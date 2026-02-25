import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { useAuthStore } from '../stores/auth'

const API_URL = 'http://localhost:4000/api'

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const auth = useAuthStore()
      const res = await fetch(`${API_URL}/dashboard/statistics`, { headers: auth.getAuthHeaders() })
      if (!res.ok) throw new Error('Failed to load stats')
      return res.json()
    }
  })
}

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const auth = useAuthStore()
      const res = await fetch(`${API_URL}/iam/roles`, { headers: auth.getAuthHeaders() })
      if (!res.ok) throw new Error('Failed to load roles')
      return res.json()
    }
  })
}

export function usePermissions() {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const auth = useAuthStore()
      const res = await fetch(`${API_URL}/iam/permissions`, { headers: auth.getAuthHeaders() })
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
      const res = await fetch(`${API_URL}/iam/roles`, {
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
      const res = await fetch(`${API_URL}/iam/roles/${id}`, {
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
      const res = await fetch(`${API_URL}/iam/users`, {
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
      const res = await fetch(`${API_URL}/iam/users/${id}`, {
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

export function useVehicles() {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const auth = useAuthStore()
      const res = await fetch(`${API_URL}/vehicles`, { headers: auth.getAuthHeaders() })
      if (!res.ok) throw new Error('Failed to load vehicles')
      return res.json()
    }
  })
}

export function useTrails() {
  return useQuery({
    queryKey: ['trails'],
    queryFn: async () => {
      const auth = useAuthStore()
      const res = await fetch(`${API_URL}/trails`, { headers: auth.getAuthHeaders() })
      if (!res.ok) throw new Error('Failed to load trails')
      return res.json()
    }
  })
}

export function useTires() {
  return useQuery({
    queryKey: ['tires'],
    queryFn: async () => {
      const auth = useAuthStore()
      const res = await fetch(`${API_URL}/tires`, { headers: auth.getAuthHeaders() })
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
      const res = await fetch(`${API_URL}/vehicles`, {
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
      const res = await fetch(`${API_URL}/vehicles/${id}`, {
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

export function useCreateTrail() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (newTrail: any) => {
      const auth = useAuthStore()
      const res = await fetch(`${API_URL}/trails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth.getAuthHeaders() },
        body: JSON.stringify(newTrail)
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
    mutationFn: async (trailId: string) => {
      const auth = useAuthStore()
      const res = await fetch(`${API_URL}/trails/${trailId}`, {
        method: 'DELETE',
        headers: auth.getAuthHeaders()
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Failed to delete trail')
      }
      return { id: trailId }
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
      const res = await fetch(`${API_URL}/tires`, {
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
    mutationFn: async ({ tireId, status, vehicleId, unitMileage }: any) => {
      const auth = useAuthStore()
      const res = await fetch(`${API_URL}/tires/${tireId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...auth.getAuthHeaders() },
        body: JSON.stringify({ status, vehicleId, unitMileage })
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
