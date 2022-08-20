import { defineStore } from 'pinia'

export const useUserStore = defineStore({
  id: 'userStore',
  state: () => ({
    email: ""
  }),

  getters: {
    getEmail: (state) => state.email
  },

  actions: {
    setEmail(email: string) {
        this.email = email;
    }
  },
})
