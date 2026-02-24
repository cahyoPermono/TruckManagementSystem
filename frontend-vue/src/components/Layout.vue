<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { LayoutDashboard, Truck, Settings, Menu, Bell, CircleUser, MapPin } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const route = useRoute()

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Vehicles', href: '/vehicles', icon: Truck },
  { name: 'Trail Setups', href: '/trails', icon: MapPin },
  { name: 'Tires Master', href: '/tires', icon: Settings },
]

const currentName = computed(() => {
  return NAV_ITEMS.find((n) => n.href === route.path)?.name || 'Dashboard Overview'
})

const isActive = (href: string) => {
  return route.path === href || (href !== '/' && route.path.startsWith(href))
}
</script>

<template>
  <div class="flex min-h-screen w-full bg-slate-950 text-slate-50 font-sans selection:bg-blue-600/30">
    <!-- Sidebar -->
    <aside class="sticky top-0 h-screen w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl flex flex-col transition-all duration-300">
      <div class="h-16 flex items-center px-6 border-b border-slate-800/60">
        <Truck class="h-6 w-6 text-blue-500 mr-3" />
        <span class="font-bold text-lg tracking-tight bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
          TMS Portal
        </span>
      </div>
      
      <nav class="flex-1 w-full flex flex-col gap-2 p-4">
        <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">
          Main Menu
        </div>
        
        <RouterLink
          v-for="item in NAV_ITEMS"
          :key="item.name"
          :to="item.href"
          :class="cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden',
            isActive(item.href)
              ? 'text-blue-50 bg-blue-600/10 shadow-[inset_0px_1px_1px_rgba(255,255,255,0.05),0px_1px_2px_rgba(0,0,0,0.5)] border border-blue-500/20'
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
          )"
        >
          <div v-if="isActive(item.href)" class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full" />
          <component :is="item.icon" :class="cn('h-4 w-4 transition-colors', isActive(item.href) ? 'text-blue-400' : 'group-hover:text-slate-300')" />
          {{ item.name }}
        </RouterLink>
      </nav>

      <div class="p-4 border-t border-slate-800/60">
        <div class="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-700/50 shadow-sm cursor-pointer hover:bg-slate-800 transition-colors">
          <div class="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-xs font-bold shadow-inner">
            AD
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-medium text-slate-200">Admin User</span>
            <span class="text-xs text-slate-500">Fleet Operations</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col min-w-0 overflow-hidden relative">
      <!-- Decorative background glow -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <header class="sticky top-0 z-30 h-16 flex items-center justify-between px-8 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md">
        <div class="flex items-center gap-4">
          <button class="md:hidden text-slate-400 hover:text-white">
            <Menu class="h-5 w-5" />
          </button>
          <h1 class="text-xl font-semibold text-slate-100 hidden sm:block">
            {{ currentName }}
          </h1>
        </div>
        <div class="flex items-center gap-4">
          <button class="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800">
            <Bell class="h-5 w-5" />
            <span class="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-slate-950 animate-pulse" />
          </button>
          <button class="p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800">
            <CircleUser class="h-5 w-5" />
          </button>
        </div>
      </header>

      <div class="flex-1 overflow-auto p-8 z-10">
        <slot />
      </div>
    </main>
  </div>
</template>
