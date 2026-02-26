import { FastifyRequest, FastifyReply } from 'fastify'
import { VehicleService } from './service'
import { VehicleKind } from '@prisma/client'

export class VehicleController {
  private vehicleService: VehicleService

  constructor(vehicleService: VehicleService) {
    this.vehicleService = vehicleService
  }

  getAllVehicles = async (request: FastifyRequest<{ Querystring: { kind?: string, page?: string, limit?: string } }>, reply: FastifyReply) => {
    try {
      const { kind, page, limit } = request.query
      const parsedPage = page ? parseInt(page) : undefined
      const parsedLimit = limit ? parseInt(limit) : undefined
      
      const result = await this.vehicleService.getAllVehicles({
        kind: kind ? (kind as VehicleKind) : undefined,
        page: parsedPage,
        limit: parsedLimit
      })
      reply.send(result)
    } catch (error: any) {
      reply.status(500).send({ error: error.message })
    }
  }

  getVehicleById = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params
      const vehicle = await this.vehicleService.getVehicleById(id)
      if (!vehicle) {
        return reply.status(404).send({ error: 'Vehicle not found' })
      }
      reply.send(vehicle)
    } catch (error: any) {
      reply.status(500).send({ error: error.message })
    }
  }

  createVehicle = async (request: FastifyRequest<{ Body: any }>, reply: FastifyReply) => {
    try {
      const vehicle = await this.vehicleService.createVehicle(request.body)
      reply.status(201).send(vehicle)
    } catch (error: any) {
      reply.status(400).send({ error: error.message })
    }
  }

  updateVehicle = async (request: FastifyRequest<{ Params: { id: string }, Body: any }>, reply: FastifyReply) => {
    try {
      const { id } = request.params
      const vehicle = await this.vehicleService.updateVehicle(id, request.body)
      reply.send(vehicle)
    } catch (error: any) {
      reply.status(400).send({ error: error.message })
    }
  }

  deleteVehicle = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params
      await this.vehicleService.deleteVehicle(id)
      reply.send({ message: 'Vehicle deleted successfully' })
    } catch (error: any) {
      reply.status(400).send({ error: error.message })
    }
  }
}
