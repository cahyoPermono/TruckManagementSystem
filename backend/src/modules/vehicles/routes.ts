import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { VehicleController } from './controller'
import { VehicleService } from './service'

const vehicleRoutes: FastifyPluginAsync = async (server: FastifyInstance) => {
  server.addHook('onRequest', server.authenticate)

  const vehicleService = new VehicleService(server.prisma)
  const vehicleController = new VehicleController(vehicleService)

  server.get<{ Querystring: { kind?: string, page?: string, limit?: string } }>('/', { preHandler: server.verifyPermission('view:vehicles') }, vehicleController.getAllVehicles)
  server.get<{ Params: { id: string } }>('/:id', { preHandler: server.verifyPermission('view:vehicles') }, vehicleController.getVehicleById)
  server.post<{ Body: any }>('/', { preHandler: server.verifyPermission('manage:vehicles') }, vehicleController.createVehicle)
  server.put<{ Params: { id: string }, Body: any }>('/:id', { preHandler: server.verifyPermission('manage:vehicles') }, vehicleController.updateVehicle)
  server.delete<{ Params: { id: string } }>('/:id', { preHandler: server.verifyPermission('manage:vehicles') }, vehicleController.deleteVehicle)
}

export default vehicleRoutes
