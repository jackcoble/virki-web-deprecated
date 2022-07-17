<template>
    <div class="h-screen bg-gray-50">
        <div class="container p-4 mx-auto space-y-3">
            <h2 class="text-2xl font-semibold text-gray-900">Preferences</h2>

            <!-- Inactivity timeout -->
            <p class="text-xs font-medium text-gray-700">Inactivity Timeout</p>
            <p class="text-sm">Authoriser can lock itself after a certain number of minutes to remove your encryption key from memory, protecting your authentication tokens.</p>

            <div class="flex items-center space-x-2">
                <b-input type="number" v-model="timeout" />
                <span class="text-sm font-bold">minutes</span>
            </div>

            <p class="text-sm">If you have an encryption key remembered on this device, the inactivity timeout will be ignored.</p>
        </div>
    </div>
</template>

<script lang="ts">
import { useApplicationStore } from "@/stores/appStore";
import { defineComponent, onMounted, ref, watch } from "vue"

export default defineComponent({
    name: "SettingsPreferences",
    setup() {
        const applicationStore = useApplicationStore();
        const timeout = ref();

        // Fetch current timeout value from application store
        onMounted(() => {
            const currentTimeout = applicationStore.getInactivityTimeout;
            timeout.value = currentTimeout;
        })

        // Watch timeout ref and make changes in store if needed
        watch((timeout), () => {
            if (!timeout.value) {
                timeout.value = "0"
            }

            applicationStore.setInactivityTimeout(timeout.value)
        })

        return {
            timeout
        }
    }
})
</script>