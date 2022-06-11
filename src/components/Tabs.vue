<template>
<nav class="fixed bottom-0 p-2 w-full bg-[#283444] flex">
    <div v-for="button in buttons" :key="button.label" class="flex flex-col flex-grow w-full justify-center items-center text-center truncate">
        <router-link :to="button.route">
            <component class="h-6 text-[#a3aab0] mx-auto" :class="button.classes" :is="button.icon" />
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
        classes: "h-12 text-[#0471eb]"
    },
    {
        label: "Settings",
        route: "/settings",
        icon: CogIcon
    }
])
</script>