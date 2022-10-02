import type { LocalStorageKeys } from "../enums/localStorage";

export class LocalStorageService {
    constructor() {
        // Check browser supports localStorage
        if (window.localStorage === undefined) {
            throw new Error("LocalStorage is not available in this browser!")
        }
    }

    /**
     * Insert a key/value pair into LocalStorage.
     * @param key 
     * @param value 
     */
    add(key: LocalStorageKeys, value: string) {
        localStorage.setItem(key, value);
    }

    /**
     * Remove an item from LocalStorage.
     * @param key 
     */
    delete(key: LocalStorageKeys) {
        localStorage.removeItem(key);
    }

    /**
     * Retrieve a value from LocalStorage.
     * @param key 
     * @returns {string | null}
     */
    get(key: LocalStorageKeys): string | null {
        const data = localStorage.getItem(key)
        if (!data) {
            return null;
        }

        return data;
    }

    /**
     * Removes all key/value pairs from LocalStorage.
     */
    clear() {
        localStorage.clear();
    }
}