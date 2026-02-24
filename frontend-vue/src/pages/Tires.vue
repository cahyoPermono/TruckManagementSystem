<script setup lang="ts">
import { ref, computed } from 'vue'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CirclePlus, Loader2, GaugeCircle, History } from 'lucide-vue-next'
import { useTires, useVehicles, useCreateTire, useUpdateTireStatus } from '@/composables/useApi'

const { data: tiresData, isLoading } = useTires()
const { data: vehiclesData } = useVehicles()
const { mutateAsync: createTire, isPending: isSubmittingCreate } = useCreateTire()
const { mutateAsync: updateTireStatus, isPending: isSubmittingUpdate } = useUpdateTireStatus()

const tires = computed(() => tiresData.value || [])
const vehicles = computed(() => vehiclesData.value || [])

const isAddOpen = ref(false)
const isUpdateOpen = ref(false)
const selectedTire = ref<any>(null)

// Add Form
const id = ref('')
const serialNo = ref('')
const brand = ref('')
const size = ref('')

// Update Form
const newStatus = ref('')
const vehicleId = ref('')
const unitMileage = ref('')



const handleCreate = async (e: Event) => {
  e.preventDefault()
  try {
    await createTire({ 
      id: id.value, 
      serialNo: serialNo.value, 
      brand: brand.value, 
      size: size.value, 
      provisioningDate: new Date().toISOString() 
    })
    isAddOpen.value = false
    id.value = ''
    serialNo.value = ''
    brand.value = ''
    size.value = ''
  } catch (err) {
    console.error(err)
  }
}

const handleUpdateStatus = async (e: Event) => {
  e.preventDefault()
  try {
    await updateTireStatus({
      tireId: selectedTire.value.id,
      status: newStatus.value,
      vehicleId: vehicleId.value || undefined,
      unitMileage: unitMileage.value ? Number(unitMileage.value) : undefined
    })
    isUpdateOpen.value = false
    selectedTire.value = null
    newStatus.value = ''
    vehicleId.value = ''
    unitMileage.value = ''
  } catch (err) {
    console.error(err)
  }
}

const openUpdateModal = (tire: any) => {
  selectedTire.value = tire
  newStatus.value = tire.status
  vehicleId.value = tire.attachedToId || ''
  isUpdateOpen.value = true
}

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString()
</script>

