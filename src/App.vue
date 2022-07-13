<script setup lang="ts">
import { RouterView, useRoute, useRouter } from 'vue-router'
import Tabs from './components/Tabs.vue'

import { fromUnixTime, getUnixTime, sub } from "date-fns";
import { useAuthenticationStore } from './stores/authenticationStore';
import { onMounted, onUnmounted } from 'vue';

const router = useRouter();
const currentRoute = useRoute();
const authenticationStore = useAuthenticationStore();

// Listen for clicks and update the "last active" timestamp in store
document.addEventListener("click", () => {
  const activeTimestamp = getUnixTime(new Date());
  authenticationStore.setLastActiveTimestamp(activeTimestamp);
})

let inactivityInterval: NodeJS.Timer;
onMounted(() => {
  // Create an interval to check that page hasn't been inactive for the past 30 minutes
  inactivityInterval = setInterval(() => {
    const inactivityLimit = 30;
    const currentDate = new Date();

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
  <Tabs></Tabs>
</template>