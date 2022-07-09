import { createApp } from 'vue'
import { createPinia } from 'pinia'
import mitt from 'mitt';

// Buffer
import { Buffer } from 'buffer';
window.Buffer = Buffer;

import App from './App.vue'
import router from './router'

// Styles
import "@/assets/index.css";

const app = createApp(App)

// Mitt - event emitter
const emitter = mitt();
app.config.globalProperties.emitter = emitter;

app.use(createPinia())
app.use(router)

app.mount('#app')
