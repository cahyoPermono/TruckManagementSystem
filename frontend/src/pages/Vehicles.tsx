import { useEffect, useState } from "react"
import { useStore } from "../store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Loader2, LayoutGrid, List, Image as ImageIcon, Circle, MapPin } from "lucide-react"
import { VehicleTiresDialog } from "@/components/VehicleTiresDialog"
import { VehicleMobilityDialog } from "@/components/VehicleMobilityDialog"

export default function Vehicles() {
  const { vehicles, fetchVehicles, isLoading, createVehicle } = useStore()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [viewType, setViewType] = useState<'table' | 'card'>('card')
  const [formData, setFormData] = useState({ id: '', kind: 'THEAD', brand: '', model: '', modelYear: '', plateNo: '', frameNo: '', nbWheels: '10', imageUrl: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  useEffect(() => {
    fetchVehicles()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await createVehicle({
        ...formData,
        nbWheels: parseInt(formData.nbWheels, 10)
      })
      setIsAddOpen(false)
      setFormData({ id: '', kind: 'THEAD', brand: '', model: '', modelYear: '', plateNo: '', frameNo: '', nbWheels: '10', imageUrl: '' })
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-50">Vehicles Master</h2>
          <p className="text-slate-400 mt-1">Manage truck heads, chassis, and dollies.</p>
        </div>
        
        <div className="flex gap-3 items-center">
          <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700">
            <Button variant="ghost" size="icon" className={`h-8 w-8 rounded-md ${viewType === 'table' ? 'bg-slate-700 text-slate-100' : 'text-slate-400 hover:text-slate-200'}`} onClick={() => setViewType('table')}>
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className={`h-8 w-8 rounded-md ${viewType === 'card' ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:text-slate-200'}`} onClick={() => setViewType('card')}>
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Vehicle
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-50">
            <DialogHeader>
              <DialogTitle>Register New Vehicle</DialogTitle>
              <DialogDescription className="text-slate-400">
                Enter the details of the new vehicle unit.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="id" className="text-right text-slate-300">
                    Unit ID *
                  </Label>
                  <Input 
                    id="id" 
                    value={formData.id}
                    onChange={(e: any) => setFormData({...formData, id: e.target.value})}
                    className="col-span-3 bg-slate-800 border-slate-700 focus-visible:ring-blue-500" 
                    placeholder="e.g. THEAD-01"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="kind" className="text-right text-slate-300">
                    Kind *
                  </Label>
                  <div className="col-span-3">
                    <Select value={formData.kind} onValueChange={(val: string) => {
                      let wheels = '10'
                      if (val === 'CAR') wheels = '4'
                      else if (val === 'LTRUCK') wheels = '4'
                      else if (val === 'TRUCK') wheels = '6'
                      else if (val === 'THEAD') wheels = '10'
                      else if (val === 'TCHASS') wheels = '12'
                      else if (val === 'TDOLLY') wheels = '8'
                      setFormData({...formData, kind: val, nbWheels: wheels})
                    }}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                        <SelectItem value="CAR">Car</SelectItem>
                        <SelectItem value="LTRUCK">Light Truck</SelectItem>
                        <SelectItem value="TRUCK">Heavy Truck</SelectItem>
                        <SelectItem value="THEAD">Truck Head</SelectItem>
                        <SelectItem value="TCHASS">Trailer Chassis</SelectItem>
                        <SelectItem value="TDOLLY">Dolly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="brand" className="text-right text-slate-300">
                    Brand
                  </Label>
                  <Input 
                    id="brand" 
                    value={formData.brand}
                    onChange={(e: any) => setFormData({...formData, brand: e.target.value})}
                    className="col-span-3 bg-slate-800 border-slate-700 focus-visible:ring-blue-500" 
                    placeholder="e.g. Scania"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="model" className="text-right text-slate-300">
                    Model
                  </Label>
                  <Input 
                    id="model" 
                    value={formData.model}
                    onChange={(e: any) => setFormData({...formData, model: e.target.value})}
                    className="col-span-3 bg-slate-800 border-slate-700 focus-visible:ring-blue-500" 
                    placeholder="e.g. Cyber Truck"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="modelYear" className="text-right text-slate-300">
                    Model Year
                  </Label>
                  <Input 
                    id="modelYear" 
                    value={formData.modelYear}
                    onChange={(e: any) => setFormData({...formData, modelYear: e.target.value})}
                    className="col-span-3 bg-slate-800 border-slate-700 focus-visible:ring-blue-500" 
                    placeholder="e.g. 2022"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="plateNo" className="text-right text-slate-300">
                    Plate No
                  </Label>
                  <Input 
                    id="plateNo" 
                    value={formData.plateNo}
                    onChange={(e: any) => setFormData({...formData, plateNo: e.target.value})}
                    className="col-span-3 bg-slate-800 border-slate-700 focus-visible:ring-blue-500" 
                    placeholder="e.g. B 1234 XA"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="frameNo" className="text-right text-slate-300">
                    Frame SN
                  </Label>
                  <Input 
                    id="frameNo" 
                    value={formData.frameNo}
                    onChange={(e: any) => setFormData({...formData, frameNo: e.target.value})}
                    className="col-span-3 bg-slate-800 border-slate-700 focus-visible:ring-blue-500" 
                    placeholder="e.g. MH12345678"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nbWheels" className="text-right text-slate-300">
                    Wheels *
                  </Label>
                  <Input 
                    id="nbWheels" 
                    type="number"
                    value={formData.nbWheels}
                    onChange={(e: any) => setFormData({...formData, nbWheels: e.target.value})}
                    className="col-span-3 bg-slate-800 border-slate-700 focus-visible:ring-blue-500" 
                    required
                    min={2}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right text-slate-300">
                    Image
                  </Label>
                  <div className="col-span-3 flex flex-col gap-3">
                    <Input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageChange}
                      className="bg-slate-800 border-slate-700 file:bg-slate-700 file:text-slate-200 file:border-0 file:mr-4 file:px-3 file:py-1 file:rounded cursor-pointer" 
                    />
                    {formData.imageUrl && (
                      <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-700">
                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save Vehicle
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        </div>
      </div>

      {viewType === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading && vehicles.length === 0 ? (
            <div className="col-span-full h-48 flex items-center justify-center text-slate-500">
              <Loader2 className="h-6 w-6 animate-spin mr-2 text-blue-500" />
              Loading vehicles...
            </div>
          ) : vehicles.length === 0 ? (
            <div className="col-span-full h-48 flex items-center justify-center text-slate-500 bg-slate-900/20 rounded-xl border border-dashed border-slate-800">
              No vehicles found. Click "Add Vehicle" to register one.
            </div>
          ) : (
            vehicles.map((v) => (
              <Card key={v.id} className="border-slate-800 bg-slate-900/60 backdrop-blur-sm overflow-hidden group hover:border-slate-700 transition-all shadow-xl">
                <div className="h-48 bg-slate-800 relative overflow-hidden">
                  {v.imageUrl ? (
                    <img src={v.imageUrl} alt={v.id} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                      <ImageIcon className="h-12 w-12 text-slate-700" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <Badge variant="outline" className={`backdrop-blur-md shadow-sm
                      ${v.kind === 'CAR' ? 'border-sky-500/50 text-sky-100 bg-sky-900/60' : ''}
                      ${v.kind === 'LTRUCK' ? 'border-cyan-500/50 text-cyan-100 bg-cyan-900/60' : ''}
                      ${v.kind === 'TRUCK' ? 'border-teal-500/50 text-teal-100 bg-teal-900/60' : ''}
                      ${v.kind === 'THEAD' ? 'border-blue-500/50 text-blue-100 bg-blue-900/60' : ''}
                      ${v.kind === 'TCHASS' ? 'border-indigo-500/50 text-indigo-100 bg-indigo-900/60' : ''}
                      ${v.kind === 'TDOLLY' ? 'border-purple-500/50 text-purple-100 bg-purple-900/60' : ''}
                    `}>
                      {v.kind}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className={`shadow-sm backdrop-blur-md
                      ${v.status === 'ACTIVE' ? 'bg-emerald-500/80 text-white' : 'bg-slate-800/80 text-slate-300'}
                    `}>
                      {v.status}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-100 tracking-tight">{v.id}</h3>
                      {v.plateNo && <p className="text-sm text-blue-400 font-medium mt-0.5">{v.plateNo}</p>}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Brand & Model</span>
                      <span className="text-slate-300 font-medium text-right">
                        {v.brand || '-'} {v.model || ''}
                        {v.modelYear && <span className="text-slate-500 ml-1">({v.modelYear})</span>}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Frame SN</span>
                      <span className="text-slate-300 font-medium">{v.frameNo || '-'}</span>
                    </div>
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-slate-500">Links</span>
                      <div className="flex items-center gap-1">
                        <VehicleMobilityDialog vehicle={v}>
                           <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-blue-400 hover:bg-blue-500/10 hover:text-blue-300">
                             Mobility Log
                           </Button>
                        </VehicleMobilityDialog>
                        <VehicleTiresDialog vehicle={v}>
                           <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300">
                             View Tires
                           </Button>
                        </VehicleTiresDialog>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm items-center pt-2 border-t border-slate-800/60">
                      <span className="text-slate-500">Wheels</span>
                      <span className="text-slate-300 font-medium">{v.nbWheels}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-slate-800/60">
                      <span className="text-slate-500">Registered</span>
                      <span className="text-slate-400">{new Date(v.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
      <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-xl shadow-2xl">
        <CardHeader className="border-b border-slate-800/60 pb-4">
          <CardTitle className="text-slate-100 font-semibold">Vehicle Inventory</CardTitle>
          <CardDescription className="text-slate-400">View and track all registered units.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-900/50">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400 w-[150px]">Unit ID & Plate</TableHead>
                <TableHead className="text-slate-400">Type</TableHead>
                <TableHead className="text-slate-400">Brand, Model & Year</TableHead>
                <TableHead className="text-slate-400">Frame SN</TableHead>
                <TableHead className="text-slate-400 text-center">Wheels</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && vehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-slate-500">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Loading vehicles...
                  </TableCell>
                </TableRow>
              ) : vehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-slate-500">
                    No vehicles found. Click "Add Vehicle" to register one.
                  </TableCell>
                </TableRow>
              ) : (
                vehicles.map((v) => (
                  <TableRow key={v.id} className="border-slate-800/60 hover:bg-slate-800/40 transition-colors">
                    <TableCell>
                      <div className="font-medium text-slate-200">{v.id}</div>
                      {v.plateNo && <div className="text-xs text-slate-500">{v.plateNo}</div>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`
                        ${v.kind === 'CAR' ? 'border-sky-500/30 text-sky-400 bg-sky-500/10' : ''}
                        ${v.kind === 'LTRUCK' ? 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10' : ''}
                        ${v.kind === 'TRUCK' ? 'border-teal-500/30 text-teal-400 bg-teal-500/10' : ''}
                        ${v.kind === 'THEAD' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' : ''}
                        ${v.kind === 'TCHASS' ? 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10' : ''}
                        ${v.kind === 'TDOLLY' ? 'border-purple-500/30 text-purple-400 bg-purple-500/10' : ''}
                      `}>
                        {v.kind}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-slate-300">{v.brand || '-'} {v.model || ''}</span>
                      {v.modelYear && <span className="text-slate-400 text-sm ml-1">({v.modelYear})</span>}
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm">{v.frameNo || '-'}</TableCell>
                    <TableCell className="text-center text-slate-300">
                      <div className="flex items-center justify-center gap-2">
                        {v.nbWheels}
                        <VehicleTiresDialog vehicle={v}>
                           <Button variant="ghost" size="icon" className="h-6 w-6 text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300" title="View Tires">
                             <Circle className="h-3 w-3" />
                           </Button>
                        </VehicleTiresDialog>
                        <VehicleMobilityDialog vehicle={v}>
                           <Button variant="ghost" size="icon" className="h-6 w-6 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300" title="View Mobility Log">
                             <MapPin className="h-3 w-3" />
                           </Button>
                        </VehicleMobilityDialog>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`
                        ${v.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-slate-800 text-slate-400'}
                      `}>
                        {v.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      )}
    </div>
  )
}
