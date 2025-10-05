import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// GET /api/projects - Get all accessible projects for the user
export async function GET() {
  try {
    const user = await requireAuth()

    const projects = await prisma.project.findMany({
      where: {
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
        _count: {
          select: { whiteboards: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json({ projects })
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.error('Get projects error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { name, description } = await request.json()

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      )
    }

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        ownerId: user.id,
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
        _count: {
          select: { whiteboards: true }
        }
      }
    })

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.error('Create project error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}