<template>
    <div class="flex items-center justify-center">
        <div class="flex items-center justify-between w-full h-24 text-white bg-[#214974] rounded-md shadow-md"
            @click="showTOTP">
            <div class="flex flex-col p-4">
                <span class="text-xl text-white">{{ issuer }} </span>
                <p class="text-sm text-gray-200 font-semibold">{{ account }}</p>
                
                <h2 class="text-xl font-bold">{{ generatedCode }}</h2>

                <p class="text-xs">{{ countdownLeft }} seconds</p>
            </div>
            <img class="h-full py-2 pr-4 ml-8 h-16"
                :src="icon" />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, onMounted, ref } from "vue";
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
        const timestamp = ref(Math.floor(Date.now()));
        const generatedCode = ref();
        const countdownLeft = ref(30); // Assume that 30 second countdown is left

        // Create and return TOTP code from the "secret" prop
        const totp = new OTPAuth.TOTP({
            secret: props.secret,
            digits: 6
        })

        onMounted(() => {
            // Set the current token based on the timestamp
            generatedCode.value = totp.generate({ timestamp: timestamp.value })

            // Do a check to see how long the token has left.
            // We can do this by adding 1 millisecond to the current timestamp until we get
            // a different token to the one currently stored.
            for (let milliseconds = 0; milliseconds < timestamp.value; milliseconds++) {
                // Generate a new token with a different timestamp (incremented by 1ms)
                const newTimestamp = timestamp.value + milliseconds;
                const newToken = totp.generate({ timestamp: newTimestamp });

                // If the newToken is different to the current token, then
                // we can set the countdown value to whatever the value of 'i / 1000' is.
                if (newToken !== generatedCode.value) {
                    const secondsLeft = Math.floor(milliseconds / 1000);
                    countdownLeft.value = secondsLeft 
                    break;
                }
            }

            emitter.on('countdown', handleCountdown);
        })

        // Listen for an event emitted to us and handle the countdown.
        const handleCountdown = (event: any) => {
            const token = totp.generate({ timestamp: event.timestamp });

            // If the token is different to what we've got currently stored
            // then reset the timer
            if (token !== generatedCode.value) {
                countdownLeft.value = 30;
                generatedCode.value = token;
                return;
            }

            // More of a thing for user experience, just don't let the countdown get to zero,
            // just skip this interval.
            if (countdownLeft.value -1 == 0) {
                return;
            } else {
                countdownLeft.value -= 1;
            }
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