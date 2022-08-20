<template>
    <div class="flex justify-center items-center h-screen bg-mine-shaft p-8">
        <div class="p-8 md:m-auto rounded md:shadow-sm bg-white md:border md:border-gray-200 space-y-3 xl:w-3/12 md:w-1/2 sm:w-3/4 w-full">
            <!-- Header -->
            <img class="w-24 mx-auto" src="@/assets/images/virki_logo_transparent.png" alt="Virki Logo">
            <div space-y-1>
                <h1 class="text-xl text-center">Welcome back, <span class="text-mountain-meadow">{{ email }}</span>.</h1>
                <p class="text-xs text-center">Please enter your password to decrypt your account.</p>
            </div>

            <form @submit.prevent="handleDecryption" class="space-y-2">
                <!-- Password input -->
                <p class="font-bold text-sm">Password</p>
                <b-password-input v-model="password" autofocus />

                <!-- Unlock button -->
                <div class="flex flex-wrap md:flex-nowrap justify-center items-center md:space-x-2 space-y-2 md:space-y-0 pt-3">
                    <b-button type="submit" classType="primary" :disabled="isLoading" disabledText="Decrypting keys..." :loading="isLoading">
                        <div class="flex flex-row justify-center items-center">
                            <LoginIcon class="w-4 mr-1" />
                            <span>Submit</span>
                        </div>
                    </b-button>
                </div>
            </form>

            <div class="flex justify-center items-center space-x-1 pt-3">
                <img src="@/assets/gb_flag.svg" class="w-5 rounded-sm" alt="GB Flag">
                <p class="text-xs">Made in the UK.</p>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { LoginIcon } from "@heroicons/vue/outline";
import { useUserStore } from "@/stores/userStore";
import { useKeyStore } from "@/stores/keyStore";
import { computed } from "@vue/reactivity";
import { CryptoWorker } from "@/utils/comlink";
import type { Keys } from "@/types/user";

export default defineComponent({
    name: "Credentials",
    components: {
        LoginIcon,
    },
    setup() {
        const userStore = useUserStore();
        const keyStore = useKeyStore();

        const router = useRouter();

        const email = computed(() => userStore.getEmail)
        const password = ref("");
        const isLoading = ref(false);

        // Handle decryption
        const handleDecryption = async () => {
            isLoading.value = true;

            const keys = keyStore.getEncryptedKeys;

            const cryptoWorker = await new CryptoWorker();
            const decryptedKeys: Keys = await cryptoWorker.decryptKeys(password.value, keys);
            
            console.log(decryptedKeys);

            isLoading.value = false;
        }

        return {
            email,
            password,
            isLoading,

            router,

            handleDecryption
        }
    }
})
</script>