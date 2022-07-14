<template>
    <div class="w-full bg-gray-200 rounded">
        <div class="text-xs font-medium text-center p-1 leading-none rounded" :class="strength.class" :style="`width: ${strength.width}%; transition: width 1s;`">
            {{ strength.label }}
        </div>
    </div>   
</template>

<script lang="ts">
import { defineComponent, ref, watchEffect } from "vue";
import zxcvbn from "zxcvbn";

export default defineComponent({
    name: "PasswordStrength",
    props: {
        password: {
            type: String
        }
    },
    setup(props) {
        const strength = ref({
            label: "Weak",
            width: 0,
            class: ""
        });

        // Function to calculate and set ZXCBN score
        const passwordScore = (password: string) => {
            // If password length is zero, then set some defaults for style


            const result = zxcvbn(password);
            switch (result.score) {
                case 0:
                    strength.value.label = "Weak";
                    strength.value.width = 20;
                    strength.value.class = "bg-red-400 text-white"
                    break;

                case 1:
                    strength.value.label = "Weak";
                    strength.value.width = 40;
                    strength.value.class = "bg-amber-600 text-white"
                    break;

                case 2:
                    strength.value.label = "Weak";
                    strength.value.width = 40;
                    strength.value.class = "bg-amber-600 text-white"
                    break;

                case 3:
                    strength.value.label = "Good";
                    strength.value.width = 75;
                    strength.value.class = "bg-yellow-400 text-white"
                    break;

                case 4:
                    strength.value.label = "Strong";
                    strength.value.width = 100;
                    strength.value.class = "bg-green-500 text-white"
                    break;

                default:
                    break;
            }
        }

        // Create a watcher to re-calculate ZXCVBN score
        watchEffect(() => {
            passwordScore(props.password!)
        })

        return {
            strength
        }
    }
})
</script>