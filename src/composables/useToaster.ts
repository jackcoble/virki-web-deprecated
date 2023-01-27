import { createToaster } from "@meforma/vue-toaster";

export default function useToaster()  {
    const toaster = createToaster({
        position: "top-right",
        type: "info"
    });

    return toaster;
}