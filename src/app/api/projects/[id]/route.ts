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

    const project = await prisma.project.findFirst({
      where: {
        id,
        OR: [
          { ownerId: user.id },
          {
            sharedWith: {
              some: { userId: user.id }
            }
          }
        ]
      },
      include: {
        owner: {
          select: { id: true, username: true }
        },
        sharedWith: {
          include: {
            user: {
              select: { id: true, username: true }
            }
          }
        },
        whiteboards: {
          orderBy: { updatedAt: 'desc' }
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ project })
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