<template>
  <div class="flex flex-col gap-6 animate-in fade-in duration-500">
    <div class="flex justify-between items-end">
      <div>
        <h2 class="text-3xl font-bold tracking-tight text-slate-50">Tires Master</h2>
        <p class="text-slate-400 mt-1">Manage tire assets, status, and assignment.</p>
      </div>
      
      <Dialog v-model:open="isAddOpen">
        <DialogTrigger asChild>
          <Button class="bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-900/20">
            <CirclePlus class="mr-2 h-4 w-4" /> Add Tire
          </Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-50">
          <DialogHeader>
            <DialogTitle>Register New Tire</DialogTitle>
            <DialogDescription class="text-slate-400">
              Input the new tire's serial number and specifications.
            </DialogDescription>
          </DialogHeader>
          <form @submit="handleCreate">
            <div class="grid gap-4 py-4">
              <div class="grid grid-cols-4 items-center gap-4">
                <Label class="text-right text-slate-300">Tire ID *</Label>
                <Input v-model="id" class="col-span-3 bg-slate-800 border-slate-700 focus-visible:ring-teal-500" required placeholder="e.g. TR-2024-001" />
              </div>
              <div class="grid grid-cols-4 items-center gap-4">
                <Label class="text-right text-slate-300">Serial No *</Label>
                <Input v-model="serialNo" class="col-span-3 bg-slate-800 border-slate-700 focus-visible:ring-teal-500" required placeholder="e.g. SN12345678" />
              </div>
              <div class="grid grid-cols-4 items-center gap-4">
                <Label class="text-right text-slate-300">Brand</Label>
                <Input v-model="brand" class="col-span-3 bg-slate-800 border-slate-700 focus-visible:ring-teal-500" placeholder="e.g. Michelin" />
              </div>
              <div class="grid grid-cols-4 items-center gap-4">
                <Label class="text-right text-slate-300">Size</Label>
                <Input v-model="size" class="col-span-3 bg-slate-800 border-slate-700 focus-visible:ring-teal-500" placeholder="e.g. 295/80R22.5" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" :disabled="isSubmittingCreate" class="bg-teal-600 hover:bg-teal-700 text-white">
                <Loader2 v-if="isSubmittingCreate" class="mr-2 h-4 w-4 animate-spin" /> Save Tire
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>

    <Dialog v-model:open="isUpdateOpen">
      <DialogContent class="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-50">
        <DialogHeader>
          <DialogTitle>Update Tire Status</DialogTitle>
          <DialogDescription class="text-slate-400">
            Attach, detach or send tire {{ selectedTire?.id }} for repair.
          </DialogDescription>
        </DialogHeader>
        <form @submit="handleUpdateStatus">
          <div class="grid gap-4 py-4">
            <div class="grid grid-cols-4 items-center gap-4">
              <Label class="text-right text-slate-300">Status *</Label>
              <div class="col-span-3">
                <Select :modelValue="newStatus" @update:modelValue="(val) => newStatus = (val as string)">
                  <SelectTrigger class="bg-slate-800 border-slate-700 text-slate-200">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent class="bg-slate-800 border-slate-700 text-slate-200">
                    <SelectItem value="NEW">New (Stock)</SelectItem>
                    <SelectItem value="ATTACHED">Attached to Vehicle</SelectItem>
                    <SelectItem value="DETACHED">Detached (Stock)</SelectItem>
                    <SelectItem value="REPAIR">In Repair</SelectItem>
                    <SelectItem value="SCRAP">Scrapped</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div v-if="newStatus === 'ATTACHED'" class="grid grid-cols-4 items-center gap-4">
              <Label class="text-right text-slate-300">Vehicle *</Label>
              <div class="col-span-3">
                <Select :modelValue="vehicleId" @update:modelValue="(val) => vehicleId = (val as string)" required>
                  <SelectTrigger class="bg-slate-800 border-slate-700 text-slate-200">
                    <SelectValue placeholder="Select Vehicle" />
                  </SelectTrigger>
                  <SelectContent class="bg-slate-800 border-slate-700 text-slate-200 max-h-48">
                    <SelectItem v-for="v in vehicles" :key="v.id" :value="v.id">{{ v.id }}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div v-if="newStatus === 'ATTACHED' || newStatus === 'DETACHED'" class="grid grid-cols-4 items-center gap-4">
              <Label class="text-right text-slate-300">Unit Mileage</Label>
              <Input 
                type="number" v-model="unitMileage" 
                class="col-span-3 bg-slate-800 border-slate-700 focus-visible:ring-indigo-500"
                placeholder="Current vehicle reading (km)" required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" :disabled="isSubmittingUpdate" class="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Loader2 v-if="isSubmittingUpdate" class="mr-2 h-4 w-4 animate-spin" /> Submit Update
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <Card class="border-slate-800 bg-slate-900/40 backdrop-blur-xl shadow-2xl">
      <CardHeader class="border-b border-slate-800/60 pb-4">
        <CardTitle class="text-slate-100 font-semibold flex items-center gap-2">
          <GaugeCircle class="h-5 w-5 text-teal-400" /> Tire Inventory
        </CardTitle>
        <CardDescription class="text-slate-400">View all tire assets and their current assignments.</CardDescription>
      </CardHeader>
      <CardContent class="p-0">
        <Table>
          <TableHeader class="bg-slate-900/50">
            <TableRow class="border-slate-800 hover:bg-transparent">
              <TableHead class="text-slate-400">Tire ID</TableHead>
              <TableHead class="text-slate-400">Brand & Size</TableHead>
              <TableHead class="text-slate-400">Added On</TableHead>
              <TableHead class="text-slate-400">Mileage</TableHead>
              <TableHead class="text-slate-400">Status</TableHead>
              <TableHead class="text-slate-400">Attached To</TableHead>
              <TableHead class="text-slate-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="isLoading && tires.length === 0">
              <TableCell :colspan="7" class="h-48 text-center text-slate-500">
                <Loader2 class="h-6 w-6 animate-spin mx-auto mb-2 text-teal-500" /> Loading tires...
              </TableCell>
            </TableRow>
            <TableRow v-else-if="tires.length === 0">
              <TableCell :colspan="7" class="h-48 text-center text-slate-500">
                No tires registered.
              </TableCell>
            </TableRow>
            <TableRow v-else v-for="t in tires" :key="t.id" class="border-slate-800/60 hover:bg-slate-800/40 transition-colors">
              <TableCell>
                <div class="font-medium text-slate-200">{{ t.id }}</div>
                <div class="text-xs text-slate-500 font-mono mt-1" title="Serial Number">{{ t.serialNo }}</div>
              </TableCell>
              <TableCell>
                <div class="font-medium text-slate-300">{{ t.brand || '-' }}</div>
                <div class="text-xs text-slate-500">{{ t.size || '-' }}</div>
              </TableCell>
              <TableCell class="text-slate-400 text-sm">
                {{ formatDate(t.provisioningDate) }}
              </TableCell>
              <TableCell class="text-slate-300 font-medium whitespace-nowrap">
                {{ Number(t.mileage || 0).toLocaleString() }} <span class="text-slate-500 text-xs font-normal">km</span>
              </TableCell>
              <TableCell>
                <Badge variant="outline" :class="[
                  t.status === 'NEW' ? 'text-teal-400 border-teal-500/30 bg-teal-500/10' : '',
                  t.status === 'ATTACHED' ? 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10' : '',
                  t.status === 'DETACHED' ? 'text-slate-400 border-slate-500/30 bg-slate-500/10' : '',
                  t.status === 'REPAIR' ? 'text-orange-400 border-orange-500/30 bg-orange-500/10' : '',
                  t.status === 'SCRAP' ? 'text-red-400 border-red-500/30 bg-red-500/10' : ''
                ]">
                  {{ t.status }}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge v-if="t.attachedToId" variant="secondary" class="bg-slate-800 text-indigo-300 border border-slate-700">
                  {{ t.attachedToId }}
                </Badge>
                <span v-else class="text-slate-600">-</span>
              </TableCell>
              <TableCell class="text-right">
                 <Button variant="ghost" size="sm" @click="openUpdateModal(t)" class="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10">
                   <History class="h-4 w-4 mr-2" /> Log Action
                 </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>
