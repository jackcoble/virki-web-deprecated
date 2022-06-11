<template>
<nav class="fixed lg:hidden bottom-0 p-1.5 w-full border bg-gray-100 flex">
    <div v-for="button in buttons" :key="button.label" class="flex flex-col flex-grow w-full items-center text-center truncate">
        <router-link :to="button.route">
            <component class="h-6 text-gray-600 mx-auto" :is="button.icon" />
            <span class="text-xs align-middle font-semibold">{{ button.label }}</span>
        </router-link>
    </div>
</nav>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import { ClockIcon, QrcodeIcon, CogIcon } from "@heroicons/vue/solid";

const buttons = ref([
    {
        label: "Tokens",
        route: "/vault",
        icon: ClockIcon
    },
    {
        label: "New",
        route: "/new",
        icon: QrcodeIcon
    },
    {
        label: "Settings",
        route: "/settings",
        icon: CogIcon
    }


])
</script>