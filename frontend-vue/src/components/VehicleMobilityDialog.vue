<script setup lang="ts">
import { computed } from 'vue'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { MapPin, Navigation } from 'lucide-vue-next'

const props = defineProps<{ vehicle: any }>()
const logs = computed(() => props.vehicle?.mobilityLogs || [])
const totalDistance = computed(() => logs.value.reduce((acc: number, log: any) => acc + log.distance, 0))

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString()
</script>

<template>
  <Dialog>
    <DialogTrigger asChild>
      <slot />
    </DialogTrigger>
    <DialogContent class="sm:max-w-[450px] bg-slate-900 border-slate-800 text-slate-50">
      <DialogHeader>
        <DialogTitle>Mobility Log - {{ vehicle.id }}</DialogTitle>
      </DialogHeader>
      <div class="py-4 space-y-4">
        <div class="flex justify-between items-center text-sm px-1">
          <span class="text-slate-400">Total Distance Logged</span>
          <span class="text-slate-200 font-medium">{{ totalDistance.toFixed(1) }} km</span>
        </div>
        
        <div v-if="logs.length === 0" class="text-center text-slate-500 py-6 bg-slate-800/20 rounded-lg border border-dashed border-slate-700">
          No mobility logs recorded for this vehicle.
        </div>
        
        <div v-else class="space-y-2 max-h-[300px] overflow-y-auto pr-2">
          <div v-for="log in logs" :key="log.id" class="flex flex-col gap-2 p-3 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition-colors">
            <div class="flex justify-between items-start">
              <div class="flex items-center gap-2">
                <MapPin class="h-4 w-4 text-indigo-400" />
                <span class="text-xs font-mono text-slate-300">
                  {{ Number(log.latitude).toFixed(4) }}, {{ Number(log.longitude).toFixed(4) }}
                </span>
              </div>
              <span class="text-xs text-slate-400">
                {{ formatDate(log.timestamp) }}
              </span>
            </div>
            <div class="flex gap-4 items-center">
              <Badge variant="outline" class="border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                <Navigation class="h-3 w-3 mr-1" />
                {{ Number(log.speed).toFixed(1) }} km/h
              </Badge>
              <span class="text-xs text-slate-300 font-medium">+{{ Number(log.distance).toFixed(2) }} km</span>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
