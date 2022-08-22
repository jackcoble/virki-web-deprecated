<template>
  <teleport to="body">
    <div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      <div class="fixed z-10 inset-0 overflow-y-auto">
        <div class="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
          <div
            class="relative bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-sm sm:w-full sm:p-6">
            <div>
              <!-- Icon -->
              <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <slot name="icon">
                  <ExclamationCircleIcon class="h-6 w-6 text-red-600" />
                </slot>
              </div>

              <!-- Body -->
              <div class="mt-3 text-center sm:mt-5">
                <slot name="body"></slot>
              </div>
            </div>

            <!-- Footer -->
            <div class="mt-5 sm:mt-6">
              <slot name="footer">
                <b-button classType="primary">OK</b-button>
              </slot>
            </div>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from "vue";
import { XIcon, ExclamationCircleIcon } from "@heroicons/vue/outline";

export default defineComponent({
  name: "ModalDialog",
  props: {
    hideCloseIcon: {
      type: Boolean,
      default: false,
    },

    // Footer type props
    noFooter: {
      type: Boolean,
      default: false
    },
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
    XIcon,
    ExclamationCircleIcon
  },
  setup(props, { emit }) {
    const closeModal = () => {
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

    return {
      closeModal
    };
  },
});
</script>
