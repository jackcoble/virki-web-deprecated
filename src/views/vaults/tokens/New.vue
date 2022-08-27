<template>
    <!-- Manual Entry -->
    <div class="flex-col p-4 space-y-3 w-3/5 mx-auto">
        <!-- Icon uploader -->
        <div class="flex justify-center">
            <b-icon-upload :image="token.icon" />
        </div>

        <!-- Title/Issuer -->
        <div>
            <label for="issuer" class="block mb-2 font-medium text-gray-900">Title (Issuer)</label>
            <div class="relative">
                <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                    <GlobeIcon class="w-5 h-5 text-gray-500" />
                </div>
                <input type="text" id="issuer"
                    v-model="token.issuer"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                    placeholder="Twitter">
            </div>
        </div>

        <!-- Label -->
        <div>
            <label for="username" class="block mb-2 font-medium text-gray-900">Label</label>
            <div class="relative">
                <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                    <UserIcon class="w-5 h-5 text-gray-500" />
                </div>
                <input type="text" id="label"
                    v-model="token.label"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                    placeholder="user@example.tld">
            </div>
        </div>

        <!-- Secret/Seed -->
        <div>
            <label for="secret" class="block mb-2 font-medium text-gray-900">Secret/Seed</label>
            <div class="relative">
                <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                    <KeyIcon class="w-5 h-5 text-gray-500" />
                </div>
                <input type="text" id="secret"
                    v-model="token.secret"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                    placeholder="JBSWY3DPEHPK3PXP">
            </div>
        </div>

        <!-- Algorithm -->
        <div>
            <label for="algorithm" class="block mb-2 font-medium text-gray-900">Algorithm</label>
            <select id="algorithm"
                v-model="token.algorithm"
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
            <select id="type"
                v-model="token.type"
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
                <input type="number" id="period" min="0"
                    v-model.number="token.period"
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
                <input type="number" id="counter" min="0"
                    v-model.number="token.counter"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5">
            </div>
        </div>

        <!-- Save token button -->
        <b-button @click="handleCreateToken">Add Token</b-button>
    </div>
</template>

<script lang="ts">
import { PAGES } from '@/router/pages';
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { OTPType, OTPAlgorithm, type Token } from "@/types/token";
import { GlobeIcon, UserIcon, KeyIcon, ClockIcon, PencilIcon, QrcodeIcon } from "@heroicons/vue/outline";

export default defineComponent({
    name: "NewToken",
    components: {
        GlobeIcon,
        UserIcon,
        KeyIcon,
        ClockIcon,
        PencilIcon,
        QrcodeIcon,
    },
    setup() {
        const router = useRouter();

        const token = ref({
            // Set some defaults...
            algorithm: OTPAlgorithm.SHA1,
            type: OTPType.TOTP,
            period: 30,
        } as Token);

        // Handle creating an encrypted token
        const handleCreateToken = async () => {
            // Create a copy of the token ref for us to work on
            const tokenToEncrypt = {...token.value};
        }

        return {
            router,

            PAGES,

            OTPType,
            OTPAlgorithm,

            token,

            handleCreateToken,
        }
    }
})
</script>