<template>
  <div class="flex flex-col h-screen">
    <!-- Header -->
    <div class="flex w-full justify-between items-center px-4 md:px-11 py-4 border-b-2 bg-gray-100 space-x-3">
      <!-- Text -->
      <h1 class="font-medium text-lg text-purple-800 hidden md:block">Authoriser</h1>

      <!-- Menu icon (only visible on mobile) -->
      <button class="block md:hidden text-purple-800 w-9" @click="closeMenuMobile = !closeMenuMobile">
        <MenuIcon v-if="!closeMenuMobile" />
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
      <div class="flex-col flex-shrink-0 xl:w-1/6 md:w-1/4 sm:w-full" :class="closeMenuMobile ? 'block w-full' : 'hidden md:block'">
        <Sidebar />
      </div>

     
    </div>
  </div>
</template>

<script lang="ts">
import useEmitter from "@/composables/useEmitter";

import { computed, defineComponent, onBeforeUnmount, onMounted, ref } from "vue";

import { EmojiSadIcon, PlusCircleIcon, ClockIcon, XIcon, MenuIcon } from "@heroicons/vue/outline"
import { useVaultStore } from "@/stores/vaultStore";
import { useApplicationStore } from "@/stores/appStore";

import { useEncryptionKeyStore } from "@/stores/encryptionKeyStore";
import { useRouter } from "vue-router";
import BaseModal from "@/components/Modal/BaseModal.vue"
import { useAuthenticationStore } from "@/stores/authenticationStore";
import Sidebar from "../components/Sidebar.vue";

export default defineComponent({
  name: "HomeView",
  components: {
    EmojiSadIcon,
    PlusCircleIcon,
    ClockIcon,
    XIcon,
    MenuIcon,
    BaseModal,
    Sidebar,
  },
  setup() {
    const router = useRouter();

    const emitter = useEmitter();

    const authenticationStore = useAuthenticationStore();
    const applicationStore = useApplicationStore();
    const encryptionKeyStore = useEncryptionKeyStore();
    const vaultStore = useVaultStore();

    // Computed values from store
    const isOnline = computed(() => applicationStore.isOnline);
    const isSyncing = computed(() => applicationStore.isSyncing);
    const user = computed(() => authenticationStore.getUser);
    const vaults = computed(() => vaultStore.getVaults);

    // Sidebar refs
    const closeMenuMobile = ref(false);
    const showSidebarVaults = ref(false);
    const showSidebarUserOptions = ref(false);
    const showCreateVaultModal = ref(false);

    let interval: any;

    onMounted(async () => {
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

    const entries = [] as any;

    return {
      router,

      user,
      vaults,

      entries,
      isOnline,
      isSyncing,

      closeMenuMobile,
      showSidebarVaults,
      showSidebarUserOptions,
      showCreateVaultModal,

      vaultStore,
    };
  }
})
</script>