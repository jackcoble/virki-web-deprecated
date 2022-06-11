import { getCurrentInstance } from "vue";

export default function useEmitter() {
    const internalInstance = getCurrentInstance();
    if (internalInstance) {
        const emitter = internalInstance.appContext.config.globalProperties.emitter;
        
        return emitter;
    }
}