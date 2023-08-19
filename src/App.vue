<script setup lang="ts">
import { fromUnixTime, getUnixTime, sub } from 'date-fns';
import { onMounted, onUnmounted } from 'vue';
import { RouterView, useRoute, useRouter } from 'vue-router'
import { PAGES } from './router/pages';
import { useAppStore } from './stores/appStore';
import { useKeyStore } from './stores/keyStore';
import { useUserStore } from './stores/userStore';
import { useVaultStore } from './stores/vaultStore';
import { api } from './api';

const appStore = useAppStore();
const keyStore = useKeyStore();
const vaultStore = useVaultStore();
const userStore = useUserStore();

const router = useRouter();
const route = useRoute();

// Listen for online/offline events and update the application store
window.addEventListener("online", () => appStore.setOnline(true));
window.addEventListener("offline", () => appStore.setOnline(false));

// Listen for clicks and update the last activity timestamp on the Application Store.
// This value is used to trigger automatic locking of the vault.
document.addEventListener("click", () => {
  const activeTimestamp = getUnixTime(new Date());
  appStore.setLastActiveTimestamp(activeTimestamp);
})

let inactivityInterval: any;
onMounted(() => {
  // Fetch the access token from the store and set the API to use it
  const accessToken = userStore.getAccessToken;
  if (accessToken) {
    api.setAccessToken(accessToken);
  }

  // Check every second to make sure the 15 minute inactivity timeout hasn't been reached
  inactivityInterval = setInterval(() => {
    const lastActiveTimestamp = appStore.getLastActiveTimestamp;
    const leastActivityDate = sub(new Date(), { minutes: 15 });
    const accessToken = userStore.getAccessToken;

    if (leastActivityDate > fromUnixTime(lastActiveTimestamp) && (route.path !== PAGES.LOCK || PAGES.LOGIN) && accessToken) {
      // Clear the encryption key and vaults
      keyStore.clearMasterEncryptionKey();
      vaultStore.clear();
      
      router.push(PAGES.LOCK);
    }
  }, 1000)
})

onUnmounted(() => {
  clearInterval(inactivityInterval);
})
</script>

<template>
  <component :is="route.meta.layout || 'div'">
    <RouterView />
  </component>
</template>