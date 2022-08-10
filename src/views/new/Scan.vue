<template>
    <div v-if="!hideScanner" class="flex flex-col items-center h-screen w-full">
        <b-button class="absolute z-10 w-48 bottom-20" @click="hideScanner = true">Enter manually?</b-button>
        <qrcode-stream @decode="onDecode"></qrcode-stream>
    </div>
    
    <div v-else>
        <p>Manual token entry...</p>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
    name: "Scan",
    setup() {
        const hideScanner = ref(false);

        const onDecode = (data: any) => {
            // TODO: Parse the OTP string URL in the data

            // TODO: Populate fields

            // Hide the scanner
            hideScanner.value = true;
        }

        return {
            hideScanner,
            onDecode
        }
    }
})
</script>