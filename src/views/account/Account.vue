<template>
    <div class="flex p-8 space-x-4 w-10/12 mx-auto">
        <!-- User details -->
        <div class="flex flex-col flex-shrink-0 space-y-4">
            <div
                class="flex flex-col items-center justify-center p-8 w-full space-y-2 bg-gray-50 border border-gray-300 rounded">
                <img :src="avatarImage" class="w-28 rounded-full" />
                <input type="file" accept="image/*" @change=uploadImage>

                <p>{{ email }}</p>
            </div>

            <div class="p-8 w-full space-y-2 bg-gray-50 border border-gray-300 rounded">
                <b-button>Change Email</b-button>
                <b-button>Change Password</b-button>
                <b-button @click="handleLogout">Logout</b-button>
            </div>
        </div>

        <!-- Session management -->
        
    </div>
</template>

<script lang="ts">
import userService from '@/service/api/userService';
import { defineComponent, onMounted, ref } from 'vue';
import { fromUnixTime, formatRelative, subDays } from "date-fns";
import { useLogout } from '@/composables/useLogout';
import { useRouter } from 'vue-router';
import { PAGES } from '@/router/pages';
import { computed } from '@vue/reactivity';
import { useUserStore } from '@/stores/userStore';
import { UserCircleIcon } from "@heroicons/vue/solid"
import axios from 'axios';

export default defineComponent({
    name: "Sessions",
    components: {
        UserCircleIcon
    },
    setup() {
        const userStore = useUserStore();
        const router = useRouter();

        const email = computed(() => userStore.getEmail);

        const sessions = ref();

        onMounted(async () => {
            // Fetch all user sessions
            await userService.GetSessions().then(res => {
                sessions.value = res.data;
            })
        })

        // Revoke an individual user session by ID
        const revokeSession = async (session: any) => {
            // Revoke the session
            try {
                await userService.RevokeSession(session.id);
            } catch (error) {
                console.log("Error revoking session...")
            }

            // If it's this device we're revoking, do a logout
            if (session.this_device) {
                return await handleLogout();
            }

            // Update the sessions list
            await userService.GetSessions().then(res => {
                sessions.value = res.data;
            })
        }

        // Handle logout
        const handleLogout = async () => {
            try {
                await userService.Logout();
                await useLogout();
            } finally {
                // Ignore any errors and just push straight to root
                router.push(PAGES.ROOT);
            }
        }

        // Return a relative human readable date
        const formatDate = (unix: any) => {
            const formatted = formatRelative(subDays(fromUnixTime(unix), 0), new Date())
            return formatted.charAt(0).toUpperCase() + formatted.slice(1);
        }

        // Handle avatar uploads
        const avatarImage = ref()
        const uploadImage = async (event: any) => {
            try {
                // Extract the file from the upload input
                const file = event.target.files[0];

                // Request for a presigned URL
                let res = await userService.UploadAvatar();
                const url = res.data.url as string;

                // Upload the avatar
                await axios.put(url, file, { headers: { "Content-Type": file.type } })

                // Fetch the image from S3 and display in browser
                res = await userService.GetAvatar();
                const avatarUrl = res.data.url as string;

                res = await axios.get(avatarUrl, { responseType: "blob" });
                const reader = new window.FileReader();
                reader.readAsDataURL(res.data);
                reader.onload = () => {
                    avatarImage.value = reader.result;
                }
            } catch (e) {
                // TODO: Handle this...
                console.log(e);
            }
        }

        return {
            email,
            sessions,

            avatarImage,

            revokeSession,
            handleLogout,
            formatDate,
            uploadImage
        }
    }
})
</script>