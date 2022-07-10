<script setup lang="ts">
import { RouterView } from 'vue-router'
import Tabs from './components/Tabs.vue'

import { getUnixTime } from "date-fns";

// Listen for clicks and update the "lastActive" timestamp
document.addEventListener("click", () => {
  const currentDate = new Date();
  const activeTimestamp = getUnixTime(currentDate).toString();

  localStorage.setItem("lastActive", activeTimestamp)
})
</script>

<template>
  <RouterView />
  <Tabs></Tabs>
</template>