<template>
    <div class="h-screen p-4 bg-[#262727] space-y-3">
        <h2 class="text-2xl font-semibold text-white">Create</h2>

        <!-- Scan QR Code -->
        <div class="flex items-center container mx-auto p-4 rounded bg-gray-200 text-gray-700">
            <QrcodeIcon class="h-12 mr-4"></QrcodeIcon>
            <div class="flex-row">
                <h2 class="text-xl font-bold">Scan</h2>
                <p class="text-sm">If you have a QR code of your 2FA, you can quickly scan it in here.</p>
            </div>
        </div>

        <!-- Create token vault -->
        <div class="flex items-center container mx-auto p-4 rounded bg-gray-200 text-gray-700">
            <LockClosedIcon class="h-12 mr-4" />
            <div class="flex-row">
                <h2 class="text-xl font-bold">Vault</h2>
                <p class="text-sm">Create a new token vault to store your authentication codes.</p>
            </div>
        </div>

        <!-- Advanced entry -->
        <div class="flex items-center container mx-auto p-4 rounded bg-gray-200 text-gray-700">
            <PencilIcon class="h-12 mr-4" />
            <div class="flex-row">
                <h2 class="text-xl font-bold">Advanced Entry</h2>
                <p class="text-sm">Manually enter/configure a new authentication code.</p>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { QrcodeIcon, LockClosedIcon, PencilIcon } from "@heroicons/vue/outline";

export default defineComponent({
    name: "New",
    components: {
        QrcodeIcon,
        LockClosedIcon,
        PencilIcon
    }
})
</script>