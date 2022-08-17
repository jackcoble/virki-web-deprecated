<template>
    <div class="flex justify-center items-center h-screen bg-mine-shaft p-8">
        <div class="p-8 md:m-auto rounded md:shadow-sm bg-white md:border md:border-gray-200 space-y-3 xl:w-3/12 md:w-1/2 sm:w-3/4 w-full">
            <!-- Header -->
            <img class="w-24 mx-auto" src="@/assets/images/virki_logo_transparent.png" alt="Virki Logo">
            <h1 class="text-xl text-center">Welcome to <span class="text-mountain-meadow">Virki</span>.</h1>

            <form @submit.prevent="handleSignIn" class="space-y-2">
                <!-- Email input -->
                <p class="font-bold text-sm">Email Address</p>
                <b-input type="email" v-model="email" placeholder="hello@virki.io" autofocus />

                <!-- Login and Create buttons -->
                <div class="flex flex-wrap md:flex-nowrap justify-center items-center md:space-x-2 space-y-2 md:space-y-0 pt-3">
                    <b-button type="submit" classType="primary" :loading="isLoading">
                        <div class="flex flex-row justify-center items-center">
                            <LoginIcon class="w-4 mr-1" />
                            <span>Log In</span>
                        </div>
                    </b-button>

                    <b-button classType="light" @click="router.push('/signup')">
                        <div class="flex flex-row justify-center items-center">
                            <UserAddIcon class="w-4 mr-1" />
                            <span>Create Account</span>
                        </div>
                    </b-button>
                </div>
            </form>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";

import useToaster from "@/composables/useToaster";
import userService from "@/service/api/userService";

import { ClockIcon, LoginIcon, UserAddIcon } from "@heroicons/vue/outline";
import { LS_KEYS, setData } from "@/utils/storage/localStorage";
import { sleep } from "@/utils/common";

export default defineComponent({
    name: "Login",
    components: {
        ClockIcon,
        LoginIcon,
        UserAddIcon
    },
    setup() {
        const email = ref("");
        const isLoading = ref(false);

        const router = useRouter();
        const toaster = useToaster();

        // Handle user login
        const handleSignIn = async () => {
            isLoading.value = true;

            // Using the email address, request an OTP to be sent to it
            try {
                await userService.SendOTP(email.value);

                // Set email to be stored in LocalStorage
                setData(LS_KEYS.USER_DETAILS, { email: email.value });

                // Sleep for 1.5 seconds
                await sleep(1.5);

                // Push to OTP verification page
                router.push("/verify");
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
            isLoading,

            router,

            handleSignIn
        }
    }
})
</script>