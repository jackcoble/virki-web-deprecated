<template>
    <div class="p-9 lg:w-4/5 xl:w-2/5 mx-auto space-y-2">
        <h1 class="text-2xl text-center">Create a new Vault</h1>
        <p>In order to store authentication tokens, you need a Vault. This allows you to organise your tokens and keep them in one place!</p>

        <form @submit.prevent class="space-y-4 pt-4 pb-2 mx-auto">
            <b-icon-upload class="mx-auto"></b-icon-upload>
            <b-input placeholder="Vault name"></b-input>
            <b-text-area placeholder="Description of this Vault"></b-text-area>
            <b-button type="submit">Create</b-button>
        </form>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: "CreateVault"
})
</script>