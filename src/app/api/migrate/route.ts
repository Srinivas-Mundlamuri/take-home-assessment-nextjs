import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    console.log('🔄 Starting database migration...')
    
    // Test connection first
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Create users table if it doesn't exist
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `
    
    // Create projects table if it doesn't exist
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        owner_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `
    
    // Create project_shares table if it doesn't exist
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS project_shares (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(project_id, user_id)
      );
    `
    
    // Create whiteboards table if it doesn't exist
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS whiteboards (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        data JSONB,
        project_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      );
    `
    
    console.log('✅ Database migration completed successfully')
    
    // Test a simple query
    const userCount = await prisma.user.count()
    const projectCount = await prisma.project.count()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database migration completed successfully',
      userCount,
      projectCount,
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