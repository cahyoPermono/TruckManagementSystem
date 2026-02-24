<script setup lang="ts">
defineProps<{
  type: string
  hasHead: boolean
  hasT1: boolean
  hasT2: boolean
}>()
</script>

<template>
  <div class="flex items-end justify-center py-8 bg-gradient-to-b from-slate-900/40 to-slate-900/80 rounded-xl border border-slate-800 shadow-inner overflow-hidden relative">
    <div class="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
    
    <!-- Ground Line -->
    <div class="absolute bottom-6 left-0 right-0 h-0.5 bg-slate-700/50"></div>

    <div class="flex items-end z-10 translate-y-1">
      <!-- Double Trailer (T2) -->
      <div v-if="type === 'DOUBLE_TRAILER'" class="relative animate-in slide-in-from-left-4 fade-in duration-500">
        <svg viewBox="0 0 120 60" 
             :class="['h-16 w-auto transition-all duration-300 -mr-5 z-0 relative', hasT2 ? 'opacity-100 scale-100' : 'opacity-30 grayscale border-dashed blur-[0.5px] scale-95']">
          <rect x="5" y="10" width="105" height="35" rx="3" :fill="hasT2 ? '#3b82f6' : '#334155'" :stroke="hasT2 ? 'none' : '#475569'" stroke-width="2" :stroke-dasharray="hasT2 ? 'none' : '4 4'" />
          <rect x="110" y="38" width="10" height="4" :fill="hasT2 ? '#1e293b' : '#334155'" />
          <circle cx="25" cy="45" r="7" fill="#0f172a" :stroke="hasT2 ? '#64748b' : '#475569'" stroke-width="2"/>
          <circle cx="45" cy="45" r="7" fill="#0f172a" :stroke="hasT2 ? '#64748b' : '#475569'" stroke-width="2"/>
          <text v-if="hasT2" x="57" y="32" font-family="sans-serif" font-size="12" fill="#ffffff" text-anchor="middle" font-weight="bold">T2</text>
        </svg>
      </div>
      
      <!-- Single Trailer (T1) -->
      <div class="relative z-10 animate-in slide-in-from-left-4 fade-in duration-300">
        <svg viewBox="0 0 120 60" 
             :class="['h-16 w-auto transition-all duration-300 -mr-5 relative', hasT1 ? 'opacity-100 scale-100' : 'opacity-30 grayscale border-dashed blur-[0.5px] scale-95']">
          <rect x="5" y="10" width="105" height="35" rx="3" :fill="hasT1 ? '#3b82f6' : '#334155'" :stroke="hasT1 ? 'none' : '#475569'" stroke-width="2" :stroke-dasharray="hasT1 ? 'none' : '4 4'" />
          <rect x="110" y="38" width="10" height="4" :fill="hasT1 ? '#1e293b' : '#334155'" />
          <circle cx="25" cy="45" r="7" fill="#0f172a" :stroke="hasT1 ? '#64748b' : '#475569'" stroke-width="2"/>
          <circle cx="45" cy="45" r="7" fill="#0f172a" :stroke="hasT1 ? '#64748b' : '#475569'" stroke-width="2"/>
          <text v-if="hasT1" x="57" y="32" font-family="sans-serif" font-size="12" fill="#ffffff" text-anchor="middle" font-weight="bold">T1</text>
        </svg>
      </div>

      <!-- Head Unit -->
      <div class="relative z-20">
        <svg viewBox="0 0 100 60" 
             :class="['h-16 w-auto transition-all duration-300', hasHead ? 'opacity-100 scale-100 drop-shadow-lg' : 'opacity-40 scale-95 grayscale']">
          <path d="M10,38 L35,38 L45,15 L75,15 L85,30 L85,45 L10,45 Z" :fill="hasHead ? '#4f46e5' : '#334155'" />
          <path d="M47,18 L72,18 L79,28 L47,28 Z" :fill="hasHead ? '#c7d2fe' : '#475569'" />
          <circle cx="30" cy="45" r="7" fill="#0f172a" :stroke="hasHead ? '#64748b' : '#475569'" stroke-width="2"/>
          <circle cx="65" cy="45" r="7" fill="#0f172a" :stroke="hasHead ? '#64748b' : '#475569'" stroke-width="2"/>
        </svg>
      </div>
    </div>
  </div>
</template>
