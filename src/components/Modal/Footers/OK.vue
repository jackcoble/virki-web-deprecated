<template>
    <div class="mt-5 sm:mt-4 flex items-end space-y-2 space-x-2">
        <b-button @click.prevent="ok" type="button">
            OK
        </b-button>

        <b-button @click.prevent="cancel" type="button" classType="light">
            Cancel
        </b-button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    setup(props, { emit }) {
        const ok = () => {
            emit("ok");
        };

        const cancel = () => {
            emit("cancel");
        };

        return {
            ok,
            cancel,
        };
    },
});
</script>
