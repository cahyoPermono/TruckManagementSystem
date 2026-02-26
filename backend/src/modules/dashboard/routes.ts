import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { DashboardController } from './controller'
import { DashboardService } from './service'

const dashboardRoutes: FastifyPluginAsync = async (server: FastifyInstance) => {
  server.addHook('onRequest', server.authenticate)

  const dashboardService = new DashboardService(server.prisma)
  const dashboardController = new DashboardController(dashboardService)

  server.get('/statistics', { preHandler: server.verifyPermission('view:dashboard') }, dashboardController.getStatistics)
  server.get('/top-mileages', { preHandler: server.verifyPermission('view:dashboard') }, dashboardController.getTopMileages)
  server.get<{ Querystring: { vehicleId?: string } }>('/mobility-logs', { preHandler: server.verifyPermission('view:dashboard') }, dashboardController.getMobilityLogs)
  server.post<{ Body: any }>('/mobility-logs', { preHandler: server.verifyPermission('manage:dashboard') }, dashboardController.addMobilityLog)
}

export default dashboardRoutes
