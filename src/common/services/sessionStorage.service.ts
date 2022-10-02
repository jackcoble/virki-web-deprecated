import type { SessionStorageKeys } from "../enums/sessionStorage";

export class SessionStorageService {
    constructor() {
        // Check browser supports sessionStorage
        if (window.sessionStorage === undefined) {
            throw new Error("SessionStorage is not available in this browser!")
        }
    }

    /**
     * Insert a key/value pair into SessionStorage.
     * @param key 
     * @param value 
     */
    add(key: SessionStorageKeys, value: string) {
        sessionStorage.setItem(key, value);
    }

    /**
     * Remove an item from SessionStorage.
     * @param key 
     */
    delete(key: SessionStorageKeys) {
        sessionStorage.removeItem(key);
    }

    /**
     * Retrieve a value from SessionStorage.
     * @param key 
     * @returns {string | null}
     */
    get(key: SessionStorageKeys): string | null {
        const data = sessionStorage.getItem(key)
        if (!data) {
            return null;
        }

        return data;
    }

    /**
     * Removes all key/value pairs from SessionStorage.
     */
    clear() {
        sessionStorage.clear();
    }
}