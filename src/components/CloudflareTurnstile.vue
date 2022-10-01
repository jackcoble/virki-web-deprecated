<template>
    <div id="cf-turnstile-challenge"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted } from 'vue';

export default defineComponent({
    name: "CloudflareTurnstile",
    setup() {
        const scriptId = "cloudflare-turnstile-script-id";

        // On mounted, we want to import the Turnstile client JS if it isn't already present
        onMounted(() => {
            const turnstileScriptPresent = window.turnstile || document.getElementById(scriptId);
            renderTurnstile(!!turnstileScriptPresent);
        })

        const renderTurnstile = (scriptPresent: boolean) => {
            if (!scriptPresent) {
                const script = document.createElement("script");
                script.id = scriptId;
                script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback";
                script.async = true;
                script.defer = true;

                document.head.appendChild(script);
            }

            // Render the component on the load callback
            const options = {
                sitekey: '0x4AAAAAAAAp_uCeOoj1R-By',
                theme: 'auto',
                callback: function(token: string) {
                    console.log(`Challenge Success ${token}`);
                }
            }

            // If the script wasn't present, listen for the onload callback
            if (!scriptPresent) {
                window.onloadTurnstileCallback = () => {
                    window.turnstile.render('#cf-turnstile-challenge', options);
                }
            } else {
                // Otherwise render as normal
                window.turnstile.render('#cf-turnstile-challenge', options);
            }
        }
    }
})
</script>