import { createRouter, createWebHistory } from 'vue-router'

import Login from "@/views/Login.vue"
import Register from "@/views/Register.vue"
import Verify from "@/views/Verify.vue"
import Credentials from "@/views/Credentials.vue"
import Vault from "@/views/Vault.vue"
import { PAGES } from './pages'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: PAGES.ROOT,
      name: 'login',
      component: Login
    },
    {
      path: PAGES.REGISTER,
      name: "register",
      component: Register
    },
    {
      path: PAGES.VERIFY,
      name: 'verify',
      component: Verify
    },
    {
      path: PAGES.CREDENTIALS,
      name: "credentials",
      component: Credentials
    },
    {
      path: PAGES.VAULT,
      name: "vault",
      component: Vault
    }
  ]
})

export default router
