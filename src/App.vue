<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useAppStore } from './stores/appStore';

const appStore = useAppStore();

// Listen for online/offline events and update the application store
window.addEventListener("online", () => appStore.setOnline(true));
window.addEventListener("offline", () => appStore.setOnline(false));
</script>

<template>
  <RouterView />
</template>