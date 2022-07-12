import { defineStore } from 'pinia'

export const useAuthenticationStore = defineStore({
  id: 'authentication',
  state: () => ({
    access_token: localStorage.getItem("access_token") || null,
    refresh_token: localStorage.getItem("refresh_token") || null
  }),
  getters: {
    getAccessToken: (state) => state.access_token,
    getRefreshToken: (state) => state.refresh_token
  },
  actions: {
    setAccessToken(accessToken: string) {
      this.access_token = accessToken;
      localStorage.setItem("access_token", accessToken);
    },

    setRefreshToken(refreshToken: string) {
        this.refresh_token = refreshToken;
        localStorage.setItem("refresh_token", refreshToken)
    },

    clear() {
        this.access_token = null;
        this.refresh_token = null;

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
    }
  },
})
