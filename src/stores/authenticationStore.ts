import { defineStore } from 'pinia'

export const useAuthenticationStore = defineStore({
  id: 'authentication',
  state: () => ({
    access_token: localStorage.getItem("access_token") || null
  }),
  getters: {
    getAccessToken: (state) => state.access_token
  },
  actions: {
    setAccessToken(accessToken: string) {
      this.access_token = accessToken;
      localStorage.setItem("access_token", accessToken);
    }
  },
})
