<script setup lang="ts">
import { RouterView, useRoute, useRouter } from 'vue-router'
import Tabs from './components/Tabs.vue'

import { fromUnixTime, getUnixTime, sub } from "date-fns";
import { useAuthenticationStore } from './stores/authenticationStore';
import { onMounted, onUnmounted } from 'vue';
import { useApplicationStore } from './stores/appStore';
import system from './service/api/system';
import useEmitter from './composables/useEmitter';

const router = useRouter();
const currentRoute = useRoute();
const emitter = useEmitter();

const applicationStore = useApplicationStore();
const authenticationStore = useAuthenticationStore();

// Listen for clicks and update the "last active" timestamp in store
document.addEventListener("click", () => {
  const activeTimestamp = getUnixTime(new Date());
  authenticationStore.setLastActiveTimestamp(activeTimestamp);
})

// Listen for online/offline events and update application state as necessary
window.addEventListener("online", (event) => {
  if (event) {
    applicationStore.setOnline(true);

    emitter.emit("sync");
  }
})

window.addEventListener("offline", (event) => {
  if (event) {
    applicationStore.setOnline(false);
  }
})

// Carry out a health check
const doHealthCheck = async () => {
  try {
    await system.Status();
    applicationStore.setOnline(true);
  } catch (e) {
    if (!e.response) {
      applicationStore.setOnline(false);
    }
  }
}

let inactivityInterval: NodeJS.Timer;
let healthCheckInterval: NodeJS.Timer;

onMounted(async () => {
  // Do a health check beforehand
  await doHealthCheck()

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

  // Create an interval to check API health/status every 10 seconds
  healthCheckInterval = setInterval(async () => {
    await doHealthCheck()
  }, 10 * 1000)
})

onUnmounted(() => {
  clearInterval(inactivityInterval)
  clearInterval(healthCheckInterval)
})
</script>

<template>
  <RouterView />
  <Tabs v-if="currentRoute.meta.showTabMenu"></Tabs>
</template>