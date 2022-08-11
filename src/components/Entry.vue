<template>
    <div class="flex space-x-4">
        <!-- Issuer icon -->
        <div class="flex-shrink-0">
            <img v-if="token?.icon" class="w-12 h-12 rounded-full" :src="token?.icon" />
            <ClockIcon v-else class="w-12 h-12 p-2 rounded-full bg-gray-200 text-gray-600" />
        </div>

        <!-- Token details -->
        <div class="md:w-3/4 w-6/12">
            <p class="text-sm text-gray-900 truncate">{{ token?.issuer }} </p>
            <p class="text-xs text-gray-700 font-semibold">{{ token?.label }}</p>
            <p class="text-2xl">{{ otp }}</p>
        </div>

        <!-- Time remaining -->
        <div class="flex-grow pl-6">
            <p class="text-xs">{{ remaining }}s left</p>
        </div>
    </div>

</template>

<script lang="ts">
import { defineComponent, onMounted, ref, type PropType } from "vue";
import useEmitter from "@/composables/useEmitter";
import { Token } from "@/class/token";
import type { Token as TokenModel } from "@/models/token";
import { ClockIcon } from "@heroicons/vue/outline";

export default defineComponent({
    name: "Entry",
    props: {
        token: {
            type: Object as PropType<TokenModel>
        }
    },
    components: {
        ClockIcon
    },
    setup(props) {
        const emitter = useEmitter();

        // The entry component should handle the rendering and countdown of TOTP codes
        const otp = ref();
        const remaining = ref(props.token?.period);

        const token = new Token();

        onMounted(() => {
            emitter.on('countdown', handleCountdown);
        })

        // Listen for an event emitted to us and handle the countdown.
        const handleCountdown = (event: any) => {
            // Generate the OTP and work out how long is left before it expires
            const period = props.token?.period || 30;

            otp.value = Token.generate(props.token!.otp_type, props.token!.secret, props.token!.counter!, 30);
            remaining.value = period - (event.seconds % period);
        }

        return {
            otp,
            remaining
        }
    }
})
</script>