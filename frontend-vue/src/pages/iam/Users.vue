<script setup lang="ts">
import { computed, ref } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useRoles, useUsers } from '@/composables/useApi'
import PaginationControls from '@/components/PaginationControls.vue'
import { useAuthStore } from '@/stores/auth'
import UserDialog from '@/components/UserDialog.vue'
import { Plus, Search, Shield, UserCog, Edit, Trash2 } from 'lucide-vue-next'

interface User {
  id: string
  name: string
  username: string
  roleId: string | null
  role: { name: string } | null
}

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

const authStore = useAuthStore()
const queryClient = useQueryClient()

const canManage = computed(() => authStore.user?.role?.permissions?.some((p: any) => p.permission.name === 'manage:iam'))

const currentPage = ref(1)

const { data: rolesData } = useRoles(1, 100)
const roles = computed(() => rolesData.value?.data || [])

const { data: usersData, isLoading: usersLoading } = useUsers(currentPage, 10)

const { mutateAsync: deleteUserApi } = useMutation({
  mutationFn: async (userId: string) => {
    const res = await fetch(`http://localhost:4000/api/iam/users/${userId}`, {
      method: 'DELETE',
      headers: authStore.getAuthHeaders()
    })
    if (!res.ok) throw new Error('Failed to delete user')
    return userId
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] })
  }
})

const loading = computed(() => usersLoading.value)
const users = computed(() => usersData.value?.data || [])
const usersMeta = computed(() => usersData.value?.meta || null)

const deleteUser = async (user: User) => {
  try {
    await deleteUserApi(user.id)
    toast.success(`User ${user.name} deleted successfully`)
  } catch (err) {
    console.error(err)
    toast.error('Failed to delete user')
  }
}
</script>

<template>
  <div class="space-y-6 animate-in fade-in duration-500">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">User Management</h2>
        <p class="text-slate-400">View and manage system users and their assigned roles.</p>
      </div>
      <UserDialog v-if="canManage" :roles="roles">
        <Button class="bg-indigo-500 hover:bg-indigo-600">
          <Plus class="w-4 h-4 mr-2" />
          Add User
        </Button>
      </UserDialog>
    </div>

    <Card class="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
      <CardHeader class="border-b border-slate-800 flex flex-row items-center justify-between">
        <CardTitle class="text-lg text-slate-50">System Users</CardTitle>
        <div class="relative w-64">
          <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search users..."
            class="pl-9 bg-slate-950/50 border-slate-800 text-sm focus-visible:ring-indigo-500"
          />
        </div>
      </CardHeader>
      <CardContent class="p-0">
        <div v-if="loading" class="p-8 text-center text-slate-400">Loading users...</div>
        <div v-else class="divide-y divide-slate-800">
          <div v-for="user in users" :key="user.id" class="flex items-center justify-between p-4 hover:bg-slate-800/30 transition-colors">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                <UserCog class="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p class="font-medium text-slate-200">{{ user.name }}</p>
                <p class="text-sm text-slate-500">@{{ user.username }}</p>
              </div>
            </div>
            
            <div class="flex flex-1 items-center justify-center">
              <div class="w-32 flex justify-center">
                <Badge v-if="user.role" variant="outline" class="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                  <Shield class="w-3 h-3 mr-1" />
                  {{ user.role.name }}
                </Badge>
                <Badge v-else variant="outline" class="bg-slate-800 text-slate-400 border-slate-700">
                  No Role
                </Badge>
              </div>
            </div>
            
            <div class="flex items-center gap-2">
              <UserDialog v-if="canManage" :user="user" :roles="roles">
                <Button variant="ghost" size="icon" class="text-slate-400 hover:text-blue-400 hover:bg-blue-500/10">
                  <Edit class="w-4 h-4" />
                </Button>
              </UserDialog>
              <AlertDialog v-if="canManage">
                <AlertDialogTrigger as-child>
                  <Button variant="ghost" size="icon" class="text-slate-400 hover:text-red-400 hover:bg-red-500/10">
                    <Trash2 class="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent class="bg-slate-900 border-slate-800 text-slate-50">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete User</AlertDialogTitle>
                    <AlertDialogDescription class="text-slate-400">
                      Are you sure you want to delete user <strong>{{ user.name }}</strong>? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel class="bg-slate-800 text-white hover:bg-slate-700 border-slate-600">Cancel</AlertDialogCancel>
                    <AlertDialogAction @click="deleteUser(user)" class="bg-red-600 text-white hover:bg-red-700">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          <div v-if="users.length === 0" class="p-8 text-center text-slate-400">No users found.</div>
        </div>
        
        <PaginationControls 
          v-if="usersMeta && users.length > 0"
          :currentPage="usersMeta.currentPage" 
          :totalPages="usersMeta.totalPages" 
          @pageChange="currentPage = $event" 
        />
      </CardContent>
    </Card>
  </div>
</template>
