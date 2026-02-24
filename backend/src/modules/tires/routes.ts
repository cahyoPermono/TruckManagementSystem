import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { TireController } from './controller'
import { TireService } from './service'

const tireRoutes: FastifyPluginAsync = async (server: FastifyInstance) => {
  const tireService = new TireService(server.prisma)
  const tireController = new TireController(tireService)

  server.get('/', tireController.getAll)
  server.get('/:id', tireController.getById)
  server.post('/', tireController.create)
  server.put('/:id', tireController.update)
  server.post('/:id/status', tireController.setStatus)
  server.delete('/:id', tireController.delete)
}

export default tireRoutes
