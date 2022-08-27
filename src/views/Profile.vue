<template>
    <div class="flex p-8 space-x-4 w-10/12 mx-auto">
        <!-- User details -->
        <div class="flex flex-col flex-shrink-0 space-y-4">
            <div
                class="flex flex-col items-center justify-center p-8 w-full space-y-2 bg-gray-50 border border-gray-300 rounded">
                <img src="https://avatars.githubusercontent.com/u/26122014?v=4" class="w-28 rounded-full" />
                <p>Jack Coble</p>

                <!-- Button to edit Avatar and Name -->
                <b-button>Edit Details</b-button>
            </div>

            <div class="p-8 w-full space-y-2 bg-gray-50 border border-gray-300 rounded">
                <b-button>Change Email</b-button>
                <b-button>Change Password</b-button>
            </div>
        </div>

        <!-- Session management -->
        <div class="flex flex-col flex-1 rounded bg-gray-50 border p-6 border-gray-300 space-y-2">
            <div class="px-4 sm:px-6 lg:px-8">
                <div class="sm:flex sm:items-center">
                    <div class="sm:flex-auto">
                        <h1 class="text-xl font-semibold text-gray-900">Active Devices</h1>
                        <p class="mt-2 text-sm text-gray-700">Manage the devices which currently have access to your <span class="text-mountain-meadow">Virki</span> account.</p>
                    </div>
                </div>
                <div class="mt-8 flex flex-col">
                    <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                            <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded">
                                <table class="min-w-full divide-y divide-gray-300">
                                    <thead class="bg-gray-50">
                                        <tr>
                                            <th scope="col"
                                                class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                                IP Address</th>
                                            <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                Device
                                            </th>
                                            <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                Operating System
                                            </th>
                                            <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                Issued
                                            </th>
                                            <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                Last Active
                                            </th>
                                            <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                                <span class="sr-only">Edit</span>
                                            </th>

                            
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-200 bg-white">
                                        <tr v-for="session in sessions" :key="session.id">
                                            <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                {{ session.ip_address }}
                                            </td>
                                            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {{ session.device }}
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
                                                <button class="text-red-500 hover:text-red-600 transition" @click="revokeSession(session.id)">Revoke</button>
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

export default defineComponent({
    name: "Sessions",
    setup() {
        const sessions = ref();

        onMounted(async () => {
            // Fetch all user sessions
            await userService.GetSessions().then(res => {
                sessions.value = res.data;
            })
        })

        // Revoke an individual user session by ID
        const revokeSession = async(id: string) => {
            try {
                await userService.RevokeSession(id)
            } catch (error) {
                console.log("Error revoking session...")
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
            formatDate
        }
    }
})
</script>