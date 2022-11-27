<template>
    <div
        class="flex w-full justify-between items-center px-4 md:px-11 py-4 border-b-2 border-b-mountain-meadow bg-gray-100 space-x-3 shadow">
        <div>
            <!-- Logo -->
            <router-link :to="determineRootUrl()" class="hidden md:block">
                <img class="w-24" src="@/assets/images/virki_full_horizontal_transparent_dark.png" alt="Virki Logo" />
            </router-link>

            <!-- Menu Icon (only visible on mobile) -->
            <button class="block md:hidden text-mountain-meadow w-9" @click="toggleMobileMenu">
                <MenuIcon v-if="!openMobileMenu" />
                <XIcon v-else />
            </button>
        </div>

        <!-- Profile dropdown -->
        <Menu as="div" class="relative ml-3">
            <div>
                <MenuButton class="flex rounded-full bg-gray-200 text-sm focus:outline-none">
                    <span class="sr-only">Open user menu</span>
                    <img v-if="avatar" class="h-8 w-8 rounded-full"
                        :src="avatar" />
                    <div v-else>
                        <UserCircleIcon class="text-mountain-meadow w-8 h-8" />
                    </div>
                </MenuButton>
            </div>
            <transition enter-active-class="transition ease-out duration-100"
                enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95">
                <MenuItems
                    class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <MenuItem v-slot="{ active }">
                    <router-link to="/profile" :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">
                        <div class="flex space-x-2">
                            <UserCircleIcon class="w-4" />
                            <span>My Profile</span>
                        </div>
                    </router-link>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                    <router-link to="/sessions" :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">
                        <div class="flex space-x-2">
                            <DeviceMobileIcon class="w-4" />
                            <span>Active Sessions</span>
                        </div>
                    </router-link>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                    <a href="#" :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">
                        <div class="flex space-x-2">
                            <LogoutIcon class="w-4" />
                            <span>Logout</span>
                        </div>
                    </a>
                    </MenuItem>
                </MenuItems>
            </transition>
        </Menu>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { PAGES } from "@/router/pages";
import { useUserStore } from '@/stores/userStore';

import { UserCircleIcon, MenuIcon, XIcon, DeviceMobileIcon, LogoutIcon } from "@heroicons/vue/solid"
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
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
        DeviceMobileIcon,
        LogoutIcon,
        Menu, MenuButton, MenuItem, MenuItems
    },
    setup() {
        const router = useRouter();
        const userStore = useUserStore();
        const appStore = useAppStore();
        const vaultStore = useVaultStore();

        const avatar = ref();

        const email = computed(() => userStore.getEmail);
        const openMobileMenu = computed(() => appStore.shouldOpenMobileMenu);
        const activeVaultId = computed(() => vaultStore.getActiveID)

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

        /**
         * If an active vault is set, the root URL should be `${PAGES.VAULT}/{VaultID}`
         * If not, then it should just be `${PAGES.VAULT}`
         */
        const determineRootUrl = (): string => {
            let url = PAGES.VAULT as string;
            if (activeVaultId.value) {
                url = `${PAGES.VAULT}/${activeVaultId.value}`;
            }

            return url;
        }

        return {
            toggleMobileMenu,
            openMobileMenu,
            determineRootUrl,

            router,

            avatar,

            email,
            PAGES
        }
    }
})
</script>