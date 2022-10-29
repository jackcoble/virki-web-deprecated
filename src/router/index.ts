import { createRouter, createWebHashHistory, RouterView } from 'vue-router'

import { useKeyStore } from '@/stores/keyStore'
import { PAGES } from './pages'

// Layouts
import LayoutVault from '@/layouts/LayoutVault.vue'

// Views
import Login from "@/views/Login.vue"
import Register from "@/views/Register.vue"
import Lock from "@/views/Lock.vue"
import Vault from "@/views/Vault.vue"
import Profile from "@/views/Profile.vue"
import NewVault from "@/views/vaults/New.vue"
import EditVault from '@/views/vaults/Edit.vue'
import NewToken from "@/views/vaults/tokens/New.vue";

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    // Handle 404 redirect
    {
      path: "/:pathMatch(.*)*",
      beforeEnter: (to, from, next) => next(PAGES.ROOT)
    },

    {
      path: PAGES.VAULT,
      name: "LayoutVault",
      component: RouterView,
      meta: {
        layout: LayoutVault,
        sidebar: true
      },
      children: [
        {
          path: `${PAGES.VAULT}/:id?`,
          name: "VaultView",
          component: Vault
        },
        {
          path: PAGES.NEW_VAULT,
          name: "NewVault",
          component: NewVault
        },
        {
          path: `${PAGES.VAULT}/:id/edit`,
          name: "EditVault",
          component: EditVault
        },
        {
          path: `${PAGES.VAULT}/:id/tokens/new`,
          name: "newTokens",
          component: NewToken
        },
        {
          path: PAGES.PROFILE,
          name: "profile",
          component: Profile,
          meta: {
            sidebar: false
          }
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
      path: PAGES.LOCK,
      name: "lock",
      component: Lock
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const keyStore = useKeyStore();
  const session = keyStore.getSessionToken;
  const masterEncryptionKey = keyStore.getMasterEncryptionKey;
  const encryptedKeys = keyStore.getEncryptedKeys;

  console.log({ session, masterEncryptionKey, encryptedKeys })

  // We don't want the user being able to go to the Lock page if they don't have a session or encrypted key on their device
  if (to.path === PAGES.LOCK) {
    if (!session || !encryptedKeys.master_encryption_key) {
      return next({ path: PAGES.ROOT })
    }
  }

  if (to.matched.some(route => !route.meta.public)) {
    // If we don't have an encrypted master key (at the very least, then prompt for a login)
    if (encryptedKeys.master_encryption_key.length === 0) {
      return next({ path: PAGES.ROOT });
    }
  }

  next();
})

export default router
