<template>
    <div class="container p-2">
        {{ issuer }}
        {{ generatedCode }}
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import * as OTPAuth from 'otpauth';

export default defineComponent({
    name: "Entry",
    props: {
        issuer: String,
        account: String,
        secret: String,
        icon: String // Base64 encoded image
    },
    setup(props) {
        // The entry component should handle the rendering and countdown of TOTP codes
        const generatedCode = ref();
        
        // Create and return TOTP code from the "secret" prop
        const totp = new OTPAuth.TOTP({
            secret: props.secret,
            period: 30
        })

        // Every second, get the device timestamp and generate the TOTP code
        setInterval(() => {
            const time = Math.floor(Date.now() / 1000);
            console.log(time);
            generatedCode.value = totp.generate();
        }, 1000);

        return {
            generatedCode
        }
    }
})
</script>