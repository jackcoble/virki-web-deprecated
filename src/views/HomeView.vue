<template>
  <div class="h-screen bg-[#262727]">

    <div class="container mx-auto p-4 space-y-3">
      <div class="flex justify-between">
        <!-- Vault selection dropdown -->
        <h2 class="text-2xl font-semibold text-white">Personal ▼</h2>

        <!-- Refresh vault button -->
        <button class="rounded-full p-1.5 text-gray-200">
          <RefreshIcon class="w-6 h-6" />
        </button>
      </div>

      <!-- Search bar -->
      <form>
        <label for="default-search"
          class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-gray-300">Search</label>
        <div class="relative">
          <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
            <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <input type="search" id="default-search"
            class="block p-2 pl-10 w-full text-sm text-gray-900 bg-gray-50 rounded border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Search entries..." required>
        </div>
      </form>

      <p class="text-sm text-white text-center">{{ entries.length }} entries</p>

      <div v-for="entry in entries" :key="entry.issuer">
        <Entry :issuer="entry.issuer" :account="entry.account" :secret="entry.secret" :icon="entry.icon"></Entry>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import useAccount from "@/composables/useAccount";
import useEmitter from "@/composables/useEmitter";

import { defineComponent, onBeforeUnmount, onMounted } from "vue";
import Entry from "../components/Entry.vue";

import { RefreshIcon } from "@heroicons/vue/outline"

export default defineComponent({
  name: "HomeView",
  setup() {
    const emitter = useEmitter();

    let interval: any;

    onMounted(() => {
      // Fetch and initialise account class
      const account = useAccount();
      console.log(account)

      interval = setInterval(() => {
        // Emit the 'countdown' event every second
        const timestamp = Math.floor(Date.now());
        emitter.emit("countdown", { timestamp });
      }, 1000);
    })

    onBeforeUnmount(() => {
      clearInterval(interval);
    })

    const entries = [
      {
        issuer: "Instagram",
        account: "XYZ",
        secret: "JBSWY3DPEHPK3PXP",
        icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/2048px-Instagram_logo_2016.svg.png"
      },
      {
        issuer: "Instagram",
        account: "XYZ",
        secret: "JBSWY3DPEHPK3PXP",
        icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/2048px-Instagram_logo_2016.svg.png"
      },
      {
        issuer: "Instagram",
        account: "XYZ",
        secret: "JBSWY3DPEHPK3PXP",
        icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/2048px-Instagram_logo_2016.svg.png"
      },
      {
        issuer: "Instagram",
        account: "XYZ",
        secret: "JBSWY3DPEHPK3PXP",
        icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/2048px-Instagram_logo_2016.svg.png"
      },
      {
        issuer: "Instagram",
        account: "XYZ",
        secret: "JBSWY3DPEHPK3PXP",
        icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/2048px-Instagram_logo_2016.svg.png"
      }
    ];
    return {
      entries
    };
  },
  components: { Entry, RefreshIcon }
})
</script>