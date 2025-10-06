import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()

    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    // Normalize username (case-insensitive)
    const normalizedUsername = username.toLowerCase().trim()

    if (normalizedUsername.length === 0) {
      return NextResponse.json(
        { error: 'Username cannot be empty' },
        { status: 400 }
      )
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { username: normalizedUsername },
    })

    if (!user) {
      user = await prisma.user.create({
        data: { username: normalizedUsername },
      })
    }

    // Create JWT token
    const token = await createToken({
      id: user.id,
      username: user.username,
    })

    // Create response with cookie
    const response = NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
      },
    })

    // Set HTTP-only cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    }
    

    
    response.cookies.set('auth-token', token, cookieOptions)

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}