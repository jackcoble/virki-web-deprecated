<template>
    <!-- Sidebar -->
    <div class="flex flex-col h-full border-r-2 p-6 bg-gray-100 overflow-auto">
        <div class="flex-col space-y-2 p-4 text-gray-700">
            <!-- Back -->
            <router-link :to="PAGES.VAULT" class="py-2 pb-6 items-center space-x-2 cursor-pointer sm:hidden flex">
                <ArrowLeftIcon class="w-6" />
                <h2 class="text-sm">Back</h2>
            </router-link>

            <!-- Overview -->
            <router-link :to="PAGES.ACCOUNT" class="flex py-2 items-center space-x-2 cursor-pointer">
                <UserIcon class="w-6" />
                <h2 class="text-sm">Account</h2>
            </router-link>

            <!-- Sessions -->
            <router-link :to="PAGES.ACCOUNT_SESSIONS" class="flex py-2 items-center space-x-2 cursor-pointer">
                <DeviceTabletIcon class="w-6" />
                <h2 class="text-sm">Sessions</h2>
            </router-link>

            <!-- Change Password -->
            <div class="flex py-2 items-center space-x-2 cursor-pointer">
                <KeyIcon class="w-6" />
                <h2 class="text-sm">Password</h2>
            </div>

            <!-- Subscription -->
            <div class="flex py-2 items-center space-x-2 cursor-pointer">
                <SparklesIcon class="w-6 text-yellow-500" />
                <h2 class="text-sm">Subscription</h2>
            </div>
        </div>
        

        <!-- Logout area -->
        <div class="flex flex-1 space-x-2 justify-center items-end">
            <b-button classType="light" @click="doLock">
                <div class="flex flex-row justify-center items-center">
                    <LockClosedIcon class="w-4 mr-1" />
                    <span>Lock</span>
                </div>
            </b-button>

            <b-button classType="danger" @click="doLogout">
                <div class="flex flex-row justify-center items-center">
                    <LogoutIcon class="w-4 mr-1" />
                    <span>Logout</span>
                </div>
            </b-button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    DeviceTabletIcon,
    KeyIcon,
    SparklesIcon,
    UserIcon,
    LogoutIcon,
    LockClosedIcon,
    ArrowLeftIcon

} from "@heroicons/vue/outline";
import { PAGES } from '@/router/pages';
import { useLogout } from '@/composables/useLogout';
import { useRouter } from 'vue-router';
import userService from '@/service/api/userService';
import { useKeyStore } from '@/stores/keyStore';
import { useVaultStore } from '@/stores/vaultStore';

export default defineComponent({
    name: "ProfileSidebar",
    components: {
        DeviceTabletIcon,
        KeyIcon,
        SparklesIcon,
        UserIcon,
        LogoutIcon,
        LockClosedIcon,
        ArrowLeftIcon
    },
    setup() {
        const router = useRouter();

        const keyStore = useKeyStore();
        const vaultStore = useVaultStore();

        // Clear the master encryption key from cache and then navigate to the lock page
        const doLock = () => {
            keyStore.clearMasterEncryptionKey();
            vaultStore.clear();
      
            router.push(PAGES.LOCK);
        }

        // Clear all state and storage, push to login page
        const doLogout = async () => {
            // Attempt to revoke token
            try {
                await userService.Logout();
            } finally {
                useLogout();
                router.push(PAGES.ROOT);
            }
        }

        return {
            PAGES,

            doLock,
            doLogout
        }
    }
})
</script>