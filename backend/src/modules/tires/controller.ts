import { FastifyRequest, FastifyReply } from 'fastify'
import { TireService } from './service'
import { TireStatus } from '@prisma/client'

export class TireController {
  private tireService: TireService

  constructor(tireService: TireService) {
    this.tireService = tireService
  }

  getAll = async (request: FastifyRequest<{ Querystring: { page?: string, limit?: string } }>, reply: FastifyReply) => {
    try {
      const { page, limit } = request.query
      const parsedPage = page ? parseInt(page) : undefined
      const parsedLimit = limit ? parseInt(limit) : undefined

      const tires = await this.tireService.getAll({
        page: parsedPage,
        limit: parsedLimit
      })
      reply.send(tires)
    } catch (error: any) {
      reply.status(500).send({ error: error.message })
    }
  }

  getById = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params
      const tire = await this.tireService.getById(id)
      if (!tire) return reply.status(404).send({ error: 'Tire not found' })
      reply.send(tire)
    } catch (error: any) {
      reply.status(500).send({ error: error.message })
    }
  }

  create = async (request: FastifyRequest<{ Body: any }>, reply: FastifyReply) => {
    try {
      const tire = await this.tireService.create(request.body)
      reply.status(201).send(tire)
    } catch (error: any) {
      reply.status(400).send({ error: error.message })
    }
  }

  update = async (request: FastifyRequest<{ Params: { id: string }, Body: any }>, reply: FastifyReply) => {
    try {
      const { id } = request.params
      const tire = await this.tireService.update(id, request.body)
      reply.send(tire)
    } catch (error: any) {
      reply.status(400).send({ error: error.message })
    }
  }

  setStatus = async (request: FastifyRequest<{ Params: { id: string }, Body: any }>, reply: FastifyReply) => {
    try {
      const { id } = request.params
      const { status, vehicleId, unitMileage } = request.body as any
      const newStatus = status as TireStatus

      const tire = await this.tireService.setStatus(id, newStatus, vehicleId, unitMileage)
      reply.send(tire)
    } catch (error: any) {
      reply.status(400).send({ error: error.message })
    }
  }

  delete = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params
      await this.tireService.delete(id)
      reply.send({ message: 'Tire deleted successfully' })
    } catch (error: any) {
      reply.status(400).send({ error: error.message })
    }
  }
}
