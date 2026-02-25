import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import './assets/index.css'
import 'vue-sonner/style.css'
import App from './App.vue'
import router from './router'
import { pinia } from './store'

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(VueQueryPlugin)

app.mount('#app')
