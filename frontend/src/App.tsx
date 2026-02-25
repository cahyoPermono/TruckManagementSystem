import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Vehicles from './pages/Vehicles'
import Trails from './pages/Trails'
import Tires from './pages/Tires'
import { Login } from './pages/Login'
import { Users } from './pages/iam/Users'
import { Roles } from './pages/iam/Roles'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout><Outlet /></Layout>}>
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
    </BrowserRouter>
  )
}

export default App
