import { createRouter, createWebHistory } from 'vue-router'

import Login from "@/views/Login.vue"
import Register from "@/views/Register.vue"
import Verify from "@/views/Verify.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
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
