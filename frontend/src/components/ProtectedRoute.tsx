import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store'

export function ProtectedRoute() {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  const path = location.pathname
  let requiredPermission = null
  if (path.startsWith('/vehicles')) requiredPermission = 'view:vehicles'
  else if (path.startsWith('/trails')) requiredPermission = 'view:trails'
  else if (path.startsWith('/tires')) requiredPermission = 'view:tires'
  else if (path.startsWith('/iam')) requiredPermission = 'view:iam'
  else if (path.startsWith('/dashboard')) requiredPermission = 'view:dashboard'

  if (requiredPermission && user && user.role && user.role.permissions) {
    const hasPerm = user.role.permissions.some((p: any) => p.permission.name === requiredPermission)
    if (!hasPerm) {
      if (path === '/dashboard') {
        return (
          <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-400">
            You do not have permission to view the dashboard. Please contact an administrator.
          </div>
        )
      }
      return <Navigate to="/dashboard" replace />
    }
  }

  return <Outlet />
}
