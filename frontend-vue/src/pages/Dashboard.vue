<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStats, useVehicles, useTrails } from '@/composables/useApi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Truck, MapPin, GaugeCircle, CircleDot, Search, Navigation, Activity } from 'lucide-vue-next'
import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import TruckSimulation from '@/components/TruckSimulation.vue'

ChartJS.register(ArcElement, Tooltip, Legend)

const { data: stats } = useStats()
const { data: vehiclesData } = useVehicles()
const { data: trailsData } = useTrails()

const vehicles = computed(() => vehiclesData.value || [])
const trails = computed(() => trailsData.value || [])

const searchQuery = ref('')
const selectedAsset = ref<any>(null)
const isDialogOpen = computed({
  get: () => !!selectedAsset.value,
  set: (val) => { if (!val) selectedAsset.value = null }
})

const headData = computed(() => {
  const heads = vehicles.value.filter((v: any) => v.kind === 'THEAD')
  const active = heads.filter((v: any) => v.status === 'ACTIVE').length
  const inactive = heads.length - active
  return {
    labels: ['Active', 'Inactive/Maintenance'],
    datasets: [{
      data: [active, inactive],
      backgroundColor: ['#10b981', '#64748b'],
      borderWidth: 0
    }]
  }
})

const chassisData = computed(() => {
  const chassis = vehicles.value.filter((v: any) => v.kind === 'TCHASS' || v.kind === 'TDOLLY')
  const attachedIds = new Set()
  trails.value.forEach((t: any) => t.trailers?.forEach((tr: any) => attachedIds.add(tr.trailerId)))
  
  const attached = chassis.filter((c: any) => attachedIds.has(c.id)).length
  const detached = chassis.length - attached
  return {
    labels: ['Attached', 'Detached (Standby)'],
    datasets: [{
      data: [attached, detached],
      backgroundColor: ['#3b82f6', '#f59e0b'],
      borderWidth: 0
    }]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '75%',
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: { color: '#cbd5e1', padding: 20, font: { size: 12 }, usePointStyle: true, pointStyle: 'circle' }
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      titleColor: '#f8fafc',
      bodyColor: '#e2e8f0',
      borderColor: 'rgba(51, 65, 85, 0.5)',
      borderWidth: 1,
      padding: 10,
      cornerRadius: 8
    }
  }
}

const mapNodes = computed(() => {
  const nodes = trails.value.map((t: any) => {
    const headVehicle = t.head || vehicles.value.find((v: any) => v.id === t.headId)
    let lat = 0, lng = 0, speed = 0
    
    if (headVehicle?.mobilityLogs && headVehicle.mobilityLogs.length > 0) {
      lat = headVehicle.mobilityLogs[0].latitude
      lng = headVehicle.mobilityLogs[0].longitude
      speed = headVehicle.mobilityLogs[0].speed
    } else {
      const hash = t.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)
      lat = (hash % 60) - 30
      lng = ((hash * 13) % 100) - 50
    }
    return { ...t, lat, lng, speed, headVehicle }
  }).filter((n: any) => n.headVehicle)
  
  if (!searchQuery.value) return nodes
  return nodes.filter((n: any) => 
    n.id.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
    (n.headVehicle?.plateNo && n.headVehicle.plateNo.toLowerCase().includes(searchQuery.value.toLowerCase()))
  )
})

const createCustomIcon = (node: any) => {
  const isMoving = node.speed > 0
  const nodeColor = 'bg-emerald-400'
  const shadowColor = 'shadow-[0_0_15px_rgba(52,211,153,0.6)]'
  
  const htmlStr = `
    <div class="relative flex items-center justify-center w-full h-full group">
      <div class="absolute w-4 h-4 rounded-full ${nodeColor} ${shadowColor} border border-white/20"></div>
      ${isMoving ? `<div class="absolute w-4 h-4 rounded-full ${nodeColor} opacity-75 animate-ping"></div>` : ''}
      <div class="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700/50 text-xs px-2.5 py-1 rounded-md text-slate-200 opacity-0 group-hover:opacity-100 whitespace-nowrap shadow-xl transition-opacity flex flex-col items-center gap-1 backdrop-blur-sm z-50 pointer-events-none">
        <div class="flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full ${nodeColor}"></span>
          <span class="font-bold text-emerald-400">${node.id}</span>
        </div>
        <span class="text-[10px] text-slate-400 border-t border-slate-700 w-full text-center pt-1">${node.headVehicle.plateNo || node.headVehicle.id}</span>
      </div>
    </div>
  `
  return L.divIcon({
    html: htmlStr,
    className: 'bg-transparent border-none',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  })
}

