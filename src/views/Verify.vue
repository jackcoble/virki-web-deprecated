<template>
    <div class="flex justify-center items-center h-screen bg-mine-shaft p-8">
        <div class="p-8 md:m-auto rounded md:shadow-sm bg-white md:border md:border-gray-200 space-y-3 xl:w-3/12 md:w-1/2 sm:w-3/4 w-full">
            <!-- Header -->
            <img class="w-24 mx-auto" src="@/assets/images/virki_logo_transparent.png" alt="Virki Logo">
            <h1 class="text-xl text-center">We've sent a verification code to <span class="text-mountain-meadow">{{ email }}</span></h1>
            <p class="text-xs">If you haven't received a verification code within a couple of minutes, please check your spam or request for a new code to be sent.</p>

            <form @submit.prevent="handleVerification" class="space-y-2">
                <b-input type="text" v-model.number="otp" placeholder="Verification code" autofocus />

                <!-- Verify button -->
                <b-button class="flex justify-center items-center space-x-1" type="submit" classType="primary" :loading="isLoading">
                    <CheckIcon class="w-4" />
                    <span>Verify</span>
                </b-button>
            </form>

            <!-- Resend options -->
            <div class="flex justify-between">
                <button class="text-sm text-mine-shaft hover:text-mountain-meadow-50 transition">Resend code</button>
                <button class="text-sm text-mine-shaft hover:text-mountain-meadow-50 transition" @click="router.push('/login')">Change email</button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import useToaster from "@/composables/useToaster";
import userService from "@/service/api/userService";

import { CheckIcon } from "@heroicons/vue/outline";
import { getData, LS_KEYS, setData } from "@/utils/storage/localStorage";

export default defineComponent({
    name: "Login",
    components: {
        CheckIcon
    },
    setup() {
        const email = ref("");
        const otp = ref();

        const isLoading = ref(false);

        const router = useRouter();
        const toaster = useToaster();

        onMounted(() => {
            // Fetch the user data from LocalStorage
            const userData = getData(LS_KEYS.USER_DETAILS);
            if (userData) {
                email.value = userData.email;
            }
        })

        // Handle OTP verification
        const handleVerification = async () => {
            isLoading.value = true;

            try {
                // Verify the OTP with the expectation to receive a session token back!
                const res = await userService.VerifyOTP(email.value, otp.value);
                if (res.data && res.data.sessionToken) {
                    // Store the sessionToken with userData
                    setData(LS_KEYS.USER_DETAILS, { email: email.value, sessionToken: res.data.sessionToken });
                }
            } catch (e) {
                if (e.response.data && e.response.data.error) {
                    toaster.error(e.response.data.error);
                    return;
                } else {
                    toaster.error("An unknown error has occurred.");
                    return;
                }
            } finally {
                isLoading.value = false;
            }
        }

        return {
            email,
            otp,
            isLoading,

            router,

            handleVerification
        }
    }
})
</script>