import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/projects/[id] - Get a specific project
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id } = await params

    // First check if project exists and get basic info
    const project = await prisma.project.findUnique({
      where: { id }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Check if user has access (either owner or shared with)
    let hasAccess = false
    
    // Check ownership
    if (project.ownerId === user.id) {
      hasAccess = true
    } else {
      // Check if project is shared with this user
      const sharedAccess = await prisma.projectShare.findFirst({
        where: {
          projectId: id,
          userId: user.id
        }
      })
      hasAccess = !!sharedAccess
    }

    if (!hasAccess) {
      return NextResponse.json({ error: 'Project not found or you do not have access to it' }, { status: 404 })
    }
    
    // Get related data separately to avoid relation issues
    let whiteboards: any[] = []
    let owner = null
    
    if (project) {
      try {
        whiteboards = await prisma.whiteboard.findMany({
          where: { projectId: project.id },
          orderBy: { updatedAt: 'desc' }
        })
      } catch (error) {
        console.error('Error fetching whiteboards:', error)
      }
      
      try {
        owner = await prisma.user.findUnique({
          where: { id: project.ownerId },
          select: { id: true, username: true }
        })
      } catch (error) {
        console.error('Error fetching owner:', error)
      }
    }

    return NextResponse.json({
      ...project,
      owner,
      whiteboards
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.error('Get project error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/[id] - Delete a project (owner only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id } = await params

    // Check if user is the owner
    const project = await prisma.project.findUnique({
      where: { id },
      select: { ownerId: true }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    if (project.ownerId !== user.id) {
      return NextResponse.json(
        { error: 'Only project owners can delete projects' },
        { status: 403 }
      )
    }

    await prisma.project.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.error('Delete project error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}