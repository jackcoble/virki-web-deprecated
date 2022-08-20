<template>
  <div class="flex flex-col h-screen">
    <!-- Header -->
    <div class="flex w-full justify-between items-center px-4 md:px-11 py-4 border-b-2 border-b-mountain-meadow bg-gray-100 space-x-3">
      <!-- Logo -->
      <a href="/">
        <img class="w-24 hidden md:block" src="@/assets/images/virki_full_horizontal_transparent_dark.png" alt="Virki Logo" />
      </a>

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

  <!-- Create vault modal -->
  <CreateVaultModal v-if="showCreateVaultModal" @close="showCreateVaultModal = !showCreateVaultModal" />
</template>

<script lang="ts">
import useEmitter from "@/composables/useEmitter";

import { computed, defineComponent, onBeforeUnmount, onMounted, ref } from "vue";

import { EmojiSadIcon, PlusCircleIcon, ClockIcon, XIcon, MenuIcon } from "@heroicons/vue/outline"
import { useRouter } from "vue-router";

import Sidebar from "@/components/Sidebar.vue"

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

    // Sidebar refs
    const closeMenuMobile = ref(false);
    const showSidebarVaults = ref(false);
    const showSidebarUserOptions = ref(false);
    const showCreateVaultModal = ref(false);

    return {
      router,

    

      closeMenuMobile,
      showSidebarVaults,
      showSidebarUserOptions,
      showCreateVaultModal,
    };
  }
})
</script>