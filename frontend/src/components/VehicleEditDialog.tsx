import { useState } from "react"
import type { Vehicle } from "../store"
import { useStore } from "../store"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export function VehicleEditDialog({ vehicle, children }: { vehicle: Vehicle, children: React.ReactNode }) {
  const { updateVehicle } = useStore()
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    kind: vehicle.kind,
    brand: vehicle.brand || '',
    model: vehicle.model || '',
    modelYear: vehicle.modelYear || '',
    plateNo: vehicle.plateNo || '',
    frameNo: vehicle.frameNo || '',
    nbWheels: vehicle.nbWheels.toString(),
    imageUrl: vehicle.imageUrl || ''
  })
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await updateVehicle(vehicle.id, {
        ...formData,
        nbWheels: parseInt(formData.nbWheels, 10)
      })
      setIsOpen(false)
      toast.success("Vehicle updated successfully")
    } catch (err) {
      console.error(err)
      toast.error("Failed to update vehicle")
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
          <DialogTitle>Edit Vehicle</DialogTitle>
          <DialogDescription className="text-slate-400">
            Update the details of vehicle unit {vehicle.id}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="id" className="text-right text-slate-300">
                Unit ID
              </Label>
              <Input 
                id="id" 
                value={vehicle.id}
                className="col-span-3 bg-slate-800 border-slate-700 focus-visible:ring-blue-500 cursor-not-allowed text-slate-500" 
                readOnly
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="kind" className="text-right text-slate-300">
                Kind *
              </Label>
              <div className="col-span-3">
                <Select value={formData.kind} onValueChange={(val: any) => {
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
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
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
                onChange={(e) => setFormData({...formData, model: e.target.value})}
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
                onChange={(e) => setFormData({...formData, modelYear: e.target.value})}
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
                onChange={(e) => setFormData({...formData, plateNo: e.target.value})}
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
                onChange={(e) => setFormData({...formData, frameNo: e.target.value})}
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
                onChange={(e) => setFormData({...formData, nbWheels: e.target.value})}
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
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
