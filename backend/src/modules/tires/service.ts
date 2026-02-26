import { PrismaClient, Tire, TireStatus } from '@prisma/client'

export class TireService {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  async getAll(queries: { page?: number, limit?: number } = {}) {
    const page = queries.page || 1
    const limit = queries.limit || 10
    const skip = (page - 1) * limit

    const [data, totalCount] = await Promise.all([
      this.prisma.tire.findMany({
        include: { attachedTo: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.tire.count()
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

  async getById(id: string): Promise<Tire | null> {
    return this.prisma.tire.findUnique({
      where: { id },
      include: {
        attachedTo: true,
        logs: {
          orderBy: { timestamp: 'desc' },
          take: 50
        }
      }
    })
  }

  async create(data: any): Promise<Tire> {
    return this.prisma.tire.create({
      data: {
        id: data.id,
        serialNo: data.serialNo,
        brand: data.brand,
        size: data.size,
        status: data.status || 'NEW',
        mileage: data.mileage || 0.0,
        provisioningDate: new Date(data.provisioningDate),
        attachedToId: data.attachedToId || null
      }
    })
  }

  async update(id: string, data: any): Promise<Tire> {
    return this.prisma.tire.update({
      where: { id },
      data: {
        ...data,
        provisioningDate: data.provisioningDate ? new Date(data.provisioningDate) : undefined
      }
    })
  }

  async setStatus(id: string, newStatus: TireStatus, vehicleId?: string, unitMileage?: number): Promise<Tire> {
    return this.prisma.$transaction(async (tx) => {
      const updatedTire = await tx.tire.update({
        where: { id },
        data: {
          status: newStatus,
          attachedToId: newStatus === 'ATTACHED' ? vehicleId : null,
        }
      })

      // Create a log entry
      await tx.tireLog.create({
        data: {
          tireId: id,
          activity: newStatus,
          vehicleId: vehicleId,
          unitMileage: unitMileage
        }
      })

      return updatedTire
    })
  }

  async delete(id: string): Promise<Tire> {
    return this.prisma.tire.delete({
      where: { id }
    })
  }
}
