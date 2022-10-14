<template>
    <div class="flex flex-col h-screen">
        <!-- Header -->
        <div
            class="flex w-full justify-between items-center px-4 md:px-11 py-4 border-b-2 border-b-mountain-meadow bg-gray-100 space-x-3 shadow">
            <div>
                <!-- Logo -->
                <router-link :to="PAGES.ROOT" class="hidden md:block">
                    <img class="w-24" src="@/assets/images/virki_full_horizontal_transparent_dark.png"
                        alt="Virki Logo" />
                </router-link>
            </div>

            <!-- Avatar -->
            <div class="flex items-center justify-center space-x-2 rounded px-3 py-1.5 hover:bg-gray-200 transition cursor-pointer" @click="router.push(PAGES.PROFILE)">
                <UserCircleIcon class="w-7 text-mountain-meadow" />
                <p class="text-sm">{{ email }}</p>
            </div>
        </div>

        <div class="flex flex-grow overflow-hidden">
            <!-- Sidebar (controllable with a meta property) -->
            <div v-if="route.meta.sidebar" class="flex-col flex-shrink-0 xl:w-1/6 md:w-1/4 sm:w-full">
                <Sidebar />
            </div>

            <!-- Main content -->
            <div class="flex-col flex-grow overflow-auto">
                <slot />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// Components
import Sidebar from '@/components/Sidebar.vue';

import { UserCircleIcon } from "@heroicons/vue/solid"

import { PAGES } from '@/router/pages';
import { useUserStore } from '@/stores/userStore';
import { computed } from '@vue/reactivity';

export default defineComponent({
    name: "LayoutVault",
    components: {
        Sidebar,
        UserCircleIcon
    },
    setup() {
        const router = useRouter();
        const route = useRoute();

        const userStore = useUserStore();

        const email = computed(() => userStore.getEmail);

        return {
            router,
            route,

            email,

            PAGES
        }
    }
})
</script>