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
import { Loader2, Trash2, Link as LinkIcon, LayoutGrid, List, Circle, MapPin } from "lucide-react"
import { VehicleTiresDialog } from "@/components/VehicleTiresDialog"
import { VehicleMobilityDialog } from "@/components/VehicleMobilityDialog"
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

export const TruckSimulation = ({ type, hasHead, hasT1, hasT2 }: { type: string, hasHead: boolean, hasT1: boolean, hasT2: boolean }) => {
  return (
    <div className="flex items-end justify-center py-8 bg-gradient-to-b from-slate-900/40 to-slate-900/80 rounded-xl border border-slate-800 shadow-inner overflow-hidden relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      
      {/* Ground Line */}
      <div className="absolute bottom-6 left-0 right-0 h-0.5 bg-slate-700/50"></div>

      <div className="flex items-end z-10 translate-y-1">
        {type === 'DOUBLE_TRAILER' && (
          <div className="relative animate-in slide-in-from-left-4 fade-in duration-500">
            <svg viewBox="0 0 120 60" className={`h-16 w-auto transition-all duration-300 ${hasT2 ? 'opacity-100 scale-100' : 'opacity-30 grayscale border-dashed blur-[0.5px] scale-95'} -mr-5 z-0 relative`}>
              <rect x="5" y="10" width="105" height="35" rx="3" fill={hasT2 ? "#3b82f6" : "#334155"} stroke={hasT2 ? "none" : "#475569"} strokeWidth="2" strokeDasharray={hasT2 ? "none" : "4 4"} />
              <rect x="110" y="38" width="10" height="4" fill={hasT2 ? "#1e293b" : "#334155"} />
              <circle cx="25" cy="45" r="7" fill="#0f172a" stroke={hasT2 ? "#64748b" : "#475569"} strokeWidth="2"/>
              <circle cx="45" cy="45" r="7" fill="#0f172a" stroke={hasT2 ? "#64748b" : "#475569"} strokeWidth="2"/>
              {hasT2 && (
                <text x="57" y="32" fontFamily="sans-serif" fontSize="12" fill="#ffffff" textAnchor="middle" fontWeight="bold">T2</text>
              )}
            </svg>
          </div>
        )}
        
        <div className="relative z-10 animate-in slide-in-from-left-4 fade-in duration-300">
          <svg viewBox="0 0 120 60" className={`h-16 w-auto transition-all duration-300 ${hasT1 ? 'opacity-100 scale-100' : 'opacity-30 grayscale border-dashed blur-[0.5px] scale-95'} -mr-5 relative`}>
            <rect x="5" y="10" width="105" height="35" rx="3" fill={hasT1 ? "#3b82f6" : "#334155"} stroke={hasT1 ? "none" : "#475569"} strokeWidth="2" strokeDasharray={hasT1 ? "none" : "4 4"} />
            <rect x="110" y="38" width="10" height="4" fill={hasT1 ? "#1e293b" : "#334155"} />
            <circle cx="25" cy="45" r="7" fill="#0f172a" stroke={hasT1 ? "#64748b" : "#475569"} strokeWidth="2"/>
            <circle cx="45" cy="45" r="7" fill="#0f172a" stroke={hasT1 ? "#64748b" : "#475569"} strokeWidth="2"/>
            {hasT1 && (
              <text x="57" y="32" fontFamily="sans-serif" fontSize="12" fill="#ffffff" textAnchor="middle" fontWeight="bold">T1</text>
            )}
          </svg>
        </div>

        <div className="relative z-20">
          <svg viewBox="0 0 100 60" className={`h-16 w-auto transition-all duration-300 ${hasHead ? 'opacity-100 scale-100 drop-shadow-lg' : 'opacity-40 scale-95 grayscale'}`}>
            <path d="M10,38 L35,38 L45,15 L75,15 L85,30 L85,45 L10,45 Z" fill={hasHead ? "#4f46e5" : "#334155"} />
            <path d="M47,18 L72,18 L79,28 L47,28 Z" fill={hasHead ? "#c7d2fe" : "#475569"} />
            <circle cx="30" cy="45" r="7" fill="#0f172a" stroke={hasHead ? "#64748b" : "#475569"} strokeWidth="2"/>
            <circle cx="65" cy="45" r="7" fill="#0f172a" stroke={hasHead ? "#64748b" : "#475569"} strokeWidth="2"/>
          </svg>
        </div>
      </div>
    </div>
  )
}

