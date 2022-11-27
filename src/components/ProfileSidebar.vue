<template>
    <!-- Sidebar -->
    <div class="flex flex-col h-full border-r-2 p-6 bg-gray-100 overflow-auto">
        <div class="flex-col space-y-2 p-4 text-gray-700">
            <!-- Overview -->
            <router-link :to="PAGES.ACCOUNT" class="flex py-2 items-center space-x-2 cursor-pointer">
                <ClipboardListIcon class="w-6" />
                <h2 class="text-sm">Overview</h2>
            </router-link>

            <!-- Sessions -->
            <div class="flex py-2 items-center space-x-2 cursor-pointer">
                <DeviceTabletIcon class="w-6" />
                <h2 class="text-sm">Sessions</h2>
            </div>

            <!-- Change Password -->
            <div class="flex py-2 items-center space-x-2 cursor-pointer">
                <KeyIcon class="w-6" />
                <h2 class="text-sm">Password</h2>
            </div>

            <!-- Change Email -->
            <div class="flex py-2 items-center space-x-2 cursor-pointer">
                <AtSymbolIcon class="w-6" />
                <h2 class="text-sm">Email Address</h2>
            </div>

            <!-- Subscription -->
            <div class="flex py-2 items-center space-x-2 cursor-pointer">
                <SparklesIcon class="w-6 text-yellow-500" />
                <h2 class="text-sm">Subscription</h2>
            </div>
        </div>

        <!-- Logout area -->
        <div class="flex flex-1 justify-center items-end">
            <b-button classType="danger">
                Logout
            </b-button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    AtSymbolIcon,
    ClipboardListIcon,
    DeviceTabletIcon,
    KeyIcon,
    SparklesIcon

} from "@heroicons/vue/outline";
import { PAGES } from '@/router/pages';

export default defineComponent({
    name: "ProfileSidebar",
    components: {
        AtSymbolIcon,
        ClipboardListIcon,
        DeviceTabletIcon,
        KeyIcon,
        SparklesIcon,
    },
    setup() {
        return {
            PAGES
        }
    }
})
</script>