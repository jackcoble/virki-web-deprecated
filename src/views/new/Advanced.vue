<template>
    <div class="h-screen p-4 bg-[#262727] space-y-3">
        <h2 class="text-2xl font-semibold text-white">Advanced Entry</h2>

        <!-- Manual entry form -->
        <form @submit.prevent class="space-y-3">
            <p class="text-bold text-white">Information</p>
            <div class="mb-3">
                <label for="issuer" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Title
                    (Issuer)</label>
                <input type="text"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Twitter" required>
            </div>

            <div class="mb-3">
                <label for="issuer"
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Username</label>
                <input type="text"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="user@example.com" required>
            </div>

            <hr>
            <p class="text-bold text-white">Token</p>

            <div class="mb-3">
                <label for="issuer"
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Secret</label>
                <input type="text"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="JBSWY3DPEHPK3PXP" required>
            </div>

            <label for="countries" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">Algorithm</label>
            <select id="countries"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                <option>SHA-1</option>
                <option>SHA-256</option>
                <option>SHA-512</option>
            </select>

            <label for="countries" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">Type</label>
            <select id="countries"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                <option>Time-based (TOTP)</option>
                <option>Counter-based (HOTP)</option>
                <option>Steam</option>
            </select>

        </form>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "Advanced",
    setup() {
        console.log("Setup")
    }
})
</script>