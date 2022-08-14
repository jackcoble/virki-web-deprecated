<template>
  <div class="flex flex-col h-screen">
    <!-- Header -->
    <div class="flex w-full justify-between items-center px-4 mx md:px-11 py-4 border-b-2 bg-gray-100 space-x-3">
      <!-- Text -->
      <h1 class="font-medium text-lg text-purple-800 hidden md:block">Authoriser</h1>

      <!-- Menu icon (only visible on mobile) -->
      <button class="block md:hidden text-purple-800 w-9" @click="showMenuMobile = !showMenuMobile">
        <MenuIcon v-if="showMenuMobile" />
        <XIcon v-else />
      </button>

      <!-- Search input -->
      <b-input class="w-full md:w-3/6" type="search" placeholder="Search for an entry or tag..."></b-input>

      <!-- New Entry button -->
      <div>
        <b-button type="submit" classType="primary" @click="router.push('/new/qrcode')">
          <div class="flex flex-row justify-center items-center space-x-1">
            <PlusCircleIcon class="w-5 md:-ml-1" />
            <span class="hidden md:block">New Entry</span>
          </div>
        </b-button>
      </div>
    </div>

    <div class="flex flex-grow overflow-hidden">
      <!-- Sidebar -->
      <div class="flex-col flex-shrink-0 xl:w-1/6 md:w-1/4 w-2/6">
        <Sidebar />
      </div>

      <!-- TOTP Entries -->
      <div class="flex-col flex-grow overflow-auto" :class="showEditTokenPane ? 'hidden md:flex' : 'flex'">
        <!-- Show frowny face if we've got no tokens -->
        <div v-if="entries.length === 0" class="flex flex-col justify-center items-center h-full p-4 text-center space-y-2">
          <EmojiSadIcon class="w-24 text-purple-800" />
          <p class="text-sm">You have no authentication tokens in your <span class="font-bold">{{ vaultStore.getActiveVault?.name }}</span> vault.</p>
        </div>

        <div v-for="entry in entries" :key="entry._id">
          <Entry :token="entry" @tokenToEdit="handleEditToken" />
        </div>
      </div>

      <!-- Edit column -->
      <div v-if="showEditTokenPane" class="flex-col flex-grow bg-gray-100 overflow-auto">
        <EditEntry :id="tokenToEdit._id" @close="showEditTokenPane = !showEditTokenPane" />
      </div>
    </div>
  </div>

  <!-- Create vault modal -->
  <CreateVaultModal v-if="showCreateVaultModal" @close="showCreateVaultModal = !showCreateVaultModal" />

  <!-- Create action modal -->
  <BaseModal v-if="showCreateActionModal" @close="showCreateActionModal = !showCreateActionModal" noFooter>
    <template v-slot:body>
      <div class="flex flex-col space-y-2 text-center pb-4">
        <h1 class="text-xl">Create</h1>
      </div>

      <fieldset class="space-y-2">
        <!-- Create token entry-->
        <div
          class="flex flex-row items-center px-4 py-10 w-100 text-sm h-14 space-x-3 cursor-pointer border-2 rounded-md">
          <div
            class="flex-col flex-shrink-0 object-contain rounded-full w-9 h-9 p-1.5 bg-gray-200 border-2 border-gray-300">
            <ClockIcon class="text-gray-500 rounded-full" />
          </div>

          <div class="flex-col">
            <p class="text-lg font-medium text-gray-700 select-none">Entry</p>
            <p class="text-xs">Create a new authentication token entry by scanning a QR code or inputting the details
              manually.</p>
          </div>
        </div>

        <!-- Create a tag -->
        <div
          class="flex flex-row items-center px-4 py-10 w-100 text-sm h-14 space-x-3 cursor-pointer border-2 rounded-md">
          <div
            class="flex-col flex-shrink-0 object-contain rounded-full w-9 h-9 p-1.5 bg-gray-200 border-2 border-gray-300">
            <TagIcon class="text-gray-500 rounded-full" />
          </div>

          <div class="flex-col">
            <p class="text-lg font-medium text-gray-700 select-none">Tag</p>
            <p class="text-xs">Tags are a quick and easy way to organise different categories within a vault.</p>
          </div>
        </div>

        <!-- Create a vault -->
        <div
          class="flex flex-row items-center px-4 py-10 w-100 text-sm h-14 space-x-3 cursor-pointer border-2 rounded-md">
          <div
            class="flex-col flex-shrink-0 object-contain rounded-full w-9 h-9 p-1.5 bg-gray-200 border-2 border-gray-300">
            <LockClosedIcon class="text-gray-500 rounded-full" />
          </div>

          <div class="flex-col">
            <p class="text-lg font-medium text-gray-700 select-none">Vault</p>
            <p class="text-xs">Create separate vaults for Personal, Work, etc.</p>
          </div>
        </div>
      </fieldset>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import useEmitter from "@/composables/useEmitter";

