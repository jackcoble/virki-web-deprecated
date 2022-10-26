<template>
    <div
        class="flex w-full justify-between items-center px-4 md:px-11 py-4 border-b-2 border-b-mountain-meadow bg-gray-100 space-x-3 shadow">
        <div>
            <!-- Logo -->
            <router-link :to="PAGES.ROOT" class="hidden md:block">
                <img class="w-24" src="@/assets/images/virki_full_horizontal_transparent_dark.png" alt="Virki Logo" />
            </router-link>

            <!-- Menu Icon (only visible on mobile) -->
            <button class="block md:hidden text-mountain-meadow w-9" @click="toggleMobileMenu">
                <MenuIcon v-if="!openMobileMenu" />
                <XIcon v-else />
            </button>
        </div>

        <!-- Avatar -->
        <div class="flex items-center justify-center space-x-2 rounded px-3 py-1.5 hover:bg-gray-200 transition cursor-pointer"
            @click="router.push(PAGES.PROFILE)">
            <UserCircleIcon class="w-7 text-mountain-meadow" />
            <p class="text-sm">{{ email }}</p>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';

import { PAGES } from "@/router/pages";
import { useUserStore } from '@/stores/userStore';

import { UserCircleIcon, MenuIcon, XIcon } from "@heroicons/vue/solid"
import { useAppStore } from '@/stores/appStore';

export default defineComponent({
    name: "Navigation",
    components: {
        UserCircleIcon,
        MenuIcon,
        XIcon
    },
    setup() {
        const router = useRouter();
        const userStore = useUserStore();
        const appStore = useAppStore();

        const email = computed(() => userStore.getEmail);
        const openMobileMenu = computed(() => appStore.shouldOpenMobileMenu);

        /**
         * Function to toggle whether mobile menu should be opened
         */
        const toggleMobileMenu = () => {
            const currentOpenMobileMenu = appStore.shouldOpenMobileMenu;
            appStore.setOpenMobileMenu(!currentOpenMobileMenu);
        }

        return {
            toggleMobileMenu,
            openMobileMenu,

            router,

            email,
            PAGES
        }
    }
})
</script>