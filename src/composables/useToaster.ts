import { createToaster } from "@meforma/vue-toaster";

export default function useToaster()  {
    const toaster = createToaster({
        position: "bottom",
        type: "info"
    });

    return toaster;
}