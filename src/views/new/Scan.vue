<template>
    <div class="h-screen w-full">
        <qrcode-stream @decode="onDecode"></qrcode-stream>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "Scan",
    setup() {
        const onDecode = (data: any) => {
            console.log(data);
        }

        return {
            onDecode
        }
    }
})
</script>