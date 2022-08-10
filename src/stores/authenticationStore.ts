import { defineStore } from 'pinia'
import { getUnixTime } from "date-fns";
import jwt_decode from "jwt-decode";
import useAuthoriserDB from '@/composables/useAuthoriserDB';

export const useAuthenticationStore = defineStore({
  id: 'authentication',
  state: () => ({
    email: "",
    password_salt: "",
    access_token: localStorage.getItem("access_token") || "",
    refresh_token: localStorage.getItem("refresh_token") || "",
    lastActiveTimestamp: getUnixTime(new Date())
  }),
  getters: {
    getEmail: (state) => state.email,
    getPasswordSalt: (state) => state.password_salt,
    getAccessToken: (state) => state.access_token,
    getRefreshToken: (state) => state.refresh_token,
    getLastActiveTimestamp: (state) => state.lastActiveTimestamp,
    getActiveAccount: (state): string => {
      const decoded = jwt_decode(state.access_token) as any;
      return decoded.sub;
    }
  },
  actions: {
    async initialise() {
      const authoriserDB = useAuthoriserDB();
      const account = await authoriserDB.getAccount(this.getActiveAccount!);
      if (!account) {
        return;
      }

      // Set the password salt and email
      this.setPasswordSalt(account.password.salt);
      this.setEmail(account.email);
    },

    setEmail(email: string) {
        this.email = email
    },

    setPasswordSalt(salt: string) {
        this.password_salt = salt;
    },

    setAccessToken(accessToken: string) {
      this.access_token = accessToken;
      localStorage.setItem("access_token", accessToken);
    },

    setRefreshToken(refreshToken: string) {
        this.refresh_token = refreshToken;
        localStorage.setItem("refresh_token", refreshToken)
    },

    setLastActiveTimestamp(timestamp: number) {
        this.lastActiveTimestamp = timestamp;
    },

    clear() {
        localStorage.clear();
    }
  },
})
