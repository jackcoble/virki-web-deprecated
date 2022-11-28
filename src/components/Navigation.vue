<template>
    <div
        class="flex w-full justify-between items-center px-4 md:px-11 py-4 border-b-2 border-b-mountain-meadow bg-gray-100 space-x-3 shadow">
        <div>
            <!-- Logo -->
            <a href="/" class="hidden md:block">
                <img class="w-24" src="@/assets/images/virki_full_horizontal_transparent_dark.png" alt="Virki Logo" />
            </a>

            <!-- Menu Icon (only visible on mobile) -->
            <button class="block md:hidden text-mountain-meadow w-9" @click="toggleMobileMenu">
                <MenuIcon v-if="!openMobileMenu" />
                <XIcon v-else />
            </button>
        </div>

        <!-- Profile dropdown -->
        <Menu as="div" class="relative ml-3">
            <div>
                <MenuButton class="flex rounded-full bg-gray-200 text-sm focus:outline-none" @click="router.push(PAGES.ACCOUNT)">
                    <span class="sr-only">Open user menu</span>
                    <img v-if="avatar" class="h-8 w-8 rounded-full"
                        :src="avatar" />
                    <div v-else>
                        <UserCircleIcon class="text-mountain-meadow w-8 h-8" />
                    </div>
                </MenuButton>
            </div>
        </Menu>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { PAGES } from "@/router/pages";
import { useUserStore } from '@/stores/userStore';

import { UserCircleIcon, MenuIcon, XIcon } from "@heroicons/vue/solid"
import { Menu, MenuButton } from '@headlessui/vue'
import { useAppStore } from '@/stores/appStore';
import userService from '@/service/api/userService';
import axios from 'axios';
import { useVaultStore } from '@/stores/vaultStore';

export default defineComponent({
    name: "Navigation",
    components: {
        UserCircleIcon,
        MenuIcon,
        XIcon,
        Menu,
        MenuButton
    },
    setup() {
        const router = useRouter();
        const userStore = useUserStore();
        const appStore = useAppStore();
        const vaultStore = useVaultStore();

        const avatar = ref();

        const email = computed(() => userStore.getEmail);
        const openMobileMenu = computed(() => appStore.shouldOpenMobileMenu);
        onMounted(async () => {
            // Fetch the users account avatar
            try {
                // Need the URL for the image
                let res = await userService.GetAvatar();
                const signedUrl = res.data.url as string;

                // Fetch and load the image
                res = await axios.get(signedUrl, { responseType: "blob" });
                const reader = new window.FileReader();
                reader.readAsDataURL(res.data);
                reader.onload = () => {
                    avatar.value = reader.result;
                }  
            } catch (e) {
                console.log("TODO: Handle this...")
            }
        })

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

            avatar,

            email,
            PAGES
        }
    }
})
</script>