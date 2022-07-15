<template>
    <div class="flex items-center justify-center">
        <div class="flex items-center justify-between w-full h-24 text-gray-900"
            @click="showTOTP">
            <div class="flex flex-col p-4">
                <span class="text-xl text-gray-900">{{ issuer }} </span>
                <p class="text-sm text-gray-700 font-semibold">{{ account }}</p>
                <p>{{ generatedCode }}</p>
                <p class="text-xs">{{ countdownLeft }}s</p>
            </div>
            <img class="h-full py-2 pr-4 ml-8 h-16"
                :src="icon" />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import * as OTPAuth from 'otpauth';
import useEmitter from "@/composables/useEmitter";

export default defineComponent({
    name: "Entry",
    props: {
        issuer: String,
        account: String,
        secret: String,
        icon: String // Base64 encoded image
    },
    setup(props) {
        const emitter = useEmitter();

        // The entry component should handle the rendering and countdown of TOTP codes
        const generatedCode = ref();
        const countdownLeft = ref(30); // Assume that 30 second countdown is left

        // Create and return TOTP code from the "secret" prop
        const totp = new OTPAuth.TOTP({
            secret: props.secret,
            digits: 6
        })

        onMounted(() => {
            emitter.on('countdown', handleCountdown);
        })

        // Listen for an event emitted to us and handle the countdown.
        const handleCountdown = (event: any) => {
            countdownLeft.value = 30 - (event.seconds % 30);
            generatedCode.value = totp.generate({ timestamp: event.milliseconds });
        }

        // Alert user of TOTP
        const showTOTP = () => {
            alert("OTP: " + generatedCode.value)
        }

        return {
            generatedCode,
            countdownLeft,
            showTOTP
        }
    }
})
</script>