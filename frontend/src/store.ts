import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { customFetch } from '@/lib/fetchInterceptor'

interface Stats {
  heads: number
  chassis: number
  dollies: number
  tires: number
  tireStatusCount: { status: string; _count: { id: number } }[]
  vehicleStatusCount: { status: string; _count: { id: number } }[]
}

export interface Log {
  id: string
  vehicleId: string
  latitude: number
  longitude: number
  speed: number
  distance: number
  timestamp: string
}

export interface Vehicle {
  id: string
  kind: 'CAR' | 'LTRUCK' | 'TRUCK' | 'THEAD' | 'TCHASS' | 'TDOLLY'
  brand: string | null
  model: string | null
  imageUrl: string | null
  modelYear: string | null
  plateNo: string | null
  frameNo: string | null
  nbWheels: number
  status: string
  createdAt: string
  tires?: Tire[]
  mobilityLogs?: Log[]
}

export interface TrailSetup {
  id: string
  type: string
  headId: string
  head: Vehicle
  totalWheels: number
  trailers: { trailerId: string, order: number, trailer: Vehicle }[]
  createdAt: string
}

export interface Tire {
  id: string
  serialNo: string
  brand: string | null
  size: string | null
  status: string
  mileage: number
  provisioningDate: string
  attachedToId: string | null
  createdAt: string
}

export interface PaginationMeta {
  totalCount: number
  totalPages: number
  currentPage: number
  limit: number
}

interface AppState {
  stats: Stats | null
  logs: Log[]
  vehicles: Vehicle[]
  vehiclesMeta: PaginationMeta | null
  trails: TrailSetup[]
  trailsMeta: PaginationMeta | null
  tires: Tire[]
  tiresMeta: PaginationMeta | null
  roles: any[]
  rolesMeta: PaginationMeta | null
  users: any[]
  usersMeta: PaginationMeta | null
  permissions: any[]
  fetchStats: () => Promise<void>
  fetchLogs: () => Promise<void>
  fetchVehicles: (page?: number, limit?: number) => Promise<void>
  createVehicle: (data: any) => Promise<void>
  updateVehicle: (id: string, data: any) => Promise<void>
  deleteVehicle: (id: string) => Promise<void>
  fetchTrails: (page?: number, limit?: number) => Promise<void>
  createTrail: (data: any) => Promise<void>
  deleteTrail: (id: string) => Promise<void>
  fetchTires: (page?: number, limit?: number) => Promise<void>
  createTire: (data: any) => Promise<void>
  updateTireStatus: (id: string, status: string, vehicleId?: string, unitMileage?: number) => Promise<void>
  deleteTire: (id: string) => Promise<void>
  fetchRoles: (page?: number, limit?: number) => Promise<void>
  createRole: (data: any) => Promise<void>
  updateRole: (id: string, data: any) => Promise<void>
  deleteRole: (id: string) => Promise<void>
  fetchPermissions: () => Promise<void>
  fetchUsers: (page?: number, limit?: number) => Promise<void>
  createUser: (data: any) => Promise<void>
  updateUser: (id: string, data: any) => Promise<void>
  deleteUser: (id: string) => Promise<void>
  isLoading: boolean
}

interface AuthState {
  token: string | null
  user: any | null
  setAuth: (token: string, user: any) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'tms-auth',
    }
  )
)

const API_BASE = 'http://localhost:4000/api'

// Helper to get auth headers
const getAuthHeaders = (): Record<string, string> => {
  const token = useAuthStore.getState().token
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}

