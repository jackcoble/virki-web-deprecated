import { Database } from "@/class/pouchdb";
import { useApplicationStore } from "@/stores/appStore";
import { useAuthenticationStore } from "@/stores/authenticationStore";

const REMOTE_HOST = "http://localhost:5984"

export default function usePouchDB () {
    // Fetch access token from Authentication store
    const authenticationStore = useAuthenticationStore();
    const applicationStore = useApplicationStore();
    
    return new Database(authenticationStore.getAccessToken!, `${REMOTE_HOST}/${applicationStore.getSyncDB}`)
}