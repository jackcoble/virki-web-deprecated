<template>
  <teleport to="body">
    <transition
      enter-active-class="transition ease-out duration-200 transform"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-200 transform"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        class="fixed z-10 inset-0 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
        v-if="showModal"
      >
        <div
          class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
        >
          <div
            @click="closeModal"
            class="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
            aria-hidden="true"
          ></div>

          <!-- This element is to trick the browser into centering the modal contents. -->
          <span
            class="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
            >&#8203;</span
          >

          <div
            class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
          >
            <div
              v-if="!hideCloseIcon"
              class="hidden sm:block absolute top-0 right-0 pt-4 pr-4"
            >
              <button
                @click="closeModal"
                type="button"
                class="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <span class="sr-only">Close</span>
                <XIcon class="w-6 h-6" />
              </button>
            </div>
            <div class="sm:flex sm:items-start">
              <div class="mt-3 sm:mt-0 sm:text-left w-full">
                <slot />
              </div>
            </div>

            <!-- Footer (make this dynamic for the different footers) -->
            <OK v-show="okFooter" @ok="$emit('ok')" @cancel="closeModal" />
            <Done v-show="doneFooter" @done="$emit('done')" />
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from "vue";
import { XIcon } from "@heroicons/vue/outline";

// Footer components
import OK from "@/components/Modal/Footers/OK.vue";
import Done from "@/components/Modal/Footers/Done.vue";

export default defineComponent({
  name: "ModalDialog",
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    hideCloseIcon: {
      type: Boolean,
      default: false,
    },

    // Footer type props
    okFooter: {
      type: Boolean,
      default: false,
    },
    doneFooter: {
      type: Boolean,
      default: false
    }
  },
  components: {
    OK,
    Done,

    XIcon,
  },
  setup(props, { emit }) {
    const showModal = ref(false);

    const closeModal = () => {
      showModal.value = false;
      emit("close");
    };

    onMounted(() => {
      const onEscape = (e: any) => {
        if (e.keyCode === 27) {
          closeModal();
        }
      };

      document.addEventListener("keydown", onEscape);
    });

    watch(
      () => props.show,
      (show) => {
        showModal.value = show;
      }
    );

    return {
      closeModal,

      showModal,
    };
  },
});
</script>
