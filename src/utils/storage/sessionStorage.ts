export enum SESSION_KEYS {
    MASTER_ENCRYPTION_KEY = "masterEncryptionKey"
}

export const setKey = (key: SESSION_KEYS, value: object) => {
    sessionStorage.setItem(key, JSON.stringify(value));
}

export const getKey = (key: SESSION_KEYS) => {
    // Check the key we're after exists in SessionStorage
    if (sessionStorage.getItem(key) === undefined) {
        return null;
    }

    // Attempt to parse the data
    const data = sessionStorage.getItem(key);
    return data && JSON.parse(data);
}