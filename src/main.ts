import { createApp } from 'vue'
import { createPinia } from 'pinia'
import mitt from 'mitt';

// Custom components
import BButton from "@/components/Button.vue";
import BPasswordInput from "@/components/PasswordInput.vue";
import BInput from "@/components/Input.vue";
import PasswordStrength from "@/components/PasswordStrength.vue";

// Buffer
import { Buffer } from 'buffer';
window.Buffer = Buffer;

import App from './App.vue'
import router from './router'

// QR Code Reader
import QrcodeReaderVue3 from "qrcode-reader-vue3";

// Notifications component
import Toaster from "@meforma/vue-toaster";

// Styles
import "@/assets/index.css";

// Firebase

// Firebase
import { initializeApp } from "firebase/app";
const firebaseConfig = {
    apiKey: "AIzaSyCLF6-3ka8CpRIvuzNMTkZsn9Wl1kJB1Ak",
    authDomain: "authoriser-e148f.firebaseapp.com",
    projectId: "authoriser-e148f",
    storageBucket: "authoriser-e148f.appspot.com",
    messagingSenderId: "541622874478",
    appId: "1:541622874478:web:562d24399bc3a9d3de517f"
};
initializeApp(firebaseConfig);

const app = createApp(App)

// Mitt - event emitter
const emitter = mitt();
app.config.globalProperties.emitter = emitter;

app.use(createPinia())
app.use(router)
app.use(QrcodeReaderVue3)
app.use(Toaster)

// Register custom components
app.component("b-button", BButton);
app.component("b-password-input", BPasswordInput);
app.component("b-input", BInput);
app.component("password-strength", PasswordStrength);

app.mount('#app')
