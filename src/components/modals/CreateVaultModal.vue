<template>
    <BaseModal @ok="handleVaultCreation">
      <template v-slot:body>
        <div class="flex flex-col items-center space-y-4">
          <h1 class="text-xl">Create a new vault</h1>

          <EncryptedFileUpload :encryption-key="masterEncryptionKey" @object-key="vaultIconKey = $event" />

          <form class="w-full" @submit.prevent="handleVaultCreation">
              <b-input v-model="vaultName" placeholder="Vault name" autofocus></b-input>
          </form>
        </div>
      </template>
  </BaseModal>
</template>

<script lang="ts">
import { CryptoWorker } from '@/common/comlink';
import { useKeyStore } from '@/stores/keyStore';
import { defineComponent, computed, ref } from 'vue';

import BaseModal from './BaseModal.vue';
import EncryptedFileUpload from '../EncryptedFileUpload.vue';
import useToaster from '@/composables/useToaster';
import { serialiseCipherString } from '@/common/utils/cipher';
import { EncryptionType } from '@/common/enums/encryptionType';
import type { Vault } from '@/common/interfaces/vault';
import vaultService from '@/service/api/vaultService';

export default defineComponent({
    name: "CreateVaultModal",
    components: {
      EncryptedFileUpload,
      BaseModal
    },
    emits: ["ok"],
    setup(props, { emit }) {
      // Stores
      const keyStore = useKeyStore();

      // Toaster
      const toaster = useToaster();

      // Master encryption key
      const masterEncryptionKey = computed(() => keyStore.getMasterEncryptionKey);

      // Values to bind vault creation to
      const vaultName = ref();
      const vaultIconKey = ref();

      // Handle encrypting the vault attributes into a suitable payload
      const handleVaultCreation = async () => {
        const cryptoWorker = await new CryptoWorker();

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

        // Pack everything into a vault object
        const encryptedVault: Vault = {
          encryption_key: encryptedVaultKey,
          name: encryptedName,
          created: null,
          modified: null
        }

        // Don't forget the vault icon key!
        if (vaultIconKey.value) {
          encryptedVault.icon = vaultIconKey.value
        }

        // Send the vault object to the API
        try {
          await vaultService.addVault(encryptedVault);
          emit("ok");
        } catch (e) {
          return toaster.error("Unable to save Vault!");
        }
      }

      return {
        masterEncryptionKey,

        vaultName,
        vaultIconKey,

        handleVaultCreation
      }
    }
})
</script>