<template>
    <div class="flex flex-col p-6 pt-12 space-y-2">
        <div class="px-4 sm:px-6 lg:px-8 space-y-4">
            <div class="sm:flex sm:items-center">
                <div class="sm:flex-auto">
                    <h1 class="text-xl font-semibold text-gray-900">Email Address</h1>
                    <p class="mt-2 text-sm text-gray-700">View or update the email address associated with your
                        <span class="text-mountain-meadow">Virki</span> account.
                    </p>
                </div>
            </div>

            <!-- Email and master password inputs -->
            <div class="md:w-1/4 w-full space-y-2">
                <!-- Email -->
                <p class="font-bold text-sm">Email Address</p>
                <b-input type="email" v-model="email" placeholder="hello@virki.io" autofocus />

                <!-- Master password -->
                <p class="font-bold text-sm">Master Password</p>
                <b-password-input v-model="masterPassword"></b-password-input>
                <p class="text-xs text-gray-600">We need your master password to verify the email update request.</p>

                <b-button class="md:w-1/3 w-full">Update</b-button>
            </div>
        </div>
    </div>
</template>

<script lang=ts>
import { useUserStore } from '@/stores/userStore';
import { defineComponent, ref } from 'vue';

export default defineComponent({
    name: "AccountEmail",
    setup() {
        // Stores
        const userStore = useUserStore();

        const email = ref(userStore.getEmail);
        const masterPassword = ref("");

        return {
            email,
            masterPassword
        }
    }
})
</script>