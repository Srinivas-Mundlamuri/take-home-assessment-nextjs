import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('DATABASE_URL:', process.env.DATABASE_URL)
    console.log('NODE_ENV:', process.env.NODE_ENV)
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Prisma connection successful')
    
    // Test query
    const userCount = await prisma.user.count()
    console.log('✅ User count query successful:', userCount)
    
    return NextResponse.json({ 
      success: true, 
      userCount,
      databaseUrl: process.env.DATABASE_URL?.substring(0, 30) + '...',
      nodeEnv: process.env.NODE_ENV
    })
  } catch (error: any) {
    console.error('❌ Database test failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      code: error.code,
      databaseUrl: process.env.DATABASE_URL?.substring(0, 30) + '...',
      nodeEnv: process.env.NODE_ENV
    }, { status: 500 })
  }
}