import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../pages/Dashboard.vue'
import Vehicles from '../pages/Vehicles.vue'
import Trails from '../pages/Trails.vue'
import Tires from '../pages/Tires.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Dashboard, name: 'Dashboard' },
    { path: '/vehicles', component: Vehicles, name: 'Vehicles' },
    { path: '/trails', component: Trails, name: 'Trails' },
    { path: '/tires', component: Tires, name: 'Tires' }
  ]
})

export default router
