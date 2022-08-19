import { createRouter, createWebHistory } from 'vue-router'

import Login from "@/views/Login.vue"
import Register from "@/views/Register.vue"
import Verify from "@/views/Verify.vue"
import HomeView from '@/views/HomeView.vue'

import { useEncryptionKeyStore } from '@/stores/encryptionKeyStore'
import { useAuthenticationStore } from '@/stores/authenticationStore'
import { useApplicationStore } from '@/stores/appStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        authRequired: true,
        showTabMenu: true
      }
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/verify',
      name: 'verify',
      component: Verify
    },
    {
      path: "/signup",
      name: "register",
      component: Register
    },
    {
      path: "/lock",
      name: "lock",
      component: Lock
    }
  ]
})

export default router
