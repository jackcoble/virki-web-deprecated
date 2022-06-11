<template>
    <div class="flex items-center justify-center">
        <div class="flex items-center justify-between w-full h-24 text-white bg-[#214974] rounded-md shadow-md"
            @click="showTOTP">
            <div class="flex flex-col p-4">
                <span class="text-xl text-white">{{ issuer }} </span>
                <p class="text-sm text-gray-200 font-semibold">{{ account }}</p>
                <p>{{ countdownLeft }}s left</p>
                <p>{{ generatedCode }}</p>
            </div>
            <img class="h-full py-2 pr-4 ml-8 h-16"
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/2048px-Instagram_icon.png" />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
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
            for (let i = 0; i < timestamp.value; i++) {
                // Generate a new token with a different timestamp (incremented by 1ms)
                const newTimestamp = timestamp.value + i;
                const newToken = totp.generate({ timestamp: newTimestamp });

                // If the newToken is different to the current token, then
                // we can set the countdown value to whatever the value of 'i / 1000' is.
                if (newToken !== generatedCode.value) {
                    const secondsLeft = Math.floor(i / 1000);
                    countdownLeft.value = secondsLeft 
                    break;
                }
            }

            // Now that we've worked out the different, we can kick off the normal
            // interval that handles the countdown
            // Every second, get the device timestamp and generate the TOTP code
            setInterval(() => {
                const timestamp = Math.floor(Date.now());
                const token = totp.generate({ timestamp });

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
            }, 1000);
        })



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