import { Database } from "@/class/pouchdb";
import { useApplicationStore } from "@/stores/appStore";
import { useAuthenticationStore } from "@/stores/authenticationStore";

export default function usePouchDB () {
    // Fetch access token from Authentication store
    const authenticationStore = useAuthenticationStore();
    const applicationStore = useApplicationStore();
    
    return new Database(applicationStore.getSync.type, applicationStore.getSync.db, applicationStore.getSync.url, authenticationStore.getAccessToken!)
}