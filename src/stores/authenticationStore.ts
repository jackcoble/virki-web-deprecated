import { defineStore } from 'pinia'
import { getUnixTime } from "date-fns";
import jwt_decode from "jwt-decode";

export const useAuthenticationStore = defineStore({
  id: 'authentication',
  state: () => ({
    user: {
      email: "",
      name: "",
      avatar: ""
    },
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
    getUser: (state) => state.user,
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
    // Populate all information from LocalStorage and into the store
    initialise() {
      // User data
      const userDataString = localStorage.getItem("user");
      if (userDataString) {
        const userData = JSON.parse(userDataString);

        this.setUser(userData.email, userData.name, userData.avatar);
      }

      // Password data
      const passwordDataString = localStorage.getItem("password");
      if (passwordDataString) {
        const passwordData = JSON.parse(passwordDataString);

        this.setPassword(passwordData.hash, passwordData.salt);
      }

      // Access/refresh tokens
      const tokenDataString = localStorage.getItem("authentication_tokens");
      if (tokenDataString) {
        const tokenData = JSON.parse(tokenDataString);

        this.setTokens(tokenData.access_token, tokenData.refresh_token);
      }
    },

    setUser(email: string, name: string, avatar?: string) {
        this.user.email = email;
        this.user.name = name;

        if (avatar) {
          this.user.avatar = avatar;
        }

        // Store in LocalStorage
        localStorage.setItem("user", JSON.stringify(this.user));
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
