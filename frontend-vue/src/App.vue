<script setup lang="ts">
import { useRoute, RouterView } from 'vue-router'
import Layout from '@/components/Layout.vue'
import { Toaster } from '@/components/ui/sonner'

const route = useRoute()
</script>

<template>
  <Layout v-if="route.meta.requiresAuth">
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </Layout>
  <RouterView v-else />
  <Toaster richColors position="top-center" />
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
