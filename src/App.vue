<script setup lang="ts">
import { RouterView } from 'vue-router'
import Tabs from './components/Tabs.vue'

import { getUnixTime } from "date-fns";
import { useAuthenticationStore } from './stores/authenticationStore';

const authenticationStore = useAuthenticationStore();

// Listen for clicks and update the "last active" timestamp in store
document.addEventListener("click", () => {
  const activeTimestamp = getUnixTime(new Date());
  authenticationStore.setLastActiveTimestamp(activeTimestamp);
})
</script>

<template>
  <RouterView />
  <Tabs></Tabs>
</template>