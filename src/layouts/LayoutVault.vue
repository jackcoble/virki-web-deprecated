<template>
    <div class="flex flex-col h-screen">
        <!-- Header -->
        <div
            class="flex w-full justify-between items-center px-4 md:px-11 py-4 border-b-2 border-b-mountain-meadow bg-gray-100 space-x-3 shadow">
            <div>
                <!-- Logo -->
                <a href="/" class="hidden md:block">
                    <img class="w-24" src="@/assets/images/virki_full_horizontal_transparent_dark.png"
                        alt="Virki Logo" />
                </a>
            </div>

            <!-- Avatar -->
            <div class="flex items-center justify-center space-x-2 rounded px-3 py-1.5 hover:bg-gray-200 transition cursor-pointer" @click="router.push(PAGES.PROFILE)">
                <img class="w-8 h-8 rounded-full" src="https://avatars.githubusercontent.com/u/26122014?v=4" alt="">
                <p class="text-sm">Jack Coble</p>
            </div>
        </div>

        <div class="flex flex-grow overflow-hidden">
            <!-- Sidebar -->
            <div class="flex-col flex-shrink-0 xl:w-1/6 md:w-1/4 sm:w-full">
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
import { useRouter } from 'vue-router';

// Components
import Sidebar from '@/components/Sidebar.vue';

import { PAGES } from '@/router/pages';

export default defineComponent({
    name: "LayoutVault",
    components: {
        Sidebar
    },
    setup() {
        const router = useRouter();

        return {
            router,

            PAGES
        }
    }
})
</script>