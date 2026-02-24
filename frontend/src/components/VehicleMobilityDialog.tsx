import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { Vehicle } from "@/store"
import { MapPin, Navigation } from "lucide-react"

export function VehicleMobilityDialog({ vehicle, children }: { vehicle: Vehicle, children: React.ReactNode }) {
  const logs = vehicle.mobilityLogs || []
  const totalDistance = logs.reduce((acc, log) => acc + log.distance, 0)
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] bg-slate-900 border-slate-800 text-slate-50">
        <DialogHeader>
          <DialogTitle>Mobility Log - {vehicle.id}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex justify-between items-center text-sm px-1">
            <span className="text-slate-400">Total Distance Logged</span>
            <span className="text-slate-200 font-medium">{totalDistance.toFixed(1)} km</span>
          </div>
          {logs.length === 0 ? (
            <div className="text-center text-slate-500 py-6 bg-slate-800/20 rounded-lg border border-dashed border-slate-700">
              No mobility logs recorded for this vehicle.
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {logs.map(log => (
                <div key={log.id} className="flex flex-col gap-2 p-3 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-indigo-400" />
                      <span className="text-xs font-mono text-slate-300">
                        {log.latitude.toFixed(4)}, {log.longitude.toFixed(4)}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-4 items-center">
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                      <Navigation className="h-3 w-3 mr-1" />
                      {log.speed.toFixed(1)} km/h
                    </Badge>
                    <span className="text-xs text-slate-300 font-medium">+{log.distance.toFixed(2)} km</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
