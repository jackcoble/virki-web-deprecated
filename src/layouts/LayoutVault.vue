<template>
    <div class="flex flex-col h-screen">
        <!-- Header -->
        <Navigation />

        <div class="flex flex-grow overflow-hidden">
            <!-- Sidebar (controllable with a meta property) -->
            <div v-if="route.meta.sidebar" class="flex-col flex-shrink-0 xl:w-1/6 md:w-1/4 sm:w-full" :class="openMobileMenu ? 'block w-full' : 'hidden md:block'">
                <Sidebar />
            </div>

            <!-- Main content -->
            <div class="flex-col flex-grow overflow-auto">
                <slot />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useRoute } from 'vue-router';

// Components
import Navigation from '../components/Navigation.vue';
import Sidebar from '@/components/Sidebar.vue';
import { useAppStore } from '@/stores/appStore';

export default defineComponent({
    name: "LayoutVault",
    components: {
        Sidebar,
        Navigation
    },
    setup() {
        const appStore = useAppStore();
        const route = useRoute();

        const openMobileMenu = computed(() => appStore.shouldOpenMobileMenu);

        return {
            openMobileMenu,
            route
        }
    }
})
</script>