<template>
    <!-- Sidebar -->
    <div class="flex flex-col h-full border-r-2 p-6 bg-gray-100 overflow-auto">

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
            <div v-if="showSidebarUserOptions"
                class="flex-col rounded shadow mt-3 text-gray-600 bg-white space-y-0.5 text-sm">
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
                <button class="flex flex-1 justify-start items-center space-x-2"
                    @click="showSidebarVaults = !showSidebarVaults">
                    <ChevronRightIcon v-if="!showSidebarVaults" class="w-4" />
                    <ChevronDownIcon v-else class="w-4" />
                    <p class="text-sm">Vaults</p>
                </button>

                <button class="p-1 rounded-full hover:bg-gray-200" @click="$emit('newVault')">
                    <PlusIcon class="w-4" />
                </button>
            </div>

            <!-- List all vaults -->
            <div v-if="showSidebarVaults" class="pt-2 space-y-1">
                <div v-for="vault in vaults" :key="vault.id"
                    class="flex p-2 rounded items-center justify-between space-x-2 cursor-pointer hover:bg-gray-200 transition"
                    :class="activeVaultID === vault.id ? 'bg-gray-200' : ''">
                    <!-- Vault icon and name -->
                    <div class="flex flex-1 items-center space-x-2" @click="changeVault(vault.id)">
                        <div
                            class="object-contain cursor-pointer rounded-full border-2 border-gray-300 bg-gray-200 h-8 w-8">
                            <img v-if="vault.icon" class="rounded-full object-cover" :src="vault.icon"
                                alt="Vault Icon" />
                            <img v-else class="rounded-full object-cover" src="@/assets/images/virki_logo_bg_dark.png"
                                alt="Vault Icon" />
                        </div>
                        <p class="text-sm">{{ vault.name }}</p>
                    </div>

                    <!-- More icon (3 dots) -->
                    <button class="rounded-full p-1 hover:bg-gray-300 transition" @click="$emit('editVault', vault.id)">
                        <DotsHorizontalIcon class="w-4 h-4 text-gray-400" />
                    </button>
                </div>
            </div>

            <!-- Show active vault even if sidebar is closed -->
            <div v-if="activeVault && activeVault.id && !showSidebarVaults"
                class="flex p-2 mt-2 rounded items-center space-x-2 cursor-pointer bg-gray-200">
                <div class="object-contain cursor-pointer rounded-full border-2 border-gray-300 bg-gray-200 h-8 w-8">
                    <img v-if="activeVault && activeVault.icon" class="rounded-full object-cover"
                        :src="activeVault.icon" alt="Vault Icon" />
                    <img v-else class="rounded-full object-cover" src="@/assets/images/virki_logo_bg_dark.png"
                        alt="Vault Icon" />
                </div>
                <p class="text-sm">{{ activeVault && activeVault.name }}</p>
            </div>
        </div>

        <!-- Tags -->
        <div class="p-4 text-gray-700">
            <div class="flex">
                <div class="flex flex-1 justify-start items-center space-x-2">
                    <ChevronDownIcon class="w-4" />
                    <p class="text-sm">Tags</p>
                </div>

                <button class="p-1 rounded-full hover:bg-gray-200">
                    <PlusIcon class="w-4" />
                </button>
            </div>

            <!-- TODO: List all tags -->
        </div>

        <!-- Status information -->
        <div class="flex flex-1 justify-center items-end">
            <button class="flex items-center justify-center p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                :title="isOnline ? 'Online' : 'Offline'"
                @click="isOnline ? showOnlineModal = !showOnlineModal : showOfflineModal = !showOfflineModal">
                <StatusOnlineIcon v-if="isOnline" class="w-5 h-5 text-mountain-meadow-50" />
                <StatusOfflineIcon v-else class="w-5 h-5 text-red-400" />
            </button>
        </div>

        <!-- Version information -->
        <div class="flex justify-center p-4">
            <p class="text-sm text-gray-400">
                <span class="text-mountain-meadow">Virki</span>
                v{{ version }}
            </p>
        </div>
    </div>

    <!-- Online alert modal -->
    <b-modal v-if="showOnlineModal" @ok="showOnlineModal = !showOnlineModal">
        <template v-slot:icon>
            <StatusOnlineIcon class="h-6 w-6 text-mountain-meadow" />
        </template>
        <template v-slot:body>
            <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">You're online!</h3>
            <div class="mt-2">
                <p class="text-sm text-gray-500">This device is online and can reach the Virki sync server.</p>
            </div>
        </template>
    </b-modal>

    <!-- Offline alert modal -->
    <b-modal v-if="showOfflineModal" @ok="showOfflineModal = !showOfflineModal">
        <template v-slot:icon>
            <StatusOfflineIcon class="h-6 w-6 text-red-400" />
        </template>
        <template v-slot:body>
            <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">You're offline!</h3>
            <div class="mt-2">
                <p class="text-sm text-gray-500">It appears this device is offline! Any features that require internet
                    connectivity have been disabled.</p>
            </div>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
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
    MailIcon,
    StatusOfflineIcon,
    StatusOnlineIcon

} from "@heroicons/vue/outline";
import { StarIcon } from "@heroicons/vue/solid"
import { useUserStore } from '@/stores/userStore';
import { computed } from '@vue/reactivity';
import { useVaultStore } from '@/stores/vaultStore';
import { version } from "../../package.json";
import { useAppStore } from '@/stores/appStore';

export default defineComponent({
    name: "Sidebar",
    emits: ["newVault", "editVault"],
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
        MailIcon,
        StatusOfflineIcon,
        StatusOnlineIcon
    },
    setup() {
        // Stores
        const appStore = useAppStore();
        const userStore = useUserStore();
        const vaultStore = useVaultStore();

        // Refs for sidebar menus
        const showSidebarUserOptions = ref(false);
        const showSidebarVaults = ref(false);
        const showCreateVaultModal = ref(false);

        // Refs for online/offline modals
        const showOnlineModal = ref(false);
        const showOfflineModal = ref(false);

        const isOnline = computed(() => appStore.isOnline);
        const email = computed(() => userStore.getEmail);
        const vaults = computed(() => vaultStore.getAll);
        const activeVaultID = computed(() => vaultStore.getActiveID);
        const activeVault = computed(() => vaultStore.getActive);

        // Function to handle changing vaults by updating the ID in the vault store.
        const changeVault = (id: string) => {
            vaultStore.setActive(id);
        }

        return {
            version,

            showSidebarUserOptions,
            showSidebarVaults,
            showCreateVaultModal,

            showOnlineModal,
            showOfflineModal,

            isOnline,
            email,
            vaults,
            activeVaultID,

            activeVault,

            changeVault
        }
    }
})
</script>