<template>
    <div class="p-3">
        <div class="flex justify-between items-center">
            <h2 class="text-lg font-medium">Editing</h2>

            <button class="p-2" @click="discardChanges">
                <XIcon class="w-6 text-red-400" />
            </button>
        </div>

        <div class="flex">
            <b-input v-model="modifiedToken.issuer"></b-input>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';

import { XIcon } from "@heroicons/vue/outline"
import { useVaultStore } from '@/stores/vaultStore';
import useToaster from '@/composables/useToaster';
import type { Token } from '@/models/token';

export default defineComponent({
    name: "EditEntry",
    components: {
        XIcon
    },
    emits: ["close"],
    props: {
        id: String
    },
    setup(props, { emit }) {
        const vaultStore = useVaultStore();
        const toaster = useToaster();

        let originalToken: Token;
        const modifiedToken = ref({} as Token);

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

        return {
            modifiedToken,

            discardChanges
        }
    }
})
</script>