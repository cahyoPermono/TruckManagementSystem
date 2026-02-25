import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

export const AuthService = (prisma: PrismaClient) => ({
  async login(username: string, passwordPlain: string) {
    const user = await prisma.user.findUnique({ where: { username } })
    if (!user) {
      throw new Error('Invalid credentials')
    }

    const isValid = await bcrypt.compare(passwordPlain, user.passwordHash)
    if (!isValid) {
      throw new Error('Invalid credentials')
    }

    return {
      id: user.id,
      username: user.username,
      name: user.name,
      roleId: user.roleId
    }
  },

  async getMe(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        role: {
          include: {
            permissions: {
              include: { permission: true }
            }
          }
        },
        createdAt: true
      }
    })
  }
})
