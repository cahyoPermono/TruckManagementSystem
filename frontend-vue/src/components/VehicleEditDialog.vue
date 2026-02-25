<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-vue-next'
import { useUpdateVehicle } from '@/composables/useApi'
import { toast } from 'vue-sonner'

const props = defineProps<{
  vehicle: any
}>()

const isOpen = ref(false)
const formData = ref({
  kind: props.vehicle.kind,
  brand: props.vehicle.brand || '',
  model: props.vehicle.model || '',
  modelYear: props.vehicle.modelYear || '',
  plateNo: props.vehicle.plateNo || '',
  frameNo: props.vehicle.frameNo || '',
  nbWheels: props.vehicle.nbWheels,
  imageUrl: props.vehicle.imageUrl || ''
})

watch(() => props.vehicle, (newVal) => {
  formData.value = {
    kind: newVal.kind,
    brand: newVal.brand || '',
    model: newVal.model || '',
    modelYear: newVal.modelYear || '',
    plateNo: newVal.plateNo || '',
    frameNo: newVal.frameNo || '',
    nbWheels: newVal.nbWheels,
    imageUrl: newVal.imageUrl || ''
  }
}, { deep: true })

const { mutateAsync: updateVehicle, isPending: isSubmitting } = useUpdateVehicle()

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
    await updateVehicle({ id: props.vehicle.id, data: { ...formData.value } })
    toast.success("Vehicle updated successfully")
    isOpen.value = false
  } catch (err: any) {
    console.error(err)
    toast.error(err.message || "Failed to update vehicle")
  }
}
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogTrigger asChild>
      <slot />
    </DialogTrigger>
    <DialogContent class="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-50">
      <DialogHeader>
        <DialogTitle>Edit Vehicle</DialogTitle>
        <DialogDescription class="text-slate-400">
          Update the details of vehicle unit {{ vehicle.id }}.
        </DialogDescription>
      </DialogHeader>
      <form @submit="handleSubmit">
        <div class="grid gap-4 py-4">
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="edit-id" class="text-right text-slate-300">Unit ID</Label>
            <Input 
              id="edit-id" 
              :value="vehicle.id" 
              class="col-span-3 bg-slate-800 border-slate-700 focus-visible:ring-blue-500 cursor-not-allowed text-slate-500" 
              readonly 
              disabled 
            />
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="edit-kind" class="text-right text-slate-300">Kind *</Label>
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
            <Label for="edit-brand" class="text-right text-slate-300">Brand</Label>
            <Input id="edit-brand" v-model="formData.brand" class="col-span-3 bg-slate-800 border-slate-700 focus-visible:ring-blue-500" placeholder="e.g. Scania" />
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="edit-model" class="text-right text-slate-300">Model</Label>
            <Input id="edit-model" v-model="formData.model" class="col-span-3 bg-slate-800 border-slate-700 focus-visible:ring-blue-500" placeholder="e.g. Cyber Truck" />
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="edit-modelYear" class="text-right text-slate-300">Model Year</Label>
            <Input id="edit-modelYear" v-model="formData.modelYear" class="col-span-3 bg-slate-800 border-slate-700 focus-visible:ring-blue-500" placeholder="e.g. 2022" />
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="edit-plateNo" class="text-right text-slate-300">Plate No</Label>
            <Input id="edit-plateNo" v-model="formData.plateNo" class="col-span-3 bg-slate-800 border-slate-700 focus-visible:ring-blue-500" placeholder="e.g. B 1234 XA" />
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="edit-frameNo" class="text-right text-slate-300">Frame SN</Label>
            <Input id="edit-frameNo" v-model="formData.frameNo" class="col-span-3 bg-slate-800 border-slate-700 focus-visible:ring-blue-500" placeholder="e.g. MH12345678" />
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="edit-nbWheels" class="text-right text-slate-300">Wheels *</Label>
            <Input id="edit-nbWheels" type="number" v-model="formData.nbWheels" class="col-span-3 bg-slate-800 border-slate-700 focus-visible:ring-blue-500" required :min="2" />
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
            Save Changes
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
