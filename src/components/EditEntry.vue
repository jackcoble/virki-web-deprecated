<template>
    <div class="p-6">
        <div class="flex justify-between items-center">
            <h2 class="text-lg font-medium">Editing</h2>

            <button class="p-2" @click="discardChanges">
                <TrashIcon class="w-6 text-red-400" />
            </button>
        </div>

        <div class="flex">
            <form @submit.prevent="saveModifiedToken" class="w-full space-y-2">
                <!-- Issuer -->
                <div>
                    <label>Issuer</label>
                    <b-input v-model="modifiedToken.issuer" placeholder="OTP Token Issuer" required></b-input>
                </div>

                <!-- Label -->
                <div>
                    <label>Label</label>
                    <b-input v-model="modifiedToken.label" placeholder="OTP Token Label/Username" required></b-input>
                </div>

                <!-- Secret/Seed -->
                <div>
                    <label>Secret</label>
                    <b-password-input v-model="modifiedToken.secret" placeholder="OTP Token Secret" required />
                </div>

                <!-- OTP Type and Algorithm -->
                <div class="flex space-x-4 justify-between">
                    <div class="flex-1">
                        <label for="type" class="block mb-2 font-medium text-gray-900">Type</label>
                        <select v-model="modifiedToken.otp_type" id="type"
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5">
                            <option :value="OTPType.TOTP">Time Based (TOTP)</option>
                            <option :value="OTPType.HOTP">Counter Based (HOTP)</option>
                            <option :value="OTPType.Steam">Steam</option>
                        </select>
                    </div>

                    <div class="flex-1">
                        <label for="algorithm" class="block mb-2 font-medium text-gray-900">Algorithm</label>
                        <select v-model="modifiedToken.algorithm" id="algorithm"
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5">
                            <option :value="OTPAlgorithm.SHA1">SHA-1</option>
                            <option :value="OTPAlgorithm.SHA256">SHA-256</option>
                            <option :value="OTPAlgorithm.SHA512">SHA-512</option>
                        </select>
                    </div>
                </div>

                <!-- Token length -->
                <div>
                    <label for="length" class="block mb-2 font-medium text-gray-900">Token Length</label>
                    <select v-model="modifiedToken.length" id="length"
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                        <option :value="6">6 digits</option>
                        <option :value="7">7 digits</option>
                        <option :value="8">8 digits</option>
                    </select>
                </div>

                <!-- Additional fields depending on Token type -->
                <!-- Time Period (TOTP) -->
                <div v-if="modifiedToken.otp_type === OTPType.TOTP">
                    <label for="period" class="block mb-2 font-medium text-gray-900">Time Period</label>
                    <div class="relative">
                        <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                            <ClockIcon class="w-5 h-5 text-gray-500" />
                        </div>
                        <input type="number" id="period" min="0" v-model.number="modifiedToken.period" required
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5">
                    </div>
                </div>

                <!-- Counter (HOTP) -->
                <div v-if="modifiedToken.otp_type === OTPType.HOTP">
                    <label for="counter" class="block mb-2 font-medium text-gray-900">Initial Counter</label>
                    <div class="relative">
                        <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                            <ClockIcon class="w-5 h-5 text-gray-500" />
                        </div>
                        <input type="number" id="counter" min="0" v-model.number="modifiedToken.counter" required
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5">
                    </div>
                </div>

                <!-- Save button -->
                <div class="flex space-x-3 pt-4">
                    <b-button type="submit">Save Changes</b-button>
                    <b-button classType="danger" @click="discardChanges">Discard Changes</b-button>
                </div>
            </form>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';

import { TrashIcon, ClockIcon } from "@heroicons/vue/outline"
import { useVaultStore } from '@/stores/vaultStore';
import useToaster from '@/composables/useToaster';
import type { Token as TokenModel } from '@/models/token';
import { OTPAlgorithm, OTPType, Token } from '@/class/token';
import useVault from '@/composables/useVault';
import usePouchDB from '@/composables/usePouchDB';

export default defineComponent({
    name: "EditEntry",
    components: {
        TrashIcon,
        ClockIcon
    },
    emits: ["close"],
    props: {
        id: String
    },
    setup(props, { emit }) {
        const vaultStore = useVaultStore();
        const toaster = useToaster();

        const pouchDB = usePouchDB();

        let originalToken: TokenModel;
        const modifiedToken = ref({} as TokenModel);

        // Computed properties
        const decryptedVaults = computed(() => vaultStore.getVaults);

        onMounted(() => {
            // When this component is mounted, we want to store an original copy (directly from the store)
            // so we can compare if anything has changed and alert the user if they try and leave with modifications present.
            if (!props.id) {
                return toaster.error("Token ID not provided!");
            }

            originalToken = vaultStore.getTokens.find(token => token._id === props.id);
            if (!originalToken) {
                return toaster.error("Could not find original token!");
            }

            // Set the modified token to be a copy of the original token.
            modifiedToken.value = { ...originalToken };
        })

        // Handle closing the editing component. If we have modifications, alert the user prompting for discard.
        const discardChanges = () => {
            console.log("Modified?", modifiedToken.value !== originalToken);

            // TODO: Depending on the action, handle it...
            emit("close");
        }

        // We need to save the modified token and synchronise PouchDB
        const saveModifiedToken = async () => {
            // Fetch the vault key this token is encrypted with
            const vaultBelonging = vaultStore.getVaults.find(v => v._id === originalToken.vault);
            if (!vaultBelonging) {
                return toaster.error("Could not find the vault belonging to token!");
            }

            const token = new Token();
            const encryptedToken = await token.createEncryptedTokenObject(modifiedToken.value, vaultBelonging.key);
            await pouchDB.addToken(encryptedToken);

            // Decrypt the newly encrypted token and then add it to the token store
            const decryptedToken = await token.decryptFromTokenObject(encryptedToken, vaultBelonging.key);
            vaultStore.addToken(decryptedToken);

            // Synchronise and close the edit pane
            await pouchDB.synchronise();
            emit("close");
        }


        return {
            // Types
            OTPType,
            OTPAlgorithm,

            modifiedToken,

            discardChanges,
            saveModifiedToken
        }
    }
})
</script>