<template>
<div>
    Hello world
</div>
</template>

<script lang="ts">
import userService from '@/service/api/userService';
import { defineComponent, onMounted } from 'vue';

export default defineComponent({
    name: "Sessions",
    setup() {
        // Fetch all user sessions on page mount
        onMounted(async () => {
            await userService.GetSessions();
        })
    }
})
</script>