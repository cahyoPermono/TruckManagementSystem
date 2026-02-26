import { FastifyRequest, FastifyReply } from 'fastify'
import { TrailService } from './service'

export class TrailController {
  private trailService: TrailService

  constructor(trailService: TrailService) {
    this.trailService = trailService
  }

  getAll = async (request: FastifyRequest<{ Querystring: { page?: string, limit?: string } }>, reply: FastifyReply) => {
    try {
      const { page, limit } = request.query
      const parsedPage = page ? parseInt(page) : undefined
      const parsedLimit = limit ? parseInt(limit) : undefined

      const setups = await this.trailService.getAll({
        page: parsedPage,
        limit: parsedLimit
      })
      reply.send(setups)
    } catch (error: any) {
      reply.status(500).send({ error: error.message })
    }
  }

  getById = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params
      const setup = await this.trailService.getById(id)
      if (!setup) return reply.status(404).send({ error: 'Trail Setup not found' })
      reply.send(setup)
    } catch (error: any) {
      reply.status(500).send({ error: error.message })
    }
  }

  create = async (request: FastifyRequest<{ Body: any }>, reply: FastifyReply) => {
    try {
      const setup = await this.trailService.create(request.body)
      reply.status(201).send(setup)
    } catch (error: any) {
      reply.status(400).send({ error: error.message })
    }
  }

  update = async (request: FastifyRequest<{ Params: { id: string }, Body: any }>, reply: FastifyReply) => {
    try {
      const { id } = request.params
      const setup = await this.trailService.update(id, request.body)
      reply.send(setup)
    } catch (error: any) {
      reply.status(400).send({ error: error.message })
    }
  }

  delete = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params
      await this.trailService.delete(id)
      reply.send({ message: 'Trail Setup deleted successfully' })
    } catch (error: any) {
      reply.status(400).send({ error: error.message })
    }
  }
}
