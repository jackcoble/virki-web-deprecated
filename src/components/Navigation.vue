<template>
    <div
        class="flex w-full justify-between items-center px-4 md:px-11 py-4 border-b-2 border-b-mountain-meadow bg-gray-100 space-x-3 shadow">
        <div>
            <!-- Logo -->
            <router-link :to="PAGES.LOGIN" class="hidden md:block">
                <img class="w-24" src="@/assets/images/virki_full_horizontal_transparent_dark.png" alt="Virki Logo" />
            </router-link>

            <!-- Menu Icon (only visible on mobile) -->
            <button class="block md:hidden text-mountain-meadow w-8" @click="toggleMobileMenu">
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
import { VirkiStorageService } from '@/common/services/storage.service';
import userService from '@/service/api/userService';
import { CryptoWorker } from '@/common/comlink';
import { useKeyStore } from '@/stores/keyStore';
import axios from 'axios';

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
        const keyStore = useKeyStore();

        const avatar = computed(() => userStore.getAvatarURL);
        const email = computed(() => userStore.getEmail);
        const openMobileMenu = computed(() => appStore.shouldOpenMobileMenu);

        /**
         * Function to toggle whether mobile menu should be opened
         */
        const toggleMobileMenu = () => {
            const currentOpenMobileMenu = appStore.shouldOpenMobileMenu;
            appStore.setOpenMobileMenu(!currentOpenMobileMenu);
        }

        onMounted(async () => {
            // Attempt to retrieve and set the avatar file from IndexedDB.
            // If we don't have it present there, then we should request for the file from the API
            // and decrypt it.
            const cryptoWorker = await new CryptoWorker();
            const storageService = new VirkiStorageService();
            const masterEncryptionKey = keyStore.getMasterEncryptionKey;

            // Request for the avatar file. This will enable us to check if the object key
            // is different.
            const existingAvatarKey = await storageService.getAvatarKey();
            const avatar = await userService.GetAvatar();

            let updateAvatar = false;
            if (avatar.data.file && existingAvatarKey !== avatar.data.file.key) {
                // The object key we have from the API is different to what we have locally
                // so force an update
                updateAvatar = true;
            }

            // If we have no local avatar file, or the file needs updating
            // then decrypt the avatar. 
            const avatarFile = await storageService.getAvatar();
            if (!avatarFile || updateAvatar) {
                // Request for Presigned file URL and metadata
                let res = avatar;
                const avatarFile = res.data.file;
                const metadata = res.data.metadata;

                // First, let us decrypt the encryption key with our master key
                const encryptionKey = await cryptoWorker.decryptFromB64CipherString(metadata.encryption_key, masterEncryptionKey);

                // Decrypt the MIME type with the encryption key
                const mimeType = await cryptoWorker.decryptFromB64CipherStringToUTF8(metadata.mime_type, encryptionKey);

                // Fetch the contents of the file from directly from S3
                res = await axios.get(avatarFile.url, {
                    responseType: "arraybuffer"
                });
                const file = res.data as ArrayBuffer;
                const uintFile = new Uint8Array(file);

                // Decrypt file into a blob for us to then store in IndexedDB
                const decryptedFile: Blob = await cryptoWorker.decryptFile(uintFile, mimeType, metadata.encryption_header, encryptionKey);
                const storageService = new VirkiStorageService();
                await storageService.addAvatar(avatarFile.key, decryptedFile);

                const avatarFileObjectURL = URL.createObjectURL(decryptedFile);
                userStore.setAvatarURL(avatarFileObjectURL);
            } else {
                // We found the file locally...
                const avatarFileObjectURL = URL.createObjectURL(avatarFile);
                userStore.setAvatarURL(avatarFileObjectURL);
            }
        })

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