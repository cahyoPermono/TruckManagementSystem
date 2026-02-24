<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Circle } from 'lucide-vue-next'

const props = defineProps<{ vehicle: any }>()
const tires = props.vehicle?.tires || []
</script>

<template>
  <Dialog>
    <DialogTrigger asChild>
      <slot />
    </DialogTrigger>
    <DialogContent class="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-50">
      <DialogHeader>
        <DialogTitle>Attached Tires - {{ vehicle.id }}</DialogTitle>
      </DialogHeader>
      <div class="py-4 space-y-4">
        <div class="flex justify-between items-center text-sm px-1">
          <span class="text-slate-400">Total Attached</span>
          <span class="text-slate-200 font-medium">{{ tires.length }} / {{ vehicle.nbWheels }}</span>
        </div>
        
        <div v-if="tires.length === 0" class="text-center text-slate-500 py-6 bg-slate-800/20 rounded-lg border border-dashed border-slate-700">
          No tires attached to this vehicle.
        </div>
        
        <div v-else class="space-y-2 max-h-[300px] overflow-y-auto pr-2">
          <div v-for="t in tires" :key="t.id" class="flex justify-between items-center p-3 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition-colors">
            <div class="flex items-center gap-3">
              <Circle class="h-5 w-5 text-indigo-400" />
              <div>
                <div class="font-medium text-slate-200">
                  {{ t.serialNo }} <span class="text-indigo-400/80 text-xs font-normal ml-2">({{ Number(t.mileage).toFixed(0) }} km)</span>
                </div>
                <div class="text-xs text-slate-400">{{ t.brand || 'Unknown Brand' }} - {{ t.size || 'Size N/A' }}</div>
              </div>
            </div>
            <Badge variant="outline" :class="[
              t.status === 'GOOD' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : '',
              t.status === 'WORN' ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' : '',
              t.status === 'DAMAGED' ? 'border-red-500/30 text-red-400 bg-red-500/10' : '',
              t.status === 'SPARE' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' : ''
            ]">
              {{ t.status }}
            </Badge>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
