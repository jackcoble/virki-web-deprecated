<template>
  <div class="h-screen bg-gray-50">

    <div class="container mx-auto p-4 space-y-3">
      <div class="flex justify-between">
        <!-- Vault selection dropdown -->
        <h2 class="text-2xl font-semibold text-gray-900">Personal 🔒</h2>

        <!-- Refresh vault button -->
        <button class="rounded-full p-1.5 text-purple-800" :class="isRefreshingVault ? 'animate-reverse-spin' : ''"
          @click="refreshVault">
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
            class="pl-10 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2"
            placeholder="Search entries..." required>
        </div>
      </form>

      <div class="flex">
        <div v-if="entries && entries.length !== 0" v-for="entry in entries" :key="entry.issuer">
          <Entry :issuer="entry.issuer" :account="entry.account" :secret="entry.secret" :icon="entry.icon"></Entry>
          <div class="w-full border-t border-gray-300"></div>
        </div>

        <div v-else class="mt-48 items-center justify-items-center text-gray-400 mx-auto space-y-3">
          <EmojiSadIcon class="w-24 mx-auto" />
          <p class="text-sm text-center">You don't have any tokens in your vault.</p>
        </div>
      </div>
    </div>

    <p v-if="entries && entries.length !== 0" class="text-sm text-gray-400 text-center">{{ entries.length }} entries</p>
  </div>
</template>

<script lang="ts">
import useAccount from "@/composables/useAccount";
import useEmitter from "@/composables/useEmitter";

import { defineComponent, onBeforeUnmount, onMounted, ref } from "vue";
import Entry from "../components/Entry.vue";

import { RefreshIcon, EmojiSadIcon } from "@heroicons/vue/outline"

export default defineComponent({
  name: "HomeView",
  setup() {
    const emitter = useEmitter();
    const account = useAccount();

    const isRefreshingVault = ref(false);
    const refreshVault = async () => {
      // Simulate loading be encrypting/decrypting items 50 times
      isRefreshingVault.value = true;

      for (let i = 0; i < 50; i++) {
        const encrypted = await account?.encryptData("Hello world!");
        const decrypted = await account?.decryptData(encrypted!);

        console.log("Decrypted data:", decrypted)
      }

      isRefreshingVault.value = false;
    }

    let interval: any;

    onMounted(async () => {
      interval = setInterval(() => {
        // Emit the 'countdown' event every second
        const timestamp = Math.floor(Date.now());
        emitter.emit("countdown", { timestamp });
      }, 1000);
    })

    onBeforeUnmount(() => {
      clearInterval(interval);
    })

    const entries = [] as any[];

    return {
      entries,
      isRefreshingVault,

      refreshVault
    };
  },
  components: { Entry, RefreshIcon, EmojiSadIcon }
})
</script>