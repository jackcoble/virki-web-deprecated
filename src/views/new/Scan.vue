<template>
    <div class="flex flex-col">
        <!-- Header -->
        <div class="flex fixed p-4 z-10 bg-gray-100 w-full justify-between">
            <h2 class="text-2xl font-semibold text-gray-900">{{ !hideScanner ? "Scan QR Code" : "Add" }}</h2>

            <div class="flex flex-col">
                <!-- Manual Entry -->
                <button v-if="!hideScanner" class="rounded-full p-1 text-purple-800" @click="hideScanner = true"
                    title="Manual Entry">
                    <PencilIcon class="w-6 h-6" />
                </button>

                <!-- QR Scanner -->
                <button v-else class="rounded-full p-1 text-purple-800" @click="hideScanner = false"
                    title="QR Code Scanner">
                    <QrcodeIcon class="w-6 h-6" />
                </button>
            </div>
        </div>

        <!-- QR Code Scanner -->
        <div v-if="!hideScanner" class="flex-col h-screen">
            <qrcode-stream @decode="onDecode"></qrcode-stream>
        </div>

        <!-- Manual Entry -->
        <div v-else class="flex-col mt-16 p-4 space-y-3">
            <!-- Title/Issuer -->
            <div>
                <label for="issuer" class="block mb-2 font-medium text-gray-900">Title (Issuer)</label>
                <div class="relative">
                    <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                        <GlobeIcon class="w-5 h-5 text-gray-500" />
                    </div>
                    <input type="text" id="issuer"
                        v-model="tokenIssuer"
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                        placeholder="Twitter">
                </div>
            </div>

            <!-- Username -->
            <div>
                <label for="username" class="block mb-2 font-medium text-gray-900">Username</label>
                <div class="relative">
                    <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                        <UserIcon class="w-5 h-5 text-gray-500" />
                    </div>
                    <input type="text" id="username"
                        v-model="tokenUsername"
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
                        v-model="tokenSecret"
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                        placeholder="JBSWY3DPEHPK3PXP">
                </div>
            </div>

            <!-- Algorithm -->
            <div>
                <label for="algorithm" class="block mb-2 font-medium text-gray-900">Algorithm</label>
                <select v-model="tokenAlgorithm" id="algorithm"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                    <option :value="OTPAlgorithm.SHA1">SHA-1</option>
                    <option :value="OTPAlgorithm.SHA256">SHA-256</option>
                    <option :value="OTPAlgorithm.SHA512">SHA-512</option>
                </select>
            </div>

            <!-- Token Length -->
            <div>
                <label for="length" class="block mb-2 font-medium text-gray-900">Token Length</label>
                <select v-model="tokenLength" id="length"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                    <option :value="6">6 digits</option>
                    <option :value="7">7 digits</option>
                    <option :value="8">8 digits</option>
                </select>
            </div>

            <!-- Token Type -->
            <div>
                <label for="type" class="block mb-2 font-medium text-gray-900">Type</label>
                <select v-model="tokenType" id="type"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                    <option :value="OTPType.TOTP">Time Based (TOTP)</option>
                    <option :value="OTPType.HOTP">Counter Based (HOTP)</option>
                    <option :value="OTPType.Steam">Steam</option>
                </select>
            </div>

            <!-- Depending on the Token Type, some more information may be needed -->
            <!-- Time Period (TOTP) -->
            <div v-if="tokenType === OTPType.TOTP">
                <label for="period" class="block mb-2 font-medium text-gray-900">Time Period</label>
                <div class="relative">
                    <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                        <ClockIcon class="w-5 h-5 text-gray-500" />
                    </div>
                    <input type="number" id="period" min="0" v-model.number="tokenTimePeriod"
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5">
                </div>
            </div>

            <!-- Initial Counter (HOTP) -->
            <div v-if="tokenType === OTPType.HOTP">
                <label for="counter" class="block mb-2 font-medium text-gray-900">Initial Counter</label>
                <div class="relative">
                    <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                        <ClockIcon class="w-5 h-5 text-gray-500" />
                    </div>
                    <input type="number" id="counter" min="0" v-model.number="tokenCounter"
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5">
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { GlobeIcon, UserIcon, KeyIcon, ClockIcon, PencilIcon, QrcodeIcon } from "@heroicons/vue/outline";
import { OTPAlgorithm, OTPType } from "@/class/token";

export default defineComponent({
    name: "Scan",
    components: {
        GlobeIcon,
        UserIcon,
        KeyIcon,
        ClockIcon,
        PencilIcon,
        QrcodeIcon
    },
    setup() {
        const hideScanner = ref(false);

        // Options needed for either manual or QR code scan
        const tokenIssuer = ref("");
        const tokenUsername = ref("");
        const tokenSecret = ref("");
        const tokenAlgorithm = ref(OTPAlgorithm.SHA1);
        const tokenLength = ref(6);
        const tokenType = ref(OTPType.TOTP);
        const tokenTimePeriod = ref(30);
        const tokenCounter = ref(0);

        const onDecode = (data: any) => {
            // TODO: Parse the OTP string URL in the data
            const otpauth = new URL(data);
            if (otpauth.protocol !== "otpauth:") {
                // TODO: Show error
                return;
            }

            // Determine OTP type
            const otpType = otpauth.host;
            if (otpType === 'totp') {
                tokenType.value = OTPType.TOTP
            }
            else if (otpType === 'hotp') {
                tokenType.value = OTPType.HOTP
            }
            else if (otpType === 'steam') {
                tokenType.value = OTPType.Steam
            }

            // Determine username and issuer if possible
            const label = otpauth.pathname.replace(/^\/|\/$/g, ''); // Strips leading slashes
            if (label.indexOf(":") !== -1) {
                tokenIssuer.value = label.split(":")[0];
                tokenUsername.value = label.split(":")[1];
            } else {
                tokenUsername.value = label;
            }

            // Need to split the remainder of the parameters
            const parameters = otpauth.searchParams;

            // Set the token secret
            const secret = parameters.get("secret");
            if (secret) {
                tokenSecret.value = secret;
            }
            
            // Override the issuer if its present
            const issuer = parameters.get("issuer");
            if (issuer) {
                tokenIssuer.value = decodeURIComponent(issuer);
            }

            // Determine the algorithm
            const algorithm = parameters.get("algorithm");
            if (algorithm) {
                switch (algorithm) {
                    case "SHA1":
                        tokenAlgorithm.value = OTPAlgorithm.SHA1
                        break;

                    case "SHA256":
                        tokenAlgorithm.value = OTPAlgorithm.SHA256
                        break;

                    case "SHA512":
                        tokenAlgorithm.value = OTPAlgorithm.SHA512
                        break;
                
                    default:
                        // TODO: Throw not supported error.
                        break;
                }
            }

            // Set the token digits
            const digits = parameters.get("digits");
            if (digits) {
                const digitsNumber = parseInt(digits);
                tokenLength.value = digitsNumber;
            }

            // Set token time period (for TOTP)
            const period = parameters.get("period");
            if (period) {
                const periodNumber = parseInt(period);
                tokenTimePeriod.value = periodNumber;
            }

            // Set the initial counter (for HOTP)
            const counter = parameters.get("counter");
            if (counter) {
                tokenCounter.value = parseInt(counter);
            }

            // Hide the scanner
            hideScanner.value = true;
        }

        return {
            OTPAlgorithm,
            OTPType,

            tokenIssuer,
            tokenUsername,
            tokenSecret,
            tokenAlgorithm,
            tokenLength,
            tokenType,
            tokenTimePeriod,
            tokenCounter,

            hideScanner,
            onDecode
        }
    }
})
</script>