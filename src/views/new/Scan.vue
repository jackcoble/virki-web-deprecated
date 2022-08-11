<template>
    <div class="flex flex-col">
        <!-- Header -->
        <div class="flex p-4 z-10 bg-gray-50 w-full justify-between">
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
        <div v-else class="flex-col p-4 space-y-3">
            <!-- Icon uploader -->
            <div class="flex justify-center">
                <IconUpload :image="tokenIcon" @image-data="handleImageData" />
            </div>

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

            <!-- Save token button -->
            <b-button @click="addToken">Add Token</b-button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { GlobeIcon, UserIcon, KeyIcon, ClockIcon, PencilIcon, QrcodeIcon } from "@heroicons/vue/outline";
import { OTPAlgorithm, OTPType, Token } from "@/class/token";
import type { Token as TokenModel } from "@/models/token";
import { useVaultStore } from "@/stores/vaultStore";
import usePouchDB from "@/composables/usePouchDB";
import { useRouter } from "vue-router";
import IconUpload from "@/components/IconUpload.vue";

export default defineComponent({
    name: "Scan",
    components: {
        GlobeIcon,
        UserIcon,
        KeyIcon,
        ClockIcon,
        PencilIcon,
        QrcodeIcon,
        IconUpload
    },
    setup() {
        const vaultStore = useVaultStore();
        const pouchDB = usePouchDB();
        const router = useRouter();

        const hideScanner = ref(false);

        // Options needed for either manual or QR code scan
        const tokenIcon = ref("");
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
                tokenIssuer.value = decodeURIComponent(label.split(":")[0]);
                tokenUsername.value = decodeURIComponent(label.split(":")[1]);
            } else {
                tokenUsername.value = decodeURIComponent(label);
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

        // Encrypt and save all of the token data into PouchDB
        const addToken = async () => {
            const activeVault = vaultStore.getActiveVault;
            if (!activeVault) {
                // TODO: Throw error about active vault not being set
                return;
            }

            const tokenDetails = {
                vault: activeVault._id,
                issuer: tokenIssuer.value,
                label: tokenUsername.value,
                secret: tokenSecret.value,
                algorithm: tokenAlgorithm.value,
                length: tokenLength.value,
                otp_type: tokenType.value
            } as TokenModel;

            // Add the icon if one has been uploaded
            if (tokenIcon.value && tokenIcon.value !== "") {
                tokenDetails.icon = tokenIcon.value;
            }

            // Depending on if the token is TOTP or HOTP, we need to add some more details
            switch (tokenDetails.otp_type) {
                case OTPType.TOTP:
                    tokenDetails.period = tokenTimePeriod.value;
                    break;

                case OTPType.HOTP:
                    tokenDetails.counter = tokenCounter.value;
                    break;
            
                default:
                    break;
            }

            // Retrieve the active vault and encrypt the token data with the symmetric key
            const t = new Token();
            const encryptedToken = await t.createEncryptedTokenObject(tokenDetails, activeVault.key);
            await pouchDB.addToken(encryptedToken);

            // Decrypt the newly encrypted token and then add it to the token store
            const decryptedToken = await t.decryptFromTokenObject(encryptedToken, activeVault.key);
            vaultStore.addToken(decryptedToken);

            router.push("/");
        }

        // Function to handle the "imageData" event from icon upload component
        const handleImageData = (e: any) => {
            // If the event is undefined, that means
            // the image has been cleared, so we want to remove the icon from this vault.
            if (!e) {
                tokenIcon.value = "";
            }
            else {
                // Update icon from the string in the event
                tokenIcon.value = e;
            }
        }

        return {
            OTPAlgorithm,
            OTPType,

            tokenIcon,
            tokenIssuer,
            tokenUsername,
            tokenSecret,
            tokenAlgorithm,
            tokenLength,
            tokenType,
            tokenTimePeriod,
            tokenCounter,

            hideScanner,
            onDecode,
            addToken,
            handleImageData
        }
    }
})
</script>