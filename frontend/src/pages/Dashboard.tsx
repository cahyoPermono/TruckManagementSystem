import { useState, useMemo, useEffect } from "react"
import { useStore } from "../store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Truck, MapPin, GaugeCircle, CircleDot, Search, Navigation, Activity } from "lucide-react"
import { Input } from "@/components/ui/input"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { TruckSimulation } from "./Trails"
import { motion } from 'framer-motion'

const COLORS_HEADS = ['#10b981', '#64748b'] // active vs inactive
const COLORS_CHASSIS = ['#3b82f6', '#f59e0b'] // attached vs detached

export default function Dashboard() {
  const { stats, fetchStats, vehicles, fetchVehicles, trails, fetchTrails } = useStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAsset, setSelectedAsset] = useState<any>(null)

  useEffect(() => {
    fetchStats()
    fetchVehicles()
    fetchTrails()
  }, [])

  // Process data for charts
  const headData = useMemo(() => {
    const heads = vehicles.filter(v => v.kind === 'THEAD')
    const active = heads.filter(v => v.status === 'ACTIVE').length
    const inactive = heads.length - active
    return [
      { name: 'Active', value: active },
      { name: 'Inactive/Maintenance', value: inactive }
    ]
  }, [vehicles])

  const chassisData = useMemo(() => {
    const chassis = vehicles.filter(v => v.kind === 'TCHASS' || v.kind === 'TDOLLY')
    const attachedIds = new Set()
    trails.forEach(t => t.trailers?.forEach((tr: any) => attachedIds.add(tr.trailerId)))
    
    const attached = chassis.filter(c => attachedIds.has(c.id)).length
    const detached = chassis.length - attached
    return [
      { name: 'Attached', value: attached },
      { name: 'Detached (Standby)', value: detached }
    ]
  }, [vehicles, trails])

  // Process data for the interactive map (Setups only)
  const mapNodes = useMemo(() => {
    const nodes = trails.map(t => {
      const headVehicle = t.head || vehicles.find(v => v.id === t.headId)
      
      let lat = 0, lng = 0
      let speed = 0
      
      if (headVehicle?.mobilityLogs && headVehicle.mobilityLogs.length > 0) {
        lat = headVehicle.mobilityLogs[0].latitude
        lng = headVehicle.mobilityLogs[0].longitude
        speed = headVehicle.mobilityLogs[0].speed
      } else {
        const hash = t.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
        lat = (hash % 60) - 30 // -30 to 30
        lng = ((hash * 13) % 100) - 50 // -50 to 50
      }
      return { ...t, lat, lng, speed, headVehicle }
    }).filter(n => n.headVehicle) // Plot set ups with active heads
    
    if (!searchQuery) return nodes
    return nodes.filter(n => 
      n.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (n.headVehicle?.plateNo && n.headVehicle.plateNo.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [trails, vehicles, searchQuery])

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6 relative"
    >
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-50">Operation Center</h2>
          <p className="text-slate-400 mt-1">Live overview and telemetry of all enterprise assets.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Power Units" value={stats?.heads ?? 0} icon={Truck} color="text-emerald-400" bg="bg-emerald-500/10" glow="group-hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]" />
        <StatCard title="Total Chassis" value={stats?.chassis ?? 0} icon={MapPin} color="text-indigo-400" bg="bg-indigo-500/10" glow="group-hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]" />
        <StatCard title="Dollies in Field" value={stats?.dollies ?? 0} icon={CircleDot} color="text-violet-400" bg="bg-violet-500/10" glow="group-hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]" />
        <StatCard title="Tires Managed" value={stats?.tires ?? 0} icon={GaugeCircle} color="text-cyan-400" bg="bg-cyan-500/10" glow="group-hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2">
        {/* Interactive Asset Map */}
        <Card className="lg:col-span-8 border-slate-700/50 bg-slate-900/60 backdrop-blur-xl shadow-2xl relative overflow-hidden flex flex-col group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
          <CardHeader className="border-b border-slate-700/50 pb-4 z-10 bg-slate-900/40 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-slate-100 font-semibold flex items-center text-xl">
                  Live Telemetry Map
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  Tracking {mapNodes.length} active setups
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Locate Unit ID or Plate..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-950/50 border-slate-700 focus-visible:ring-indigo-500 rounded-full shadow-inner text-slate-200" 
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 h-[500px] relative overflow-hidden bg-slate-950/80 rounded-b-xl z-0">
            <MapContainer 
              center={mapNodes.length > 0 ? [mapNodes[0].lat, mapNodes[0].lng] : [0, 0]} 
              zoom={4} 
              className="h-full w-full z-0"
              zoomControl={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              
              {mapNodes.map(node => {
                const isMoving = node.speed > 0
                
                const nodeColor = 'bg-emerald-400'
                const shadowColor = 'shadow-[0_0_15px_rgba(52,211,153,0.6)]'
                
                const htmlStr = `
                  <div class="relative flex items-center justify-center w-full h-full group">
                    <div class="absolute w-4 h-4 rounded-full ${nodeColor} ${shadowColor} border border-white/20"></div>
                    ${isMoving ? `<div class="absolute w-4 h-4 rounded-full ${nodeColor} opacity-75 animate-ping"></div>` : ''}
                    <div class="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700/50 text-xs px-2.5 py-1 rounded-md text-slate-200 opacity-0 group-hover:opacity-100 whitespace-nowrap shadow-xl transition-opacity flex flex-col items-center gap-1 backdrop-blur-sm z-50 pointer-events-none">
                      <div class="flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full ${nodeColor}"></span>
                        <span class="font-bold text-emerald-400">${node.id}</span>
                      </div>
                      <span class="text-[10px] text-slate-400 border-t border-slate-700 w-full text-center pt-1">${node.headVehicle.plateNo || node.headVehicle.id}</span>
                    </div>
                  </div>
                `
                
                const customIcon = L.divIcon({
                  html: htmlStr,
                  className: 'bg-transparent border-none',
                  iconSize: [24, 24],
                  iconAnchor: [12, 12]
                })

                return (
                  <Marker 
                    key={node.id} 
                    position={[node.lat, node.lng]} 
                    title={`Setup: ${node.id}`} 
                    icon={customIcon}
                    eventHandlers={{
                      click: () => setSelectedAsset(node)
                    }}
                  />
                )
              })}
            </MapContainer>
            
            {/* Map Accents */}
            <div className="absolute left-4 bottom-4 flex flex-col gap-2 z-[1000] pointer-events-none">
               <div className="bg-slate-900/90 backdrop-blur border border-slate-700/50 rounded-lg p-3 shadow-2xl pointer-events-auto">
                 <div className="text-[10px] uppercase text-slate-500 font-bold mb-2 tracking-wider">Legend</div>
                 <div className="flex items-center gap-2 text-xs text-slate-300 mb-1.5">
                   <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" /> Active Fleet (Trail Setups)
                 </div>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Diagrams */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card className="border-slate-700/50 bg-slate-900/60 backdrop-blur-xl shadow-2xl flex-1 relative overflow-hidden group">
            <div className="absolute -right-12 -top-12 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
            <CardHeader className="border-b border-slate-700/50 pb-3">
              <CardTitle className="text-slate-100 font-semibold text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-400" /> Power Unit Health
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 h-[240px] flex items-center justify-center">
              <ResponsiveContainer width="99%" height={200} minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie
                    data={headData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {headData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_HEADS[index]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', borderColor: 'rgba(51, 65, 85, 0.5)', borderRadius: '8px', color: '#f8fafc', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }} 
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-slate-700/50 bg-slate-900/60 backdrop-blur-xl shadow-2xl flex-1 relative overflow-hidden group">
            <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors" />
            <CardHeader className="border-b border-slate-700/50 pb-3">
              <CardTitle className="text-slate-100 font-semibold text-base flex items-center gap-2">
                <Navigation className="h-4 w-4 text-indigo-400" /> Chassis Linkage
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 h-[240px] flex items-center justify-center">
              <ResponsiveContainer width="99%" height={200} minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie
                    data={chassisData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {chassisData.map((_, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS_CHASSIS[index]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', borderColor: 'rgba(51, 65, 85, 0.5)', borderRadius: '8px', color: '#f8fafc', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }} 
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Asset Detail Dialog */}
      <Dialog open={!!selectedAsset} onOpenChange={(open) => !open && setSelectedAsset(null)}>
        <DialogContent className="sm:max-w-[450px] bg-slate-900 border-slate-800 text-slate-50">
          <DialogHeader className="mb-2">
            <DialogTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-indigo-400" />
              Setup Configuration: {selectedAsset?.id}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Live location and configuration details for this set up.
            </DialogDescription>
          </DialogHeader>
          
          {selectedAsset && (
            <div className="space-y-4">
              {/* Visualizer */}
              <div className="bg-slate-950/50 rounded-xl border border-slate-800 shadow-inner">
                <TruckSimulation 
                  type={selectedAsset.type} 
                  hasHead={!!selectedAsset.headVehicle} 
                  hasT1={selectedAsset.trailers?.length > 0} 
                  hasT2={selectedAsset.trailers?.length > 1} 
                />
              </div>

              {/* Head Section */}
              {selectedAsset.headVehicle && (
                <div className="bg-blue-900/10 border border-blue-800/40 rounded-lg p-3">
                  <div className="text-xs font-semibold text-blue-400 mb-1 flex justify-between">
                    <span>HEAD UNIT • {selectedAsset.headVehicle.id}</span>
                    <span className="text-slate-300">{selectedAsset.headVehicle.plateNo || 'No Plate'}</span>
                  </div>
                  <div className="font-medium text-slate-200 text-sm">
                    {selectedAsset.headVehicle.brand || '-'} {selectedAsset.headVehicle.model || ''}
                  </div>
                </div>
              )}

              {/* Trailers Section */}
              {selectedAsset.trailers?.map((tr: any) => (
                <div key={tr.trailerId} className="bg-indigo-900/10 border border-indigo-800/40 rounded-lg p-3 relative ml-4">
                  <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-4 border-t border-slate-700"></div>
                  <div className="text-xs font-semibold text-indigo-400 mb-1 flex justify-between">
                    <span>TRAILER #{tr.order} • {tr.trailerId}</span>
                    <span className="text-slate-300">{tr.trailer?.plateNo || 'No Plate'}</span>
                  </div>
                  <div className="font-medium text-slate-200 text-sm">
                    {tr.trailer?.brand || '-'} {tr.trailer?.model || ''}
                  </div>
                </div>
              ))}

              <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center px-1">
                <span className="text-sm text-slate-400">Total Setup Wheels</span>
                <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/10 font-bold px-3 py-1">
                  {selectedAsset.totalWheels} Wheels Total
                </Badge>
              </div>

              {selectedAsset.headVehicle?.mobilityLogs && selectedAsset.headVehicle.mobilityLogs.length > 0 && (
                <div className="mt-4 border-t border-slate-800 pt-4 bg-slate-900/40 rounded-lg p-3">
                  <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Live Telemetry (Head)</div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Speed</span>
                    <span className="text-emerald-400 font-mono font-medium">{selectedAsset.headVehicle.mobilityLogs[0].speed.toFixed(1)} km/h</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-slate-500">Coordinates</span>
                    <span className="text-slate-300 font-mono">
                      {selectedAsset.headVehicle.mobilityLogs[0].latitude.toFixed(4)}, {selectedAsset.headVehicle.mobilityLogs[0].longitude.toFixed(4)}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-2 text-right">
                    Last sync: {new Date(selectedAsset.headVehicle.mobilityLogs[0].timestamp).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

function StatCard({ title, value, icon: Icon, color, bg, glow = '' }: any) {
  return (
    <Card className={`border-slate-700/50 bg-slate-900/50 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:bg-slate-800/60 group overflow-hidden relative ${glow} hover:-translate-y-1`}>
      <div className={`absolute top-0 right-0 w-32 h-32 ${bg} rounded-full blur-[40px] -mr-12 -mt-12 pointer-events-none group-hover:scale-150 transition-transform duration-700 opacity-70`} />
      <CardContent className="p-6 flex items-center gap-5 relative z-10">
        <div className={`p-3.5 rounded-2xl ${bg} ${color} ring-1 ring-inset ring-current/20 shadow-inner group-hover:scale-110 transition-transform`}>
          <Icon className="h-6 w-6 lg:h-8 lg:w-8" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-black tracking-tight text-slate-50 mt-1">{value}</h3>
        </div>
      </CardContent>
    </Card>
  )
}
