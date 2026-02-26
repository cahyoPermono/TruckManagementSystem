import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { unref, type Ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { customFetch } from '@/lib/fetchInterceptor'

const API_URL = 'http://localhost:4000/api'

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const auth = useAuthStore()
      const res = await customFetch(`${API_URL}/dashboard/statistics`, { headers: auth.getAuthHeaders() })
      if (!res.ok) throw new Error('Failed to load stats')
      return res.json()
    }
  })
}

export function useRoles(page?: Ref<number> | number, limit?: Ref<number> | number) {
  return useQuery({
    queryKey: ['roles', page, limit],
    queryFn: async () => {
      const auth = useAuthStore()
      const p = unref(page)
      const l = unref(limit)
      const params = new URLSearchParams()
      if (p !== undefined) params.append('page', p.toString())
      if (l !== undefined) params.append('limit', l.toString())
      const qs = params.toString() ? `?${params.toString()}` : ''
      const res = await customFetch(`${API_URL}/iam/roles${qs}`, { headers: auth.getAuthHeaders() })
      if (!res.ok) throw new Error('Failed to load roles')
      return res.json()
    }
  })
}

export function useUsers(page?: Ref<number> | number, limit?: Ref<number> | number) {
  return useQuery({
    queryKey: ['users', page, limit],
    queryFn: async () => {
      const auth = useAuthStore()
      const p = unref(page)
      const l = unref(limit)
      const params = new URLSearchParams()
      if (p !== undefined) params.append('page', p.toString())
      if (l !== undefined) params.append('limit', l.toString())
      const qs = params.toString() ? `?${params.toString()}` : ''
      const res = await customFetch(`${API_URL}/iam/users${qs}`, { headers: auth.getAuthHeaders() })
      if (!res.ok) throw new Error('Failed to load users')
      return res.json()
    }
  })
}

export function usePermissions() {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const auth = useAuthStore()
      const res = await customFetch(`${API_URL}/iam/permissions`, { headers: auth.getAuthHeaders() })
      if (!res.ok) throw new Error('Failed to load permissions')
      return res.json()
    }
  })
}

export function useCreateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (newRole: any) => {
      const auth = useAuthStore()
      const res = await customFetch(`${API_URL}/iam/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth.getAuthHeaders() },
        body: JSON.stringify(newRole)
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Failed to create role')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
    }
  })
}

export function useUpdateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const auth = useAuthStore()
      const res = await customFetch(`${API_URL}/iam/roles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...auth.getAuthHeaders() },
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Failed to update role')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
    }
  })
}

export function useDeleteRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (roleId: string) => {
      const auth = useAuthStore()
      const res = await fetch(`${API_URL}/iam/roles/${roleId}`, {
        method: 'DELETE',
        headers: auth.getAuthHeaders()
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Failed to delete role')
      }
      return { id: roleId }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
    }
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (newUser: any) => {
      const auth = useAuthStore()
      const res = await customFetch(`${API_URL}/iam/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth.getAuthHeaders() },
        body: JSON.stringify(newUser)
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Failed to create user')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const auth = useAuthStore()
      const res = await customFetch(`${API_URL}/iam/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...auth.getAuthHeaders() },
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Failed to update user')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (userId: string) => {
      const auth = useAuthStore()
      const res = await fetch(`${API_URL}/iam/users/${userId}`, {
        method: 'DELETE',
        headers: auth.getAuthHeaders()
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Failed to delete user')
      }
      return { id: userId }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}

export function useVehicles(page?: Ref<number> | number, limit?: Ref<number> | number) {
  return useQuery({
    queryKey: ['vehicles', page, limit],
    queryFn: async () => {
      const auth = useAuthStore()
      const p = unref(page)
      const l = unref(limit)
      const params = new URLSearchParams()
      if (p !== undefined) params.append('page', p.toString())
      if (l !== undefined) params.append('limit', l.toString())
      const qs = params.toString() ? `?${params.toString()}` : ''
      const res = await fetch(`${API_URL}/vehicles${qs}`, { headers: auth.getAuthHeaders() })
      if (!res.ok) throw new Error('Failed to load vehicles')
      return res.json()
    }
  })
}

export function useTrails(page?: Ref<number> | number, limit?: Ref<number> | number) {
  return useQuery({
    queryKey: ['trails', page, limit],
    queryFn: async () => {
      const auth = useAuthStore()
      const p = unref(page)
      const l = unref(limit)
      const params = new URLSearchParams()
      if (p !== undefined) params.append('page', p.toString())
      if (l !== undefined) params.append('limit', l.toString())
      const qs = params.toString() ? `?${params.toString()}` : ''
      const res = await fetch(`${API_URL}/trails${qs}`, { headers: auth.getAuthHeaders() })
      if (!res.ok) throw new Error('Failed to load trails')
      return res.json()
    }
  })
}

export function useTires(page?: Ref<number> | number, limit?: Ref<number> | number) {
  return useQuery({
    queryKey: ['tires', page, limit],
    queryFn: async () => {
      const auth = useAuthStore()
      const p = unref(page)
      const l = unref(limit)
      const params = new URLSearchParams()
      if (p !== undefined) params.append('page', p.toString())
      if (l !== undefined) params.append('limit', l.toString())
      const qs = params.toString() ? `?${params.toString()}` : ''
      const res = await fetch(`${API_URL}/tires${qs}`, { headers: auth.getAuthHeaders() })
      if (!res.ok) throw new Error('Failed to load tires')
      return res.json()
    }
  })
}

export function useCreateVehicle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (newVehicle: any) => {
      const auth = useAuthStore()
      const res = await customFetch(`${API_URL}/vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth.getAuthHeaders() },
        body: JSON.stringify(newVehicle)
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Failed to create vehicle')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    }
  })
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const auth = useAuthStore()
      const res = await customFetch(`${API_URL}/vehicles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...auth.getAuthHeaders() },
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Failed to update vehicle')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    }
  })
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const auth = useAuthStore()
      const res = await customFetch(`${API_URL}/vehicles/${id}`, {
        method: 'DELETE',
        headers: auth.getAuthHeaders()
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Failed to delete vehicle')
      }
      return { id }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    }
  })
}

export function useCreateTrail() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (newSetup: any) => {
      const auth = useAuthStore()
      const res = await customFetch(`${API_URL}/trails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth.getAuthHeaders() },
        body: JSON.stringify(newSetup)
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Failed to create trail')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trails'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    }
  })
}

export function useDeleteTrail() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const auth = useAuthStore()
      const res = await customFetch(`${API_URL}/trails/${id}`, {
        method: 'DELETE',
        headers: auth.getAuthHeaders()
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Failed to delete trail')
      }
      return { id }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trails'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    }
  })
}

export function useCreateTire() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (newTire: any) => {
      const auth = useAuthStore()
      const res = await customFetch(`${API_URL}/tires`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth.getAuthHeaders() },
        body: JSON.stringify(newTire)
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Failed to create tire')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tires'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    }
  })
}

export function useUpdateTireStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { id: string, status: string, vehicleId?: string, unitMileage?: number }) => {
      const auth = useAuthStore()
      const res = await customFetch(`${API_URL}/tires/${payload.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth.getAuthHeaders() },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Failed to update tire status')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tires'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    }
  })
}

export function useDeleteTire() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const auth = useAuthStore()
      const res = await customFetch(`${API_URL}/tires/${id}`, {
        method: 'DELETE',
        headers: auth.getAuthHeaders()
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Failed to delete tire')
      }
      return { id }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tires'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    }
  })
}
