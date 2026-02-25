import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('tms-vue-token'))
  const user = ref<any | null>(JSON.parse(localStorage.getItem('tms-vue-user') || 'null'))

  const setAuth = (newToken: string, newUser: any) => {
    token.value = newToken
    user.value = newUser
    localStorage.setItem('tms-vue-token', newToken)
    localStorage.setItem('tms-vue-user', JSON.stringify(newUser))
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('tms-vue-token')
    localStorage.removeItem('tms-vue-user')
  }

  const getAuthHeaders = (): Record<string, string> => {
    return token.value ? { 'Authorization': `Bearer ${token.value}` } : {}
  }

  return { token, user, setAuth, logout, getAuthHeaders }
})
