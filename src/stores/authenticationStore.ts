import { defineStore } from 'pinia'
import { getUnixTime } from "date-fns";

export const useAuthenticationStore = defineStore({
  id: 'authentication',
  state: () => ({
    email: localStorage.getItem("email") || null,
    access_token: localStorage.getItem("access_token") || null,
    refresh_token: localStorage.getItem("refresh_token") || null,
    lastActiveTimestamp: getUnixTime(new Date())
  }),
  getters: {
    getEmail: (state) => state.email,
    getAccessToken: (state) => state.access_token,
    getRefreshToken: (state) => state.refresh_token,
    getLastActiveTimestamp: (state) => state.lastActiveTimestamp
  },
  actions: {
    setEmail(email: string) {
        this.email = email;
        localStorage.setItem("email", email);
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
        this.access_token = null;
        this.refresh_token = null;

        localStorage.removeItem("email");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
    }
  },
})
