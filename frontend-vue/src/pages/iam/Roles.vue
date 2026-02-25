<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, Edit, Trash2, Plus } from 'lucide-vue-next'
import RoleDialog from '@/components/RoleDialog.vue'
import { useRoles, usePermissions, useDeleteRole } from '@/composables/useApi'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'vue-sonner'

const { data: rolesData, isLoading: rolesLoading } = useRoles()
const { data: permissionsData, isLoading: permsLoading } = usePermissions()
const { mutateAsync: deleteRoleApi } = useDeleteRole()

const loading = computed(() => rolesLoading.value || permsLoading.value)
const roles = computed(() => rolesData.value || [])
const permissions = computed(() => permissionsData.value || [])

const getModules = () => {
  if (!permissions.value) return [] as string[]
  return Array.from(new Set(permissions.value.map((p: any) => p.module))) as string[]
}

const getPermissionsForModule = (module: string) => {
  if (!permissions.value) return []
  return permissions.value.filter((p: any) => p.module === module)
}

const deleteRole = async (role: any) => {
  try {
    await deleteRoleApi(role.id)
    toast.success(`Role ${role.name} deleted successfully`)
  } catch (err) {
    console.error(err)
    toast.error('Failed to delete role')
  }
}
</script>

<template>
  <div class="space-y-6 animate-in fade-in duration-500">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">Roles & Permissions</h2>
        <p class="text-slate-400">Manage security roles and map permissions to access levels.</p>
      </div>
      <RoleDialog :permissions="permissions || []">
        <Button class="bg-indigo-500 hover:bg-indigo-600">
          <Plus class="w-4 h-4 mr-2" />
          Create Role
        </Button>
      </RoleDialog>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Roles List -->
      <div class="lg:col-span-1 space-y-4">
        <div v-if="loading" class="p-4 text-center text-slate-400">Loading roles...</div>
        <template v-else>
          <Card 
            v-for="role in roles" 
            :key="role.id" 
            class="bg-slate-900/50 border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-colors relative overflow-hidden group"
          >
            <CardContent class="p-4">
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="font-semibold text-slate-200 flex items-center gap-2">
                    <Shield class="w-4 h-4 text-indigo-400" />
                    {{ role.name }}
                  </h3>
                  <p class="text-xs text-slate-500 mt-1 line-clamp-2">
                    {{ role.description || 'No description provided.' }}
                  </p>
                </div>
              </div>
              <div class="mt-4 flex items-center gap-2">
                <Badge variant="outline" class="bg-slate-950 text-slate-400 text-[10px] border-slate-800">
                  {{ role.permissions.length }} Permissions
                </Badge>
              </div>

              <div class="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                <RoleDialog :role="role" :permissions="permissions || []">
                  <Button variant="ghost" size="icon" class="h-6 w-6 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10">
                    <Edit class="w-3 h-3" />
                  </Button>
                </RoleDialog>
                <AlertDialog>
                  <AlertDialogTrigger as-child>
                    <Button variant="ghost" size="icon" class="h-6 w-6 text-slate-400 hover:text-red-400 hover:bg-red-500/10">
                      <Trash2 class="w-3 h-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent class="bg-slate-900 border-slate-800 text-slate-50">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Role</AlertDialogTitle>
                      <AlertDialogDescription class="text-slate-400">
                        Are you sure you want to delete role <strong>{{ role.name }}</strong>? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel class="bg-slate-800 text-white hover:bg-slate-700 border-slate-600">Cancel</AlertDialogCancel>
                      <AlertDialogAction @click="deleteRole(role)" class="bg-red-600 text-white hover:bg-red-700">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </template>
      </div>

      <!-- Permissions Grid Matrix (Viewer) -->
      <Card class="lg:col-span-3 bg-slate-900/50 border-slate-800">
        <CardHeader class="border-b border-slate-800">
          <CardTitle class="text-lg flex items-center gap-2 text-slate-50">
             <Shield class="w-5 h-5 text-indigo-400" />
             Permission Matrix Reference
          </CardTitle>
        </CardHeader>
        <CardContent class="p-6">
          <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div v-for="module in getModules()" :key="module" class="bg-slate-950/50 rounded-lg p-4 border border-slate-800/50">
                <h4 class="text-sm font-semibold text-slate-300 mb-3 pb-2 border-b border-slate-800">{{ module }}</h4>
                <div class="space-y-2">
                  <div v-for="p in getPermissionsForModule(module)" :key="p.id" class="flex items-center space-x-2">
                    <input type="checkbox" :id="p.id" disabled checked class="rounded border-slate-700 bg-slate-800 text-indigo-500 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50" />
                    <label
                      :for="p.id"
                      class="text-xs font-medium leading-none text-slate-400 cursor-not-allowed"
                    >
                      {{ p.name.split(':')[0] }}
                    </label>
                  </div>
                </div>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
