import { FastifyRequest, FastifyReply } from 'fastify'
import { DashboardService } from './service'

export class DashboardController {
  private dashboardService: DashboardService

  constructor(dashboardService: DashboardService) {
    this.dashboardService = dashboardService
  }

  getStatistics = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const stats = await this.dashboardService.getStatistics()
      reply.send(stats)
    } catch (error: any) {
      reply.status(500).send({ error: error.message })
    }
  }

  getTopMileages = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const top = await this.dashboardService.getTopMileages()
      reply.send(top)
    } catch (error: any) {
      reply.status(500).send({ error: error.message })
    }
  }

  addMobilityLog = async (request: FastifyRequest<{ Body: any }>, reply: FastifyReply) => {
    try {
      const log = await this.dashboardService.addMobilityLog(request.body)
      reply.status(201).send(log)
    } catch (error: any) {
      reply.status(400).send({ error: error.message })
    }
  }

  getMobilityLogs = async (request: FastifyRequest<{ Querystring: { vehicleId?: string } }>, reply: FastifyReply) => {
    try {
      const logs = await this.dashboardService.getMobilityLogs(request.query.vehicleId)
      reply.send(logs)
    } catch (error: any) {
      reply.status(500).send({ error: error.message })
    }
  }
}
