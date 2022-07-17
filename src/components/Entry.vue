<template>
    <div class="flex p-2 space-x-4">
        <!-- Issuer icon -->
        <div class="flex-shrink-0 ">
            <img class="w-12 h-12 m-2 rounded-full " :src="token?.icon" />
        </div>

        <!-- Token details -->
        <div class="md:w-3/4 w-6/12">
            <p class="text-sm text-gray-900 truncate">{{ token!.issuer }} </p>
            <p class="text-xs text-gray-700 font-semibold">{{ token!.account }}</p>
            <p class="text-2xl">{{ generatedCode }}</p>
        </div>

        <!-- Time remaining -->
        <div class="flex-grow pl-6">
            <p class="text-xs">{{ countdownLeft }}s left</p>
        </div>
    </div>

</template>

<script lang="ts">
import { defineComponent, onMounted, ref, type PropType } from "vue";
import useEmitter from "@/composables/useEmitter";
import { Token, type IToken } from "@/class/token";

export default defineComponent({
    name: "Entry",
    props: {
        token: {
            type: Object as PropType<IToken>
        }
    },
    setup(props) {
        const emitter = useEmitter();

        // The entry component should handle the rendering and countdown of TOTP codes
        const generatedCode = ref();
        const countdownLeft = ref(props.token!.duration); // Assume that 30 second countdown is left

        const token = new Token("");

        onMounted(() => {
            emitter.on('countdown', handleCountdown);
        })

        // Listen for an event emitted to us and handle the countdown.
        const handleCountdown = (event: any) => {
            countdownLeft.value = props.token!.duration - (event.seconds % props.token!.duration);
            generatedCode.value = token.getCode(props.token!.secret, props.token!.type, props.token!.digits, props.token!.duration, props.token!.algorithm)
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