import { FastifyInstance } from 'fastify'
import { IamService } from './service'

export default async function (fastify: FastifyInstance) {
  const iamService = IamService(fastify.prisma)

  // Requires authentication and 'manage:iam' permission
  fastify.addHook('onRequest', fastify.verifyPermission('manage:iam'))

  // USERS
  fastify.get<{ Querystring: { page?: string, limit?: string } }>('/users', async (request, reply) => {
    const { page, limit } = request.query
    const parsedPage = page ? parseInt(page) : undefined
    const parsedLimit = limit ? parseInt(limit) : undefined
    return iamService.getUsers({ page: parsedPage, limit: parsedLimit })
  })

  fastify.post('/users', async (request, reply) => {
    try {
      const user = await iamService.createUser(request.body as any)
      return reply.code(201).send(user)
    } catch (err: any) {
      return reply.code(400).send({ error: err.message })
    }
  })

  fastify.put('/users/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      return await iamService.updateUser(id, request.body as any)
    } catch (err: any) {
      return reply.code(400).send({ error: err.message })
    }
  })

  fastify.delete('/users/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      await iamService.deleteUser(id)
      return reply.code(204).send()
    } catch (err: any) {
      return reply.code(400).send({ error: err.message })
    }
  })

  // ROLES
  fastify.get<{ Querystring: { page?: string, limit?: string } }>('/roles', async (request, reply) => {
    const { page, limit } = request.query
    const parsedPage = page ? parseInt(page) : undefined
    const parsedLimit = limit ? parseInt(limit) : undefined
    return iamService.getRoles({ page: parsedPage, limit: parsedLimit })
  })

  fastify.post('/roles', async (request, reply) => {
    try {
      const role = await iamService.createRole(request.body as any)
      return reply.code(201).send(role)
    } catch (err: any) {
      return reply.code(400).send({ error: err.message })
    }
  })

  fastify.put('/roles/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      return await iamService.updateRole(id, request.body as any)
    } catch (err: any) {
      return reply.code(400).send({ error: err.message })
    }
  })

  fastify.delete('/roles/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      await iamService.deleteRole(id)
      return reply.code(204).send()
    } catch (err: any) {
      return reply.code(400).send({ error: err.message })
    }
  })

  // PERMISSIONS
  fastify.get('/permissions', async (request, reply) => {
    return iamService.getPermissions()
  })
}
