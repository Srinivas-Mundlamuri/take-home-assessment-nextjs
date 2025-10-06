import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    // Add canvasData column to whiteboards table if it doesn't exist
    await prisma.$executeRaw`
      ALTER TABLE whiteboards 
      ADD COLUMN IF NOT EXISTS "canvasData" JSONB
    `
    
    await prisma.$disconnect()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Canvas data column added to whiteboards table' 
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { 
        error: 'Migration failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    )
  }
}