<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, Edit, Trash2 } from 'lucide-vue-next'
import { useAuthStore } from '../../stores/auth'

interface Role {
  id: string
  name: string
  description: string | null
  permissions: { permission: Permission }[]
}

interface Permission {
  id: string
  name: string
  module: string
}

const roles = ref<Role[]>([])
const permissions = ref<Permission[]>([])
const loading = ref(true)
const authStore = useAuthStore()

const getModules = () => {
  return Array.from(new Set(permissions.value.map(p => p.module)))
}

const getPermissionsForModule = (module: string) => {
  return permissions.value.filter(p => p.module === module)
}

const fetchData = async () => {
  loading.value = true
  try {
    const hdrs = authStore.getAuthHeaders()
    const [roleRes, permRes] = await Promise.all([
      fetch('http://localhost:4000/api/iam/roles', { headers: hdrs }),
      fetch('http://localhost:4000/api/iam/permissions', { headers: hdrs })
    ])
    
    if (roleRes.ok) roles.value = await roleRes.json()
    if (permRes.ok) permissions.value = await permRes.json()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="space-y-6 animate-in fade-in duration-500">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">Roles & Permissions</h2>
        <p class="text-slate-400">Manage security roles and map permissions to access levels.</p>
      </div>
      <Button class="bg-indigo-500 hover:bg-indigo-600">
        <plus class="w-4 h-4 mr-2" />
        Create Role
      </Button>
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
                <Button variant="ghost" size="icon" class="h-6 w-6 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10">
                  <Edit class="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" class="h-6 w-6 text-slate-400 hover:text-red-400 hover:bg-red-500/10">
                  <Trash2 class="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </template>
      </div>

      <!-- Permissions Grid Matrix (Viewer) -->
      <Card class="lg:col-span-3 bg-slate-900/50 border-slate-800">
        <CardHeader class="border-b border-slate-800">
          <CardTitle class="text-lg flex items-center gap-2">
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
