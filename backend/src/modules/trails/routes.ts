import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { TrailController } from './controller'
import { TrailService } from './service'

const trailRoutes: FastifyPluginAsync = async (server: FastifyInstance) => {
  const trailService = new TrailService(server.prisma)
  const trailController = new TrailController(trailService)

  server.get('/', trailController.getAll)
  server.get('/:id', trailController.getById)
  server.post('/', trailController.create)
  server.put('/:id', trailController.update)
  server.delete('/:id', trailController.delete)
}

export default trailRoutes
