import { useState } from "react"
import { useStore } from "../store"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"

export function RoleDialog({ role, children, permissions }: { role?: any, children: React.ReactNode, permissions: any[] }) {
  const { createRole, updateRole } = useStore()
  const isEdit = !!role
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: role?.name || '',
    description: role?.description || '',
    permissions: role?.permissions?.map((p: any) => p.permission.id) || []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (isEdit) {
        await updateRole(role.id, formData)
      } else {
        await createRole(formData)
      }
      setIsOpen(false)
      if (!isEdit) {
        setFormData({ name: '', description: '', permissions: [] })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const togglePermission = (permId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter((id: string) => id !== permId)
        : [...prev.permissions, permId]
    }))
  }

  const modules = Array.from(new Set(permissions.map(p => p.module)))

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col bg-slate-900 border-slate-800 text-slate-50">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Role' : 'Create Role'}</DialogTitle>
          <DialogDescription className="text-slate-400">
            {isEdit ? 'Update the role details and permissions.' : 'Define a new role and assign its access levels.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <form id="role-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-slate-300">Role Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-800 border-slate-700 focus-visible:ring-indigo-500"
                  placeholder="e.g. Regional Manager"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-slate-300">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-slate-800 border-slate-700 focus-visible:ring-indigo-500"
                  placeholder="e.g. Manages operations for a specific region"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-slate-300 text-base">Permissions</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {modules.map(module => (
                  <div key={module} className="bg-slate-950/50 rounded-lg p-4 border border-slate-800/50">
                    <h4 className="text-sm font-semibold text-slate-300 mb-3 pb-2 border-b border-slate-800">{module}</h4>
                    <div className="space-y-2">
                      {permissions.filter(p => p.module === module).map(p => (
                        <div key={p.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`perm-${p.id}`}
                            checked={formData.permissions.includes(p.id)}
                            onCheckedChange={() => togglePermission(p.id)}
                            className="border-slate-600 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                          />
                          <label
                            htmlFor={`perm-${p.id}`}
                            className="text-xs font-medium leading-none text-slate-400 cursor-pointer select-none"
                          >
                            {p.name.split(':')[0]}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>

        <DialogFooter className="pt-4 border-t border-slate-800 mt-auto">
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-100">
            Cancel
          </Button>
          <Button type="submit" form="role-form" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isEdit ? 'Save Changes' : 'Create Role'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
