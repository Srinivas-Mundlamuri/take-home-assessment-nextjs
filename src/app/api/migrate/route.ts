import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    console.log('🔄 Starting database migration...')
    
    // Test connection first
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Drop existing tables to recreate with correct schema
    await prisma.$executeRaw`DROP TABLE IF EXISTS whiteboards CASCADE;`
    await prisma.$executeRaw`DROP TABLE IF EXISTS project_shares CASCADE;`
    await prisma.$executeRaw`DROP TABLE IF EXISTS projects CASCADE;`
    await prisma.$executeRaw`DROP TABLE IF EXISTS users CASCADE;`
    
    // Create users table with correct field names
    await prisma.$executeRaw`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `
    
    // Create projects table with correct field names
    await prisma.$executeRaw`
      CREATE TABLE projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        "ownerId" TEXT NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("ownerId") REFERENCES users(id) ON DELETE CASCADE
      );
    `
    
    // Create project_shares table with correct field names
    await prisma.$executeRaw`
      CREATE TABLE project_shares (
        id TEXT PRIMARY KEY,
        "projectId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("projectId") REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE("projectId", "userId")
      );
    `
    
    // Create whiteboards table with correct field names
    await prisma.$executeRaw`
      CREATE TABLE whiteboards (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        data JSONB,
        "projectId" TEXT NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("projectId") REFERENCES projects(id) ON DELETE CASCADE
      );
    `
    
    console.log('✅ Database migration completed successfully')
    
    // Test queries
    const userCount = await prisma.user.count()
    const projectCount = await prisma.project.count()
    const whiteboardCount = await prisma.whiteboard.count()
    const projectShareCount = await prisma.projectShare.count()
    
    // Get sample data
    const users = await prisma.user.findMany({ take: 3 })
    const projects = await prisma.project.findMany({ take: 3, include: { owner: true } })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database migration completed successfully',
      counts: {
        users: userCount,
        projects: projectCount,
        whiteboards: whiteboardCount,
        projectShares: projectShareCount
      },
      sampleData: {
        users,
        projects
      },
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('❌ Database migration failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}