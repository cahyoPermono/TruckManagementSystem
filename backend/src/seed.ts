import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding initial data...')

  // Modules available in the system
  const modules = ['Vehicles', 'Trails', 'Tires', 'Dashboard', 'IAM']
  const permissionsData = [
    { name: 'manage:vehicles', module: 'Vehicles' },
    { name: 'view:vehicles', module: 'Vehicles' },
    { name: 'manage:trails', module: 'Trails' },
    { name: 'view:trails', module: 'Trails' },
    { name: 'manage:tires', module: 'Tires' },
    { name: 'view:tires', module: 'Tires' },
    { name: 'view:dashboard', module: 'Dashboard' },
    { name: 'manage:iam', module: 'IAM' }, // Manage users, roles, permissions
  ]

  const createdPermissions = []
  for (const perm of permissionsData) {
    const p = await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm
    })
    createdPermissions.push(p)
  }

  // Create Admin Role
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      name: 'Admin',
      description: 'System Administrator with full access'
    }
  })

  // Assign all permissions to Admin
  for (const p of createdPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: p.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: p.id }
    })
  }

  // Create Staff Role (Read Only)
  const staffRole = await prisma.role.upsert({
    where: { name: 'Staff' },
    update: {},
    create: {
      name: 'Staff',
      description: 'Standard staff with read-only access'
    }
  })

  // Assign view permissions to Staff
  const readPerms = createdPermissions.filter(p => p.name.startsWith('view:'))
  for (const p of readPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: staffRole.id, permissionId: p.id } },
      update: {},
      create: { roleId: staffRole.id, permissionId: p.id }
    })
  }

  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      name: 'System Admin',
      username: 'admin',
      passwordHash: adminPassword,
      roleId: adminRole.id
    }
  })

  console.log('Seeding completed! Default Admin: username=admin, password=admin123')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
