import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { Vehicle } from "@/store"
import { Circle } from "lucide-react"

export function VehicleTiresDialog({ vehicle, children }: { vehicle: Vehicle, children: React.ReactNode }) {
  const tires = vehicle.tires || []
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-50">
        <DialogHeader>
          <DialogTitle>Attached Tires - {vehicle.id}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex justify-between items-center text-sm px-1">
            <span className="text-slate-400">Total Attached</span>
            <span className="text-slate-200 font-medium">{tires.length} / {vehicle.nbWheels}</span>
          </div>
          {tires.length === 0 ? (
            <div className="text-center text-slate-500 py-6 bg-slate-800/20 rounded-lg border border-dashed border-slate-700">
              No tires attached to this vehicle.
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {tires.map(t => (
                <div key={t.id} className="flex justify-between items-center p-3 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <Circle className="h-5 w-5 text-indigo-400" />
                    <div>
                      <div className="font-medium text-slate-200">{t.serialNo} <span className="text-indigo-400/80 text-xs font-normal ml-2">({t.mileage.toFixed(0)} km)</span></div>
                      <div className="text-xs text-slate-400">{t.brand || 'Unknown Brand'} - {t.size || 'Size N/A'}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className={`
                    ${t.status === 'GOOD' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : ''}
                    ${t.status === 'WORN' ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' : ''}
                    ${t.status === 'DAMAGED' ? 'border-red-500/30 text-red-400 bg-red-500/10' : ''}
                    ${t.status === 'SPARE' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' : ''}
                  `}>
                    {t.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
