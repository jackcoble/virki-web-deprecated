import type { IToken } from '@/class/token';
import { defineStore } from 'pinia'

export const useTokenStore = defineStore({
    id: 'tokens',
    state: () => ({
        tokens: [] as IToken[],
    }),
    getters: {
        getTokens: (state) => {
            return state.tokens;
        }
    },
    actions: {
        add(token: IToken) {
            // Check that the token ID doesn't already exist. If it does, just update the contents/
            const existingTokenIndex = this.tokens.findIndex(t => t.t_id === t.t_id);
            if (existingTokenIndex !== -1) {
                this.tokens[existingTokenIndex] = token;
            }
            else {
                this.tokens.push(token);
            }
        },

        clear() {
            this.tokens = [];
        }
    },
})
