import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'

const API_URL = 'http://localhost:4000/api'

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/dashboard/stats`)
      if (!res.ok) throw new Error('Failed to load stats')
      return res.json()
    }
  })
}

export function useVehicles() {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/vehicles`)
      if (!res.ok) throw new Error('Failed to load vehicles')
      return res.json()
    }
  })
}

export function useTrails() {
  return useQuery({
    queryKey: ['trails'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/trails`)
      if (!res.ok) throw new Error('Failed to load trails')
      return res.json()
    }
  })
}

export function useTires() {
  return useQuery({
    queryKey: ['tires'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/tires`)
      if (!res.ok) throw new Error('Failed to load tires')
      return res.json()
    }
  })
}

export function useCreateVehicle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (newVehicle: any) => {
      const res = await fetch(`${API_URL}/vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

export function useCreateTrail() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (newTrail: any) => {
      const res = await fetch(`${API_URL}/trails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      const res = await fetch(`${API_URL}/trails/${trailId}`, {
        method: 'DELETE'
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
      const res = await fetch(`${API_URL}/tires`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      const res = await fetch(`${API_URL}/tires/${tireId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
