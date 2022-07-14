<template>
<nav class="fixed bottom-0 p-2 w-full bg-gray-50 flex border-t-4 border-purple-800">
    <div v-for="button in buttons" :key="button.label" class="flex flex-col flex-grow w-full justify-center items-center text-center truncate">
        <router-link :to="button.route">
            <component class="h-6 mx-auto" :class="button.classes" :is="button.icon" />
        </router-link>
    </div>
</nav>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { HomeIcon, PlusCircleIcon, CogIcon } from "@heroicons/vue/solid";

const buttons = ref([
    {
        label: "Tokens",
        route: "/",
        icon: HomeIcon,
        classes: "text-gray-400"
    },
    {
        label: "New",
        route: "/new",
        icon: PlusCircleIcon,
        classes: "h-12 text-purple-800"
    },
    {
        label: "Settings",
        route: "/settings",
        icon: CogIcon,
        classes: "text-gray-400"
    }
])
</script>