import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../pages/Dashboard.vue'
import Vehicles from '../pages/Vehicles.vue'
import Trails from '../pages/Trails.vue'
import Tires from '../pages/Tires.vue'
import Login from '../pages/Login.vue'
import Users from '../pages/iam/Users.vue'
import Roles from '../pages/iam/Roles.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: Login, name: 'Login' },
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', component: Dashboard, name: 'Dashboard', meta: { requiresAuth: true } },
    { path: '/vehicles', component: Vehicles, name: 'Vehicles', meta: { requiresAuth: true } },
    { path: '/trails', component: Trails, name: 'Trails', meta: { requiresAuth: true } },
    { path: '/tires', component: Tires, name: 'Tires', meta: { requiresAuth: true } },
    { path: '/iam/users', component: Users, name: 'Users', meta: { requiresAuth: true } },
    { path: '/iam/roles', component: Roles, name: 'Roles', meta: { requiresAuth: true } }
  ]
})

router.beforeEach((to, _from) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.token) {
    return '/login'
  } else if (to.path === '/login' && auth.token) {
    return '/dashboard'
  }
  return true
})

export default router
