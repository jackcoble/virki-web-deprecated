import { initializeApp, type FirebaseApp } from "firebase/app";

export class FirebaseService {
    private _app: FirebaseApp;

    /**
     * FirebaseService
     */
    constructor() {
        const firebaseConfig = {
            apiKey: "AIzaSyB7xD8P31XZsdzTbrYd3vpFTptWECN1lHg",
            authDomain: "virki-89c36.firebaseapp.com",
            projectId: "virki-89c36",
            storageBucket: "virki-89c36.appspot.com",
            messagingSenderId: "1084295273699",
            appId: "1:1084295273699:web:9b58d91af864ae3f3eb9d6"
        };

        this._app = initializeApp(firebaseConfig);
    }

    /**
     * Returns instance of the Firebase app
     * @returns {FirebaseApp}
     */
    getApp(): FirebaseApp {
        return this._app;
    }
}