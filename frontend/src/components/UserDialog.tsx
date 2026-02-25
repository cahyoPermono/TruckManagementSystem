import { useState } from "react"
import { useStore } from "../store"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export function UserDialog({ user, children, roles }: { user?: any, children: React.ReactNode, roles: any[] }) {
  const { createUser, updateUser } = useStore()
  const isEdit = !!user
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    password: '',
    roleId: user?.roleId || ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const submitData = { ...formData }
      if (isEdit && !submitData.password) {
        delete (submitData as any).password
      }
      
      if (isEdit) {
        await updateUser(user.id, submitData)
        toast.success("User updated successfully")
      } else {
        await createUser(submitData)
        toast.success("User created successfully")
      }
      setIsOpen(false)
      if (!isEdit) {
        setFormData({ name: '', username: '', password: '', roleId: '' })
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to save user")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-50">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit User' : 'Add User'}</DialogTitle>
          <DialogDescription className="text-slate-400">
            {isEdit ? 'Update user details and assigned role. Leave password blank to keep current.' : 'Create a new user account.'}
          </DialogDescription>
        </DialogHeader>

        <form id="user-form" onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="user-name" className="text-slate-300">Full Name *</Label>
            <Input
              id="user-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-slate-800 border-slate-700 focus-visible:ring-indigo-500"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="username" className="text-slate-300">Username *</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="bg-slate-800 border-slate-700 focus-visible:ring-indigo-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-300">
              {isEdit ? 'New Password' : 'Password *'}
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="bg-slate-800 border-slate-700 focus-visible:ring-indigo-500"
              required={!isEdit}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-slate-300">Assigned Role</Label>
            <Select 
              value={formData.roleId} 
              onValueChange={(val: string) => setFormData({ ...formData, roleId: val })}
            >
              <SelectTrigger className="bg-slate-800 border-slate-700 focus-visible:ring-indigo-500">
                <SelectValue placeholder="Select a role..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                {roles.map(r => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </form>

        <DialogFooter className="pt-4 border-t border-slate-800">
          <Button type="submit" form="user-form" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isEdit ? 'Save Changes' : 'Create User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
