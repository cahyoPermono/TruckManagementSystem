import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { TrailController } from './controller'
import { TrailService } from './service'

const trailRoutes: FastifyPluginAsync = async (server: FastifyInstance) => {
  server.addHook('onRequest', server.authenticate)

  const trailService = new TrailService(server.prisma)
  const trailController = new TrailController(trailService)

  server.get('/', { preHandler: server.verifyPermission('view:trails') }, trailController.getAll)
  server.get<{ Params: { id: string } }>('/:id', { preHandler: server.verifyPermission('view:trails') }, trailController.getById)
  server.post<{ Body: any }>('/', { preHandler: server.verifyPermission('manage:trails') }, trailController.create)
  server.put<{ Params: { id: string }, Body: any }>('/:id', { preHandler: server.verifyPermission('manage:trails') }, trailController.update)
  server.delete<{ Params: { id: string } }>('/:id', { preHandler: server.verifyPermission('manage:trails') }, trailController.delete)
}

export default trailRoutes
