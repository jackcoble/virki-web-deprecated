<template>
    <!-- Sidebar -->
    <div class="h-full border-r-2 p-6 bg-gray-100 overflow-auto">

        <!-- Avatar and user name -->
        <div class="p-4">
            <div class="flex items-center text-gray-800 cursor-pointer"
                @click="showSidebarUserOptions = !showSidebarUserOptions">
                <div class="flex flex-1 justify-start space-x-2">
                    <UserIcon class="w-6" />
                    <h2>{{ email }}</h2>
                </div>

                <div class="ml-2">
                    <ChevronDownIcon class="w-4" />
                </div>
            </div>

            <!-- User options -->
            <div v-if="showSidebarUserOptions" class="flex-col rounded shadow mt-3 text-gray-600 bg-white space-y-0.5 text-sm">
                <!-- Recovery Key -->
                <div class="flex items-center space-x-2 px-3 py-2 cursor-pointer rounded">
                    <ShieldCheckIcon class="w-4" />
                    <p>Recovery Key</p>
                </div>

                <!-- Change Password -->
                <div class="flex items-center space-x-2 px-3 py-2 cursor-pointer rounded">
                    <KeyIcon class="w-4" />
                    <p>Change Password</p>
                </div>

                <!-- Change Email -->
                <div class="flex items-center space-x-2 px-3 py-2 cursor-pointer rounded">
                    <MailIcon class="w-4" />
                    <p>Change Email Address</p>
                </div>

                <!-- Sessions management -->
                <div class="flex items-center space-x-2 px-3 py-2 cursor-pointer rounded">
                    <DeviceMobileIcon class="w-4" />
                    <p>Active Sessions</p>
                </div>

                <!-- Logout -->
                <div class="flex items-center space-x-2 px-3 py-2 cursor-pointer text-red-400 rounded">
                    <LogoutIcon class="w-4" />
                    <p>Logout</p>
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
                <button class="flex flex-1 justify-start items-center space-x-2" @click="showSidebarVaults = !showSidebarVaults">
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
                <div v-for="vault in vaults" :key="vault.id" class="flex p-2 rounded items-center space-x-2 cursor-pointer">
                    <div
                        class="object-contain cursor-pointer rounded-full border-2 border-gray-300 bg-gray-200 h-6 w-6">
                        <img v-if="vault.icon" class="rounded-full object-cover" :src="vault.icon" alt="Vault Icon" />
                        <img v-else class="rounded-full object-cover" src="@/assets/images/default_vault_icon.png" alt="Vault Icon" />
                    </div>
                    <p class="text-sm">{{ vault.name }}</p>
                </div>
            </div>
        </div>

        <!-- Tags -->
        <div class="p-4 text-gray-700">
            <div class="flex">
                <div class="flex flex-1 justify-start items-center space-x-2">
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
import { defineComponent, onMounted, ref } from 'vue';
import {
    UserIcon,
    ChevronDownIcon,
    KeyIcon,
    LogoutIcon,
    InboxIcon,
    ChevronRightIcon,
    PlusIcon,
    DotsHorizontalIcon,
    ShieldCheckIcon,
    DeviceMobileIcon,
    MailIcon

} from "@heroicons/vue/outline";
import { StarIcon } from "@heroicons/vue/solid"
import userService from '@/service/api/userService';
import { useUserStore } from '@/stores/userStore';
import { computed } from '@vue/reactivity';
import { useVaultStore } from '@/stores/vaultStore';

export default defineComponent({
    name: "Sidebar",
    components: {
        UserIcon,
        ChevronDownIcon,
        KeyIcon,
        LogoutIcon,
        InboxIcon,
        StarIcon,
        ChevronRightIcon,
        PlusIcon,
        DotsHorizontalIcon,
        ShieldCheckIcon,
        DeviceMobileIcon,
        MailIcon
    },
    setup() {
        // Refs for sidebar menus
        const showSidebarUserOptions = ref(false);
        const showSidebarVaults = ref(false);
        const showCreateVaultModal = ref(false);

        // Stores
        const userStore = useUserStore();
        const vaultStore = useVaultStore();

        const email = computed(() => userStore.getEmail);
        const vaults = computed(() => vaultStore.getAll);

        onMounted(async () => {
            // Fetch account data
            const account = await userService.GetAccount();
            if (account.data) {
                // Set email address
                userStore.setEmail(account.data.email)
            }
        })

        return {
            showSidebarUserOptions,
            showSidebarVaults,
            showCreateVaultModal,

            email,
            vaults
        }
    }
})
</script>