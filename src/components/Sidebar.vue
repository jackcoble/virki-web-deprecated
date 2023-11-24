<template>
    <!-- Sidebar -->
    <div class="flex flex-col h-full border-r-2 p-6 bg-gray-100 overflow-auto">
        <!-- Vaults -->
        <div class="p-4 text-gray-700">
            <!-- All items -->
            <div class="flex p-2 mb-1 rounded items-center justify-between space-x-2 cursor-pointer hover:bg-gray-200 transition"
                :class="route.path === PAGES.VAULT ? 'bg-gray-200' : ''" @click="router.push(PAGES.VAULT)">
                <div class="flex flex-1 items-center space-x-2">
                    <div
                        class="flex justify-center items-center cursor-pointer rounded-full border-2 border-gray-300 bg-gray-200 h-8 w-8">
                        <CollectionIcon class="w-4 h-4 text-mountain-meadow" />
                    </div>
                    <p class="text-sm">All Items</p>
                </div>
            </div>

            <!-- Favourites -->
            <div class="flex p-2 mb-4 rounded items-center justify-between space-x-2 cursor-pointer hover:bg-gray-200 transition"
                :class="route.path === PAGES.FAVOURITES ? 'bg-gray-200' : ''" @click="router.push(PAGES.FAVOURITES)">
                <div class="flex flex-1 items-center space-x-2">
                    <div
                        class="flex justify-center items-center cursor-pointer rounded-full border-2 border-gray-300 bg-gray-200 h-8 w-8">
                        <StarIcon class="w-4 h-4 text-yellow-500" />
                    </div>
                    <p class="text-sm">Favourites</p>
                </div>
            </div>

            <div class="flex">
                <button class="flex flex-1 justify-start items-center space-x-2"
                    @click="showSidebarVaults = !showSidebarVaults">
                    <ChevronRightIcon v-if="!showSidebarVaults" class="w-4" />
                    <ChevronDownIcon v-else class="w-4" />
                    <p class="text-sm">Vaults</p>
                </button>

                <button class="p-1 rounded-full hover:bg-gray-200" @click="showCreateVaultModal = !showCreateVaultModal">
                    <PlusIcon class="w-4" />
                </button>
            </div>

            <!-- List all vaults -->
            <div v-if="showSidebarVaults" class="pt-2">
                <div class="space-y-1">
                    <div v-for="vault in vaults" :key="vault.id" @contextmenu.prevent="handleContextMenu(vault.id)">
                        <div class="flex p-2 rounded items-center justify-between space-x-2 space-y-1 cursor-pointer hover:bg-gray-200 transition"
                            :class="route.params.id === vault.id ? 'bg-gray-200' : ''">
                            <!-- Vault icon and name -->
                            <div class="flex flex-1 items-center space-x-2" @click="changeVault(vault.id)">
                                <div
                                    class="flex justify-center items-center object-contain cursor-pointer rounded-full border-2 border-gray-300 bg-gray-200 h-8 w-8">
                                    <!-- <img v-if="!!vault.icon" class="rounded-full object-cover" :src="vault.icon" alt="Vault Icon" /> -->
                                    <CubeIcon class="w-4 h-4 text-mountain-meadow" />
                                </div>

                                <p class="text-sm flex-1">{{ vault.name }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="showSidebarVaults && vaults.length === 0">
                <div class="flex py-2 items-center space-x-2">
                    <EmojiSadIcon class="w-6 text-mountain-meadow" />
                    <h2 class="text-sm">No vaults available...</h2>
                </div>
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

    <!-- Create vault modal -->
    <CreateVaultModal v-if="showCreateVaultModal" @ok="showCreateVaultModal = !showCreateVaultModal"
        @cancel="showCreateVaultModal = !showCreateVaultModal" />

    <!-- Delete vault modal -->
    <DeleteVaultModal v-if="showDeleteVaultModal"
        :vault-id="vaultContextMenu.vaultId"
        @cancel="showDeleteVaultModal = !showDeleteVaultModal"
        @close="showDeleteVaultModal = !showDeleteVaultModal"
    />

    <!-- Edit vault modal -->
    <EditVaultModal v-if="showEditVaultModal"
        :vault-id="vaultContextMenu.vaultId"
        @cancel="showEditVaultModal = !showEditVaultModal"
        @close="showEditVaultModal = !showEditVaultModal"
    />

    <!-- Vault context menu -->
    <VaultContextMenu v-if="vaultContextMenu.show"
        :x="vaultContextMenu.x"
        :y="vaultContextMenu.y"
        :actions="vaultContextMenu.actions"
        @action="handleContextMenuAction"
    />
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import {
    UserIcon,
    ChevronDownIcon,
    KeyIcon,
    LogoutIcon,
    ChevronRightIcon,
    PlusIcon,
    DotsHorizontalIcon,
    ShieldCheckIcon,
    DeviceMobileIcon,
    MailIcon,
    StatusOfflineIcon,
    StatusOnlineIcon,
    EmojiSadIcon,
    CollectionIcon,
    CubeIcon,
    StarIcon

} from "@heroicons/vue/outline";
import { useUserStore } from '@/stores/userStore';
import { computed } from '@vue/reactivity';
import { useVaultStore } from '@/stores/vaultStore';
import { version } from "../../package.json";
import { useAppStore } from '@/stores/appStore';
import { useRoute, useRouter } from 'vue-router';
import { PAGES } from '@/router/pages';
import CreateVaultModal from './modals/CreateVaultModal.vue';
import DeleteVaultModal from './modals/DeleteVaultModal.vue';
import EditVaultModal from "./modals/EditVaultModal.vue";
import VaultContextMenu from './VaultContextMenu.vue';
import draggable from 'vuedraggable';
import { useMouse } from '@vueuse/core';

export default defineComponent({
    name: "Sidebar",
    emits: ["newVault", "editVault"],
    components: {
        UserIcon,
        ChevronDownIcon,
        KeyIcon,
        LogoutIcon,
        ChevronRightIcon,
        PlusIcon,
        DotsHorizontalIcon,
        ShieldCheckIcon,
        DeviceMobileIcon,
        MailIcon,
        StatusOfflineIcon,
        StatusOnlineIcon,
        EmojiSadIcon,
        CollectionIcon,
        StarIcon,
        CubeIcon,
        CreateVaultModal,
        DeleteVaultModal,
        EditVaultModal,
        VaultContextMenu,
        draggable
    },
    setup() {
        // Stores
        const appStore = useAppStore();
        const userStore = useUserStore();
        const vaultStore = useVaultStore();

        const router = useRouter();
        const route = useRoute();

        // X and Y cursor values
        const { x, y } = useMouse();
        const vaultContextMenu = ref({
            show: false,
            x: 0,
            y: 0,
            actions: [
                {
                    name: "Edit vault",
                    emits: "edit-vault"
                },
                {
                    name: "Delete vault",
                    emits: "delete-vault"
                }
            ],
            vaultId: ""
        });

        // Refs for sidebar menus
        const showSidebarVaults = ref(true);
        const showCreateVaultModal = ref(false);
        const showDeleteVaultModal = ref(false);
        const showEditVaultModal = ref(false);

        // Refs for online/offline modals
        const showOnlineModal = ref(false);
        const showOfflineModal = ref(false);

        const isOnline = computed(() => appStore.isOnline);
        const email = computed(() => userStore.getEmail);
        const vaults = computed(() => vaultStore.getAll);

        const vaultIdPresent = computed(() => !!route.query.vault);
        const activeVaultID = computed(() => route.query.vault);

        const changeVault = (id: string) => {
            router.push(`${PAGES.VAULT}/${id}`);
        }
        const editVault = (id: string) => {
            router.push(`${PAGES.VAULT}/${id}/edit`);
        }

        // Handle what happens when we receive the context menu event
        // We should set X and Y values, as well as the Vault ID context.
        const handleContextMenu = (vaultId: string) => {
            vaultContextMenu.value.show = true;
            vaultContextMenu.value.x = x.value;
            vaultContextMenu.value.y = y.value;
            vaultContextMenu.value.vaultId = vaultId;
        }

        // Handle the action we receive back from the context menu component
        const handleContextMenuAction = (action: string) => {
            switch (action) {
                case "edit-vault": {
                    showEditVaultModal.value = true;
                    break;
                }
                case "delete-vault": {
                    showDeleteVaultModal.value = true;
                    break;
                }
                case "close-menu": {
                    vaultContextMenu.value.show = false;
                }
            }
        }

        return {
            router,
            route,
            version,

            PAGES,

            showSidebarVaults,
            showCreateVaultModal,
            showDeleteVaultModal,
            showEditVaultModal,

            showOnlineModal,
            showOfflineModal,

            isOnline,
            email,
            vaults,
            activeVaultID,
            vaultIdPresent,
            vaultContextMenu,

            changeVault,
            editVault,
            handleContextMenu,
            handleContextMenuAction
        }
    }
})
</script>