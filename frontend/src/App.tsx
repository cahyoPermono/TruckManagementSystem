import { cloneElement } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useOutlet } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Vehicles from './pages/Vehicles'
import Trails from './pages/Trails'
import Tires from './pages/Tires'
import { Login } from './pages/Login'
import { Users } from './pages/iam/Users'
import { Roles } from './pages/iam/Roles'
import { Toaster } from '@/components/ui/sonner'
import { AnimatePresence } from 'framer-motion'
function AnimatedRoute() {
  const location = useLocation()
  const element = useOutlet()

  return (
    <AnimatePresence mode="wait">
      {element ? cloneElement(element, { key: location.pathname }) : null}
    </AnimatePresence>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout><AnimatedRoute /></Layout>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/trails" element={<Trails />} />
          <Route path="/tires" element={<Tires />} />
          <Route path="/iam/users" element={<Users />} />
          <Route path="/iam/roles" element={<Roles />} />
        </Route>
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster richColors position="top-center" />
    </BrowserRouter>
  )
}

export default App
