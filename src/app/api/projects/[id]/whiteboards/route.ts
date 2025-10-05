import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/projects/[id]/whiteboards - Get all whiteboards for a project
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id } = await params

    // Check if user has access to this project
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
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      )
    }

    const whiteboards = await prisma.whiteboard.findMany({
      where: { projectId: id },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json({ whiteboards })
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.error('Get whiteboards error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/projects/[id]/whiteboards - Create a new whiteboard
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id } = await params
    const { name } = await request.json()

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Whiteboard name is required' },
        { status: 400 }
      )
    }

    // Check if user has access to this project
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
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      )
    }

    const whiteboard = await prisma.whiteboard.create({
      data: {
        name: name.trim(),
        projectId: id
        // canvasData will be null by default
      }
    })

    return NextResponse.json({ whiteboard }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.error('Create whiteboard error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}