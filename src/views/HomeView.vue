<template>
  <div class="flex flex-col">
    <!-- Header -->
    <div class="flex justify-between items-center px-12 py-4 border-b-2 bg-gray-100">
      <!-- Text -->
      <h1 class="font-medium text-lg text-purple-800">Authoriser</h1>

      <!-- Search input -->
      <b-input class="w-2/6" type="search" placeholder="Search for an entry or tag..."></b-input>

      <!-- Create button -->
      <div>
        <b-button type="submit" classType="primary" @click="showCreateActionModal = !showCreateActionModal">
          <div class="flex flex-row justify-center space-x-1">
            <PlusCircleIcon class="w-4 -ml-1" />
            <span>Create</span>
          </div>
        </b-button>
      </div>
    </div>

    <!-- Main view -->
    <div class="flex flex-grow">
      <!-- Sidebar -->
      <div class="border-r-2 flex-col p-6 w-1/6 bg-gray-100 overflow-auto">

        <!-- Avatar and user name -->
        <div class="p-4">
          <div class="flex items-center text-purple-800 cursor-pointer" @click="showSidebarUserOptions = !showSidebarUserOptions">
            <div class="flex flex-1 justify-start space-x-2">
              <UserIcon class="w-6" />
              <h2>{{ user.name }}</h2>
            </div>

            <div>
              <ChevronDownIcon class="w-4" />
            </div>
          </div>

          <!-- User options -->
          <div v-if="showSidebarUserOptions" class="flex-col mt-3 text-gray-600 space-y-1">
              <!-- Lock -->
              <div class="flex items-center space-x-2 p-3 cursor-pointer bg-gray-200 rounded">
                <LockClosedIcon class="w-4" />
                <h2 class="text-xs">Lock</h2>
              </div>

              <!-- Sign Out -->
              <div class="flex items-center space-x-2 p-3 cursor-pointer bg-gray-200 text-red-400 rounded">
                <LogoutIcon class="w-4" />
                <h2 class="text-xs">Sign Out</h2>
              </div>
          </div>
        </div>

        <!-- All Items and Favourites -->
        <div class="flex-col space-y-2 p-4 text-gray-700">
          <div class="flex py-2 items-center space-x-2">
            <InboxIcon class="w-6" />
            <h2 class="text-sm">All Items</h2>
          </div>

          <div class="flex py-2 items-center space-x-2">
            <StarIcon class="w-6 text-yellow-400" />
            <h2 class="text-sm">Favourites</h2>
          </div>
        </div>

        <!-- Vaults -->
        <div class="p-4 text-gray-700">
          <div class="flex">
            <button class="flex flex-1 justify-start space-x-2" @click="showSidebarVaults = !showSidebarVaults">
              <ChevronRightIcon v-if="!showSidebarVaults" class="w-4" />
              <ChevronDownIcon v-else class="w-4" />
              <p class="text-sm">Vaults</p>
            </button>

            <button @click="showCreateVaultModal = !showCreateVaultModal">
              <PlusIcon class="w-4" />
            </button>
          </div>

          <!-- List all vaults -->
          <div v-if="showSidebarVaults" class="pt-2 space-y-1">
            <div v-for="vault in vaults" class="flex p-2 rounded items-center space-x-2 cursor-pointer" :class="vaultStore.getActiveVaultId === vault._id ? 'bg-gray-200' : ''" @click="vaultStore.setActiveVault(vault._id)">
              <div class="object-contain cursor-pointer rounded-full border-2 border-gray-300 bg-gray-200 h-6 w-6">
                <img class="rounded-full object-cover" src="@/assets/images/default_vault_icon.png" alt="Vault Icon">
              </div>
              <p class="text-sm">{{ vault.name }}</p>
            </div>
          </div>

          <!-- Show active vault even if sidebar is closed -->
          <div v-if="vaultStore.getActiveVaultId && !showSidebarVaults" class="flex p-2 mt-2 rounded items-center space-x-2 cursor-pointer bg-gray-200">
            <div class="object-contain cursor-pointer rounded-full border-2 border-gray-300 bg-gray-200 h-6 w-6">
                <img class="rounded-full object-cover" src="@/assets/images/default_vault_icon.png" alt="Vault Icon">
              </div>
              <p class="text-sm">{{ vaultStore.getActiveVault?.name }}</p>
          </div>
        </div>

        <!-- Tags -->
        <div class="p-4 text-gray-700">
          <div class="flex">
            <div class="flex flex-1 justify-start space-x-2">
              <ChevronDownIcon class="w-4" />
              <p class="text-sm">Tags</p>
            </div>

            <button>
              <PlusIcon class="w-4" />
            </button>
          </div>

          <!-- TODO: List all tags -->
        </div>
      </div>

      <!-- Entries view -->
      <div class="flex-col flex-1 text-gray-700 space-y-2 h-screen overflow-auto">
        <!-- Show frowny face if we've got no tokens -->
        <div v-if="entries.length === 0" class="flex flex-col justify-center items-center h-3/4">
          <EmojiSadIcon class="w-24 text-purple-800" />
          <p class="text-sm">You have no authentication tokens in your <span class="font-bold">{{ vaultStore.getActiveVault?.name }}</span> vault.</p>
        </div>

        <div v-for="entry in entries" :key="entry._id">
          <Entry :token="entry" />
        </div>
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
import VaultSelector from "@/components/VaultSelector.vue"

import { RefreshIcon, EmojiSadIcon, StatusOfflineIcon, PlusCircleIcon, ClockIcon, TagIcon, LockClosedIcon, UserIcon, ChevronDownIcon, ChevronRightIcon, PlusIcon, LogoutIcon, InboxIcon } from "@heroicons/vue/outline"
import { StarIcon } from "@heroicons/vue/solid";
import { useVaultStore } from "@/stores/vaultStore";
import { useApplicationStore } from "@/stores/appStore";
import OfflineAlertModal from "../components/OfflineAlertModal.vue";
import CreateVaultModal from "../components/CreateVaultModal.vue";

import usePouchDB from "@/composables/usePouchDB";
import useVault from "@/composables/useVault";
import { useEncryptionKeyStore } from "@/stores/encryptionKeyStore";
import { useRouter } from "vue-router";
import Entry from "@/components/Entry.vue"
import BaseModal from "@/components/Modal/BaseModal.vue"
import { useAuthenticationStore } from "@/stores/authenticationStore";

export default defineComponent({
  name: "HomeView",
  components: {
    VaultSelector,
    RefreshIcon,
    EmojiSadIcon,
    StatusOfflineIcon,
    OfflineAlertModal,
    CreateVaultModal,
    PlusCircleIcon,
    ClockIcon,
    TagIcon,
    LockClosedIcon,
    UserIcon,
    PlusIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    StarIcon,
    LogoutIcon,
    InboxIcon,
    Entry,
    BaseModal
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
    const showSidebarVaults = ref(false);
    const showSidebarUserOptions = ref(false);
    const showCreateVaultModal = ref(false);

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

      showCreateActionModal,
      showSidebarVaults,
      showSidebarUserOptions,
      showCreateVaultModal,

      vaultStore,

      refreshVault
    };
  }
})
</script>