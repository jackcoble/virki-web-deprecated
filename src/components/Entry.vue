<template>
    <div class="flex space-x-4 items-center justify-center border-b p-3">
        <!-- Issuer icon -->
        <div class="flex-shrink-0">
            <img v-if="token?.icon" class="w-12 h-12 rounded-full" :src="token?.icon" />
            <ClockIcon v-else class="w-12 h-12 p-2 rounded-full bg-gray-200 text-gray-600" />
        </div>

        <!-- Token details -->
        <div class="md:w-3/4 w-6/12 flex-grow" @click="copyOTPToClipboard">
            <p class="text-sm text-gray-900 truncate">{{ token?.issuer }} </p>
            <p class="text-xs text-gray-700 font-semibold">{{ token?.label }}</p>
            <p class="text-2xl">{{ otp }}</p>
        </div>

        <button class="p-2" @click="tokenToEdit(token?._id)">
            <DotsHorizontalIcon class="w-4 h-4 text-gray-400" />
        </button>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, type PropType } from "vue";
import useEmitter from "@/composables/useEmitter";
import { OTPType, Token } from "@/class/token";
import type { Token as TokenModel } from "@/models/token";
import { ClockIcon, DotsHorizontalIcon, PencilAltIcon, TrashIcon } from "@heroicons/vue/outline";
import BaseModal from "./Modal/BaseModal.vue";
import useToaster from "@/composables/useToaster";

export default defineComponent({
    name: "Entry",
    props: {
        token: {
            type: Object as PropType<TokenModel>
        }
    },
    emits: ["tokenToEdit"],
    components: {
        ClockIcon,
        DotsHorizontalIcon,
        PencilAltIcon,
        TrashIcon,

        BaseModal
    },
    setup(props, { emit }) {
        const toaster = useToaster();
        const emitter = useEmitter();

        const showActionModal = ref(false);

        // The entry component should handle the rendering and countdown of TOTP codes
        const otp = ref();
        const remaining = ref(props.token?.period);

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

        // When the entry is clicked, copy the OTP code to the clipboard
        const copyOTPToClipboard = () => {
            if (navigator && navigator.clipboard) {
                navigator.clipboard.writeText(otp.value);
                toaster.success("Copied OTP to clipboard!");

                return;
            }
            else {
                return toaster.error("Unable to copy OTP to clipboard!");
            }
        }

        // Emit an event containing the ID of the token we want to edit
        const tokenToEdit = (id: string) => {
            emit("tokenToEdit", id);
        }

        return {
            copyOTPToClipboard,
            tokenToEdit,

            showActionModal,

            OTPType,

            otp,
            remaining
        }
    }
})
</script>