export const useStore = create<AppState>((set) => ({
  stats: null,
  logs: [],
  vehicles: [],
  vehiclesMeta: null,
  trails: [],
  trailsMeta: null,
  tires: [],
  tiresMeta: null,
  roles: [],
  rolesMeta: null,
  permissions: [],
  users: [],
  usersMeta: null,
  isLoading: false,

  fetchStats: async () => {
    set({ isLoading: true })
    try {
      const res = await customFetch(`${API_BASE}/dashboard/statistics`, { headers: getAuthHeaders() })
      const data = await res.json()
      set({ stats: data })
    } catch (e) {
      console.error(e)
    } finally {
      set({ isLoading: false })
    }
  },

  fetchLogs: async () => {
    try {
      const res = await customFetch(`${API_BASE}/dashboard/mobility-logs`, { headers: getAuthHeaders() })
      const data = await res.json()
      set({ logs: data })
    } catch (e) {
      console.error(e)
    }
  },

  fetchRoles: async (page = 1, limit = 10) => {
    try {
      const res = await customFetch(`${API_BASE}/iam/roles?page=${page}&limit=${limit}`, { headers: getAuthHeaders() })
      const data = await res.json()
      set({ roles: data.data || data, rolesMeta: data.meta || null })
    } catch (e) {
      console.error(e)
    }
  },

  createRole: async (data: any) => {
    try {
      const res = await customFetch(`${API_BASE}/iam/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to create role')
      useStore.getState().fetchRoles()
    } catch (e) {
      console.error(e)
      throw e
    }
  },

  updateRole: async (id: string, data: any) => {
    try {
      const res = await customFetch(`${API_BASE}/iam/roles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to update role')
      useStore.getState().fetchRoles()
    } catch (e) {
      console.error(e)
      throw e
    }
  },

  deleteRole: async (id: string) => {
    try {
      const res = await customFetch(`${API_BASE}/iam/roles/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      if (!res.ok) throw new Error('Failed to delete role')
      useStore.getState().fetchRoles()
    } catch (e) {
      console.error(e)
      throw e
    }
  },

  fetchPermissions: async () => {
    try {
      const res = await customFetch(`${API_BASE}/iam/permissions`, { headers: getAuthHeaders() })
      const data = await res.json()
      set({ permissions: data })
    } catch (e) {
      console.error(e)
    }
  },

  fetchUsers: async (page = 1, limit = 10) => {
    try {
      const res = await customFetch(`${API_BASE}/iam/users?page=${page}&limit=${limit}`, { headers: getAuthHeaders() })
      const data = await res.json()
      set({ users: data.data || data, usersMeta: data.meta || null })
    } catch (e) {
      console.error(e)
    }
  },

  createUser: async (data: any) => {
    try {
      const res = await customFetch(`${API_BASE}/iam/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to create user')
      useStore.getState().fetchUsers()
    } catch (e) {
      console.error(e)
      throw e
    }
  },

  updateUser: async (id: string, data: any) => {
    try {
      const res = await customFetch(`${API_BASE}/iam/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to update user')
      useStore.getState().fetchUsers()
    } catch (e) {
      console.error(e)
      throw e
    }
  },

  deleteUser: async (id: string) => {
    try {
      const res = await customFetch(`${API_BASE}/iam/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      if (!res.ok) throw new Error('Failed to delete user')
      useStore.getState().fetchUsers()
    } catch (e) {
      console.error(e)
      throw e
    }
  },

  fetchVehicles: async (page = 1, limit = 10) => {
    set({ isLoading: true })
    try {
      const res = await customFetch(`${API_BASE}/vehicles?page=${page}&limit=${limit}`, { headers: getAuthHeaders() })
      const data = await res.json()
      set({ vehicles: data.data || data, vehiclesMeta: data.meta || null })
    } catch (e) {
      console.error(e)
    } finally {
      set({ isLoading: false })
    }
  },

  createVehicle: async (data: any) => {
    try {
      const res = await customFetch(`${API_BASE}/vehicles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to create vehicle')
      // Refresh the list
      useStore.getState().fetchVehicles()
    } catch (e) {
      console.error(e)
      throw e
    }
  },

  updateVehicle: async (id: string, data: any) => {
    try {
      const res = await customFetch(`${API_BASE}/vehicles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to update vehicle')
      useStore.getState().fetchVehicles()
    } catch (e) {
      console.error(e)
      throw e
    }
  },

  deleteVehicle: async (id: string) => {
    try {
      const res = await customFetch(`${API_BASE}/vehicles/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      if (!res.ok) throw new Error('Failed to delete vehicle')
      useStore.getState().fetchVehicles()
    } catch (e) {
      console.error(e)
      throw e
    }
  },

  fetchTrails: async (page = 1, limit = 10) => {
    set({ isLoading: true })
    try {
      const res = await customFetch(`${API_BASE}/trails?page=${page}&limit=${limit}`, { headers: getAuthHeaders() })
      const data = await res.json()
      set({ trails: data.data || data, trailsMeta: data.meta || null })
    } catch (e) {
      console.error(e)
    } finally {
      set({ isLoading: false })
    }
  },

  createTrail: async (data: any) => {
    try {
      const res = await customFetch(`${API_BASE}/trails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to create trail setup')
      useStore.getState().fetchTrails()
    } catch (e) {
      console.error(e)
      throw e
    }
  },

  deleteTrail: async (id: string) => {
    try {
      const res = await customFetch(`${API_BASE}/trails/${id}`, { method: 'DELETE', headers: getAuthHeaders() })
      if (!res.ok) throw new Error('Failed to delete trail')
      useStore.getState().fetchTrails()
    } catch (e) {
      console.error(e)
      throw e
    }
  },

  fetchTires: async (page = 1, limit = 10) => {
    set({ isLoading: true })
    try {
      const res = await customFetch(`${API_BASE}/tires?page=${page}&limit=${limit}`, { headers: getAuthHeaders() })
      const data = await res.json()
      set({ tires: data.data || data, tiresMeta: data.meta || null })
    } catch (e) {
      console.error(e)
    } finally {
      set({ isLoading: false })
    }
  },

  createTire: async (data: any) => {
    try {
      const res = await customFetch(`${API_BASE}/tires`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to create tire')
      useStore.getState().fetchTires()
    } catch (e) {
      console.error(e)
      throw e
    }
  },

  updateTireStatus: async (id: string, status: string, vehicleId?: string, unitMileage?: number) => {
    try {
      const res = await customFetch(`${API_BASE}/tires/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ status, vehicleId, unitMileage })
      })
      if (!res.ok) throw new Error('Failed to update tire status')
      useStore.getState().fetchTires()
    } catch (e) {
      console.error(e)
      throw e
    }
  },

  deleteTire: async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/tires/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      if (!res.ok) throw new Error('Failed to delete tire')
      useStore.getState().fetchTires()
    } catch (e) {
      console.error(e)
      throw e
    }
  }
}))
