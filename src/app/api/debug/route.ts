import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL || process.env.NEON_RED_DOG_URL
    console.log('DATABASE_URL:', dbUrl?.substring(0, 30) + '...')
    console.log('NODE_ENV:', process.env.NODE_ENV)
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Prisma connection successful')
    
    // Test queries
    const userCount = await prisma.user.count()
    const projectCount = await prisma.project.count()
    console.log('✅ User count query successful:', userCount)
    console.log('✅ Project count query successful:', projectCount)
    
    // Get sample data
    const users = await prisma.user.findMany({ take: 3 })
    const projects = await prisma.project.findMany({ 
      take: 3, 
      include: { 
        owner: { select: { id: true, username: true } },
        _count: { select: { whiteboards: true, sharedWith: true } }
      } 
    })
    
    return NextResponse.json({ 
      success: true, 
      counts: {
        users: userCount,
        projects: projectCount
      },
      sampleData: {
        users: users.map(u => ({ id: u.id, username: u.username })),
        projects: projects.map(p => ({ 
          id: p.id, 
          name: p.name, 
          owner: p.owner.username,
          whiteboards: p._count.whiteboards,
          shares: p._count.sharedWith
        }))
      },
      databaseUrl: dbUrl?.substring(0, 30) + '...',
      nodeEnv: process.env.NODE_ENV
    })
  } catch (error: any) {
    console.error('❌ Database test failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      code: error.code,
      databaseUrl: (process.env.DATABASE_URL || process.env.NEON_RED_DOG_URL)?.substring(0, 30) + '...',
      nodeEnv: process.env.NODE_ENV
    }, { status: 500 })
  }
}