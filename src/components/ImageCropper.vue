<template>
    <BaseModal>
        <template v-slot:body>
            <div class="space-y-2">
                <h1 class="text-xl">Upload a profile picture</h1>

                <div class="flex flex-col items-center">
                    <Cropper class="w-72 h-72" ref="cropper" :src="placeholder" :stencil-props="{
                        handlers: {},
                        movable: false,
                        resizable: false,
                        aspectRatio: 1,
                        }" 
                        :resize-image="{
                            adjustStencil: false
                        }"
                        image-restriction="stencil">
                    </Cropper>
                </div>
            </div>
        </template>
    </BaseModal>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { Cropper } from "vue-advanced-cropper";
import 'vue-advanced-cropper/dist/style.css';
import BaseModal from './modals/BaseModal.vue';

export default defineComponent({
    name: "ImageCropper",
    components: {
        Cropper,
        BaseModal
    },
    props: {
        placeholder: String
    },
    setup() {
        const cropper = ref();

        return {
            cropper
        }
    }
})
</script>