import { PrismaClient, TrailSetup } from '@prisma/client'

export class TrailService {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  async getAll(): Promise<TrailSetup[]> {
    return this.prisma.trailSetup.findMany({
      include: {
        head: { include: { tires: true, mobilityLogs: { orderBy: { timestamp: 'desc' }, take: 10 } } },
        trailers: {
          include: { trailer: { include: { tires: true, mobilityLogs: { orderBy: { timestamp: 'desc' }, take: 10 } } } },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  async getById(id: string): Promise<TrailSetup | null> {
    return this.prisma.trailSetup.findUnique({
      where: { id },
      include: {
        head: { include: { tires: true, mobilityLogs: { orderBy: { timestamp: 'desc' }, take: 10 } } },
        trailers: {
          include: { trailer: { include: { tires: true, mobilityLogs: { orderBy: { timestamp: 'desc' }, take: 10 } } } },
          orderBy: { order: 'asc' }
        }
      }
    })
  }

  async create(data: any): Promise<TrailSetup> {
    const { id, type, headId, totalWheels, trailers } = data
    // trailers should be an array of objects: { trailerId: string, order: number }

    return this.prisma.trailSetup.create({
      data: {
        id,
        type,
        headId,
        totalWheels: totalWheels || 0,
        trailers: {
          create: trailers.map((t: any) => ({
            trailerId: t.trailerId,
            order: t.order,
          }))
        }
      },
      include: {
        head: true,
        trailers: true
      }
    })
  }

  async update(id: string, data: any): Promise<TrailSetup> {
    const { type, headId, totalWheels, trailers } = data

    // If updating trailers, we delete existing and recreate them
    const updateData: any = { type, headId, totalWheels }
    
    if (trailers) {
      updateData.trailers = {
        deleteMany: {},
        create: trailers.map((t: any) => ({
          trailerId: t.trailerId,
          order: t.order,
        }))
      }
    }

    return this.prisma.trailSetup.update({
      where: { id },
      data: updateData,
      include: {
        head: true,
        trailers: true
      }
    })
  }

  async delete(id: string): Promise<TrailSetup> {
    return this.prisma.trailSetup.delete({
      where: { id }
    })
  }
}
