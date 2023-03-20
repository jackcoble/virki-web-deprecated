<template>
  <div class="flex flex-col h-full p-4" v-if="!isFirstLoad">
    <!-- Button to add entry to vault -->
    <div class="flex justify-end p-2 pb-4" v-if="vaults.length !== 0 && !showCreateVault && !showEditVault">
      <div class="flex">
        <b-button class="w-36" @click="addTokensPage">
          <div class="flex flex-row justify-center items-center space-x-1">
            <PlusCircleIcon class="w-4" />
            <span>Add</span>
          </div>
        </b-button>
      </div>
    </div>

    <!-- Show message if no vaults are available -->
    <div v-if="vaults.length === 0 && !showCreateVault && !showEditVault"
      class="flex flex-col justify-center items-center h-full p-4 text-center space-y-2">
      <img src="@/assets/images/eyes_emoji.gif" alt="Eyes emoji" class="w-16">
      <p class="text-sm">To get started, you need to create a Vault.</p>
    </div>

    <!-- Show frowny face if we've got no tokens, but have vaults available -->
    <div v-if="vaultIdPresent && vaults.length !== 0 && !showCreateVault && !showEditVault"
      class="flex flex-col justify-center items-center h-full p-4 text-center space-y-2">
      <EmojiSadIcon class="w-12 text-mountain-meadow" />
      <p class="text-sm">You have no authentication tokens in this vault.</p>
    </div>
  </div>

  <!-- Loading spinner -->
  <div v-else class="flex flex-col flex-grow justify-center items-center h-full p-4 text-center space-y-2">
    <svg class="animate-spin h-10 w-10 text-mountain-meadow" xmlns="http://www.w3.org/2000/svg" fill="none"
      viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from "vue";

import { EmojiSadIcon, PlusCircleIcon, ClockIcon, XIcon } from "@heroicons/vue/outline"
import { useRoute, useRouter } from "vue-router";

import { useVaultStore } from "@/stores/vaultStore";
import { useAppStore } from "@/stores/appStore";

import { PAGES } from "@/router/pages";
import vaultService from "@/service/api/vaultService";
import type { Vault } from "@/common/interfaces/vault";
import { CryptoWorker } from "@/common/comlink";
import { useKeyStore } from "@/stores/keyStore";
import userService from "@/service/api/userService";
import { VirkiStorageService } from "@/common/services/storage/storage.service";
import axios from "axios";

export default defineComponent({
  name: "HomeView",
  components: {
    EmojiSadIcon,
    PlusCircleIcon,
    ClockIcon,
    XIcon
  },
  setup() {
    const router = useRouter();
    const route = useRoute();

    const appStore = useAppStore();
    const vaultStore = useVaultStore();
    const keyStore = useKeyStore();

    // We don't want to allow any token related actions until the user
    // has vaults available. If they have just signed up, then this value
    // should be false.
    const isFirstLoad = ref(true);
    const vaults = computed(() => vaultStore.getAll);
    const vaultIdPresent = computed(() => !!route.query.vault);
    const isOnline = computed(() => appStore.isOnline);

    // Sidebar refs
    const showCreateVault = ref(false);
    const showEditVault = ref(false);

    onMounted(async () => {
      // Fetch all the vaults if we're online and decrypt them.
      const storageService = await VirkiStorageService.build();

      if (appStore.isOnline) {
        try {
          const res = await vaultService.getVaults();
          const vaults: Vault[] = res.data;

          // Prepare a CryptoWorker for us to use, along with our master encryption key
          const cryptoWorker = await new CryptoWorker();
          const masterEncryptionKey = keyStore.getMasterEncryptionKey;

          // Decrypt and add to the Pinia vault store
          if (vaults) {
            let order = 0;

            vaults.forEach(async vault => {
              // Decrypt the vault encryption key using the master key
              const vaultEncryptionKey = await cryptoWorker.decryptFromB64CipherString(vault.encryption_key, masterEncryptionKey);

              // We can proceed to decrypt the UTF8 name
              const decryptedName = await cryptoWorker.decryptFromB64CipherStringToUTF8(vault.name, vaultEncryptionKey);

              // Create a copy of the encrypted vault (to retain all the metadata) and replace the encrypted data with decrypted...
              const decryptedVault = { ...vault };
              decryptedVault.encryption_key = vaultEncryptionKey;
              decryptedVault.name = decryptedName;

              // Whilst we are at it, if the vault has an icon, we should
              // check if it already exists locally. If not, then fetch
              // and decrypt.
              if (decryptedVault.icon) {
                const existingIcon = await storageService.getFile(decryptedVault.icon);
                if (existingIcon) {
                  // Create a data URL
                  const iconObjectURL = URL.createObjectURL(existingIcon);
                  decryptedVault.icon_blob = iconObjectURL;
                }
                else {
                  // Otherwise fetch and decrypt...
                  try {
                    let res = await userService.GetFile(decryptedVault.icon);
                    const file = res.data.file;
                    const metadata = res.data.metadata;

                    // First, let us decrypt the encryption key with our master key
                    const cryptoWorker = await new CryptoWorker();
                    const encryptionKey = await cryptoWorker.decryptFromB64CipherString(metadata.encryption_key, masterEncryptionKey);

                    // Decrypt the MIME type with the encryption key
                    const mimeType = await cryptoWorker.decryptFromB64CipherStringToUTF8(metadata.mime_type, encryptionKey);

                    // Fetch the contents of the file from directly from S3
                    res = await axios.get(file.url, {
                      responseType: "arraybuffer"
                    });
                    const rawFile = res.data as ArrayBuffer;
                    const uintFile = new Uint8Array(rawFile);

                    // Decrypt file into a blob for us to then store in IndexedDB
                    const decryptedFile: Blob = await cryptoWorker.decryptFile(uintFile, mimeType, metadata.encryption_header, encryptionKey);
                    await storageService.saveFile(file.key, decryptedFile);

                    const iconObjectURL = URL.createObjectURL(decryptedFile);
                    decryptedVault.icon_blob = iconObjectURL;

                    decryptedVault.order = order;

                    order++;
                  } catch (e) {
                    console.log(e);
                  }
                }
              }

              // Add the decrypted vault into the Vault Store
              vaultStore.add(decryptedVault);
            })
          }
        } catch (e) {
          // TODO: Handle this...
          console.log(e);
        }
      }

      isFirstLoad.value = false;
    })

    // Route user to add tokens page for this vault
    const addTokensPage = () => {
      // If we can find a vault ID in the params, add the token that vault.
      let vaultId = route.params.id;
      if (vaultId) {
        router.push(`${PAGES.VAULT}/${vaultId}/add-token`)
      } else {
        // If not, then check we've got vaults and use the first one which is returned.
        // If we have no vaults, just return.
        if (vaultStore.getAll.length > 0) {
          vaultId = vaultStore.getAll[0].id;
          router.push(`${PAGES.VAULT}/${vaultId}/add-token`)
        } else {
          return;
        }
      }
    }

    return {
      router,

      PAGES,

      isFirstLoad,
      vaults,
      isOnline,
      vaultIdPresent,

      showCreateVault,
      showEditVault,

      addTokensPage
    };
  }
})
</script>