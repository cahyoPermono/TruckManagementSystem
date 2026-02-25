<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { Truck } from 'lucide-vue-next'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const router = useRouter()
const authStore = useAuthStore()

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    const res = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: username.value, password: password.value })
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || 'Login failed')
    }

    authStore.setAuth(data.token, data.user)
    router.push('/')
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
    <!-- Background Decor -->
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
      <div class="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px]" />
      <div class="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-blue-500/10 blur-[120px]" />
    </div>

    <div class="relative z-10 w-full max-w-md">
      <div class="flex flex-col items-center mb-8">
        <div class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4 animate-in zoom-in duration-500">
          <Truck class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-3xl font-bold text-slate-50 tracking-tight">TMS Portal</h1>
        <p class="text-slate-400 mt-2">Tire Management System</p>
      </div>

      <Card class="bg-slate-900/50 backdrop-blur-xl border-slate-800 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <CardHeader>
          <CardTitle class="text-xl text-slate-100">Welcome Back</CardTitle>
          <CardDescription class="text-slate-400">Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="handleLogin" class="space-y-4">
            <div class="space-y-2">
              <Label for="username" class="text-slate-300">Username</Label>
              <Input 
                id="username" 
                v-model="username"
                autocomplete="username"
                placeholder="admin" 
                class="bg-slate-950/50 border-slate-700 text-slate-100 focus-visible:ring-indigo-500"
                required
              />
            </div>
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <Label for="password" class="text-slate-300">Password</Label>
              </div>
              <Input 
                id="password" 
                type="password" 
                v-model="password"
                autocomplete="current-password"
                class="bg-slate-950/50 border-slate-700 text-slate-100 focus-visible:ring-indigo-500"
                required
              />
            </div>

            <div v-if="error" class="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
              <p class="text-sm text-red-400 text-center">{{ error }}</p>
            </div>

            <Button 
              type="submit" 
              class="w-full bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 transition-all"
              :disabled="loading"
            >
              {{ loading ? 'Signing in...' : 'Sign in' }}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
