import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import Login from "@/views/Login.vue"
import Register from "@/views/Register.vue"
import New from "@/views/new/Index.vue"
import Scan from '@/views/new/Scan.vue'
import Advanced from "@/views/new/Advanced.vue"
import Settings from "@/views/Settings.vue"
import Lock from "@/views/Lock.vue"

import { useEncryptionKeyStore } from '@/stores/encryptionKeyStore'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        authRequired: true
      }
    },
    {
      path: '/login',
      name: 'login',
      component: Login
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
    },
    {
      path: "/new",
      name: "new",
      component: New,
      meta: {
        authRequired: true
      }
    },
    {
      path: "/new/qrcode",
      name: "scan",
      component: Scan,
      meta: {
        authRequired: true
      }
    },
    {
      path: "/new/advanced",
      name: "advanced",
      component: Advanced,
      meta: {
        authRequired: true
      }
    },
    {
      path: "/settings",
      name: "settings",
      component: Settings,
      meta: {
        authRequired: true
      }
    }
  ]
})

// On specified, check that user is authenticated by checking for presence of "master key"
router.beforeEach((to, from, next) => {
  const encryptionKeyStore = useEncryptionKeyStore();
  
  if (to.matched.some(route => route.meta.authRequired)) {
    if (!encryptionKeyStore.getMasterKey) {
      return next({ path: '/login' })
    }
  }

  next();
})

export default router
