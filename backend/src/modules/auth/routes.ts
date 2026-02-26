import { FastifyInstance } from 'fastify'
import { AuthService } from './service'

export default async function (fastify: FastifyInstance) {
  const authService = AuthService(fastify.prisma)

  fastify.post('/login', async (request, reply) => {
    const { username, password } = request.body as any
    if (!username || !password) {
      return reply.code(400).send({ error: 'Username and password are required' })
    }

    try {
      const user = await authService.login(username, password)
      const tokenPayload = { id: user.id, username: user.username, roleId: user.roleId }
      const token = fastify.jwt.sign(tokenPayload)
      return { token, user }
    } catch (error: any) {
      return reply.code(401).send({ error: error.message })
    }
  })

  fastify.get('/me', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const me = await authService.getMe(request.user.id)
    if (!me) {
      return reply.code(404).send({ error: 'User not found' })
    }
    return me
  })
}
