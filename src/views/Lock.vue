<template>
    <h1 class="text-xl p-4">Locked!</h1>
    <p class="text-sm">Currently logged in as: {{ email }}</p>
</template>

<script lang="ts">
import { useAuthenticationStore } from "@/stores/authenticationStore";
import { computed } from "@vue/reactivity";
import { defineComponent } from "vue";

export default defineComponent({
    name: "Lock",
    setup() {
        const authenticationStore = useAuthenticationStore();

        const email = computed(() => authenticationStore.getEmail);

        return {
            email
        }
    }
})
</script>