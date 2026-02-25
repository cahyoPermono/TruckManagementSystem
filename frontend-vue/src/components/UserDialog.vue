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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-vue-next'
import { useCreateUser, useUpdateUser } from '@/composables/useApi'

const props = defineProps<{
  user?: any
  roles: any[]
}>()

const isEdit = computed(() => !!props.user)
const isOpen = ref(false)

const formData = ref({
  name: props.user?.name || '',
  username: props.user?.username || '',
  password: '',
  roleId: props.user?.roleId || ''
})

watch(() => props.user, (newVal) => {
  if (newVal) {
    formData.value = {
      name: newVal.name || '',
      username: newVal.username || '',
      password: '',
      roleId: newVal.roleId || ''
    }
  } else {
    formData.value = { name: '', username: '', password: '', roleId: '' }
  }
}, { deep: true })

const { mutateAsync: createUser, isPending: isCreating } = useCreateUser()
const { mutateAsync: updateUser, isPending: isUpdating } = useUpdateUser()
const isSubmitting = computed(() => isCreating.value || isUpdating.value)

const handleRoleChange = (val: string) => {
  formData.value.roleId = val
}

const handleSubmit = async (e: Event) => {
  e.preventDefault()
  try {
    const submitData = { ...formData.value } as any
    if (isEdit.value && !submitData.password) {
      delete submitData.password
    }
    
    if (isEdit.value) {
      await updateUser({ id: props.user.id, data: submitData })
    } else {
      await createUser(submitData)
      formData.value = { name: '', username: '', password: '', roleId: '' }
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
    <DialogContent class="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-50">
      <DialogHeader>
        <DialogTitle>{{ isEdit ? 'Edit User' : 'Add User' }}</DialogTitle>
        <DialogDescription class="text-slate-400">
          {{ isEdit ? 'Update user details and assigned role. Leave password blank to keep current.' : 'Create a new user account.' }}
        </DialogDescription>
      </DialogHeader>

      <form id="user-form" @submit="handleSubmit" class="space-y-4 py-4">
        <div class="space-y-2">
          <Label for="user-name" class="text-slate-300">Full Name *</Label>
          <Input
            id="user-name"
            v-model="formData.name"
            class="bg-slate-800 border-slate-700 focus-visible:ring-indigo-500"
            required
          />
        </div>
        
        <div class="space-y-2">
          <Label for="username" class="text-slate-300">Username *</Label>
          <Input
            id="username"
            v-model="formData.username"
            class="bg-slate-800 border-slate-700 focus-visible:ring-indigo-500"
            required
          />
        </div>

        <div class="space-y-2">
          <Label for="password" class="text-slate-300">
            {{ isEdit ? 'New Password' : 'Password *' }}
          </Label>
          <Input
            id="password"
            type="password"
            v-model="formData.password"
            class="bg-slate-800 border-slate-700 focus-visible:ring-indigo-500"
            :required="!isEdit"
          />
        </div>

        <div class="space-y-2">
          <Label for="role" class="text-slate-300">Assigned Role</Label>
          <Select :modelValue="formData.roleId" @update:modelValue="(val) => handleRoleChange(val as string)">
            <SelectTrigger class="bg-slate-800 border-slate-700 focus-visible:ring-indigo-500">
              <SelectValue placeholder="Select a role..." />
            </SelectTrigger>
            <SelectContent class="bg-slate-800 border-slate-700 text-slate-200">
              <SelectItem v-for="role in roles" :key="role.id" :value="role.id">
                {{ role.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </form>

      <DialogFooter class="pt-4 border-t border-slate-800">
        <Button type="button" variant="outline" @click="isOpen = false" class="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-100">
          Cancel
        </Button>
        <Button type="submit" form="user-form" :disabled="isSubmitting" class="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
          {{ isEdit ? 'Save Changes' : 'Create User' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
