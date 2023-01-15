<template>
    <div class="flex flex-col p-6 pt-12 space-y-2">
        <div class="px-4 sm:px-6 lg:px-8">
            <div class="sm:flex sm:items-center">
                <div class="sm:flex-auto">
                    <h1 class="text-xl font-semibold text-gray-900">Active Sessions</h1>
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
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">import { useLogout } from '@/composables/useLogout';
import useToaster from '@/composables/useToaster';
import { PAGES } from '@/router/pages';
import userService from '@/service/api/userService';
import { useUserStore } from '@/stores/userStore';
import { UserCircleIcon } from '@heroicons/vue/outline';
import { formatDate } from '@vueuse/shared';
import axios from 'axios';
import { formatRelative, subDays, fromUnixTime } from 'date-fns';
import { defineComponent, computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
    name: "Sessions",
    components: {
        UserCircleIcon
    },
    setup() {
        const router = useRouter();
        const toaster = useToaster();

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
            } else {
                toaster.info("Session was revoked!");
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
                router.push(PAGES.LOGIN);
            }
        }

        // Return a relative human readable date
        const formatDate = (unix: any) => {
            const formatted = formatRelative(subDays(fromUnixTime(unix), 0), new Date())
            return formatted.charAt(0).toUpperCase() + formatted.slice(1);
        }

        return {
            sessions,
            revokeSession,
            handleLogout,
            formatDate
        }
    }
})
</script>