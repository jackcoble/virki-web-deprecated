<template>
    <!-- Manual Entry -->
    <div class="flex flex-col h-full w-1/2 p-4 pt-12 space-y-3 mx-auto">
        <!-- Title/Issuer -->
        <div class="flex space-x-4 items-center">
            <div>
                <!-- Icon uploader -->
                <div class="flex justify-center">
                    <EncryptedFileUpload :encryption-key="masterEncryptionKey" @object-key="handleObjectKey" />
                </div>
            </div>

            <div class="flex-grow">
                <label for="issuer" class="block mb-2 font-medium text-gray-900">Service</label>
                <div class="relative">
                    <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                        <GlobeIcon class="w-5 h-5 text-gray-500" />
                    </div>
                    <input type="text" id="issuer" v-model="token.service"
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                        placeholder="e.g. Twitter">
                </div>
            </div>
        </div>

        <!-- Account -->
        <div>
            <label for="username" class="block mb-2 font-medium text-gray-900">Account</label>
            <div class="relative">
                <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                    <UserIcon class="w-5 h-5 text-gray-500" />
                </div>
                <input type="text" id="label" v-model="token.account"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                    placeholder="e.g. user@example.com">
            </div>
        </div>

        <!-- Secret/Seed -->
        <div>
            <label for="secret" class="block mb-2 font-medium text-gray-900">Secret/Seed</label>
            <div class="relative">
                <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                    <KeyIcon class="w-5 h-5 text-gray-500" />
                </div>
                <input type="text" id="secret" v-model="token.secret"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                    placeholder="e.g. JBSWY3D...">
            </div>
        </div>

        <!-- Vault -->
        <div>
            <label for="vault" class="block mb-2 font-medium text-gray-900">Vault</label>
            <select id="vault" v-model="token.vault_id"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                <option v-for="vault in vaults" :key="vault.id" :value="vault.id">{{ vault.name }}</option>
            </select>
        </div>

        <!-- Backup Codes -->
        <!--
        <div>
            <label for="backupcodes" class="block mb-2 font-medium text-gray-900">Backup Codes (Optional)</label>
            <textarea class="block w-full form-textarea rounded-lg bg-gray-50 border border-gray-300 text-sm" rows="5" placeholder="Enter some backup codes..."></textarea>
        </div>
        -->

        <!-- Advanced options -->
        <div class="flex">
            <button class="flex flex-1 justify-start items-center space-x-2" @click="showAdvanced = !showAdvanced">
                <ChevronRightIcon v-if="!showAdvanced" class="w-4" />
                <ChevronDownIcon v-else class="w-4" />
                <p>Advanced</p>
            </button>

            <button class="p-1 rounded-full hover:bg-gray-200" @click="router.push(PAGES.NEW_VAULT)">
                <PlusIcon class="w-4" />
            </button>
        </div>
        <div v-if="showAdvanced" class="border rounded border-gray-200 p-3 space-y-2">
            <p class="text-xs text-center p-3.5 bg-gray-200 rounded text-gray-800">If you are unfamiliar with these advanced
                options, do not change them. Otherwise the generated OTP code will not work.</p>

            <!-- Algorithm -->
            <div>
                <label for="algorithm" class="block mb-2 font-medium text-gray-900">Algorithm</label>
                <select id="algorithm" v-model="token.algorithm"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                    <option :value="OTPAlgorithm.SHA1">SHA-1</option>
                    <option :value="OTPAlgorithm.SHA256">SHA-256</option>
                    <option :value="OTPAlgorithm.SHA512">SHA-512</option>
                </select>
            </div>

            <!-- Token Length -->
            <div>
                <label for="length" class="block mb-2 font-medium text-gray-900">Token Length</label>
                <select id="length"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                    <option :value="6">6 digits</option>
                    <option :value="7">7 digits</option>
                    <option :value="8">8 digits</option>
                </select>
            </div>

            <!-- Token Type -->
            <div>
                <label for="type" class="block mb-2 font-medium text-gray-900">Type</label>
                <select id="type" v-model="token.type"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                    <option :value="OTPType.TOTP">Time Based (TOTP)</option>
                    <option :value="OTPType.HOTP">Counter Based (HOTP)</option>
                    <option :value="OTPType.Steam">Steam</option>
                </select>
            </div>

            <!-- Depending on the Token Type, some more information may be needed -->
            <!-- Time Period (TOTP) -->
            <div v-if="token.type === OTPType.TOTP">
                <label for="period" class="block mb-2 font-medium text-gray-900">Time Period</label>
                <div class="relative">
                    <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                        <ClockIcon class="w-5 h-5 text-gray-500" />
                    </div>
                    <input type="number" id="period" min="0" v-model.number="token.period"
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5">
                </div>
            </div>

            <!-- Initial Counter (HOTP) -->
            <div v-if="token.type === OTPType.HOTP">
                <label for="counter" class="block mb-2 font-medium text-gray-900">Initial Counter</label>
                <div class="relative">
                    <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                        <ClockIcon class="w-5 h-5 text-gray-500" />
                    </div>
                    <input type="number" id="counter" min="0" v-model.number="token.counter"
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5">
                </div>
            </div>
        </div>

        <!-- Save token button -->
        <b-button @click="handleCreateToken">Add Token</b-button>
    </div>
</template>

<script lang="ts">
import { PAGES } from '@/router/pages';
import { computed, defineComponent, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { OTPType, OTPAlgorithm } from "@/common/enums/otp";
import type { Token } from '@/common/interfaces/token';
import { GlobeIcon, UserIcon, KeyIcon, ClockIcon, PencilIcon, QrcodeIcon, ChevronRightIcon, ChevronDownIcon } from "@heroicons/vue/outline";
import { useVaultStore } from '@/stores/vaultStore';
import EncryptedFileUpload from '@/components/EncryptedFileUpload.vue';
import { useKeyStore } from '@/stores/keyStore';

export default defineComponent({
    name: "NewToken",
    components: {
    GlobeIcon,
    UserIcon,
    KeyIcon,
    ClockIcon,
    PencilIcon,
    QrcodeIcon,
    ChevronRightIcon,
    ChevronDownIcon,
    EncryptedFileUpload
},
    setup() {
        const router = useRouter();
        const route = useRoute();
        const vaultStore = useVaultStore();
        const keyStore = useKeyStore();

        const vaults = computed(() => vaultStore.getAll);
        const vaultInQuery = computed(() => route.query.vault);
        const masterEncryptionKey = computed(() => keyStore.getMasterEncryptionKey);

        const token = ref({
            // Set some defaults...
            algorithm: OTPAlgorithm.SHA1,
            type: OTPType.TOTP,
            period: 30,
            counter: 0,

            vault_id: vaultInQuery.value
        } as Token);
        const showAdvanced = ref(false);

        // Handle creating an encrypted token
        const handleCreateToken = async () => {
            // Create a copy of the token ref for us to work on
            const tokenToEncrypt = { ...token.value };        
        }

        // When user uploads an icon, set the object key in the token ref
        const handleObjectKey = (key: string) => {
            token.value.icon = key;
        }

        return {
            router,
            vaults,
            vaultInQuery,
            masterEncryptionKey,

            PAGES,

            OTPType,
            OTPAlgorithm,

            token,
            showAdvanced,

            handleCreateToken,
            handleObjectKey
        }
    }
})
</script>