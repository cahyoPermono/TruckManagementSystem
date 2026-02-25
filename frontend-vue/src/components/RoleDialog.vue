<script setup lang="ts">
import { ref, watch, computed } from 'vue'
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
import { Loader2 } from 'lucide-vue-next'
import { useCreateRole, useUpdateRole } from '@/composables/useApi'

const props = defineProps<{
  role?: any
  permissions: any[]
}>()

const isEdit = computed(() => !!props.role)
const isOpen = ref(false)

const formData = ref({
  name: props.role?.name || '',
  description: props.role?.description || '',
  permissions: props.role?.permissions?.map((p: any) => p.permission.id) || [] as string[]
})

watch(() => props.role, (newVal) => {
  if (newVal) {
    formData.value = {
      name: newVal.name || '',
      description: newVal.description || '',
      permissions: newVal.permissions?.map((p: any) => p.permission.id) || []
    }
  } else {
    formData.value = { name: '', description: '', permissions: [] }
  }
}, { deep: true })

const { mutateAsync: createRole, isPending: isCreating } = useCreateRole()
const { mutateAsync: updateRole, isPending: isUpdating } = useUpdateRole()
const isSubmitting = computed(() => isCreating.value || isUpdating.value)

const modules = computed(() => Array.from(new Set(props.permissions.map(p => p.module))))

const handleSubmit = async (e: Event) => {
  e.preventDefault()
  try {
    if (isEdit.value) {
      await updateRole({ id: props.role.id, data: formData.value })
    } else {
      await createRole(formData.value)
      formData.value = { name: '', description: '', permissions: [] }
    }
    isOpen.value = false
  } catch (err) {
    console.error(err)
  }
}
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogTrigger asChild>
      <slot />
    </DialogTrigger>
    <DialogContent class="sm:max-w-[600px] h-[80vh] flex flex-col bg-slate-900 border-slate-800 text-slate-50">
      <DialogHeader>
        <DialogTitle>{{ isEdit ? 'Edit Role' : 'Create Role' }}</DialogTitle>
        <DialogDescription class="text-slate-400">
          {{ isEdit ? 'Update the role details and permissions.' : 'Define a new role and assign its access levels.' }}
        </DialogDescription>
      </DialogHeader>

      <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <form id="role-form" @submit="handleSubmit" class="space-y-6">
          <div class="space-y-4">
            <div class="grid gap-2">
              <Label for="role-name" class="text-slate-300">Role Name *</Label>
              <Input
                id="role-name"
                v-model="formData.name"
                class="bg-slate-800 border-slate-700 focus-visible:ring-indigo-500"
                placeholder="e.g. Regional Manager"
                required
              />
            </div>
            <div class="grid gap-2">
              <Label for="role-desc" class="text-slate-300">Description</Label>
              <Input
                id="role-desc"
                v-model="formData.description"
                class="bg-slate-800 border-slate-700 focus-visible:ring-indigo-500"
                placeholder="e.g. Manages operations for a specific region"
              />
            </div>
          </div>

          <div class="space-y-3">
            <Label class="text-slate-300 text-base">Permissions</Label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="module in modules" :key="module" class="bg-slate-950/50 rounded-lg p-4 border border-slate-800/50">
                <h4 class="text-sm font-semibold text-slate-300 mb-3 pb-2 border-b border-slate-800">{{ module }}</h4>
                <div class="space-y-2">
                  <div v-for="p in permissions.filter(p => p.module === module)" :key="p.id" class="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      :id="`perm-${p.id}`" 
                      :value="p.id"
                      v-model="formData.permissions"
                      class="rounded border-slate-700 bg-slate-800 text-indigo-500 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 cursor-pointer" 
                    />
                    <label
                      :for="`perm-${p.id}`"
                      class="text-xs font-medium leading-none text-slate-400 cursor-pointer select-none"
                    >
                      {{ p.name.split(':')[0] }}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <DialogFooter class="pt-4 border-t border-slate-800 mt-auto">
        <Button type="button" variant="outline" @click="isOpen = false" class="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-100">
          Cancel
        </Button>
        <Button type="submit" form="role-form" :disabled="isSubmitting" class="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
          {{ isEdit ? 'Save Changes' : 'Create Role' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
