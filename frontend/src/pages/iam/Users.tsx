import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Shield, UserCog, Trash2, Edit } from 'lucide-react'
import { useStore, useAuthStore } from '../../store'
import { UserDialog } from '@/components/UserDialog'
import {
  AlertDialog,
  AlertDialogAction,
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

export function Users() {
  const { users, roles, fetchUsers, fetchRoles, deleteUser } = useStore()
  const { user } = useAuthStore()
  const canManage = user?.role?.permissions?.some((p: any) => p.permission.name === 'manage:iam')
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      await Promise.all([fetchUsers(), fetchRoles()])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

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
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-slate-400">View and manage system users and their assigned roles.</p>
        </div>
        {canManage && (
        <UserDialog roles={roles}>
          <Button className="bg-indigo-500 hover:bg-indigo-600">
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </UserDialog>
        )}
      </div>

      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
        <CardHeader className="border-b border-slate-800 flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-slate-50">System Users</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search users..."
              className="pl-9 bg-slate-950/50 border-slate-800 text-sm focus-visible:ring-indigo-500"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading users...</div>
          ) : (
            <div className="divide-y divide-slate-800">
              {users.map(user => (
                <div key={user.id} className="flex items-center justify-between p-4 hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                      <UserCog className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-200">{user.name}</p>
                      <p className="text-sm text-slate-500">@{user.username}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-1 items-center justify-center">
                    {user.role ? (
                      <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                        <Shield className="w-3 h-3 mr-1" />
                        {user.role.name}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-slate-800 text-slate-400 border-slate-700">
                        No Role
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {canManage && (
                    <UserDialog user={user} roles={roles}>
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-400 hover:bg-blue-500/10">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </UserDialog>
                    )}
                    {canManage && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-400 hover:bg-red-500/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-slate-900 border-slate-800 text-slate-50">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete User</AlertDialogTitle>
                          <AlertDialogDescription className="text-slate-400">
                            Are you sure you want to delete user <strong>{user.name}</strong>? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-slate-800 text-white hover:bg-slate-700 border-slate-600">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={async () => {
                              await deleteUser(user.id)
                              toast.success("User deleted successfully")
                            }}
                            className="bg-red-600 text-white hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    )}
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <div className="p-8 text-center text-slate-400">No users found.</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
