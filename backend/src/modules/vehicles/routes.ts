import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { VehicleController } from './controller'
import { VehicleService } from './service'

const vehicleRoutes: FastifyPluginAsync = async (server: FastifyInstance) => {
  const vehicleService = new VehicleService(server.prisma)
  const vehicleController = new VehicleController(vehicleService)

  server.get('/', vehicleController.getAllVehicles)
  server.get('/:id', vehicleController.getVehicleById)
  server.post('/', vehicleController.createVehicle)
  server.put('/:id', vehicleController.updateVehicle)
  server.delete('/:id', vehicleController.deleteVehicle)
}

export default vehicleRoutes
