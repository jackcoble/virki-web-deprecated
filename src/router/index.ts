import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import Login from "@/views/Login.vue"
import Register from "@/views/Register.vue"
import New from "@/views/new/Index.vue"
import Scan from '@/views/new/Scan.vue'
import NewVault from "@/views/new/Vault.vue"
import Advanced from "@/views/new/Advanced.vue"
import Settings from "@/views/Settings.vue"
import Lock from "@/views/Lock.vue"

import { useEncryptionKeyStore } from '@/stores/encryptionKeyStore'

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
        authRequired: true,
        showTabMenu: true
      }
    },
    {
      path: "/new/qrcode",
      name: "scan",
      component: Scan,
      meta: {
        authRequired: true,
        showTabMenu: true
      }
    },
    {
      path: "/new/advanced",
      name: "advanced",
      component: Advanced,
      meta: {
        authRequired: true,
        showTabMenu: true
      }
    },
    {
      path: "/new/vault",
      name: "newVault",
      component: NewVault,
      meta: {
        authRequired: true,
        showTabMenu: true
      }
    },
    {
      path: "/settings",
      name: "settings",
      component: Settings,
      meta: {
        authRequired: true,
        showTabMenu: true
      }
    }
  ]
})

// On specified, check that user is authenticated by checking for presence of "master key"
router.beforeEach((to, from, next) => {
  const encryptionKeyStore = useEncryptionKeyStore();
  
  if (to.matched.some(route => route.meta.authRequired)) {
    // Check that we have all of the following stored in state:
    // - Stretched master password
    // - Encrypted master key

    // If we don't have an encrypted master key (at the very least, then prompt for a login)
    if (!encryptionKeyStore.getEncryptedMasterKey) {
      return next({ path: '/login' });
    }

    // Otherwise if we have no master key, but the encrypted master key, we can prompt for
    // an unlock
    if (!encryptionKeyStore.getMasterKey && encryptionKeyStore.getEncryptedMasterKey) {
      return next({ path: "/lock" })
    }
  }

  next();
})

export default router