const formatDate = (dateString: string) => new Date(dateString).toLocaleString()

</script>

<template>
  <div class="flex flex-col gap-6 animate-in fade-in duration-500 relative">
    <div class="flex justify-between items-end mb-2">
      <div>
        <h2 class="text-3xl font-bold tracking-tight text-slate-50">Operation Center</h2>
        <p class="text-slate-400 mt-1">Live overview and telemetry of all enterprise assets.</p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card class="border-slate-700/50 bg-slate-900/50 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:bg-slate-800/60 group overflow-hidden relative hover:-translate-y-1">
        <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] -mr-12 -mt-12 pointer-events-none group-hover:scale-150 transition-transform duration-700 opacity-70" />
        <CardContent class="p-6 flex items-center gap-5 relative z-10">
          <div class="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-current/20 shadow-inner group-hover:scale-110 transition-transform"><Truck class="h-6 w-6 lg:h-8 lg:w-8" /></div>
          <div><p class="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors uppercase tracking-wider">Active Power Units</p><h3 class="text-3xl font-black tracking-tight text-slate-50 mt-1">{{ stats?.heads ?? 0 }}</h3></div>
        </CardContent>
      </Card>
      <Card class="border-slate-700/50 bg-slate-900/50 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:bg-slate-800/60 group overflow-hidden relative hover:-translate-y-1">
        <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] -mr-12 -mt-12 pointer-events-none group-hover:scale-150 transition-transform duration-700 opacity-70" />
        <CardContent class="p-6 flex items-center gap-5 relative z-10">
          <div class="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-400 ring-1 ring-inset ring-current/20 shadow-inner group-hover:scale-110 transition-transform"><MapPin class="h-6 w-6 lg:h-8 lg:w-8" /></div>
          <div><p class="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors uppercase tracking-wider">Total Chassis</p><h3 class="text-3xl font-black tracking-tight text-slate-50 mt-1">{{ stats?.chassis ?? 0 }}</h3></div>
        </CardContent>
      </Card>
      <Card class="border-slate-700/50 bg-slate-900/50 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:bg-slate-800/60 group overflow-hidden relative hover:-translate-y-1">
        <div class="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-[40px] -mr-12 -mt-12 pointer-events-none group-hover:scale-150 transition-transform duration-700 opacity-70" />
        <CardContent class="p-6 flex items-center gap-5 relative z-10">
          <div class="p-3.5 rounded-2xl bg-violet-500/10 text-violet-400 ring-1 ring-inset ring-current/20 shadow-inner group-hover:scale-110 transition-transform"><CircleDot class="h-6 w-6 lg:h-8 lg:w-8" /></div>
          <div><p class="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors uppercase tracking-wider">Dollies in Field</p><h3 class="text-3xl font-black tracking-tight text-slate-50 mt-1">{{ stats?.dollies ?? 0 }}</h3></div>
        </CardContent>
      </Card>
      <Card class="border-slate-700/50 bg-slate-900/50 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:bg-slate-800/60 group overflow-hidden relative hover:-translate-y-1">
        <div class="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[40px] -mr-12 -mt-12 pointer-events-none group-hover:scale-150 transition-transform duration-700 opacity-70" />
        <CardContent class="p-6 flex items-center gap-5 relative z-10">
          <div class="p-3.5 rounded-2xl bg-cyan-500/10 text-cyan-400 ring-1 ring-inset ring-current/20 shadow-inner group-hover:scale-110 transition-transform"><GaugeCircle class="h-6 w-6 lg:h-8 lg:w-8" /></div>
          <div><p class="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors uppercase tracking-wider">Tires Managed</p><h3 class="text-3xl font-black tracking-tight text-slate-50 mt-1">{{ stats?.tires ?? 0 }}</h3></div>
        </CardContent>
      </Card>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2">
      <!-- Interactive Asset Map -->
      <Card class="lg:col-span-8 border-slate-700/50 bg-slate-900/60 backdrop-blur-xl shadow-2xl relative overflow-hidden flex flex-col group">
        <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
        <CardHeader class="border-b border-slate-700/50 pb-4 z-10 bg-slate-900/40 backdrop-blur-md">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle class="text-slate-100 font-semibold flex items-center text-xl">
                Live Telemetry Map
              </CardTitle>
              <CardDescription class="flex items-center gap-2 mt-1">
                <span class="relative flex h-2.5 w-2.5">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                Tracking {{ mapNodes.length }} active setups
              </CardDescription>
            </div>
            <div class="relative w-full sm:w-72">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Locate Unit ID or Plate..." 
                v-model="searchQuery"
                class="pl-10 bg-slate-950/50 border-slate-700 focus-visible:ring-indigo-500 rounded-full shadow-inner text-slate-200" 
              />
            </div>
          </div>
        </CardHeader>
        <CardContent class="p-0 h-[500px] relative overflow-hidden bg-slate-950/80 rounded-b-xl z-0">
          <LMap 
            :center="mapNodes.length > 0 ? [mapNodes[0].lat, mapNodes[0].lng] : [0, 0]" 
            :zoom="4" 
            class="h-full w-full z-0"
            :options="{ zoomControl: false }"
          >
            <LTileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors &copy; <a href='https://carto.com/attributions'>CARTO</a>"
            />
            
            <LMarker 
              v-for="node in mapNodes"
              :key="node.id"
              :lat-lng="[node.lat, node.lng]"
              :icon="createCustomIcon(node)"
              @click="selectedAsset = node"
            />
          </LMap>
          
          <!-- Map Accents -->
          <div class="absolute left-4 bottom-4 flex flex-col gap-2 z-[1000] pointer-events-none">
             <div class="bg-slate-900/90 backdrop-blur border border-slate-700/50 rounded-lg p-3 shadow-2xl pointer-events-auto">
               <div class="text-[10px] uppercase text-slate-500 font-bold mb-2 tracking-wider">Legend</div>
               <div class="flex items-center gap-2 text-xs text-slate-300 mb-1.5">
                 <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" /> Active Fleet (Trail Setups)
               </div>
             </div>
          </div>
        </CardContent>
      </Card>

      <!-- Status Diagrams -->
      <div class="lg:col-span-4 flex flex-col gap-6">
        <Card class="border-slate-700/50 bg-slate-900/60 backdrop-blur-xl shadow-2xl flex-1 relative overflow-hidden group">
          <div class="absolute -right-12 -top-12 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
          <CardHeader class="border-b border-slate-700/50 pb-3">
            <CardTitle class="text-slate-100 font-semibold text-base flex items-center gap-2">
              <Activity class="h-4 w-4 text-emerald-400" /> Power Unit Health
            </CardTitle>
          </CardHeader>
          <CardContent class="p-4 h-[240px] flex items-center justify-center">
            <Doughnut :data="headData" :options="chartOptions" />
          </CardContent>
        </Card>

        <Card class="border-slate-700/50 bg-slate-900/60 backdrop-blur-xl shadow-2xl flex-1 relative overflow-hidden group">
          <div class="absolute -left-12 -bottom-12 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors" />
          <CardHeader class="border-b border-slate-700/50 pb-3">
            <CardTitle class="text-slate-100 font-semibold text-base flex items-center gap-2">
              <Navigation class="h-4 w-4 text-indigo-400" /> Chassis Linkage
            </CardTitle>
          </CardHeader>
          <CardContent class="p-4 h-[240px] flex items-center justify-center">
            <Doughnut :data="chassisData" :options="chartOptions" />
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Asset Detail Dialog -->
    <Dialog v-model:open="isDialogOpen">
      <DialogContent class="sm:max-w-[450px] bg-slate-900 border-slate-800 text-slate-50">
        <DialogHeader class="mb-2">
          <DialogTitle class="flex items-center gap-2">
            <Navigation class="h-5 w-5 text-indigo-400" />
            Setup Configuration: {{ selectedAsset?.id }}
          </DialogTitle>
          <DialogDescription class="text-slate-400">
            Live location and configuration details for this set up.
          </DialogDescription>
        </DialogHeader>
        
        <div v-if="selectedAsset" class="space-y-4">
          <!-- Visualizer -->
          <div class="bg-slate-950/50 rounded-xl border border-slate-800 shadow-inner">
            <TruckSimulation 
              :type="selectedAsset.type" 
              :hasHead="!!selectedAsset.headVehicle" 
              :hasT1="(selectedAsset.trailers?.length || 0) > 0" 
              :hasT2="(selectedAsset.trailers?.length || 0) > 1" 
            />
          </div>

          <!-- Head Section -->
          <div v-if="selectedAsset.headVehicle" class="bg-blue-900/10 border border-blue-800/40 rounded-lg p-3">
            <div class="text-xs font-semibold text-blue-400 mb-1 flex justify-between">
              <span>HEAD UNIT • {{ selectedAsset.headVehicle.id }}</span>
              <span class="text-slate-300">{{ selectedAsset.headVehicle.plateNo || 'No Plate' }}</span>
            </div>
            <div class="font-medium text-slate-200 text-sm">
              {{ selectedAsset.headVehicle.brand || '-' }} {{ selectedAsset.headVehicle.model || '' }}
            </div>
          </div>

          <!-- Trailers Section -->
          <div v-for="tr in selectedAsset.trailers" :key="tr.trailerId" class="bg-indigo-900/10 border border-indigo-800/40 rounded-lg p-3 relative ml-4">
            <div class="absolute -left-4 top-1/2 -translate-y-1/2 w-4 border-t border-slate-700"></div>
            <div class="text-xs font-semibold text-indigo-400 mb-1 flex justify-between">
              <span>TRAILER #{{ tr.order }} • {{ tr.trailerId }}</span>
              <span class="text-slate-300">{{ tr.trailer?.plateNo || 'No Plate' }}</span>
            </div>
            <div class="font-medium text-slate-200 text-sm">
              {{ tr.trailer?.brand || '-' }} {{ tr.trailer?.model || '' }}
            </div>
          </div>

          <div class="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center px-1">
            <span class="text-sm text-slate-400">Total Setup Wheels</span>
            <Badge variant="outline" class="border-indigo-500/30 text-indigo-400 bg-indigo-500/10 font-bold px-3 py-1">
              {{ selectedAsset.totalWheels }} Wheels Total
            </Badge>
          </div>

          <div v-if="selectedAsset.headVehicle?.mobilityLogs?.length > 0" class="mt-4 border-t border-slate-800 pt-4 bg-slate-900/40 rounded-lg p-3">
            <div class="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Live Telemetry (Head)</div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-500">Speed</span>
              <span class="text-emerald-400 font-mono font-medium">{{ selectedAsset.headVehicle.mobilityLogs[0].speed.toFixed(1) }} km/h</span>
            </div>
            <div class="flex justify-between text-sm mt-1">
              <span class="text-slate-500">Coordinates</span>
              <span class="text-slate-300 font-mono">
                {{ selectedAsset.headVehicle.mobilityLogs[0].latitude.toFixed(4) }}, {{ selectedAsset.headVehicle.mobilityLogs[0].longitude.toFixed(4) }}
              </span>
            </div>
            <div class="text-[10px] text-slate-500 mt-2 text-right">
              Last sync: {{ formatDate(selectedAsset.headVehicle.mobilityLogs[0].timestamp) }}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
