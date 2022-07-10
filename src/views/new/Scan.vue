<template>
    <div class="h-screen w-full">
        <qrcode-stream @decode="onDecode"></qrcode-stream>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import * as OTPAuth from "otpauth"

export default defineComponent({
    name: "Scan",
    setup() {
        const onDecode = (data: any) => {
            // Attempt to parse data
            try {
                const parsedTOTP = OTPAuth.URI.parse(data);
                alert(parsedTOTP)
            } catch (e) {
                alert(e)
            }
        }

        return {
            onDecode
        }
    }
})
</script>