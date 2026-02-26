import { PrismaClient, Vehicle, VehicleKind } from '@prisma/client'

export class VehicleService {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  async getAllVehicles(queries: { kind?: any, page?: number, limit?: number }) {
    const page = queries.page || 1
    const limit = queries.limit || 10
    const skip = (page - 1) * limit
    const where = queries.kind ? { kind: queries.kind } : {}

    const [data, totalCount] = await Promise.all([
      this.prisma.vehicle.findMany({
        where,
        include: {
          tires: true,
          mobilityLogs: {
            orderBy: { timestamp: 'desc' },
            take: 10
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.vehicle.count({ where })
    ])

    return {
      data,
      meta: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        limit
      }
    }
  }

  async getVehicleById(id: string): Promise<Vehicle | null> {
    return this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        tires: true,
        mobilityLogs: {
          orderBy: { timestamp: 'desc' },
          take: 10
        }
      }
    })
  }

  async createVehicle(data: any): Promise<Vehicle> {
    return this.prisma.vehicle.create({
      data: {
        id: data.id,
        kind: data.kind,
        brand: data.brand,
        model: data.model,
        imageUrl: data.imageUrl,
        modelYear: data.modelYear,
        plateNo: data.plateNo,
        frameNo: data.frameNo,
        nbWheels: data.nbWheels,
        manageTire: data.manageTire ?? true,
        status: data.status || 'ACTIVE'
      }
    })
  }

  async updateVehicle(id: string, data: any): Promise<Vehicle> {
    return this.prisma.vehicle.update({
      where: { id },
      data
    })
  }

  async deleteVehicle(id: string): Promise<Vehicle> {
    return this.prisma.$transaction(async (tx) => {
      // 1. Detach any tires attached to this vehicle
      await tx.tire.updateMany({
        where: { attachedToId: id },
        data: { attachedToId: null, status: 'DETACHED' }
      })

      // 2. Identify all TrailSetups linked to this vehicle (as head or trailer)
      const setupsAsHead = await tx.trailSetup.findMany({
        where: { headId: id },
        select: { id: true }
      })

      const setupsAsTrailer = await tx.trailTrailer.findMany({
        where: { trailerId: id },
        select: { setupId: true }
      })

      const setupIdsToDelete = [
        ...setupsAsHead.map(s => s.id),
        ...setupsAsTrailer.map(s => s.setupId)
      ]

      const uniqueSetupIds = [...new Set(setupIdsToDelete)]

      // 3. Delete those TrailSetups (TrailTrailers will cascade automatically)
      if (uniqueSetupIds.length > 0) {
        await tx.trailSetup.deleteMany({
          where: { id: { in: uniqueSetupIds } }
        })
      }

      // 4. Finally delete the vehicle (MobilityLogs will cascade cleanly)
      return tx.vehicle.delete({
        where: { id }
      })
    })
  }
}
