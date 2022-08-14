<template>
    <div class="flex space-x-4 items-center justify-center border-b p-3" @click="copyOTPToClipboard">
        <!-- Issuer icon -->
        <div class="flex-shrink-0">
            <img v-if="token?.icon" class="w-12 h-12 rounded-full" :src="token?.icon" />
            <ClockIcon v-else class="w-12 h-12 p-2 rounded-full bg-gray-200 text-gray-600" />
        </div>

        <!-- Token details -->
        <div class="md:w-3/4 w-6/12 flex-grow">
            <p class="text-sm text-gray-900 truncate">{{ token?.issuer }} </p>
            <p class="text-xs text-gray-700 font-semibold">{{ token?.label }}</p>
            <p class="text-2xl">{{ otp }}</p>
        </div>

        <button class="p-2" @click="showActionModal = !showActionModal">
            <DotsHorizontalIcon class="w-4 h-4 text-gray-400" />
        </button>
    </div>

    <!-- Actions modal -->
    <BaseModal v-if="showActionModal" @close="showActionModal = !showActionModal" noFooter>
        <template v-slot:body>
            <div class="flex flex-col space-y-2 text-center pb-4">
                <h1 class="text-xl">Actions</h1>
                <p class="text-sm">Here you can make changes to your authentication token.</p>
            </div>

            <fieldset class="space-y-2">
                <!-- Edit token details -->
                <div class="flex flex-row items-center px-4 w-100 text-sm h-14 space-x-3 cursor-pointer border-2 rounded-md">
                    <div class="object-contain rounded-full w-9 h-9 p-1.5 bg-gray-200 border-2 border-gray-300">
                        <PencilAltIcon class="text-gray-500 rounded-full" />
                    </div>
                    <p class="font-medium text-gray-700 select-none">Edit token details</p>
                </div>

                <!-- Increment HOTP counter (HOTP only) -->
                <div v-if="token?.otp_type === OTPType.HOTP" class="flex flex-row items-center px-4 w-100 text-sm h-14 space-x-3 cursor-pointer border-2 rounded-md">
                    <div class="object-contain rounded-full w-9 h-9 p-1.5 bg-gray-200 border-2 border-gray-300">
                        <ClockIcon class="text-gray-500 rounded-full" />
                    </div>
                    <p class="font-medium text-gray-700 select-none">Increment counter</p>
                </div>

                <!-- Delete token -->
                <div class="flex flex-row items-center px-4 w-100 text-sm h-14 space-x-3 cursor-pointer border-2 rounded-md">
                    <div class="object-contain rounded-full w-9 h-9 p-1.5 bg-red-300 border-2 border-red-300">
                        <TrashIcon class="text-red-700 rounded-full" />
                    </div>
                    <p class="font-medium text-red-700 select-none">Remove token</p>
                </div>
            </fieldset>
        </template>
    </BaseModal>
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
    components: {
        ClockIcon,
        DotsHorizontalIcon,
        PencilAltIcon,
        TrashIcon,

        BaseModal
    },
    setup(props) {
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

        return {
            copyOTPToClipboard,

            showActionModal,

            OTPType,

            otp,
            remaining
        }
    }
})
</script>