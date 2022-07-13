import { defineStore } from 'pinia'
import { getUnixTime } from "date-fns";

export const useAuthenticationStore = defineStore({
  id: 'authentication',
  state: () => ({
    email: localStorage.getItem("email") || null,
    password_salt: localStorage.getItem("password_salt") || null,
    access_token: localStorage.getItem("access_token") || null,
    refresh_token: localStorage.getItem("refresh_token") || null,
    lastActiveTimestamp: getUnixTime(new Date())
  }),
  getters: {
    getEmail: (state) => state.email,
    getPasswordSalt: (state) => state.password_salt,
    getAccessToken: (state) => state.access_token,
    getRefreshToken: (state) => state.refresh_token,
    getLastActiveTimestamp: (state) => state.lastActiveTimestamp
  },
  actions: {
    setEmail(email: string) {
        this.email = email;
        localStorage.setItem("email", email);
    },

    setPasswordSalt(salt: string) {
        this.password_salt = salt;
        localStorage.setItem("password_salt", salt);
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
        this.email = null;
        this.password_salt = null;
        this.access_token = null;
        this.refresh_token = null;

        localStorage.removeItem("email");
        localStorage.removeItem("password_salt");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
    }
  },
})
