import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { TireController } from './controller'
import { TireService } from './service'

const tireRoutes: FastifyPluginAsync = async (server: FastifyInstance) => {
  server.addHook('onRequest', server.authenticate)

  const tireService = new TireService(server.prisma)
  const tireController = new TireController(tireService)

  server.get<{ Querystring: { page?: string, limit?: string } }>('/', { preHandler: server.verifyPermission('view:tires') }, tireController.getAll)
  server.get<{ Params: { id: string } }>('/:id', { preHandler: server.verifyPermission('view:tires') }, tireController.getById)
  server.post<{ Body: any }>('/', { preHandler: server.verifyPermission('manage:tires') }, tireController.create)
  server.put<{ Params: { id: string }, Body: any }>('/:id', { preHandler: server.verifyPermission('manage:tires') }, tireController.update)
  server.post<{ Params: { id: string }, Body: any }>('/:id/status', { preHandler: server.verifyPermission('manage:tires') }, tireController.setStatus)
  server.delete<{ Params: { id: string } }>('/:id', { preHandler: server.verifyPermission('manage:tires') }, tireController.delete)
}

export default tireRoutes
