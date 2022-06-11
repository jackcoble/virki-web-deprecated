<template>
<nav class="fixed lg:hidden bottom-0 p-2 w-full border bg-gray-100 flex">
    <div v-for="button in buttons" :key="button.label" class="flex flex-col flex-grow w-full justify-center items-center text-center truncate">
        <router-link :to="button.route">
            <component class="h-6 text-gray-600 mx-auto" :class="button.classes" :is="button.icon" />
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
        icon: HomeIcon
    },
    {
        label: "New",
        route: "/new",
        icon: PlusCircleIcon,
        classes: "h-12 text-green-600"
    },
    {
        label: "Settings",
        route: "/settings",
        icon: CogIcon
    }
])
</script>