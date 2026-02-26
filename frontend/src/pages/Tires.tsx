import { useEffect, useState } from "react"
import { useStore, useAuthStore } from "../store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CirclePlus, Loader2, GaugeCircle, History } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"

export default function Tires() {
  const { tires, fetchTires, createTire, updateTireStatus, vehicles, fetchVehicles, isLoading } = useStore()
  const { user } = useAuthStore()
  const canManage = user?.role?.permissions?.some((p: any) => p.permission.name === 'manage:tires')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [selectedTire, setSelectedTire] = useState<any>(null)
  
  // Add Form
  const [id, setId] = useState('')
  const [serialNo, setSerialNo] = useState('')
  const [brand, setBrand] = useState('')
  const [size, setSize] = useState('')
  
  // Update Form
  const [newStatus, setNewStatus] = useState('')
  const [vehicleId, setVehicleId] = useState('')
  const [unitMileage, setUnitMileage] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchTires()
    fetchVehicles()
  }, [])

  const handleCreate = async (e: any) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await createTire({ id, serialNo, brand, size, provisioningDate: new Date().toISOString() })
      toast.success('Tire registered successfully')
      setIsAddOpen(false)
      setId('')
      setSerialNo('')
      setBrand('')
      setSize('')
    } catch (err: any) {
      toast.error(err.message || 'Failed to register tire')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateStatus = async (e: any) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await updateTireStatus(selectedTire.id, newStatus, vehicleId || undefined, unitMileage ? Number(unitMileage) : undefined)
      toast.success('Tire status updated successfully')
      setIsUpdateOpen(false)
      setSelectedTire(null)
      setNewStatus('')
      setVehicleId('')
      setUnitMileage('')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update tire status')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openUpdateModal = (tire: any) => {
    setSelectedTire(tire)
    setNewStatus(tire.status)
    setVehicleId(tire.attachedToId || '')
    setIsUpdateOpen(true)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6"
    >
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-50">Tires Master</h2>
          <p className="text-slate-400 mt-1">Manage tire assets, status, and assignment.</p>
        </div>
        
        {canManage && (
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-900/20">
              <CirclePlus className="mr-2 h-4 w-4" /> Add Tire
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-50">
            <DialogHeader>
              <DialogTitle>Register New Tire</DialogTitle>
              <DialogDescription className="text-slate-400">
                Input the new tire's serial number and specifications.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right text-slate-300">Tire ID *</Label>
                  <Input 
                    value={id} onChange={(e: any) => setId(e.target.value)}
                    className="col-span-3 bg-slate-800 border-slate-700 focus-visible:ring-teal-500" required
                    placeholder="e.g. TR-2024-001"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right text-slate-300">Serial No *</Label>
                  <Input 
                    value={serialNo} onChange={(e: any) => setSerialNo(e.target.value)}
                    className="col-span-3 bg-slate-800 border-slate-700 focus-visible:ring-teal-500" required
                    placeholder="e.g. SN12345678"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right text-slate-300">Brand</Label>
                  <Input 
                    value={brand} onChange={(e: any) => setBrand(e.target.value)}
                    className="col-span-3 bg-slate-800 border-slate-700 focus-visible:ring-teal-500"
                    placeholder="e.g. Michelin"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right text-slate-300">Size</Label>
                  <Input 
                    value={size} onChange={(e: any) => setSize(e.target.value)}
                    className="col-span-3 bg-slate-800 border-slate-700 focus-visible:ring-teal-500"
                    placeholder="e.g. 295/80R22.5"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting} className="bg-teal-600 hover:bg-teal-700 text-white">
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Save Tire
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        )}
      </div>

      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-50">
          <DialogHeader>
            <DialogTitle>Update Tire Status</DialogTitle>
            <DialogDescription className="text-slate-400">
              Attach, detach or send tire {selectedTire?.id} for repair.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateStatus}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-slate-300">Status *</Label>
                <div className="col-span-3">
                  <Select value={newStatus} onValueChange={(val: string) => setNewStatus(val)}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                      <SelectItem value="NEW">New (Stock)</SelectItem>
                      <SelectItem value="ATTACHED">Attached to Vehicle</SelectItem>
                      <SelectItem value="DETACHED">Detached (Stock)</SelectItem>
                      <SelectItem value="REPAIR">In Repair</SelectItem>
                      <SelectItem value="SCRAP">Scrapped</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {newStatus === 'ATTACHED' && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right text-slate-300">Vehicle *</Label>
                  <div className="col-span-3">
                    <Select value={vehicleId} onValueChange={(val: string) => setVehicleId(val)} required>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                        <SelectValue placeholder="Select Vehicle" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-slate-200 max-h-48">
                        {vehicles.map(v => (
                          <SelectItem key={v.id} value={v.id}>{v.id}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {(newStatus === 'ATTACHED' || newStatus === 'DETACHED') && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right text-slate-300">Unit Mileage</Label>
                  <Input 
                    type="number"
                    value={unitMileage} onChange={(e: any) => setUnitMileage(e.target.value)}
                    className="col-span-3 bg-slate-800 border-slate-700 focus-visible:ring-indigo-500"
                    placeholder="Current vehicle reading (km)" required
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Submit Update
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-xl shadow-2xl">
        <CardHeader className="border-b border-slate-800/60 pb-4">
          <CardTitle className="text-slate-100 font-semibold flex items-center gap-2">
            <GaugeCircle className="h-5 w-5 text-teal-400" /> Tire Inventory
          </CardTitle>
          <CardDescription className="text-slate-400">View all tire assets and their current assignments.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-900/50">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400">Tire ID</TableHead>
                <TableHead className="text-slate-400">Brand & Size</TableHead>
                <TableHead className="text-slate-400">Added On</TableHead>
                <TableHead className="text-slate-400">Mileage</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400">Attached To</TableHead>
                <TableHead className="text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && tires.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center text-slate-500">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-teal-500" />
                    Loading tires...
                  </TableCell>
                </TableRow>
              ) : tires.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center text-slate-500">
                    No tires registered.
                  </TableCell>
                </TableRow>
              ) : (
                tires.map((t) => (
                  <TableRow key={t.id} className="border-slate-800/60 hover:bg-slate-800/40 transition-colors">
                    <TableCell>
                      <div className="font-medium text-slate-200">{t.id}</div>
                      <div className="text-xs text-slate-500 font-mono mt-1" title="Serial Number">{t.serialNo}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-300">{t.brand || '-'}</div>
                      <div className="text-xs text-slate-500">{t.size || '-'}</div>
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm">
                      {new Date(t.provisioningDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-slate-300 font-medium whitespace-nowrap">
                      {Number(t.mileage || 0).toLocaleString()} <span className="text-slate-500 text-xs font-normal">km</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`
                        ${t.status === 'NEW' ? 'text-teal-400 border-teal-500/30 bg-teal-500/10' : ''}
                        ${t.status === 'ATTACHED' ? 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10' : ''}
                        ${t.status === 'DETACHED' ? 'text-slate-400 border-slate-500/30 bg-slate-500/10' : ''}
                        ${t.status === 'REPAIR' ? 'text-orange-400 border-orange-500/30 bg-orange-500/10' : ''}
                        ${t.status === 'SCRAP' ? 'text-red-400 border-red-500/30 bg-red-500/10' : ''}
                      `}>
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {t.attachedToId ? (
                        <Badge variant="secondary" className="bg-slate-800 text-indigo-300 border border-slate-700">
                           {t.attachedToId}
                        </Badge>
                      ) : <span className="text-slate-600">-</span>}
                    </TableCell>
                    <TableCell className="text-right">
                       {canManage && (
                       <Button variant="ghost" size="sm" onClick={() => openUpdateModal(t)} className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10">
                         <History className="h-4 w-4 mr-2" /> Log Action
                       </Button>
                       )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  )
}
