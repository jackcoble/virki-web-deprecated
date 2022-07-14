<template>
    <div class="h-screen bg-gray-50">
        <!-- Email verification warning -->
        <button class="bg-yellow-400 text-yellow-900 p-3 text-center text-sm w-full" v-if="!accountData.email_verified">
            Your email hasn't been verified. Click here to send a verification email.
        </button>

        <div class="container p-4 mx-auto space-y-3">
            <h2 class="text-2xl font-semibold text-gray-900">Settings ⚙️</h2>

            <!-- Explanation text -->
            <p class="text-sm text-gray-700">Here you can make changes to your Authoriser account settings. Beware that
                some of these settings only take affect on this device.</p>
            <div class="w-full border-t-2 border-gray-300"></div>

            <div class="space-y-2">
                <!-- Account settings -->
                <router-link to="/" class="flex flex-row items-middle p-3 border rounded">
                    <UserIcon class="w-5 mr-1" />
                    <span class="text-sm font-medium">My Account</span>
                </router-link>

                <!-- Security settings -->
                <router-link to="/" class="flex flex-row items-middle p-3 border rounded">
                    <ShieldCheckIcon class="w-5 mr-1" />
                    <span class="text-sm font-medium">Security</span>
                </router-link>

                <!-- Preferences -->
                <router-link to="/" class="flex flex-row items-middle p-3 border rounded">
                    <AdjustmentsIcon class="w-5 mr-1" />
                    <span class="text-sm font-medium">Preferences</span>
                </router-link>

                <!-- Subscription -->
                <router-link to="/" class="flex flex-row items-middle p-3 border rounded">
                    <StarIcon class="w-5 mr-1" />
                    <span class="text-sm font-medium">Subscription</span>
                </router-link>
            </div>

            <!-- Advanced settings -->
            <div class="w-full border-t-2 border-gray-300"></div>
            <p class="text-xs font-medium text-gray-700">Advanced Settings</p>

            <!-- Deauthorise sessions -->
            <DeauthoriseModal :show="showDeauthoriseSessionModal" @close="showDeauthoriseSessionModal = false" />
            <b-button classType="danger"
                @click="showDeauthoriseSessionModal = !showDeauthoriseSessionModal">
                De-authorise sessions
            </b-button>

            <!-- Logout current user -->
            <b-button classType="danger">
                Logout
            </b-button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";

import { UserIcon, ShieldCheckIcon, AdjustmentsIcon, StarIcon } from "@heroicons/vue/outline"

// Custom components
import DeauthoriseModal from "@/components/DeauthoriseModal.vue";
import user from "@/service/api/user";

export default defineComponent({
    name: "Settings",
    components: {
        DeauthoriseModal,

        UserIcon,
        ShieldCheckIcon,
        AdjustmentsIcon,
        StarIcon
    },
    setup() {
        const accountData = ref({});
        const showDeauthoriseSessionModal = ref(false);

        onMounted(async () => {
            // Fetch account data from API
            try {
                const res = await user.GetAccount();
                accountData.value = res.data;
            } catch (e) {
                console.log(e);
            }
        })

        return {
            accountData,
            showDeauthoriseSessionModal
        }
    }
})
</script>