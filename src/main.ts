import { createApp } from 'vue'
import { createPinia } from 'pinia'

// Custom components
import BButton from "@/components/Button.vue";
import BPasswordInput from "@/components/PasswordInput.vue";
import BInput from "@/components/Input.vue";
import BTextArea from "@/components/TextArea.vue";
import BIconUpload from "@/components/IconUpload.vue";
import PasswordStrength from "@/components/PasswordStrength.vue";
import BModal from "@/components/Modal.vue";

import App from './App.vue'
import router from './router'

// Notifications component
import Toaster from "@meforma/vue-toaster";

// Styles
import "@/assets/index.css";

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Toaster)

// Register custom components
app.component("b-button", BButton);
app.component("b-password-input", BPasswordInput);
app.component("b-input", BInput);
app.component("b-text-area", BTextArea);
app.component("b-icon-upload", BIconUpload);
app.component("password-strength", PasswordStrength);
app.component("b-modal", BModal);

app.mount('#app')
