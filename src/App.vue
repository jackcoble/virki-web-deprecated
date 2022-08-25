<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { useAppStore } from './stores/appStore';

const appStore = useAppStore();

const route = useRoute();

// Listen for online/offline events and update the application store
window.addEventListener("online", () => appStore.setOnline(true));
window.addEventListener("offline", () => appStore.setOnline(false));
</script>

<template>
  <component :is="route.meta.layout || 'div'">
    <RouterView />
  </component>
</template>