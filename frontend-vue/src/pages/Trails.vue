<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTrails, useVehicles, useCreateTrail, useDeleteTrail } from '@/composables/useApi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Trash2, Link as LinkIcon, LayoutGrid, List, Circle, MapPin } from 'lucide-vue-next'
import TruckSimulation from '@/components/TruckSimulation.vue'
import VehicleTiresDialog from '@/components/VehicleTiresDialog.vue'
import VehicleMobilityDialog from '@/components/VehicleMobilityDialog.vue'
import PaginationControls from '@/components/PaginationControls.vue'
import { toast } from 'vue-sonner'
import { useAuthStore } from '@/stores/auth'

const currentPage = ref(1)
const { data: trailsData, isLoading } = useTrails(currentPage, 10)
const { data: vehiclesData } = useVehicles(1, 500)
const { mutateAsync: createTrail, isPending: isSubmitting } = useCreateTrail()
const { mutateAsync: deleteTrail } = useDeleteTrail()

const trails = computed(() => trailsData.value?.data || [])
const trailsMeta = computed(() => trailsData.value?.meta || null)
const vehicles = computed(() => vehiclesData.value?.data || [])

const auth = useAuthStore()
const canManage = computed(() => auth.user?.role?.permissions?.some((p: any) => p.permission.name === 'manage:trails'))

const isAddOpen = ref(false)
const viewType = ref<'table' | 'card'>('card')

const id = ref('')
const type = ref('SINGLE_TRAILER')
const headId = ref('')
const trailer1 = ref('')
const trailer2 = ref('')

const heads = computed(() => vehicles.value.filter((v: any) => v.kind === 'THEAD'))
const trailersList = computed(() => vehicles.value.filter((v: any) => v.kind === 'TCHASS' || v.kind === 'TDOLLY'))

const handleSubmit = async (e: Event) => {
  e.preventDefault()
  try {
    const trailerData = []
    if (trailer1.value) trailerData.push({ trailerId: trailer1.value, order: 1 })
    if (type.value === 'DOUBLE_TRAILER' && trailer2.value) trailerData.push({ trailerId: trailer2.value, order: 2 })

    await createTrail({
      id: id.value,
      type: type.value,
      headId: headId.value,
      totalWheels: 10 + trailerData.length * 8, // dummy logic for wheels
      trailers: trailerData
    })
    
    toast.success('Trail setup created successfully')
    
    isAddOpen.value = false
    id.value = ''
    type.value = 'SINGLE_TRAILER'
    headId.value = ''
    trailer1.value = ''
    trailer2.value = ''
  } catch (err: any) {
    toast.error(err.message || 'Failed to create trail setup')
    console.error(err)
  }
}

const handleDelete = async (trailId: string) => {
  try {
    await deleteTrail(trailId)
    toast.success('Trail setup deleted successfully')
  } catch (err: any) {
    toast.error(err.message || 'Failed to delete trail setup')
  }
}
</script>