export default function Trails() {
  const { trails, fetchTrails, vehicles, fetchVehicles, createTrail, deleteTrail, isLoading } = useStore()
  const { user } = useAuthStore()
  const canManage = user?.role?.permissions?.some((p: any) => p.permission.name === 'manage:trails')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [viewType, setViewType] = useState<'table' | 'card'>('card')
  
  // Form state
  const [id, setId] = useState('')
  const [type, setType] = useState('SINGLE_TRAILER')
  const [headId, setHeadId] = useState('')
  const [trailer1, setTrailer1] = useState('')
  const [trailer2, setTrailer2] = useState('')
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchTrails()
    fetchVehicles()
  }, [])

  const heads = vehicles.filter((v) => v.kind === 'THEAD')
  const trailers = vehicles.filter((v) => v.kind === 'TCHASS' || v.kind === 'TDOLLY')

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const trailerData = []
      if (trailer1) trailerData.push({ trailerId: trailer1, order: 1 })
      if (type === 'DOUBLE_TRAILER' && trailer2) trailerData.push({ trailerId: trailer2, order: 2 })

      await createTrail({
        id,
        type,
        headId,
        totalWheels: 10 + trailerData.length * 8, // dummy logic for wheels
        trailers: trailerData
      })
      
      toast.success('Trail setup created successfully')
      
      setIsAddOpen(false)
      setId('')
      setType('SINGLE_TRAILER')
      setHeadId('')
      setTrailer1('')
      setTrailer2('')
    } catch (err: any) {
      toast.error(err.message || 'Failed to create trail setup')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (trailId: string) => {
    try {
      await deleteTrail(trailId)
      toast.success('Trail setup deleted successfully')
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete trail setup')
    }
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
          <h2 className="text-3xl font-bold tracking-tight text-slate-50">Trail Setups</h2>
          <p className="text-slate-400 mt-1">Configure and view vehicle combinations.</p>
        </div>
        
        <div className="flex gap-3 items-center">
          <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700">
            <Button variant="ghost" size="icon" className={`h-8 w-8 rounded-md ${viewType === 'table' ? 'bg-slate-700 text-slate-100' : 'text-slate-400 hover:text-slate-200'}`} onClick={() => setViewType('table')}>
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className={`h-8 w-8 rounded-md ${viewType === 'card' ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-400 hover:text-slate-200'}`} onClick={() => setViewType('card')}>
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
          {canManage && (
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20">
                <LinkIcon className="mr-2 h-4 w-4" /> Create Setup
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800 text-slate-50">
            <DialogHeader>
              <DialogTitle>Configure Trail Setup</DialogTitle>
              <DialogDescription className="text-slate-400">
                Link a head unit with trailing chassis or dollies.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 mb-2">
              <TruckSimulation type={type} hasHead={!!headId} hasT1={!!trailer1} hasT2={!!trailer2} />
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="id" className="text-right text-slate-300">
                    Setup ID *
                  </Label>
                  <Input 
                    id="id" 
                    value={id}
                    onChange={(e: any) => setId(e.target.value)}
                    className="col-span-3 bg-slate-800 border-slate-700 focus-visible:ring-indigo-500" 
                    placeholder="e.g. TR-SETUP-01"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right text-slate-300">
                    Config Type *
                  </Label>
                  <div className="col-span-3">
                    <Select value={type} onValueChange={(val: string) => setType(val)}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                        <SelectItem value="SINGLE_TRAILER">Single Trailer</SelectItem>
                        <SelectItem value="DOUBLE_TRAILER">Double Trailer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right text-slate-300">
                    Head Unit *
                  </Label>
                  <div className="col-span-3">
                    <Select value={headId} onValueChange={(val: string) => setHeadId(val)} required>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                        <SelectValue placeholder="Select Head Vehicle" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-slate-200 max-h-48">
                        {heads.map(h => (
                          <SelectItem key={h.id} value={h.id}>{h.id}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right text-slate-300">
                    Trailer 1 *
                  </Label>
                  <div className="col-span-3">
                    <Select value={trailer1} onValueChange={(val: string) => setTrailer1(val)} required>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                        <SelectValue placeholder="Select First Trailer" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-slate-200 max-h-48">
                        {trailers.map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.id} ({t.kind})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {type === 'DOUBLE_TRAILER' && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right text-slate-300">
                      Trailer 2 *
                    </Label>
                    <div className="col-span-3">
                      <Select value={trailer2} onValueChange={(val: string) => setTrailer2(val)} required>
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                          <SelectValue placeholder="Select Second Trailer" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-slate-200 max-h-48">
                          {trailers.map(t => (
                            <SelectItem key={t.id} value={t.id}>{t.id} ({t.kind})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Create Setup
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        )}

      </div>

      </div>

      {viewType === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading && trails.length === 0 ? (
            <div className="col-span-full h-48 flex items-center justify-center text-slate-500">
              <Loader2 className="h-6 w-6 animate-spin mr-2 text-indigo-500" />
              Loading trails...
            </div>
          ) : trails.length === 0 ? (
            <div className="col-span-full h-48 flex items-center justify-center text-slate-500 bg-slate-900/20 rounded-xl border border-dashed border-slate-800">
              No set ups configured.
            </div>
          ) : (
            trails.map((t) => (
              <Card key={t.id} className="border-slate-800 bg-slate-900/60 backdrop-blur-sm shadow-xl flex flex-col relative overflow-hidden group hover:border-slate-700 transition-all">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/80"></div>
                <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-slate-800/60">
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-100">{t.id}</CardTitle>
                    <Badge variant="secondary" className="mt-2 bg-slate-800 text-slate-300 border border-slate-700 shadow-sm">
              {t.type}
            </Badge>
          </div>
          
          {canManage && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-slate-900 border border-slate-800 text-slate-50">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-slate-100">Delete Trail Setup</AlertDialogTitle>
                <AlertDialogDescription className="text-slate-400">
                  Are you sure you want to delete the configuration <span className="text-slate-200 font-bold">{t.id}</span>? 
                  This will virtually detach the head unit and trailers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-slate-800 text-white hover:bg-slate-700 border-slate-600">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDelete(t.id)} className="bg-red-600 text-white hover:bg-red-700">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          )}
        </CardHeader>
                <CardContent className="pt-4 flex-1 flex flex-col gap-4">
                  
                  {/* Head Unit Summary */}
                  <div className="bg-blue-900/10 border border-blue-800/40 rounded-lg p-3">
                    <div className="text-xs font-semibold text-blue-400 mb-1 flex justify-between">
                      <span>HEAD UNIT • {t.head?.id || t.headId}</span>
                    </div>
                    {t.head ? (
                      <div>
                        <div className="font-medium text-slate-200 text-sm">{t.head.brand || '-'} {t.head.model || ''} {t.head.modelYear ? `(${t.head.modelYear})` : ''}</div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-slate-400">{t.head.plateNo || 'No Plate'} • {t.head.nbWheels} Wheels</span>
                          <div className="flex gap-1">
                            <VehicleMobilityDialog vehicle={t.head}>
                              <Button variant="ghost" size="sm" className="h-5 px-2 text-[10px] text-blue-400 hover:bg-blue-500/10 hover:text-blue-300">
                                Log
                              </Button>
                            </VehicleMobilityDialog>
                            <VehicleTiresDialog vehicle={t.head}>
                              <Button variant="ghost" size="sm" className="h-5 px-2 text-[10px] text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300">
                                Tires
                              </Button>
                            </VehicleTiresDialog>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-500 italic">Unknown</span>
                    )}
                  </div>

                  {/* Trailers Summary */}
                  <div className="flex flex-col gap-2 relative">
                    {/* Visual linkage lines */}
                    <div className="absolute left-4 top-[-10px] bottom-4 w-0.5 bg-slate-800/80 z-0"></div>
                    
                    {t.trailers?.map((tr: any) => (
                      <div key={`${tr.trailerId}-${tr.order}`} className="bg-indigo-900/10 border border-indigo-800/40 rounded-lg p-3 z-10 ml-8 relative">
                        {/* Connector dot */}
                        <div className="absolute -left-5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-500/50"></div>
                        <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-3 border-t border-slate-800/80"></div>

                        <div className="text-xs font-semibold text-indigo-400 mb-1">
                          TRAILER #{tr.order} • {tr.trailerId}
                        </div>
                        {tr.trailer ? (
                          <div>
                            <div className="font-medium text-slate-200 text-sm">{tr.trailer.brand || '-'} {tr.trailer.model || ''} {tr.trailer.modelYear ? `(${tr.trailer.modelYear})` : ''}</div>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-xs text-slate-400">{tr.trailer.plateNo || 'No Plate'} • {tr.trailer.nbWheels} Wheels</span>
                              <div className="flex gap-1">
                                <VehicleMobilityDialog vehicle={tr.trailer}>
                                  <Button variant="ghost" size="sm" className="h-5 px-2 text-[10px] text-blue-400 hover:bg-blue-500/10 hover:text-blue-300">
                                    Log
                                  </Button>
                                </VehicleMobilityDialog>
                                <VehicleTiresDialog vehicle={tr.trailer}>
                                  <Button variant="ghost" size="sm" className="h-5 px-2 text-[10px] text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300">
                                    Tires
                                  </Button>
                                </VehicleTiresDialog>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-500 italic">Unknown</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-800/60 flex justify-between items-center px-1">
                    <span className="text-sm text-slate-400">Total Setup Wheels</span>
                    <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/10 font-bold px-3">
                      {t.totalWheels}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
      <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-xl shadow-2xl">
        <CardHeader className="border-b border-slate-800/60 pb-4">
          <CardTitle className="text-slate-100 font-semibold">Active Configurations</CardTitle>
          <CardDescription className="text-slate-400">View combinations of truck heads and trailers.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-900/50">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400 w-[150px]">Setup ID</TableHead>
                <TableHead className="text-slate-400">Head Unit</TableHead>
                <TableHead className="text-slate-400">Type</TableHead>
                <TableHead className="text-slate-400">Head (Brand, Year, Plate)</TableHead>
                <TableHead className="text-slate-400">Trailers Attached</TableHead>
                <TableHead className="text-slate-400 text-center">Total Wheels</TableHead>
                <TableHead className="text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && trails.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-slate-500">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-500" />
                    Loading trails...
                  </TableCell>
                </TableRow>
              ) : trails.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-slate-500">
                    No set ups configured.
                  </TableCell>
                </TableRow>
              ) : (
                trails.map((t) => (
                  <TableRow key={t.id} className="border-slate-800/60 hover:bg-slate-800/40 transition-colors">
                    <TableCell className="font-medium text-slate-200">{t.id}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10">
                        {t.head?.id || t.headId}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-slate-800 text-slate-300 border border-slate-700">
                        {t.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {t.head ? (
                        <div className="text-sm">
                          <div className="font-medium text-slate-200">{t.head.brand || '-'} {t.head.model || ''} {t.head.modelYear ? `(${t.head.modelYear})` : ''}</div>
                          <div className="flex gap-2 items-center">
                            <span className="text-xs text-slate-400">{t.head.plateNo || 'No Plate'}</span>
                            <VehicleMobilityDialog vehicle={t.head}>
                              <Button variant="ghost" size="icon" className="h-5 w-5 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300" title="Mobility Log">
                                <MapPin className="h-3 w-3" />
                              </Button>
                            </VehicleMobilityDialog>
                            <VehicleTiresDialog vehicle={t.head}>
                              <Button variant="ghost" size="icon" className="h-5 w-5 text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300" title="View Tires">
                                <Circle className="h-3 w-3" />
                              </Button>
                            </VehicleTiresDialog>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Unknown</span>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      <div className="flex flex-col gap-2">
                        {t.trailers?.map((tr: any) => (
                          <div key={tr.trailerId} className="flex flex-col p-2 bg-slate-800/40 rounded border border-slate-700/50">
                            <span className="text-xs font-semibold text-indigo-400 mb-1">
                              Trailer #{tr.order} ({tr.trailerId})
                            </span>
                            {tr.trailer ? (
                              <div className="text-xs text-slate-300">
                                <div>{tr.trailer.brand || '-'} {tr.trailer.model || ''} {tr.trailer.modelYear ? `(${tr.trailer.modelYear})` : ''}</div>
                                <div className="flex gap-2 items-center text-slate-500">
                                  <span>{tr.trailer.plateNo || 'No Plate'} • {tr.trailer.nbWheels} Wheels</span>
                                  <VehicleMobilityDialog vehicle={tr.trailer}>
                                    <Button variant="ghost" size="icon" className="h-5 w-5 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300" title="Mobility Log">
                                      <MapPin className="h-3 w-3" />
                                    </Button>
                                  </VehicleMobilityDialog>
                                  <VehicleTiresDialog vehicle={tr.trailer}>
                                    <Button variant="ghost" size="icon" className="h-5 w-5 text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300" title="View Tires">
                                      <Circle className="h-3 w-3" />
                                    </Button>
                                  </VehicleTiresDialog>
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-500 italic">Unknown Data</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-slate-300 font-medium">
                {t.totalWheels}
              </TableCell>
              <TableCell className="text-right">
                {canManage && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-slate-900 border border-slate-800 text-slate-50">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-slate-100">Delete Trail Setup</AlertDialogTitle>
                      <AlertDialogDescription className="text-slate-400">
                        Are you sure you want to delete the configuration <span className="text-slate-200 font-bold">{t.id}</span>? 
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-slate-800 text-white hover:bg-slate-700 border-slate-600">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(t.id)} className="bg-red-600 text-white hover:bg-red-700">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                )}
              </TableCell>
            </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      )}
    </motion.div>
  )
}
