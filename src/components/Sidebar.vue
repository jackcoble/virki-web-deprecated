<template>
    <!-- Sidebar -->
    <div class="border-r-2 flex-col p-6 xl:w-1/6 md:w-1/4 w-2/6 bg-gray-100 overflow-auto">

        <!-- Avatar and user name -->
        <div class="p-4">
            <div class="flex items-center text-purple-800 cursor-pointer"
                @click="showSidebarUserOptions = !showSidebarUserOptions">
                <div class="flex flex-1 justify-start space-x-2">
                    <UserIcon class="w-6" />
                    <h2>{{ user.name }}</h2>
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

            <!-- List all vaults -->
            <div v-if="showSidebarVaults" class="pt-2 space-y-1">
                <div v-for="vault in vaults" class="flex p-2 rounded items-center space-x-2 cursor-pointer"
                    :class="activeVault?._id === vault._id ? 'bg-gray-200' : ''"
                    @click="setActiveVault(vault._id)">
                    <div
                        class="object-contain cursor-pointer rounded-full border-2 border-gray-300 bg-gray-200 h-6 w-6">
                        <img class="rounded-full object-cover" src="@/assets/images/default_vault_icon.png"
                            alt="Vault Icon">
                    </div>
                    <p class="text-sm">{{ vault.name }}</p>
                </div>
            </div>

            <!-- Show active vault even if sidebar is closed -->
            <div v-if="activeVault?._id && !showSidebarVaults"
                class="flex p-2 mt-2 rounded items-center space-x-2 cursor-pointer bg-gray-200">
                <div class="object-contain cursor-pointer rounded-full border-2 border-gray-300 bg-gray-200 h-6 w-6">
                    <img class="rounded-full object-cover" src="@/assets/images/default_vault_icon.png"
                        alt="Vault Icon">
                </div>
                <p class="text-sm">{{ activeVault?.name }}</p>
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
import { useAuthenticationStore } from '@/stores/authenticationStore';
import { useVaultStore } from '@/stores/vaultStore';
import { computed, defineComponent, ref } from 'vue';
import {
    UserIcon,
    ChevronDownIcon,
    LockClosedIcon,
    LogoutIcon,
    InboxIcon,
    StarIcon,
    ChevronRightIcon,
    PlusIcon

} from "@heroicons/vue/outline";

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
        PlusIcon
    },
    setup() {
        const authenticationStore = useAuthenticationStore();
        const vaultStore = useVaultStore();

        // Computed properties
        const user = computed(() => authenticationStore.getUser);
        const activeVault = computed(() => vaultStore.getActiveVault);
        const vaults = computed(() => vaultStore.getVaults);

        // Refs for sidebar menus
        const showSidebarUserOptions = ref(false);
        const showSidebarVaults = ref(false);

        // Update active vault in store
        const setActiveVault = (vault_id: string) => {
            vaultStore.setActiveVault(vault_id);
        }

        return {
            user,
            activeVault,
            vaults,

            showSidebarUserOptions,
            showSidebarVaults,

            setActiveVault
        }
    }
})
</script>