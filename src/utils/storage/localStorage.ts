export enum LS_KEYS {
    KEYS = "keys",
    PASSWORD = "password",
    USER_DETAILS = "userDetails"
}

/**
 * Store an object in LocalStorage.
 * @param key 
 * @param value 
 */
export const setData = (key: LS_KEYS, value: object) => {
    localStorage.setItem(key, JSON.stringify(value));
}

/**
 * Remove an object by key from LocalStorage.
 * @param key 
 */
export const removeData = (key: LS_KEYS) => {
    localStorage.removeItem(key);
}

/**
 * Retrieves data from LocalStorage by key, and returns the parsed JSON object.
 * @param key 
 * @returns {object}
 */
export const getData = (key: LS_KEYS) => {
    try {
        // Check the key we're after exists in LocalStorage
        if (localStorage.getItem(key) === undefined) {
            return null;
        }

        // Attempt to parse the data
        const data = localStorage.getItem(key);
        return data && JSON.parse(data);
    } catch (error) {
        throw new Error("Unable to parse JSON for key: " + key);
    }
}