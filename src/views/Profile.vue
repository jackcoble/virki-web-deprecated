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
        <div class="flex flex-col flex-1 rounded bg-gray-50 border p-6 border-gray-300 space-y-2">
            <div class="px-4 sm:px-6 lg:px-8">
                <div class="sm:flex sm:items-center">
                    <div class="sm:flex-auto">
                        <h1 class="text-xl font-semibold text-gray-900">Active Devices</h1>
                        <p class="mt-2 text-sm text-gray-700">Manage the devices which currently have access to your
                            <span class="text-mountain-meadow">Virki</span> account.
                        </p>
                    </div>
                </div>
                <div class="mt-8 flex flex-col">
                    <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                            <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded">
                                <table class="min-w-full divide-y divide-gray-300">
                                    <thead class="bg-gray-200 text-gray-700">
                                        <tr>
                                            <th scope="col"
                                                class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-6">
                                                IP Address</th>
                                            <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold">
                                                Device
                                            </th>
                                            <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold">
                                                Operating System
                                            </th>
                                            <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold">
                                                Issued
                                            </th>
                                            <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold">
                                                Last Active
                                            </th>
                                            <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                                <span class="sr-only">Edit</span>
                                            </th>


                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-200 bg-white">
                                        <tr v-for="session in sessions" :key="session.id">
                                            <td
                                                class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                {{ session.ip_address }}
                                            </td>
                                            <td
                                                class="flex space-x-2 whitespace-nowrap items-center px-3 py-4 text-sm text-gray-500">
                                                <span v-if="session.this_device" title="This device"
                                                    class="text-mountain-meadow">
                                                    &#x25cf;
                                                </span>

                                                <span>{{ session.device }}</span>
                                            </td>
                                            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {{ session.operating_system }}
                                            </td>
                                            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {{ formatDate(session.issued) }}
                                            </td>
                                            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {{ formatDate(session.last_used) }}
                                            </td>
                                            <td
                                                class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <button class="text-red-500 hover:text-red-600 transition"
                                                    @click="revokeSession(session)">Revoke</button>
                                            </td>
                                        </tr>

                                        <!-- More people... -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
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