<template>
    <div class="flex items-center justify-center">
        <div class="flex items-center justify-between w-full h-24 text-white bg-[#214974] rounded-md shadow-md">
            <div class="flex flex-col p-4">
                <span class="text-xl text-white">{{ issuer }} </span>
                <p class="text-sm text-gray-200 font-semibold">{{ account }}</p>
            </div>
            <img class="h-full py-2 pr-4 ml-8 h-16" src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/2048px-Instagram_icon.png" />
        </div>
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
            generatedCode.value = totp.generate();

            console.log(totp.validate({ token: totp.generate() }))
        }, 1000);

        return {
            generatedCode
        }
    }
})
</script>