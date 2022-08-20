<template>
    <!-- Sidebar -->
    <div class="h-full border-r-2 p-6 bg-gray-100 overflow-auto">

        <!-- Avatar and user name -->
        <div class="p-4">
            <div class="flex items-center text-gray-800 cursor-pointer"
                @click="showSidebarUserOptions = !showSidebarUserOptions">
                <div class="flex flex-1 justify-start space-x-2">
                    <UserIcon class="w-6" />
                    <h2>Jack Coble</h2>
                </div>

                <div>
                    <ChevronDownIcon class="w-4" />
                </div>
            </div>

            <!-- User options -->
            <div v-if="showSidebarUserOptions" class="flex-col mt-3 text-gray-600 space-y-1">
                <!-- Lock -->
                <div class="flex items-center space-x-2 p-3 cursor-pointer bg-gray-200 rounded">
                    <LockClosedIcon class="w-4" />
                    <h2 class="text-xs">Lock</h2>
                </div>

                <!-- Sign Out -->
                <div class="flex items-center space-x-2 p-3 cursor-pointer bg-gray-200 text-red-400 rounded">
                    <LogoutIcon class="w-4" />
                    <h2 class="text-xs">Sign Out</h2>
                </div>
            </div>
        </div>

        <!-- All Items and Favourites -->
        <div class="flex-col space-y-2 p-4 text-gray-700">
            <div class="flex py-2 items-center space-x-2">
                <InboxIcon class="w-6" />
                <h2 class="text-sm">All Items</h2>
            </div>

            <div class="flex py-2 items-center space-x-2">
                <StarIcon class="w-6 text-yellow-400" />
                <h2 class="text-sm">Favourites</h2>
            </div>
        </div>

        <!-- Vaults -->
        <div class="p-4 text-gray-700">
            <div class="flex">
                <button class="flex flex-1 justify-start space-x-2" @click="showSidebarVaults = !showSidebarVaults">
                    <ChevronRightIcon v-if="!showSidebarVaults" class="w-4" />
                    <ChevronDownIcon v-else class="w-4" />
                    <p class="text-sm">Vaults</p>
                </button>

                <button @click="showCreateVaultModal = !showCreateVaultModal">
                    <PlusIcon class="w-4" />
                </button>
            </div>
        </div>

        <!-- Tags -->
        <div class="p-4 text-gray-700">
            <div class="flex">
                <div class="flex flex-1 justify-start space-x-2">
                    <ChevronDownIcon class="w-4" />
                    <p class="text-sm">Tags</p>
                </div>

                <button>
                    <PlusIcon class="w-4" />
                </button>
            </div>

            <!-- TODO: List all tags -->
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import {
    UserIcon,
    ChevronDownIcon,
    LockClosedIcon,
    LogoutIcon,
    InboxIcon,
    ChevronRightIcon,
    PlusIcon,
    DotsHorizontalIcon

} from "@heroicons/vue/outline";
import { StarIcon } from "@heroicons/vue/solid"

export default defineComponent({
    name: "Sidebar",
    components: {
        UserIcon,
        ChevronDownIcon,
        LockClosedIcon,
        LogoutIcon,
        InboxIcon,
        StarIcon,
        ChevronRightIcon,
        PlusIcon,
        DotsHorizontalIcon
    },
    setup() {
        // Computed properties

        // Refs for sidebar menus
        const showSidebarUserOptions = ref(false);
        const showSidebarVaults = ref(false);
        const showCreateVaultModal = ref(false);

        return {
            showSidebarUserOptions,
            showSidebarVaults,
            showCreateVaultModal
        }
    }
})
</script>