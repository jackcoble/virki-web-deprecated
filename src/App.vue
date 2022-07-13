<script setup lang="ts">
import { RouterView } from 'vue-router'
import Tabs from './components/Tabs.vue'

import { fromUnixTime, getUnixTime, sub } from "date-fns";
import { useAuthenticationStore } from './stores/authenticationStore';

const authenticationStore = useAuthenticationStore();

// Listen for clicks and update the "last active" timestamp in store
document.addEventListener("click", () => {
  const activeTimestamp = getUnixTime(new Date());
  authenticationStore.setLastActiveTimestamp(activeTimestamp);
})

// Create an interval to check that page hasn't been inactive for the past 30 minutes
const inactivityInternal = setInterval(() => {
  const inactivityLimit = 30;
  const currentDate = new Date();

  const leastActivityDate = sub(currentDate, { minutes: inactivityLimit });
  if (leastActivityDate > fromUnixTime(authenticationStore.getLastActiveTimestamp)) {
    console.log("Lock vault!");
    
    clearInterval(inactivityInternal);
  }
}, 1000)
</script>

<template>
  <RouterView />
  <Tabs></Tabs>
</template>