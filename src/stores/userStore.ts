import { getData, LS_KEYS, setData } from '@/utils/storage/localStorage';
import { defineStore } from 'pinia'

export const useUserStore = defineStore({
  id: 'userStore',
  state: () => ({
    email: getData(LS_KEYS.EMAIL) || ""
  }),

  getters: {
    getEmail: (state) => state.email
  },

  actions: {
    setEmail(email: string) {
        this.email = email;

        setData(LS_KEYS.EMAIL, email);
    },

    // Clears entire store state
    clear() {
      this.email = "";
    }
  },
})
