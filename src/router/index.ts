import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import Login from "@/views/Login.vue"
import Register from "@/views/Register.vue"
import New from "@/views/new/Index.vue"
import Scan from '@/views/new/Scan.vue'
import NewVault from "@/views/new/Vault.vue"
import Advanced from "@/views/new/Advanced.vue"
import Settings from "@/views/Settings.vue"
import SettingsSecurity from "@/views/settings/Security.vue";
import SettingsPreferences from "@/views/settings/Preferences.vue";
import SettingsVaults from "@/views/settings/Vaults.vue";
import Lock from "@/views/Lock.vue"

import { useEncryptionKeyStore } from '@/stores/encryptionKeyStore'
import useAccount from '@/composables/useAccount'
import { Crypto } from '@/class/crypto'
import useAuthoriserDB from '@/composables/useAuthoriserDB'

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
      },
    },
    {
      path: "/settings/security",
      name: "securitySettings",
      component: SettingsSecurity,
      meta: {
        authRequired: true,
        showTabMenu: true
      }
    },
    {
      path: "/settings/preferences",
      name: "settingsPreferences",
      component: SettingsPreferences,
      meta: {
        authRequired: true,
        showTabMenu: true
      }
    },
    {
      path: "/settings/vaults",
      name: "settingsVaults",
      component: SettingsVaults,
      meta: {
        authRequired: true,
        showTabMenu: true
      }
    }
  ]
})

// On specified, check that user is authenticated by checking for presence of "master key"
router.beforeEach(async (to, from, next) => {
  const authoriserDB = useAuthoriserDB();
  const encryptionKeyStore = useEncryptionKeyStore();
  
  if (to.matched.some(route => route.meta.authRequired)) {
    // If we don't have any accounts at all on this device, redirect to login
    try {
      await authoriserDB.getAccount();
    } catch (e) {
      return next({ path: "/login" });
    }

    // We want to make sure that we have everything prepared in our store.
    // If not, prepare it!
    await encryptionKeyStore.initialise();

    // Check that we have all of the following stored in state:
    // - Stretched master password
    // - Encrypted master key

    // If the stretched master password is set, but master private key isn't present
    // then decrypt encrypted master private key with stretched password
    if (encryptionKeyStore.getStretchedPassword && !encryptionKeyStore.getMasterKeyPair.privateKey) {
      console.log("Need to decrypt master keypair...")
    }

    // If we don't have an encrypted master key (at the very least, then prompt for a login)

    // Otherwise if we have no master key, stretched password, but have the encrypted master key, we can prompt for
    // an unlock
    if (!encryptionKeyStore.getMasterKeyPair.privateKey && !encryptionKeyStore.getStretchedPassword) {
      return next({ path: "/lock" })
    }
  }

  next();
})

export default router
