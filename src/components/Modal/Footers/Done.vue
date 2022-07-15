<template>
    <div class="mt-5 sm:mt-4 flex items-end space-y-2 space-x-2">
        <b-button @click.prevent="done" type="button">
            Done
        </b-button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    setup(props, { emit }) {
        const done = () => {
            emit("done");
        };

        return {
            done,
        };
    },
});
</script>
