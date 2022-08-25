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
            <h1 class="text-lg">Active Sessions</h1>

            <div v-for="session in sessions" :key="session.id" class="flex bg-gray-200 p-2 rounded space-x-8">
                <!-- Device information -->
                <div class="flex flex-col">
                    <p class="font-medium">{{ session.device }}</p>
                    <p>{{ session.operating_system }}</p>
                </div>

                <!-- Last used -->
                <div class="flex flex-col">
                    <p>Last Active: {{ formatDate(session.last_used) }}</p>
                    <p>Issued: {{ formatDate(session.issued) }}</p>
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

        // Return a relative human readable date
        const formatDate = (unix: any) => {
            const formatted = formatRelative(subDays(fromUnixTime(unix), 0), new Date())
            return formatted.charAt(0).toUpperCase() + formatted.slice(1);
        }

        return {
            sessions,

            formatDate
        }
    }
})
</script>