import { computed, defineComponent, onBeforeUnmount, onMounted, ref } from "vue";

import { EmojiSadIcon, PlusCircleIcon, ClockIcon, XIcon } from "@heroicons/vue/outline"
import { useVaultStore } from "@/stores/vaultStore";
import { useApplicationStore } from "@/stores/appStore";
import CreateVaultModal from "../components/CreateVaultModal.vue";

import usePouchDB from "@/composables/usePouchDB";
import useVault from "@/composables/useVault";
import { useEncryptionKeyStore } from "@/stores/encryptionKeyStore";
import { useRouter } from "vue-router";
import Entry from "@/components/Entry.vue"
import BaseModal from "@/components/Modal/BaseModal.vue"
import { useAuthenticationStore } from "@/stores/authenticationStore";
import type { Token } from "@/models/token";
import Sidebar from "../components/Sidebar.vue";
import EditEntry from "../components/EditEntry.vue";

export default defineComponent({
  name: "HomeView",
  components: {
    EmojiSadIcon,
    CreateVaultModal,
    PlusCircleIcon,
    ClockIcon,
    XIcon,
    Entry,
    BaseModal,
    Sidebar,
    EditEntry
  },
  setup() {
    const router = useRouter();

    const emitter = useEmitter();
    const vault = useVault();
    const pouchdb = usePouchDB();

    const authenticationStore = useAuthenticationStore();
    const applicationStore = useApplicationStore();
    const encryptionKeyStore = useEncryptionKeyStore();
    const vaultStore = useVaultStore();

    // Computed values from store
    const isOnline = computed(() => applicationStore.isOnline);
    const isSyncing = computed(() => applicationStore.isSyncing);
    const user = computed(() => authenticationStore.getUser);
    const vaults = computed(() => vaultStore.getVaults);

    const showCreateActionModal = ref(false);

    // Sidebar refs
    const showMenuMobile = ref(false);
    const showSidebarVaults = ref(false);
    const showSidebarUserOptions = ref(false);
    const showCreateVaultModal = ref(false);

    // Set token to be edited
    const showEditTokenPane = ref(false);
    const tokenToEdit = ref({} as Token);

    const handleEditToken = (id: any) => {
      if (!id) {
        return;
      }

      tokenToEdit.value = {} as Token;

      // Lookup the token within the vault to be edited
      const t = vaultStore.getTokens.find(to => to._id === id)
      if (t) {
        tokenToEdit.value = t;
      }

      showEditTokenPane.value = true;
    }

    const isRefreshingVault = ref(false);
    const refreshVault = async () => {
      if (!vault) {
        return;
      }

      isRefreshingVault.value = true;

      // Synchronise, fetch and decrypt vaults
      await pouchdb.synchronise();

      const encryptedVaults = await pouchdb.getVaults();
      encryptedVaults.forEach(async v => {
        const decrypted = await vault.decryptFromVaultObject(v, encryptionKeyStore.getMasterKeyPair.private_key, encryptionKeyStore.getMasterKeyPair.public_key);
        vaultStore.add(decrypted)
      })

      isRefreshingVault.value = false;
    }

    let interval: any;

    onMounted(async () => {
      // Don't continue if no vault is set
      if (!vault) {
        return;
      }

      // Synchronise and create/update existing indexes if needed.
      await pouchdb.synchronise();
      await pouchdb.createIndexes();

      // We can loop through the encrypted vaults, decrypt them and then set them in the store
      const encryptedVaults = await pouchdb.getVaults();
      encryptedVaults.forEach(async v => {
        const decrypted = await vault.decryptFromVaultObject(v, encryptionKeyStore.getMasterKeyPair.private_key, encryptionKeyStore.getMasterKeyPair.public_key);
        vaultStore.add(decrypted)
      })

      // Fire off initial countdown event
      emitCountdownEvent();

      interval = setInterval(() => {
        // Emit the 'countdown' event every second
        emitCountdownEvent();
      }, 1000);
    })

    onBeforeUnmount(() => {
      clearInterval(interval);
    })

    // Function to handle firing off events to be consumed by 2FA entry
    const emitCountdownEvent = () => {
      const currentDate = new Date();
      const eventPayload = {
        milliseconds: Math.floor(currentDate.getTime()),
        seconds: Math.floor(currentDate.getTime() / 1000)
      }
      emitter.emit("countdown", eventPayload);
    }

    const entries = computed(() => vaultStore.getTokens);

    return {
      router,

      user,
      vaults,

      entries,
      isRefreshingVault,
      isOnline,
      isSyncing,

      showMenuMobile,
      showSidebarVaults,
      showSidebarUserOptions,
      showCreateVaultModal,

      handleEditToken,
      showEditTokenPane,
      tokenToEdit,

      vaultStore,

      refreshVault
    };
  }
})
</script>