<script setup lang="ts">
import { useRoute, RouterView } from 'vue-router'
import Layout from '@/components/Layout.vue'

const route = useRoute()
</script>

<template>
  <Layout v-if="route.meta.requiresAuth">
    <RouterView />
  </Layout>
  <RouterView v-else />
</template>
