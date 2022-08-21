<template>
  <div class="flex flex-col h-screen">
    <!-- Header -->
    <div class="flex w-full justify-between items-center px-4 md:px-11 py-4 border-b-2 border-b-mountain-meadow bg-gray-100 space-x-3 shadow">
      <!-- Logo -->
      <a href="/">
        <img class="w-24 hidden md:block" src="@/assets/images/virki_full_horizontal_transparent_dark.png" alt="Virki Logo" />
      </a>

      <!-- Menu icon (only visible on mobile) -->
      <button class="block md:hidden text-mountain-meadow w-9" @click="closeMenuMobile = !closeMenuMobile">
        <MenuIcon v-if="!closeMenuMobile" />
        <XIcon v-else />
      </button>

      <!-- Search input -->
      <b-input class="w-full md:w-3/6" type="search" placeholder="Search for an entry or tag..."></b-input>

      <!-- New Entry or Vault button -->
      <div>
        <b-button v-if="hasVaultsAvailable" type="submit" classType="primary">
          <div class="flex flex-row justify-center items-center space-x-1">
            <PlusCircleIcon class="w-5 md:-ml-1" />
            <span class="hidden md:block">New Entry</span>
          </div>
        </b-button>

        <b-button v-if="!hasVaultsAvailable" type="submit" classType="primary">
          <div class="flex flex-row justify-center items-center space-x-1">
            <PlusCircleIcon class="w-5 md:-ml-1" />
            <span class="hidden md:block">Create Vault</span>
          </div>
        </b-button>
      </div>
    </div>

    <div class="flex flex-grow overflow-hidden">
      <!-- Sidebar -->
      <div class="flex-col flex-shrink-0 xl:w-1/6 md:w-1/4 sm:w-full" :class="closeMenuMobile ? 'block w-full' : 'hidden md:block'">
        <Sidebar />
      </div>

      <!-- Token entries -->
      <div class="flex-col flex-grow overflow-auto" >
        <!-- Show message if no vaults are available -->
        <div v-if="!hasVaultsAvailable" class="flex flex-col justify-center items-center h-full p-4 text-center space-y-2">
          <EmojiSadIcon class="w-24 text-mountain-meadow" />
          <p class="text-sm">To get started, you need to create a Vault.</p>
          <b-button class="w-36">
            <div class="flex flex-row justify-center items-center space-x-1">
              <PlusCircleIcon class="w-5 md:-ml-1" />
              <span class="hidden md:block">Create Vault</span>
            </div>
          </b-button>
        </div>

        <!-- Show frowny face if we've got no tokens, but have vaults available -->
        <div v-if="hasVaultsAvailable" class="flex flex-col justify-center items-center h-full p-4 text-center space-y-2">
          <EmojiSadIcon class="w-24 text-mountain-meadow" />
          <p class="text-sm">You have no authentication tokens in your vault.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import useEmitter from "@/composables/useEmitter";

import { defineComponent, ref } from "vue";

import { EmojiSadIcon, PlusCircleIcon, ClockIcon, XIcon, MenuIcon } from "@heroicons/vue/outline"
import { useRouter } from "vue-router";

import Sidebar from "@/components/Sidebar.vue";

export default defineComponent({
  name: "HomeView",
  components: {
    EmojiSadIcon,
    PlusCircleIcon,
    ClockIcon,
    XIcon,
    MenuIcon,
    Sidebar
  },
  setup() {
    const router = useRouter();

    const emitter = useEmitter();

    // We don't want to allow any token related actions until the user
    // has vaults available. If they have just signed up, then this value
    // should be false.
    const hasVaultsAvailable = ref(false);

    // Sidebar refs
    const closeMenuMobile = ref(false);
    const showSidebarVaults = ref(false);
    const showSidebarUserOptions = ref(false);
    const showCreateVaultModal = ref(false);

    return {
      router,

      hasVaultsAvailable,

      closeMenuMobile,
      showSidebarVaults,
      showSidebarUserOptions,
      showCreateVaultModal,
    };
  }
})
</script>