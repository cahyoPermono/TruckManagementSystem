import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Shield, Edit, Trash2 } from 'lucide-react'
import { useStore, useAuthStore } from '../../store'
import { RoleDialog } from '@/components/RoleDialog'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { PaginationControls } from "@/components/PaginationControls"


export function Roles() {
  const { roles, rolesMeta, permissions, fetchRoles, fetchPermissions, deleteRole } = useStore()
  const { user } = useAuthStore()
  const canManage = user?.role?.permissions?.some((p: any) => p.permission.name === 'manage:iam')
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchData = async () => {
    setLoading(true)
    try {
      await Promise.all([fetchRoles(currentPage, 10), fetchPermissions()])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [currentPage])

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Roles & Permissions</h2>
          <p className="text-slate-400">Manage security roles and map permissions to access levels.</p>
        </div>
        {canManage && (
        <RoleDialog permissions={permissions}>
          <Button className="bg-indigo-500 hover:bg-indigo-600">
            <Plus className="w-4 h-4 mr-2" />
            Create Role
          </Button>
        </RoleDialog>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Roles List */}
        <div className="lg:col-span-1 space-y-4">
          {loading ? (
             <div className="p-4 text-center text-slate-400">Loading roles...</div>
          ) : (
            roles.map(role => (
              <Card key={role.id} className="bg-slate-900/50 border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-colors relative overflow-hidden group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-indigo-400" />
                        {role.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {role.description || 'No description provided.'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Badge variant="outline" className="bg-slate-950 text-slate-400 text-[10px] border-slate-800">
                      {role.permissions.length} Permissions
                    </Badge>
                  </div>

                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                    {canManage && (
                    <RoleDialog role={role} permissions={permissions}>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10">
                        <Edit className="w-3 h-3" />
                      </Button>
                    </RoleDialog>
                    )}
                    {canManage && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-400 hover:bg-red-500/10">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-slate-900 border-slate-800 text-slate-50">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Role</AlertDialogTitle>
                          <AlertDialogDescription className="text-slate-400">
                            Are you sure you want to delete the <strong>{role.name}</strong> role? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-slate-800 text-white hover:bg-slate-700 border-slate-600">Cancel</AlertDialogCancel>
                          <Button 
                            onClick={async () => {
                              await deleteRole(role.id)
                              toast.success("Role deleted successfully")
                            }}
                            className="bg-red-600 text-white hover:bg-red-700"
                          >
                            Delete
                          </Button>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
          
          {rolesMeta && roles.length > 0 && (
            <PaginationControls 
              currentPage={rolesMeta.currentPage} 
              totalPages={rolesMeta.totalPages} 
              onPageChange={(page) => setCurrentPage(page)} 
            />
          )}
        </div>

        {/* Permissions Grid Matrix (Viewer) */}
        <Card className="lg:col-span-3 bg-slate-900/50 border-slate-800">
          <CardHeader className="border-b border-slate-800">
            <CardTitle className="text-lg flex items-center gap-2 text-slate-50">
               <Shield className="w-5 h-5 text-indigo-400" />
               Permission Matrix Reference
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
               {/* Group permissions by module */}
               {Array.from(new Set(permissions.map(p => p.module))).map(module => (
                 <div key={module} className="bg-slate-950/50 rounded-lg p-4 border border-slate-800/50">
                    <h4 className="text-sm font-semibold text-slate-300 mb-3 pb-2 border-b border-slate-800">{module}</h4>
                    <div className="space-y-2">
                      {permissions.filter(p => p.module === module).map(p => (
                        <div key={p.id} className="flex items-center space-x-2">
                          <Checkbox id={p.id} disabled checked />
                          <label
                            htmlFor={p.id}
                            className="text-xs font-medium leading-none text-slate-400 cursor-not-allowed"
                          >
                            {p.name.split(':')[0]}
                          </label>
                        </div>
                      ))}
                    </div>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
