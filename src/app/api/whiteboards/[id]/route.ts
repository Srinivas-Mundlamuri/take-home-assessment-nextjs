import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/whiteboards/[id] - Get a specific whiteboard
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id } = await params

    // Get whiteboard first
    const whiteboard = await prisma.whiteboard.findUnique({
      where: { id },
      include: {
        project: {
          select: { id: true, name: true, ownerId: true }
        }
      }
    })

    if (!whiteboard) {
      return NextResponse.json(
        { error: 'Whiteboard not found' },
        { status: 404 }
      )
    }

    // Check if user has access to the project (owner or shared)
    let hasAccess = false
    if (whiteboard.project.ownerId === user.id) {
      hasAccess = true
    } else {
      const sharedAccess = await prisma.projectShare.findFirst({
        where: {
          projectId: whiteboard.project.id,
          userId: user.id
        }
      })
      hasAccess = !!sharedAccess
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Whiteboard not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({ whiteboard })
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.error('Get whiteboard error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/whiteboards/[id] - Update whiteboard canvas data
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id } = await params
    const { canvasData } = await request.json()

    // Check if user has access to this whiteboard
    const whiteboard = await prisma.whiteboard.findUnique({
      where: { id },
      include: {
        project: {
          select: { id: true, ownerId: true }
        }
      }
    })

    if (!whiteboard) {
      return NextResponse.json(
        { error: 'Whiteboard not found' },
        { status: 404 }
      )
    }

    // Check access (owner or shared)
    let hasAccess = false
    if (whiteboard.project.ownerId === user.id) {
      hasAccess = true
    } else {
      const sharedAccess = await prisma.projectShare.findFirst({
        where: {
          projectId: whiteboard.project.id,
          userId: user.id
        }
      })
      hasAccess = !!sharedAccess
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Whiteboard not found or access denied' },
        { status: 404 }
      )
    }

    const updatedWhiteboard = await prisma.whiteboard.update({
      where: { id },
      data: { canvasData }
    })

    return NextResponse.json({ whiteboard: updatedWhiteboard })
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.error('Update whiteboard error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/whiteboards/[id] - Delete a whiteboard
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id } = await params

    // Check if user has access to this whiteboard
    const whiteboard = await prisma.whiteboard.findFirst({
      where: {
        id,
        project: {
          OR: [
            { ownerId: user.id },
            {
              sharedWith: {
                some: { userId: user.id }
              }
            }
          ]
        }
      }
    })

    if (!whiteboard) {
      return NextResponse.json(
        { error: 'Whiteboard not found or access denied' },
        { status: 404 }
      )
    }

    await prisma.whiteboard.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.error('Delete whiteboard error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}