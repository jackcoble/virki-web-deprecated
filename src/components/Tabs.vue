<template>
<nav class="p-1.5 w-full bg-gray-50 flex border-t-2 border-gray-200">
    <div v-for="button in buttons" :key="button.label" class="flex flex-col flex-grow w-full justify-center items-center text-center truncate">
        <router-link :to="button.route">
            <component class="mx-auto" :class="[currentRoute.path === button.route ? 'text-purple-800' : 'text-gray-400', button.classes]" :is="button.icon" />
            <span class="text-xs">{{ button.label }}</span>
        </router-link>
    </div>
</nav>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ClockIcon, CogIcon, TagIcon } from "@heroicons/vue/solid";
import { useRoute } from 'vue-router';

const currentRoute = useRoute();

const buttons = ref([
    {
        label: "Tokens",
        route: "/",
        icon: ClockIcon,
        classes: "h-5"
    },
    {
        label: "Tags",
        route: "/tags",
        icon: TagIcon,
        classes: "h-5"
    },
    {
        label: "Settings",
        route: "/settings",
        icon: CogIcon,
        classes: "h-5"
    }
])
</script>