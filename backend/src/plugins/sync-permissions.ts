import fp from 'fastify-plugin'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

export default fp(async (fastify, opts) => {
  const prisma: PrismaClient = fastify.prisma

  // Read the modules directory dynamically
  const modulesPath = path.join(__dirname, '../modules')
  let moduleDirs: string[] = []
  
  try {
    const entries = fs.readdirSync(modulesPath, { withFileTypes: true })
    moduleDirs = entries
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
  } catch (error) {
    fastify.log.error(error, 'Could not read modules directory for permission syncing')
    return
  }

  // Systematically register view and manage permissions for each module
  const autoPermissions = moduleDirs.flatMap(dir => {
    // Convert module name to PascalCase or Title Case for display
    const moduleLabel = dir.charAt(0).toUpperCase() + dir.slice(1)
    
    return [
      { name: `view:${dir}`, module: moduleLabel },
      { name: `manage:${dir}`, module: moduleLabel }
    ]
  })
  
  // Custom manual permissions that might not map 1:1 to directory structure
  // e.g., 'manage:finance' could be added here if needed in the future
  const customPermissions = [
    { name: 'view:dashboard', module: 'Dashboard' } // Dashboard might only need view
  ]

  const allPermissions = [...autoPermissions, ...customPermissions]

  // Upsert all identified permissions
  for (const perm of allPermissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: { module: perm.module },
      create: perm
    })
  }

  fastify.log.info(`Synchronized ${allPermissions.length} IAM permissions from modules.`)
})
