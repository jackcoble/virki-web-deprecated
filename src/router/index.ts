import { createRouter, createWebHashHistory, RouterView } from 'vue-router'

import { useKeyStore } from '@/stores/keyStore'
import { PAGES } from './pages'

// Layouts
import LayoutVault from '@/layouts/LayoutVault.vue'
import LayoutAccount from '@/layouts/LayoutAccount.vue'

// Views
import Login from "@/views/Login.vue"
import Register from "@/views/Register.vue"
import Lock from "@/views/Lock.vue"
import Vault from "@/views/Vault.vue"
import Account from "@/views/account/Account.vue"
import NewVault from "@/views/vaults/New.vue"
import EditVault from '@/views/vaults/Edit.vue'
import NewToken from "@/views/vaults/tokens/New.vue";
import AccountSessions from "@/views/account/Sessions.vue";
import AccountEmail from "@/views/account/Email.vue";

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
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
        }
      ]
    },

    {
      path: PAGES.ACCOUNT,
      name: "LayoutAccount",
      component: RouterView,
      meta: {
        layout: LayoutAccount
      },
      children: [
        {
          path: PAGES.ACCOUNT,
          name: "Account",
          component: Account
        },
        {
          path: PAGES.ACCOUNT_SESSIONS,
          name: "AccountSessions",
          component: AccountSessions
        },
        {
          path: PAGES.ACCOUNT_EMAIL,
          name: "AccountEmail",
          component: AccountEmail
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

  // If the user is going to the root path, already has a session, the encrypted data, and encryption key
  // in memory, allow them to navigate straight to the vault page
  if (to.path === PAGES.ROOT && session && (encryptedKeys && encryptedKeys.master_encryption_key) && (masterEncryptionKey && masterEncryptionKey.length !== 0)) {
    return next({ path: PAGES.VAULT });
  }

  // We don't want the user being able to go to the Lock page if they don't have a session or encrypted key on their device,
  // or if they already have the decrypted master key
  if (to.path === PAGES.LOCK) {
    if (!session || !encryptedKeys.master_encryption_key || (masterEncryptionKey && masterEncryptionKey.length !== 0)) {
      return next({ path: PAGES.ROOT })
    }
  }

  // If the path we're going to is the root, and the device has encrypted keys and a session token, but no decrypted key
  // allow them to "unlock" their account.
  if (to.path === PAGES.ROOT && (encryptedKeys && encryptedKeys.master_encryption_key) && session && masterEncryptionKey.length === 0) {
    return next({ path: PAGES.LOCK });
  } 

  // We need to carry out some additional checks if the page we're intending to visit is not public, with the "Lock" page
  // being an exclusion here...
  if (to.matched.some(route => !route.meta.public && route.path !== PAGES.LOCK)) {
    // At all times, private routes require the encrypted keys, decrypted key and a session.
    // If we don't have all of this, redirect to the root.
    const hasAllKeys = (encryptedKeys && encryptedKeys.master_encryption_key) && session && (masterEncryptionKey && masterEncryptionKey.length !== 0);
    if (!hasAllKeys) {
      next({ path: PAGES.ROOT });
    }
  }

  next();
})

export default router
