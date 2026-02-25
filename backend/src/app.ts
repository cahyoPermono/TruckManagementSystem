import Fastify, { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import prismaPlugin from './plugins/prisma'
import vehicleRoutes from './modules/vehicles/routes'
import trailRoutes from './modules/trails/routes'
import tireRoutes from './modules/tires/routes'
import dashboardRoutes from './modules/dashboard/routes'
import authPlugin from './plugins/auth'
import authRoutes from './modules/auth/routes'
import iamRoutes from './modules/iam/routes'

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: true,
    bodyLimit: 30 * 1024 * 1024 // 30MB limit for base64 images
  })

  // Register plugins
  await app.register(helmet)
  await app.register(cors, {
    origin: '*', // For development, allow all. In production, restrict this.
  })
  
  await app.register(prismaPlugin)
  await app.register(authPlugin)

  // Register domain modules (routes)
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  })

  await app.register(authRoutes, { prefix: '/api/auth' })
  await app.register(iamRoutes, { prefix: '/api/iam' })
  await app.register(vehicleRoutes, { prefix: '/api/vehicles' })
  await app.register(trailRoutes, { prefix: '/api/trails' })
  await app.register(tireRoutes, { prefix: '/api/tires' })
  await app.register(dashboardRoutes, { prefix: '/api/dashboard' })

  return app
}
