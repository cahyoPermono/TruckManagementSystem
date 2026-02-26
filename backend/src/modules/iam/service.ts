import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

export const IamService = (prisma: PrismaClient) => ({
  // --- USERS ---
  getUsers: async (queries: { page?: number, limit?: number } = {}) => {
    const page = queries.page || 1
    const limit = queries.limit || 10
    const skip = (page - 1) * limit

    const [data, totalCount] = await Promise.all([
      prisma.user.findMany({
        include: { role: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.user.count()
    ])

    return {
      data,
      meta: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        limit
      }
    }
  },
  
  createUser: async (data: any) => {
    const passwordHash = await bcrypt.hash(data.password, 10)
    return prisma.user.create({
      data: {
        name: data.name,
        username: data.username,
        passwordHash,
        roleId: data.roleId || null
      }
    })
  },

  updateUser: async (id: string, data: any) => {
    const updateData: any = {
      name: data.name,
      username: data.username,
      roleId: data.roleId || null
    }
    
    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10)
    }

    return prisma.user.update({
      where: { id },
      data: updateData
    })
  },

  deleteUser: async (id: string) => {
    return prisma.user.delete({ where: { id } })
  },

  // --- ROLES ---
  getRoles: async (queries: { page?: number, limit?: number } = {}) => {
    const page = queries.page || 1
    const limit = queries.limit || 10
    const skip = (page - 1) * limit

    const [data, totalCount] = await Promise.all([
      prisma.role.findMany({
        include: {
          permissions: { include: { permission: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.role.count()
    ])

    return {
      data,
      meta: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        limit
      }
    }
  },

  createRole: async (data: any) => {
    const role = await prisma.role.create({
      data: {
        name: data.name,
        description: data.description,
      }
    })

    const perms = data.permissions || data.permissionIds
    if (perms?.length) {
      await prisma.rolePermission.createMany({
        data: perms.map((pid: string) => ({ roleId: role.id, permissionId: pid }))
      })
    }

    return prisma.role.findUnique({ where: { id: role.id }, include: { permissions: { include: { permission: true } } } })
  },

  updateRole: async (id: string, data: any) => {
    await prisma.role.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description
      }
    })

    const perms = data.permissions || data.permissionIds
    if (perms) {
      // Clear existing
      await prisma.rolePermission.deleteMany({ where: { roleId: id } })
      // Insert new
      if (perms.length) {
        await prisma.rolePermission.createMany({
          data: perms.map((pid: string) => ({ roleId: id, permissionId: pid }))
        })
      }
    }

    return prisma.role.findUnique({ where: { id }, include: { permissions: { include: { permission: true } } } })
  },

  deleteRole: async (id: string) => {
    return prisma.role.delete({ where: { id } })
  },

  // --- PERMISSIONS ---
  getPermissions: async () => {
    return prisma.permission.findMany({
      orderBy: { module: 'asc' }
    })
  }

})