<template>
  <div class="flex flex-col gap-6 animate-in fade-in duration-500">
    <div class="flex justify-between items-end">
      <div>
        <h2 class="text-3xl font-bold tracking-tight text-slate-50">Trail Setups</h2>
        <p class="text-slate-400 mt-1">Configure and view vehicle combinations.</p>
      </div>
      
      <div class="flex gap-3 items-center">
        <div class="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700">
          <Button variant="ghost" size="icon" :class="['h-8 w-8 rounded-md', viewType === 'table' ? 'bg-slate-700 text-slate-100' : 'text-slate-400 hover:text-slate-200']" @click="viewType = 'table'">
            <List class="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" :class="['h-8 w-8 rounded-md', viewType === 'card' ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-400 hover:text-slate-200']" @click="viewType = 'card'">
            <LayoutGrid class="h-4 w-4" />
          </Button>
        </div>
        
        <Dialog v-if="canManage" v-model:open="isAddOpen">
          <DialogTrigger asChild>
            <Button class="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20">
              <LinkIcon class="mr-2 h-4 w-4" /> Create Setup
            </Button>
          </DialogTrigger>
          <DialogContent class="sm:max-w-[500px] bg-slate-900 border-slate-800 text-slate-50">
            <DialogHeader>
              <DialogTitle>Configure Trail Setup</DialogTitle>
              <DialogDescription class="text-slate-400">
                Link a head unit with trailing chassis or dollies.
              </DialogDescription>
            </DialogHeader>
            <div class="mt-4 mb-2">
              <TruckSimulation :type="type" :hasHead="!!headId" :hasT1="!!trailer1" :hasT2="!!trailer2" />
            </div>
            <form @submit="handleSubmit">
              <div class="grid gap-4 py-4">
                <div class="grid grid-cols-4 items-center gap-4">
                  <Label for="id" class="text-right text-slate-300">Setup ID *</Label>
                  <Input id="id" v-model="id" class="col-span-3 bg-slate-800 border-slate-700 focus-visible:ring-indigo-500" placeholder="e.g. TR-SETUP-01" required />
                </div>
                
                <div class="grid grid-cols-4 items-center gap-4">
                  <Label class="text-right text-slate-300">Config Type *</Label>
                  <div class="col-span-3">
                    <Select v-model="type">
                      <SelectTrigger class="bg-slate-800 border-slate-700 text-slate-200">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent class="bg-slate-800 border-slate-700 text-slate-200">
                        <SelectItem value="SINGLE_TRAILER">Single Trailer</SelectItem>
                        <SelectItem value="DOUBLE_TRAILER">Double Trailer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div class="grid grid-cols-4 items-center gap-4">
                  <Label class="text-right text-slate-300">Head Unit *</Label>
                  <div class="col-span-3">
                    <Select v-model="headId" required>
                      <SelectTrigger class="bg-slate-800 border-slate-700 text-slate-200">
                        <SelectValue placeholder="Select Head Vehicle" />
                      </SelectTrigger>
                      <SelectContent class="bg-slate-800 border-slate-700 text-slate-200 max-h-48">
                        <SelectItem v-for="h in heads" :key="h.id" :value="h.id">{{ h.id }}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div class="grid grid-cols-4 items-center gap-4">
                  <Label class="text-right text-slate-300">Trailer 1 *</Label>
                  <div class="col-span-3">
                    <Select v-model="trailer1" required>
                      <SelectTrigger class="bg-slate-800 border-slate-700 text-slate-200">
                        <SelectValue placeholder="Select First Trailer" />
                      </SelectTrigger>
                      <SelectContent class="bg-slate-800 border-slate-700 text-slate-200 max-h-48">
                        <SelectItem v-for="t in trailersList" :key="t.id" :value="t.id">{{ t.id }} ({{ t.kind }})</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div v-if="type === 'DOUBLE_TRAILER'" class="grid grid-cols-4 items-center gap-4">
                  <Label class="text-right text-slate-300">Trailer 2 *</Label>
                  <div class="col-span-3">
                    <Select v-model="trailer2" required>
                      <SelectTrigger class="bg-slate-800 border-slate-700 text-slate-200">
                        <SelectValue placeholder="Select Second Trailer" />
                      </SelectTrigger>
                      <SelectContent class="bg-slate-800 border-slate-700 text-slate-200 max-h-48">
                        <SelectItem v-for="t in trailersList" :key="t.id" :value="t.id">{{ t.id }} ({{ t.kind }})</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" :disabled="isSubmitting" class="bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
                  Create Setup
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>

    <!-- Cards View -->
    <div v-if="viewType === 'card'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div v-if="isLoading && trails.length === 0" class="col-span-full h-48 flex items-center justify-center text-slate-500">
        <Loader2 class="h-6 w-6 animate-spin mr-2 text-indigo-500" /> Loading trails...
      </div>
      <div v-else-if="trails.length === 0" class="col-span-full h-48 flex items-center justify-center text-slate-500 bg-slate-900/20 rounded-xl border border-dashed border-slate-800">
        No set ups configured.
      </div>
      <Card v-else v-for="t in trails" :key="t.id" class="border-slate-800 bg-slate-900/60 backdrop-blur-sm shadow-xl flex flex-col relative overflow-hidden group hover:border-slate-700 transition-all">
        <div class="absolute top-0 left-0 w-1 h-full bg-indigo-500/80"></div>
        <CardHeader class="pb-3 flex flex-row items-center justify-between border-b border-slate-800/60">
          <div>
            <CardTitle class="text-xl font-bold text-slate-100">{{ t.id }}</CardTitle>
            <Badge variant="secondary" class="mt-2 bg-slate-800 text-slate-300 border border-slate-700 shadow-sm">
              {{ t.type }}
            </Badge>
          </div>
          
          <AlertDialog v-if="canManage">
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" class="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                <Trash2 class="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent class="bg-slate-900 border border-slate-800 text-slate-50">
              <AlertDialogHeader>
                <AlertDialogTitle class="text-slate-100">Delete Trail Setup</AlertDialogTitle>
                <AlertDialogDescription class="text-slate-400">
                  Are you sure you want to delete the configuration <span class="text-slate-200 font-bold">{{ t.id }}</span>? 
                  This will virtually detach the head unit and trailers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel class="bg-slate-800 text-white hover:bg-slate-700 border-slate-600">Cancel</AlertDialogCancel>
                <Button @click="handleDelete(t.id)" class="bg-red-600 text-white hover:bg-red-700">Delete</Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardHeader>
        <CardContent class="pt-4 flex-1 flex flex-col gap-4">
          
          <!-- Head Unit Summary -->
          <div class="bg-blue-900/10 border border-blue-800/40 rounded-lg p-3">
            <div class="text-xs font-semibold text-blue-400 mb-1 flex justify-between">
              <span>HEAD UNIT • {{ t.head?.id || t.headId }}</span>
            </div>
            <div v-if="t.head">
              <div class="font-medium text-slate-200 text-sm">
                {{ t.head.brand || '-' }} {{ t.head.model || '' }} {{ t.head.modelYear ? `(${t.head.modelYear})` : '' }}
              </div>
              <div class="flex justify-between items-center mt-1">
                <span class="text-xs text-slate-400">{{ t.head.plateNo || 'No Plate' }} • {{ t.head.nbWheels }} Wheels</span>
                <div class="flex gap-1">
                  <VehicleMobilityDialog :vehicle="t.head">
                    <Button variant="ghost" size="sm" class="h-5 px-2 text-[10px] text-blue-400 hover:bg-blue-500/10 hover:text-blue-300">Log</Button>
                  </VehicleMobilityDialog>
                  <VehicleTiresDialog :vehicle="t.head">
                    <Button variant="ghost" size="sm" class="h-5 px-2 text-[10px] text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300">Tires</Button>
                  </VehicleTiresDialog>
                </div>
              </div>
            </div>
            <span v-else class="text-sm text-slate-500 italic">Unknown</span>
          </div>

          <!-- Trailers Summary -->
          <div class="flex flex-col gap-2 relative">
            <div class="absolute left-4 top-[-10px] bottom-4 w-0.5 bg-slate-800/80 z-0"></div>
            
            <div v-for="tr in t.trailers" :key="tr.trailerId" class="bg-indigo-900/10 border border-indigo-800/40 rounded-lg p-3 z-10 ml-8 relative">
              <div class="absolute -left-5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-500/50"></div>
              <div class="absolute -left-8 top-1/2 -translate-y-1/2 w-3 border-t border-slate-800/80"></div>

              <div class="text-xs font-semibold text-indigo-400 mb-1">
                TRAILER #{{ tr.order }} • {{ tr.trailerId }}
              </div>
              <div v-if="tr.trailer">
                <div class="font-medium text-slate-200 text-sm">
                  {{ tr.trailer.brand || '-' }} {{ tr.trailer.model || '' }} {{ tr.trailer.modelYear ? `(${tr.trailer.modelYear})` : '' }}
                </div>
                <div class="flex justify-between items-center mt-1">
                  <span class="text-xs text-slate-400">{{ tr.trailer.plateNo || 'No Plate' }} • {{ tr.trailer.nbWheels }} Wheels</span>
                  <div class="flex gap-1">
                    <VehicleMobilityDialog :vehicle="tr.trailer">
                      <Button variant="ghost" size="sm" class="h-5 px-2 text-[10px] text-blue-400 hover:bg-blue-500/10 hover:text-blue-300">Log</Button>
                    </VehicleMobilityDialog>
                    <VehicleTiresDialog :vehicle="tr.trailer">
                      <Button variant="ghost" size="sm" class="h-5 px-2 text-[10px] text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300">Tires</Button>
                    </VehicleTiresDialog>
                  </div>
                </div>
              </div>
              <span v-else class="text-sm text-slate-500 italic">Unknown</span>
            </div>
          </div>

          <div class="mt-auto pt-4 border-t border-slate-800/60 flex justify-between items-center px-1">
            <span class="text-sm text-slate-400">Total Setup Wheels</span>
            <Badge variant="outline" class="border-indigo-500/30 text-indigo-400 bg-indigo-500/10 font-bold px-3">
              {{ t.totalWheels }}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
    
    <div v-if="viewType === 'card' && trailsMeta && trails.length > 0">
      <PaginationControls 
        :currentPage="trailsMeta.currentPage" 
        :totalPages="trailsMeta.totalPages" 
        @pageChange="currentPage = $event" 
      />
    </div>

    <!-- Table View -->
    <Card v-else class="border-slate-800 bg-slate-900/40 backdrop-blur-xl shadow-2xl">
      <CardHeader class="border-b border-slate-800/60 pb-4">
        <CardTitle class="text-slate-100 font-semibold">Active Configurations</CardTitle>
        <CardDescription class="text-slate-400">View combinations of truck heads and trailers.</CardDescription>
      </CardHeader>
      <CardContent class="p-0">
        <Table>
          <TableHeader class="bg-slate-900/50">
            <TableRow class="border-slate-800 hover:bg-transparent">
              <TableHead class="text-slate-400 w-[150px]">Setup ID</TableHead>
              <TableHead class="text-slate-400">Head Unit</TableHead>
              <TableHead class="text-slate-400">Type</TableHead>
              <TableHead class="text-slate-400">Head (Brand, Year, Plate)</TableHead>
              <TableHead class="text-slate-400">Trailers Attached</TableHead>
              <TableHead class="text-slate-400 text-center">Total Wheels</TableHead>
              <TableHead class="text-slate-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="isLoading && trails.length === 0">
              <TableCell :colspan="7" class="text-center h-48 text-slate-500">
                <Loader2 class="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-500" /> Loading trails...
              </TableCell>
            </TableRow>
            <TableRow v-else-if="trails.length === 0">
              <TableCell :colspan="7" class="text-center h-48 text-slate-500">
                No set ups configured.
              </TableCell>
            </TableRow>
            <TableRow v-else v-for="t in trails" :key="t.id" class="border-slate-800/60 hover:bg-slate-800/40 transition-colors">
              <TableCell class="font-medium text-slate-200">{{ t.id }}</TableCell>
              <TableCell>
                <Badge variant="outline" class="border-blue-500/30 text-blue-400 bg-blue-500/10">
                  {{ t.head?.id || t.headId }}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" class="bg-slate-800 text-slate-300 border border-slate-700">
                  {{ t.type }}
                </Badge>
              </TableCell>
              <TableCell>
                <div v-if="t.head" class="text-sm">
                  <div class="font-medium text-slate-200">{{ t.head.brand || '-' }} {{ t.head.model || '' }} {{ t.head.modelYear ? `(${t.head.modelYear})` : '' }}</div>
                  <div class="flex gap-2 items-center">
                    <span class="text-xs text-slate-400">{{ t.head.plateNo || 'No Plate' }}</span>
                    <VehicleMobilityDialog :vehicle="t.head">
                      <Button variant="ghost" size="icon" class="h-5 w-5 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300" title="Mobility Log"><MapPin class="h-3 w-3" /></Button>
                    </VehicleMobilityDialog>
                    <VehicleTiresDialog :vehicle="t.head">
                      <Button variant="ghost" size="icon" class="h-5 w-5 text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300" title="View Tires"><Circle class="h-3 w-3" /></Button>
                    </VehicleTiresDialog>
                  </div>
                </div>
                <span v-else class="text-slate-500 italic">Unknown</span>
              </TableCell>
              <TableCell class="text-slate-300">
                <div class="flex flex-col gap-2">
                  <div v-for="tr in t.trailers" :key="tr.trailerId" class="flex flex-col p-2 bg-slate-800/40 rounded border border-slate-700/50">
                    <span class="text-xs font-semibold text-indigo-400 mb-1">
                      Trailer #{{ tr.order }} ({{ tr.trailerId }})
                    </span>
                    <div v-if="tr.trailer" class="text-xs text-slate-300">
                      <div>{{ tr.trailer.brand || '-' }} {{ tr.trailer.model || '' }} {{ tr.trailer.modelYear ? `(${tr.trailer.modelYear})` : '' }}</div>
                      <div class="flex gap-2 items-center text-slate-500">
                        <span>{{ tr.trailer.plateNo || 'No Plate' }} • {{ tr.trailer.nbWheels }} Wheels</span>
                        <VehicleMobilityDialog :vehicle="tr.trailer">
                          <Button variant="ghost" size="icon" class="h-5 w-5 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300" title="Mobility Log"><MapPin class="h-3 w-3" /></Button>
                        </VehicleMobilityDialog>
                        <VehicleTiresDialog :vehicle="tr.trailer">
                          <Button variant="ghost" size="icon" class="h-5 w-5 text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300" title="View Tires"><Circle class="h-3 w-3" /></Button>
                        </VehicleTiresDialog>
                      </div>
                    </div>
                    <span v-else class="text-xs text-slate-500 italic">Unknown Data</span>
                  </div>
                </div>
              </TableCell>
              <TableCell class="text-center text-slate-300 font-medium">
                {{ t.totalWheels }}
              </TableCell>
              <TableCell class="text-right">
                <AlertDialog v-if="canManage">
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" class="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent class="bg-slate-900 border border-slate-800 text-slate-50">
                    <AlertDialogHeader>
                      <AlertDialogTitle class="text-slate-100">Delete Trail Setup</AlertDialogTitle>
                      <AlertDialogDescription class="text-slate-400">
                        Are you sure you want to delete the configuration <span class="text-slate-200 font-bold">{{ t.id }}</span>? 
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel class="bg-slate-800 text-white hover:bg-slate-700 border-slate-600">Cancel</AlertDialogCancel>
                      <Button @click="handleDelete(t.id)" class="bg-red-600 text-white hover:bg-red-700">Delete</Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        
        <PaginationControls 
          v-if="trailsMeta && trails.length > 0"
          :currentPage="trailsMeta.currentPage" 
          :totalPages="trailsMeta.totalPages" 
          @pageChange="currentPage = $event" 
        />
      </CardContent>
    </Card>
  </div>
</template>
