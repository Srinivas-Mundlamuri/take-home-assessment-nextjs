import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('=== DETAILED ERROR TEST ===')
    
    // Test auth
    console.log('Testing auth...')
    const user = await requireAuth()
    console.log('User:', user)
    
    // Test database connection
    console.log('Testing database...')
    const userCount = await prisma.user.count()
    console.log('User count:', userCount)
    
    // Test project query
    console.log('Testing project query...')
    const projects = await prisma.project.findMany({
      where: { ownerId: user.id },
      include: {
        owner: { select: { id: true, username: true } }
      }
    })
    console.log('Projects found:', projects.length)
    
    // Test specific project
    const projectId = 'cmge3putd0003ib04wj2oh051'
    console.log('Testing specific project:', projectId)
    
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: user.id
      },
      include: {
        owner: { select: { id: true, username: true } }
      }
    })
    console.log('Specific project:', project)
    
    return NextResponse.json({ 
      success: true,
      user,
      userCount,
      projects: projects.length,
      specificProject: project
    })
    
  } catch (error: any) {
    console.error('Error in test:', error)
    return NextResponse.json({ 
      success: false,
      error: error.message,
      stack: error.stack,
      name: error.name
    }, { status: 500 })
  }
}