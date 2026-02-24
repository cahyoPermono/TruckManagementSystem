import { PrismaClient } from '@prisma/client'

export class DashboardService {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  async getStatistics(): Promise<any> {
    const [
      truckHeadCount,
      chassisCount,
      dollyCount,
      totalTires,
      tiresGroupedByStatus,
      vehiclesGroupedByStatus
    ] = await Promise.all([
      this.prisma.vehicle.count({ where: { kind: 'THEAD' } }),
      this.prisma.vehicle.count({ where: { kind: 'TCHASS' } }),
      this.prisma.vehicle.count({ where: { kind: 'TDOLLY' } }),
      this.prisma.tire.count(),
      this.prisma.tire.groupBy({ by: ['status'], _count: { id: true } }),
      this.prisma.vehicle.groupBy({ by: ['status'], _count: { id: true } })
    ])

    return {
      heads: truckHeadCount,
      chassis: chassisCount,
      dollies: dollyCount,
      tires: totalTires,
      tireStatusCount: tiresGroupedByStatus,
      vehicleStatusCount: vehiclesGroupedByStatus
    }
  }

  async getTopMileages(): Promise<any> {
    // In a real app we might query today's logs specifically.
    // For now we get vehicles with most distance driven based on logs.
    return this.prisma.mobilityLog.groupBy({
      by: ['vehicleId'],
      _sum: { distance: true },
      orderBy: { _sum: { distance: 'desc' } },
      take: 5
    })
  }

  // Simulate inserting mobility log (mock)
  async addMobilityLog(data: any): Promise<any> {
    return this.prisma.mobilityLog.create({
      data: {
        vehicleId: data.vehicleId,
        latitude: data.latitude,
        longitude: data.longitude,
        speed: data.speed,
        distance: data.distance || 0,
      }
    })
  }

  async getMobilityLogs(vehicleId?: string): Promise<any> {
    return this.prisma.mobilityLog.findMany({
      where: vehicleId ? { vehicleId } : undefined,
      orderBy: { timestamp: 'desc' },
      take: 100,
      include: {
        vehicle: true
      }
    })
  }
}
