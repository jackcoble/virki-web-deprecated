<template>
    <BaseModal>
      <template v-slot:body>
        <div class="flex flex-col items-center space-y-4">
          <h1 class="text-xl">Create a new vault</h1>

          <EncryptedFileUpload :encryption-key="masterEncryptionKey" @object-key="vaultIconKey = $event" />

          <form class="w-full space-y-2" @submit.prevent="handleVaultCreation">
              <b-input v-model="vaultName" placeholder="Vault name" autofocus></b-input>
              <b-text-area v-model="vaultDescription" placeholder="Description"></b-text-area>
          </form>
        </div>
      </template>

      <template v-slot:footer>
        <div class="mt-5 sm:mt-4 flex items-end space-y-2 space-x-2">
            <b-button @click="handleVaultCreation" type="button" :loading="isCreatingVault">
                Create
            </b-button>

            <b-button @click="$emit('cancel')" type="button" classType="light">
                Cancel
            </b-button>
        </div>
      </template>
  </BaseModal>
</template>

<script lang="ts">
import { useKeyStore } from '@/stores/keyStore';
import { defineComponent, computed, ref } from 'vue';

import BaseModal from './BaseModal.vue';
import EncryptedFileUpload from '../EncryptedFileUpload.vue';
import useToaster from '@/composables/useToaster';
import { serialiseCipherString } from '@/common/utils/cipher';
import { EncryptionType } from '@/common/enums/encryptionType';
import { cryptoWorker } from '@/common/comlink';
import type { GetVaultsResponseBody, VaultCreationRequestBody } from '@/service/api/types';
import userService from '@/service/api/userService';
import { useVaultStore } from '@/stores/vaultStore';
import storageService from "@/service/storage"

export default defineComponent({
    name: "CreateVaultModal",
    components: {
      EncryptedFileUpload,
      BaseModal
    },
    emits: ["ok", "cancel"],
    setup(props, { emit }) {
      // Stores
      const keyStore = useKeyStore();
      const vaultStore = useVaultStore();

      // Toaster
      const toaster = useToaster();

      // Master encryption key
      const masterEncryptionKey = computed(() => keyStore.getMasterEncryptionKey);

      // Values to bind vault creation to
      const vaultName = ref();
      const vaultDescription = ref();
      const vaultIconKey = ref();
      const isCreatingVault = ref(false);

      // Handle encrypting the vault attributes into a suitable payload
      const handleVaultCreation = async () => {
        isCreatingVault.value = true;

        // Generate a symmetric key which all items inside this vault will be encrypted with.
        const vaultEncryptionKey = await cryptoWorker.generateEncryptionKey();

        // We want to encrypt the vault encryption key with our master encryption key.
        const masterEncryptionKey = keyStore.getMasterEncryptionKey;
        if (!masterEncryptionKey) {
            return toaster.error("Master encryption key not present on device!");
        }

        // Serialise this into a cipher string
        const encryptedVaultKeyObject = await cryptoWorker.encryptToB64(vaultEncryptionKey, masterEncryptionKey);
        const encryptedVaultKey = await serialiseCipherString(EncryptionType.XCHACHA20_POLY1305, encryptedVaultKeyObject.ciphertext, encryptedVaultKeyObject.nonce, encryptedVaultKeyObject.mac);

        // We need to then encrypt the name with the vault encryption key
        const encryptedNameObject = await cryptoWorker.encryptUTF8(vaultName.value, vaultEncryptionKey);
        const encryptedName = await serialiseCipherString(EncryptionType.XCHACHA20_POLY1305, encryptedNameObject.ciphertext, encryptedNameObject.nonce, encryptedNameObject.mac);

        // Pack everything into a Vault object
        const apiVaultObject: VaultCreationRequestBody = {
          encryptionKey: encryptedVaultKey,
          name: encryptedName
        };

        // Encrypt the description too if we have it
        if (vaultDescription.value && vaultDescription.value.trim().length > 0) {
          const encryptedDescriptionObject = await cryptoWorker.encryptUTF8(vaultDescription.value, vaultEncryptionKey);
          const encryptedDescription = await serialiseCipherString(EncryptionType.XCHACHA20_POLY1305, encryptedDescriptionObject.ciphertext, encryptedDescriptionObject.nonce, encryptedDescriptionObject.mac);
        
          apiVaultObject.description = encryptedDescription;
        }

        // Don't forget the vault icon key!
        if (vaultIconKey.value) {
          apiVaultObject.icon = vaultIconKey.value
        }

        // Submit the new vault to be sent to the API
        const res = await userService.CreateVault(apiVaultObject);

        // Add the decrypted vault to the vault store and offline DB
        const decryptedVault: GetVaultsResponseBody = {
          id: res.data.id,
          encryptionKey: vaultEncryptionKey,
          name: vaultName.value,
          description: vaultDescription.value,
          icon: vaultIconKey.value,
          created: res.data.created
        }
        
        vaultStore.add(decryptedVault);
        await storageService.AddVault(res.data);

        isCreatingVault.value = false;

        // Close the modal
        emit("ok");
      }

      return {
        masterEncryptionKey,

        vaultName,
        vaultDescription,
        vaultIconKey,
        isCreatingVault,

        handleVaultCreation
      }
    }
})
</script>