<template>
    <!-- Sidebar -->
    <div class="flex flex-col h-full border-r-2 p-6 bg-gray-100 overflow-auto">
        <!-- All Items -->
        <div class="flex-col space-y-2 p-4 text-gray-700">
            <div class="flex py-2 items-center space-x-2 cursor-pointer" @click="router.push('/vaults/all')">
                <InboxIcon class="w-6" />
                <h2 class="text-sm">All Items</h2>
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

                <button class="p-1 rounded-full hover:bg-gray-200" @click="router.push(PAGES.NEW_VAULT)">
                    <PlusIcon class="w-4" />
                </button>
            </div>

            <!-- List all vaults -->
            <div v-if="showSidebarVaults && vaults.length !== 0" class="pt-2 space-y-1">
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
                    <button class="rounded-full p-1 hover:bg-gray-300 transition"
                        @click="router.push(`/vaults/${vault.id}/edit`)">
                        <DotsHorizontalIcon class="w-4 h-4 text-gray-400" />
                    </button>
                </div>
            </div>
            <div v-if="showSidebarVaults && vaults.length === 0" class="p-2">
                <div class="flex py-2 items-center space-x-2">
                    <EmojiSadIcon class="w-6 text-mountain-meadow" />
                    <h2 class="text-sm">No vaults available...</h2>
                </div>
            </div>

            <!-- Show active vault even if sidebar is closed -->
            <div v-if="activeVault && activeVault.id && !showSidebarVaults"
                class="flex p-2 mt-2 rounded items-center space-x-2 cursor-pointer bg-gray-200">

                <!-- Vault icon and name -->
                <div class="flex flex-1 items-center space-x-2" @click="changeVault(activeVaultID)">
                    <div
                        class="object-contain cursor-pointer rounded-full border-2 border-gray-300 bg-gray-200 h-8 w-8">
                        <img v-if="activeVault && activeVault.icon" class="rounded-full object-cover"
                            :src="activeVault.icon" alt="Vault Icon" />
                        <img v-else class="rounded-full object-cover" src="@/assets/images/virki_logo_bg_dark.png"
                            alt="Vault Icon" />
                    </div>
                    <p class="text-sm">{{ activeVault && activeVault.name }}</p>
                </div>

                <!-- More icon (3 dots) -->
                <button class="rounded-full p-1 hover:bg-gray-300 transition"
                    @click="router.push(`/vaults/${activeVaultID}/edit`)">
                    <DotsHorizontalIcon class="w-4 h-4 text-gray-400" />
                </button>
            </div>
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
    StatusOnlineIcon,
    EmojiSadIcon

} from "@heroicons/vue/outline";
import { useUserStore } from '@/stores/userStore';
import { computed } from '@vue/reactivity';
import { useVaultStore } from '@/stores/vaultStore';
import { version } from "../../package.json";
import { useAppStore } from '@/stores/appStore';
import { useLogout } from '@/composables/useLogout';
import { useRouter } from 'vue-router';
import { PAGES } from '@/router/pages';
import userService from '@/service/api/userService';

export default defineComponent({
    name: "Sidebar",
    emits: ["newVault", "editVault"],
    components: {
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
        StatusOnlineIcon,
        EmojiSadIcon
    },
    setup() {
        // Stores
        const appStore = useAppStore();
        const userStore = useUserStore();
        const vaultStore = useVaultStore();

        const router = useRouter();

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
            vaultStore.setActiveVault(id);
            router.push({ path: `${PAGES.VAULT}/${id}` })
        }

        // Function to handle when the user wants to logout
        const doLogout = async () => {
            // Post to logout
            try {
                await userService.Logout();
            } catch (error) {
                console.log("There was an error logging user out:", e.response);
            } finally {
                // Regardless of the outcome, clear all state in the browser to be safe
                await useLogout();
                router.push({ path: PAGES.ROOT })
            }
        }

        return {
            router,
            version,

            PAGES,

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

            changeVault,
            doLogout
        }
    }
})
</script>