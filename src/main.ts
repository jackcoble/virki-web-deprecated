import { createApp } from 'vue'
import { createPinia } from 'pinia'
import mitt from 'mitt';

// Custom components
import BButton from "@/components/Button.vue";
import BPasswordInput from "@/components/PasswordInput.vue";
import BInput from "@/components/Input.vue";
import BTextArea from "@/components/TextArea.vue";
import PasswordStrength from "@/components/PasswordStrength.vue";

// Buffer
import { Buffer } from 'buffer';
window.Buffer = Buffer;

import App from './App.vue'
import router from './router'

// Notifications component
import Toaster from "@meforma/vue-toaster";

// Styles
import "@/assets/index.css";

const app = createApp(App)

// Mitt - event emitter
const emitter = mitt();
app.config.globalProperties.emitter = emitter;

app.use(createPinia())
app.use(router)
app.use(Toaster)

// Register custom components
app.component("b-button", BButton);
app.component("b-password-input", BPasswordInput);
app.component("b-input", BInput);
app.component("b-text-area", BTextArea);
app.component("password-strength", PasswordStrength);

app.mount('#app')
