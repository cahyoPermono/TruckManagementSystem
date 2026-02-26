<script setup lang="ts">
import { ref, computed } from 'vue'
import { useVehicles, useCreateVehicle } from '@/composables/useApi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PlusCircle, Loader2, LayoutGrid, List, Image as ImageIcon, Circle, MapPin, Edit } from 'lucide-vue-next'
import VehicleTiresDialog from '@/components/VehicleTiresDialog.vue'
import VehicleMobilityDialog from '@/components/VehicleMobilityDialog.vue'
import VehicleEditDialog from '@/components/VehicleEditDialog.vue'
import { toast } from 'vue-sonner'
import { useAuthStore } from '@/stores/auth'

const { data, isLoading } = useVehicles()
const { mutateAsync: createVehicle, isPending: isSubmitting } = useCreateVehicle()

const auth = useAuthStore()
const canManage = computed(() => auth.user?.role?.permissions?.some((p: any) => p.permission.name === 'manage:vehicles'))

const vehicles = computed(() => data.value || [])
const isAddOpen = ref(false)
const viewType = ref<'table' | 'card'>('card')

const initialForm = { id: '', kind: 'THEAD', brand: '', model: '', modelYear: '', plateNo: '', frameNo: '', nbWheels: 10, imageUrl: '' }
const formData = ref({ ...initialForm })

const handleImageChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onloadend = () => {
      formData.value.imageUrl = reader.result as string
    }
    reader.readAsDataURL(file)
  }
}

const handleKindChange = (val: string) => {
  let wheels = 10
  if (val === 'CAR') wheels = 4
  else if (val === 'LTRUCK') wheels = 4
  else if (val === 'TRUCK') wheels = 6
  else if (val === 'THEAD') wheels = 10
  else if (val === 'TCHASS') wheels = 12
  else if (val === 'TDOLLY') wheels = 8
  
  formData.value.kind = val
  formData.value.nbWheels = wheels
}

const handleSubmit = async (e: Event) => {
  e.preventDefault()
  try {
    await createVehicle({ ...formData.value })
    isAddOpen.value = false
    formData.value = { ...initialForm }
    toast.success("Vehicle registered successfully")
  } catch (err) {
    console.error(err)
    toast.error("Failed to register vehicle")
  }
}

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString()
</script>

