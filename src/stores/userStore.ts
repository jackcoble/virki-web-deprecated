import { LocalStorageKeys } from '@/common/enums/localStorage';
import { LocalStorageService } from '@/common/services/localStorage.service';
import { defineStore } from 'pinia'

const localStorage = new LocalStorageService();

export const useUserStore = defineStore({
  id: 'userStore',
  state: () => ({
    email: localStorage.get(LocalStorageKeys.EMAIL) || ""
  }),

  getters: {
    getEmail: (state) => state.email
  },

  actions: {
    setEmail(email: string) {
        this.email = email;

        localStorage.add(LocalStorageKeys.EMAIL, email);
    },

    // Clears entire store state
    clear() {
      this.email = "";
    }
  },
})
