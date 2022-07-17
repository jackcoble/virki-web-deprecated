<script setup lang="ts">
import { RouterView, useRoute, useRouter } from 'vue-router'
import Tabs from './components/Tabs.vue'

import { fromUnixTime, getUnixTime, sub } from "date-fns";
import { useAuthenticationStore } from './stores/authenticationStore';
import { onMounted, onUnmounted } from 'vue';
import { useApplicationStore } from './stores/appStore';
import useToaster from './composables/useToaster';

const router = useRouter();
const currentRoute = useRoute();

const applicationStore = useApplicationStore();
const authenticationStore = useAuthenticationStore();

const toaster = useToaster();

// Listen for clicks and update the "last active" timestamp in store
document.addEventListener("click", () => {
  const activeTimestamp = getUnixTime(new Date());
  authenticationStore.setLastActiveTimestamp(activeTimestamp);
})

// Listen for online/offline events and update application state as necessary
window.addEventListener("online", (event) => {
  if (event) {
    applicationStore.setOnline(true);

    toaster.info("Syncing vaults...")
  }
})

window.addEventListener("offline", (event) => {
  if (event) {
    applicationStore.setOnline(false);
  }
})

let inactivityInterval: NodeJS.Timer;
onMounted(() => {
  // Create an interval to check that page hasn't been inactive
  inactivityInterval = setInterval(() => {
    const inactivityLimit = applicationStore.getInactivityTimeout;
    const currentDate = new Date();

    // If the inactivity limit is set to zero, or we have an encryption key remembered on the device, then we never want to lock
    if (inactivityLimit === 0 || localStorage.getItem("stretched_password")) {
      return;
    }

    const leastActivityDate = sub(currentDate, { minutes: inactivityLimit });
    if (leastActivityDate > fromUnixTime(authenticationStore.getLastActiveTimestamp)) {
      // TODO: Clear keys state

      // Push to locked page if we aren't already there
      if (currentRoute.path !== '/lock') {
        router.push("/lock");
      }
    }
  }, 1000);

  onUnmounted(() => {
    clearInterval(inactivityInterval)
  })
})
</script>

<template>
  <RouterView />
  <Tabs v-if="currentRoute.meta.showTabMenu"></Tabs>
</template>