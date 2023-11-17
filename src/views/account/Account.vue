<template>
    <div class="flex flex-col p-6 pt-12 space-y-2">
        <div class="px-4 sm:px-6 lg:px-8 space-y-4">
            <div class="sm:flex sm:items-center">
                <div class="sm:flex-auto">
                    <h1 class="text-xl font-semibold text-gray-900">
                        My Account
                    </h1>
                    <p class="mt-2 text-sm text-gray-700">A brief overview of your
                        <span class="text-mountain-meadow">Virki</span> account.
                    </p>
                </div>
            </div>

            <hr>

            <div class="flex items-center md:justify-start justify-between space-x-10">
                <div class="md:w-1/3 w-full space-y-2">
                    <!-- Name -->
                    <div class="space-y-1">
                        <p class="font-bold text-sm">Name</p>
                        <b-input type="text" v-model="name"/>
                    </div>

                    <!-- Save button -->
                    <b-button class="md:w-1/3 w-full" @click="doUpdateName" :loading="updatingName">
                        <div class="flex flex-row justify-center items-center">
                            <CheckIcon class="w-4 mr-1" />
                            <span>Save</span>
                        </div>
                    </b-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import userService from '@/service/api/userService';
import { defineComponent, ref, computed } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { UserCircleIcon, CheckIcon } from "@heroicons/vue/solid"
import { useKeyStore } from '@/stores/keyStore';
import useToaster from '@/composables/useToaster';
import type { UpdateAccountRequestBody } from '@/service/api/types';

export default defineComponent({
    name: "Sessions",
    components: {
    UserCircleIcon,
    CheckIcon
},
    setup() {
        const userStore = useUserStore();
        const keyStore = useKeyStore();
        const toaster = useToaster();

        const name = ref(userStore.getName);
        const updatingName = ref(false);

        const encryptionKey = computed(() => keyStore.getMasterEncryptionKey);

        // Function to update users name via API
        const doUpdateName = async () => {
            updatingName.value = true;

            try {
                const body: UpdateAccountRequestBody = {
                    name: name.value
                }

                await userService.UpdateAccount(body);

                // Fetch latest account information
                await userService.GetAccount().then(res => {
                    userStore.setAccount(res.data);
                    toaster.success("Name changed successfully!");
                })
            } catch (e) {
                return toaster.error(e.response.data.error);
            } finally {
                updatingName.value = false;
            }
        }

        return {
            name,
            updatingName,
            encryptionKey,
            doUpdateName
        }
    }
})
</script>