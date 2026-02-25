import fp from 'fastify-plugin'
import fastifyJwt, { FastifyJwtNamespace } from '@fastify/jwt'
import { FastifyRequest, FastifyReply } from 'fastify'

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    verifyPermission: (requiredPermission: string) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { id: string; username: string; roleId: string | null }
    user: { id: string; username: string; roleId: string | null }
  }
}

export default fp(async (fastify, opts) => {
  fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'super-secret-fallback-key'
  })

  fastify.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' })
    }
  })

  fastify.decorate('verifyPermission', function (requiredPermission: string) {
    return async function (request: FastifyRequest, reply: FastifyReply) {
      // First ensure the user is authenticated
      await fastify.authenticate(request, reply)
      
      const user = request.user
      if (!user.roleId) {
        reply.code(403).send({ error: 'Forbidden: No role assigned' })
        return
      }

      // Check if user's role has the required permission
      const role = await fastify.prisma.role.findUnique({
        where: { id: user.roleId },
        include: { permissions: { include: { permission: true } } }
      })

      if (!role) {
        reply.code(403).send({ error: 'Forbidden: Role not found' })
        return
      }

      const hasPermission = role.permissions.some(rp => rp.permission.name === requiredPermission)
      if (!hasPermission) {
        reply.code(403).send({ error: `Forbidden: Requires permission '${requiredPermission}'` })
      }
    }
  })
})
