import { createRouter, createWebHistory, RouterView } from 'vue-router'

import { useKeyStore } from '@/stores/keyStore'
import { PAGES } from './pages'

// Layouts
import LayoutVault from '@/layouts/LayoutVault.vue'

// Views
import Login from "@/views/Login.vue"
import Register from "@/views/Register.vue"
import Verify from "@/views/Verify.vue"
import Credentials from "@/views/Credentials.vue"
import Vault from "@/views/Vault.vue"
import Sessions from "@/views/Sessions.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "",
      name: "LayoutVault",
      component: RouterView,
      meta: {
        layout: LayoutVault
      },
      children: [
        {
          path: "/vault",
          name: "VaultView",
          component: Vault
        }
      ]
    },
    {
      path: PAGES.ROOT,
      name: 'login',
      component: Login,
      meta: {
        public: true
      }
    },
    {
      path: PAGES.REGISTER,
      name: "register",
      component: Register,
      meta: {
        public: true
      }
    },
    {
      path: PAGES.VERIFY,
      name: 'verify',
      component: Verify,
      meta: {
        public: true
      }
    },
    {
      path: PAGES.CREDENTIALS,
      name: "credentials",
      component: Credentials,
      meta: {
        public: true
      }
    },
    {
      path: PAGES.SESSIONS,
      name: "sessions",
      component: Sessions
    }
  ]
})

/*
We should assume that all pages by default require some form of authentication
unless stated otherwise with the "public" property in the route metadata. To verify a user is authenticated, we'll just check for the
presence of a session token in the store.
*/
router.beforeEach((to, from, next) => {
  const keyStore = useKeyStore();
  const session = keyStore.getSessionToken;
  const masterEncryptionKey = keyStore.getMasterEncryptionKey;

  // If no session token or master encryption key is present and the page isn't public, redirect to root (login)
  if ((!session || !masterEncryptionKey) && !to.meta.public) {
    return next({ path: PAGES.ROOT });
  }

  // So we have a session token present, but if we don't have encrypted keys on the device,
  // we might not want to allow the user to visit a certain page, such as the "credentials" for decryption.
  const encryptedKeys = keyStore.getEncryptedKeys;
  if (!encryptedKeys.master_encryption_key && to.path === PAGES.CREDENTIALS) {
    return next({ path: PAGES.ROOT });
  }

  // Though if both a session token and the decrypted master encryption key are available
  // on the device, we can redirect the user straight to the "/vault" if the original
  // path was to "/".
  if (session && masterEncryptionKey && to.path === PAGES.ROOT) {
    return next({ path: PAGES.VAULT });
  }

  next();
})

export default router
