import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { DashboardController } from './controller'
import { DashboardService } from './service'

const dashboardRoutes: FastifyPluginAsync = async (server: FastifyInstance) => {
  const dashboardService = new DashboardService(server.prisma)
  const dashboardController = new DashboardController(dashboardService)

  server.get('/statistics', dashboardController.getStatistics)
  server.get('/top-mileages', dashboardController.getTopMileages)
  server.get('/mobility-logs', dashboardController.getMobilityLogs)
  server.post('/mobility-logs', dashboardController.addMobilityLog)
}

export default dashboardRoutes
