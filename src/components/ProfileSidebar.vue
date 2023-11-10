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
            <router-link :to="PAGES.ACCOUNT" class="flex p-2 rounded items-center space-x-2 cursor-pointer hover:bg-gray-200 transition" :class="route.path === PAGES.ACCOUNT ? 'bg-gray-200 rounded p-2' : ''">
                <UserIcon class="w-6" />
                <h2 class="text-sm">Account</h2>
            </router-link>

            <!-- Sessions -->
            <router-link :to="PAGES.ACCOUNT_SESSIONS" class="flex p-2 rounded items-center space-x-2 cursor-pointer hover:bg-gray-200 transition" :class="route.path === PAGES.ACCOUNT_SESSIONS ? 'bg-gray-200 rounded p-2' : ''">
                <DeviceTabletIcon class="w-6" />
                <h2 class="text-sm">Sessions</h2>
            </router-link>

            <!-- Change Password -->
            <router-link :to="PAGES.LOGIN" class="flex p-2 rounded items-center space-x-2 cursor-pointer hover:bg-gray-200 transition" :class="route.path === '' ? 'bg-gray-200 rounded p-2' : ''">
                <KeyIcon class="w-6" />
                <h2 class="text-sm">Password</h2>
            </router-link>

            <!-- Account Recovery -->
            <router-link :to="PAGES.LOGIN" class="flex p-2 rounded items-center space-x-2 cursor-pointer hover:bg-gray-200 transition" :class="route.path === '' ? 'bg-gray-200 rounded p-2' : ''">
                <SupportIcon class="w-6 text-red-500" />
                <h2 class="text-sm">Recovery</h2>
            </router-link>

            <!-- Subscription -->
            <router-link :to="PAGES.LOGIN" class="flex p-2 rounded items-center space-x-2 cursor-pointer hover:bg-gray-200 transition" :class="route.path === '' ? 'bg-gray-200 rounded p-2' : ''">
                <SparklesIcon class="w-6 text-yellow-500" />
                <h2 class="text-sm">Subscription</h2>
            </router-link>
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
    ArrowLeftIcon,
    SupportIcon
} from "@heroicons/vue/outline";

import { PAGES } from '@/router/pages';
import { useLogout } from '@/composables/useLogout';
import { useRoute, useRouter } from 'vue-router';
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
        ArrowLeftIcon,
        SupportIcon
    },
    setup() {
        const router = useRouter();
        const route = useRoute();

        const keyStore = useKeyStore();
        const vaultStore = useVaultStore();

        // Clear the master encryption key from cache and then navigate to the lock page
        const doLock = () => {
            keyStore.clear();
            vaultStore.clear();
      
            router.push(PAGES.LOCK);
        }

        // Clear all state and storage, push to login page
        const doLogout = async () => {
            // Attempt to revoke token
            try {
                // await userService.Logout();
            } finally {
                useLogout();
                router.push(PAGES.LOGIN);
            }
        }

        return {
            PAGES,
            route,

            doLock,
            doLogout
        }
    }
})
</script>