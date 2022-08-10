import { defineStore } from 'pinia'
import { getUnixTime } from "date-fns";
import jwt_decode from "jwt-decode";

export const useAuthenticationStore = defineStore({
  id: 'authentication',
  state: () => ({
    email: "",
    password: {
      salt: "",
      hash: ""
    },
    tokens: {
      access_token: "",
      refresh_token: ""
    },
    lastActiveTimestamp: getUnixTime(new Date())
  }),
  getters: {
    getEmail: (state) => state.email,
    getPassword: (state) => state.password,
    getAccessToken: (state) => state.tokens.access_token,
    getRefreshToken: (state) => state.tokens.refresh_token,
    getLastActiveTimestamp: (state) => state.lastActiveTimestamp,
    getActiveAccount: (state): string => {
      const decoded = jwt_decode(state.tokens.access_token) as any;
      return decoded.sub;
    }
  },
  actions: {
    setEmail(email: string) {
        this.email = email
    },

    setPassword(hash: string, salt: string) {
        this.password.hash = hash;
        this.password.salt = salt;

        // Store in LocalStorage
        localStorage.setItem("password", JSON.stringify(this.password));
    },

    setTokens(access_token: string, refresh_token: string) {
      this.tokens.access_token = access_token;
      this.tokens.refresh_token = refresh_token;

      // Store in LocalStorage
      localStorage.setItem("authentication_tokens", JSON.stringify(this.tokens));
    },

    setLastActiveTimestamp(timestamp: number) {
        this.lastActiveTimestamp = timestamp;
    },

    clear() {
        localStorage.clear();
    }
  },
})
