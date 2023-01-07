<template>
    <teleport to="body">
        <Transition appear enter-active-class="transition ease-out duration-200 transform" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition ease-in duration-200 transform"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog"
                aria-modal="true">
                <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div @click="cancelModal" class="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
                        aria-hidden="true"></div>

                    <!-- This element is to trick the browser into centering the modal contents. -->
                    <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                    <div
                        class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                        <div v-if="!hideCloseIcon" class="hidden sm:block absolute top-0 right-0 pt-4 pr-4">
                            <button @click="cancelModal" type="button"
                                class="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none">
                                <span class="sr-only">Close</span>
                                <XIcon class="w-6 h-6" />
                            </button>
                        </div>
                        <div class="sm:flex sm:items-start">
                            <div class="mt-3 sm:mt-0 sm:text-left w-full">
                                <slot name="body" />
                            </div>
                        </div>

                        <!-- Footer -->
                        <div>
                            <div class="mt-5 sm:mt-4 flex items-end space-y-2 space-x-2">
                                <b-button @click.prevent="okModal" type="button">
                                    OK
                                </b-button>

                                <b-button @click.prevent="cancelModal" type="button" classType="light">
                                    Cancel
                                </b-button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </teleport>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from "vue";
import { XIcon } from "@heroicons/vue/outline";


export default defineComponent({
    name: "BaseModal",
    props: {
        hideCloseIcon: {
            type: Boolean,
            default: false,
        }
    },
    components: {
        XIcon
    },
    emits: ["ok", "cancel"],
    setup(props, { emit }) {
        const okModal = () => {
            emit("ok");
        }

        const cancelModal = () => {
            emit("cancel");
        };

        onMounted(() => {
            const onEscape = (e: any) => {
                if (e.keyCode === 27) {
                    cancelModal();
                }
            };

            document.addEventListener("keydown", onEscape);
        });

        return {
            okModal,
            cancelModal
        };
    },
});
</script>