<template>
  <div class="flex flex-col gap-6 animate-in fade-in duration-500">
    <div class="flex justify-between items-end">
      <div>
        <h2 class="text-3xl font-bold tracking-tight text-slate-50">Vehicles Master</h2>
        <p class="text-slate-400 mt-1">Manage truck heads, chassis, and dollies.</p>
      </div>
      
      <div class="flex gap-3 items-center">
        <div class="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700">
          <Button variant="ghost" size="icon" :class="['h-8 w-8 rounded-md', viewType === 'table' ? 'bg-slate-700 text-slate-100' : 'text-slate-400 hover:text-slate-200']" @click="viewType = 'table'">
            <List class="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" :class="['h-8 w-8 rounded-md', viewType === 'card' ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:text-slate-200']" @click="viewType = 'card'">
            <LayoutGrid class="h-4 w-4" />
          </Button>
        </div>
        
        <Dialog v-if="canManage" v-model:open="isAddOpen">
          <DialogTrigger asChild>
            <Button class="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20">
              <PlusCircle class="mr-2 h-4 w-4" /> Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent class="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-50">
            <DialogHeader>
              <DialogTitle>Register New Vehicle</DialogTitle>
              <DialogDescription class="text-slate-400">
                Enter the details of the new vehicle unit.
              </DialogDescription>
            </DialogHeader>
            <form @submit="handleSubmit">
              <div class="grid gap-4 py-4">
                <div class="grid grid-cols-4 items-center gap-4">
                  <Label for="id" class="text-right text-slate-300">Unit ID *</Label>
                  <Input id="id" v-model="formData.id" class="col-span-3 bg-slate-800 border-slate-700 focus-visible:ring-blue-500" placeholder="e.g. THEAD-01" required />
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                  <Label for="kind" class="text-right text-slate-300">Kind *</Label>
                  <div class="col-span-3">
                    <Select :modelValue="formData.kind" @update:modelValue="(val) => handleKindChange(val as string)">
                      <SelectTrigger class="bg-slate-800 border-slate-700 text-slate-200">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent class="bg-slate-800 border-slate-700 text-slate-200">
                        <SelectItem value="CAR">Car</SelectItem>
                        <SelectItem value="LTRUCK">Light Truck</SelectItem>
                        <SelectItem value="TRUCK">Heavy Truck</SelectItem>
                        <SelectItem value="THEAD">Truck Head</SelectItem>
                        <SelectItem value="TCHASS">Trailer Chassis</SelectItem>
                        <SelectItem value="TDOLLY">Dolly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                  <Label for="brand" class="text-right text-slate-300">Brand</Label>
                  <Input id="brand" v-model="formData.brand" class="col-span-3 bg-slate-800 border-slate-700 focus-visible:ring-blue-500" placeholder="e.g. Scania" />
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                  <Label for="model" class="text-right text-slate-300">Model</Label>
                  <Input id="model" v-model="formData.model" class="col-span-3 bg-slate-800 border-slate-700 focus-visible:ring-blue-500" placeholder="e.g. Cyber Truck" />
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                  <Label for="modelYear" class="text-right text-slate-300">Model Year</Label>
                  <Input id="modelYear" v-model="formData.modelYear" class="col-span-3 bg-slate-800 border-slate-700 focus-visible:ring-blue-500" placeholder="e.g. 2022" />
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                  <Label for="plateNo" class="text-right text-slate-300">Plate No</Label>
                  <Input id="plateNo" v-model="formData.plateNo" class="col-span-3 bg-slate-800 border-slate-700 focus-visible:ring-blue-500" placeholder="e.g. B 1234 XA" />
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                  <Label for="frameNo" class="text-right text-slate-300">Frame SN</Label>
                  <Input id="frameNo" v-model="formData.frameNo" class="col-span-3 bg-slate-800 border-slate-700 focus-visible:ring-blue-500" placeholder="e.g. MH12345678" />
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                  <Label for="nbWheels" class="text-right text-slate-300">Wheels *</Label>
                  <Input id="nbWheels" type="number" v-model="formData.nbWheels" class="col-span-3 bg-slate-800 border-slate-700 focus-visible:ring-blue-500" required :min="2" />
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                  <Label class="text-right text-slate-300">Image</Label>
                  <div class="col-span-3 flex flex-col gap-3">
                    <Input type="file" accept="image/*" @change="handleImageChange" class="bg-slate-800 border-slate-700 file:bg-slate-700 file:text-slate-200 file:border-0 file:mr-4 file:px-3 file:py-1 file:rounded cursor-pointer" />
                    <div v-if="formData.imageUrl" class="relative w-full h-32 rounded-lg overflow-hidden border border-slate-700">
                      <img :src="formData.imageUrl" alt="Preview" class="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" :disabled="isSubmitting" class="bg-blue-600 hover:bg-blue-700 text-white">
                  <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
                  Save Vehicle
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>

    <!-- Cards View -->
    <div v-if="viewType === 'card'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-if="isLoading && vehicles.length === 0" class="col-span-full h-48 flex items-center justify-center text-slate-500">
        <Loader2 class="h-6 w-6 animate-spin mr-2 text-blue-500" /> Loading vehicles...
      </div>
      <div v-else-if="vehicles.length === 0" class="col-span-full h-48 flex items-center justify-center text-slate-500 bg-slate-900/20 rounded-xl border border-dashed border-slate-800">
        No vehicles found. Click "Add Vehicle" to register one.
      </div>
      <Card v-else v-for="v in vehicles" :key="v.id" class="border-slate-800 bg-slate-900/60 backdrop-blur-sm overflow-hidden group hover:border-slate-700 transition-all shadow-xl">
        <div class="h-48 bg-slate-800 relative overflow-hidden">
          <img v-if="v.imageUrl" :src="v.imageUrl" :alt="v.id" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
            <ImageIcon class="h-12 w-12 text-slate-700" />
          </div>
          <div class="absolute top-3 left-3">
            <Badge variant="outline" :class="[
              'backdrop-blur-md shadow-sm',
              v.kind === 'CAR' ? 'border-sky-500/50 text-sky-100 bg-sky-900/60' : '',
              v.kind === 'LTRUCK' ? 'border-cyan-500/50 text-cyan-100 bg-cyan-900/60' : '',
              v.kind === 'TRUCK' ? 'border-teal-500/50 text-teal-100 bg-teal-900/60' : '',
              v.kind === 'THEAD' ? 'border-blue-500/50 text-blue-100 bg-blue-900/60' : '',
              v.kind === 'TCHASS' ? 'border-indigo-500/50 text-indigo-100 bg-indigo-900/60' : '',
              v.kind === 'TDOLLY' ? 'border-purple-500/50 text-purple-100 bg-purple-900/60' : ''
            ]">
              {{ v.kind }}
            </Badge>
          </div>
          <div class="absolute top-3 right-3">
            <Badge variant="secondary" :class="[
              'shadow-sm backdrop-blur-md',
              v.status === 'ACTIVE' ? 'bg-emerald-500/80 text-white' : 'bg-slate-800/80 text-slate-300'
            ]">
              {{ v.status }}
            </Badge>
          </div>
        </div>
        <CardContent class="p-5">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-xl font-bold text-slate-100 tracking-tight">{{ v.id }}</h3>
              <p v-if="v.plateNo" class="text-sm text-blue-400 font-medium mt-0.5">{{ v.plateNo }}</p>
            </div>
          </div>
          <div class="space-y-3">
            <div class="flex justify-between text-sm">
              <span class="text-slate-500">Brand & Model</span>
              <span class="text-slate-300 font-medium text-right">
                {{ v.brand || '-' }} {{ v.model || '' }}
                <span v-if="v.modelYear" class="text-slate-500 ml-1">({{ v.modelYear }})</span>
              </span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-500">Frame SN</span>
              <span class="text-slate-300 font-medium">{{ v.frameNo || '-' }}</span>
            </div>
            <div class="flex justify-between text-sm items-center">
              <span class="text-slate-500">Links</span>
              <div class="flex items-center gap-1">
                <VehicleMobilityDialog :vehicle="v">
                   <Button variant="ghost" size="sm" class="h-6 px-2 text-[10px] text-blue-400 hover:bg-blue-500/10 hover:text-blue-300">
                     Mobility Log
                   </Button>
                </VehicleMobilityDialog>
                <VehicleTiresDialog :vehicle="v">
                   <Button variant="ghost" size="sm" class="h-6 px-2 text-[10px] text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300">
                     View Tires
                   </Button>
                </VehicleTiresDialog>
                <VehicleEditDialog v-if="canManage" :vehicle="v">
                   <Button variant="ghost" size="sm" class="h-6 px-2 text-[10px] text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300">
                     Edit
                   </Button>
                </VehicleEditDialog>
              </div>
            </div>
            <div class="flex justify-between text-sm items-center pt-2 border-t border-slate-800/60">
              <span class="text-slate-500">Wheels</span>
              <span class="text-slate-300 font-medium">{{ v.nbWheels }}</span>
            </div>
            <div class="flex justify-between text-sm pt-2 border-t border-slate-800/60">
              <span class="text-slate-500">Registered</span>
              <span class="text-slate-400">{{ formatDate(v.createdAt) }}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Table View -->
    <Card v-else class="border-slate-800 bg-slate-900/40 backdrop-blur-xl shadow-2xl">
      <CardHeader class="border-b border-slate-800/60 pb-4">
        <CardTitle class="text-slate-100 font-semibold">Vehicle Inventory</CardTitle>
        <CardDescription class="text-slate-400">View and track all registered units.</CardDescription>
      </CardHeader>
      <CardContent class="p-0">
        <Table>
          <TableHeader class="bg-slate-900/50">
            <TableRow class="border-slate-800 hover:bg-transparent">
              <TableHead class="text-slate-400 w-[150px]">Unit ID & Plate</TableHead>
              <TableHead class="text-slate-400">Type</TableHead>
              <TableHead class="text-slate-400">Brand, Model & Year</TableHead>
              <TableHead class="text-slate-400">Frame SN</TableHead>
              <TableHead class="text-slate-400 text-center">Wheels</TableHead>
              <TableHead class="text-slate-400">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="isLoading && vehicles.length === 0">
              <TableCell :colspan="6" class="h-48 text-center text-slate-500">
                <Loader2 class="h-6 w-6 animate-spin mx-auto mb-2 text-blue-500" /> Loading vehicles...
              </TableCell>
            </TableRow>
            <TableRow v-else-if="vehicles.length === 0">
              <TableCell :colspan="6" class="h-48 text-center text-slate-500">
                No vehicles found. Click "Add Vehicle" to register one.
              </TableCell>
            </TableRow>
            <TableRow v-else v-for="v in vehicles" :key="v.id" class="border-slate-800/60 hover:bg-slate-800/40 transition-colors">
              <TableCell>
                <div class="font-medium text-slate-200">{{ v.id }}</div>
                <div v-if="v.plateNo" class="text-xs text-slate-500">{{ v.plateNo }}</div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" :class="[
                  v.kind === 'CAR' ? 'border-sky-500/30 text-sky-400 bg-sky-500/10' : '',
                  v.kind === 'LTRUCK' ? 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10' : '',
                  v.kind === 'TRUCK' ? 'border-teal-500/30 text-teal-400 bg-teal-500/10' : '',
                  v.kind === 'THEAD' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' : '',
                  v.kind === 'TCHASS' ? 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10' : '',
                  v.kind === 'TDOLLY' ? 'border-purple-500/30 text-purple-400 bg-purple-500/10' : ''
                ]">
                  {{ v.kind }}
                </Badge>
              </TableCell>
              <TableCell>
                <span class="text-slate-300">{{ v.brand || '-' }} {{ v.model || '' }}</span>
                <span v-if="v.modelYear" class="text-slate-400 text-sm ml-1">({{ v.modelYear }})</span>
              </TableCell>
              <TableCell class="text-slate-400 text-sm">{{ v.frameNo || '-' }}</TableCell>
              <TableCell class="text-center text-slate-300">
                <div class="flex items-center justify-center gap-2">
                  {{ v.nbWheels }}
                  <VehicleTiresDialog :vehicle="v">
                     <Button variant="ghost" size="icon" class="h-6 w-6 text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300" title="View Tires">
                       <Circle class="h-3 w-3" />
                     </Button>
                  </VehicleTiresDialog>
                  <VehicleMobilityDialog :vehicle="v">
                     <Button variant="ghost" size="icon" class="h-6 w-6 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300" title="View Mobility Log">
                       <MapPin class="h-3 w-3" />
                     </Button>
                  </VehicleMobilityDialog>
                  <VehicleEditDialog v-if="canManage" :vehicle="v">
                     <Button variant="ghost" size="icon" class="h-6 w-6 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300" title="Edit Vehicle">
                       <Edit class="h-3 w-3" />
                     </Button>
                  </VehicleEditDialog>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" :class="[
                  v.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-slate-800 text-slate-400'
                ]">
                  {{ v.status }}
                </Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>
