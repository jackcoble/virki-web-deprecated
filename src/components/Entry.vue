<template>
    <div class="flex p-2 space-x-4">
        <!-- Issuer icon -->
        <div class="flex-shrink-0 ">
            <img class="w-12 h-12 m-2 rounded-full " :src="icon" />
        </div>

        <!-- Token details -->
        <div class="md:w-3/4 w-6/12">
            <p class="text-sm text-gray-900 truncate">{{ issuer }} </p>
            <p class="text-xs text-gray-700 font-semibold">{{ account }}</p>
            <p class="text-2xl">{{ generatedCode }}</p>
        </div>

        <!-- Time remaining -->
        <div class="flex-grow pl-6">
            <p class="text-xs">{{ countdownLeft }}s left</p>
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