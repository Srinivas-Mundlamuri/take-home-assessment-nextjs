import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/projects/[id]/share - Share project with a user
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id } = await params
    const { username } = await request.json()

    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    // Normalize username
    const normalizedUsername = username.toLowerCase().trim()

    // Check if user is the project owner
    const project = await prisma.project.findUnique({
      where: { id },
      select: { ownerId: true, name: true }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    if (project.ownerId !== user.id) {
      return NextResponse.json(
        { error: 'Only project owners can share projects' },
        { status: 403 }
      )
    }

    // Find the user to share with
    const targetUser = await prisma.user.findUnique({
      where: { username: normalizedUsername }
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Can't share with yourself
    if (targetUser.id === user.id) {
      return NextResponse.json(
        { error: 'Cannot share project with yourself' },
        { status: 400 }
      )
    }

    // Check if already shared
    const existingShare = await prisma.projectShare.findUnique({
      where: {
        projectId_userId: {
          projectId: id,
          userId: targetUser.id
        }
      }
    })

    if (existingShare) {
      return NextResponse.json(
        { error: 'Project is already shared with this user' },
        { status: 400 }
      )
    }

    // Create the share
    const share = await prisma.projectShare.create({
      data: {
        projectId: id,
        userId: targetUser.id
      },
      include: {
        user: {
          select: { id: true, username: true }
        }
      }
    })

    return NextResponse.json({ share }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.error('Share project error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}