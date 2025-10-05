const { PrismaClient } = require('@prisma/client')

async function testPrismaQuery() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'], 
    datasources: {
      db: {
        url: "postgresql://postgres@localhost:5432/take_home_assessment?schema=public"
      }
    }
  })

  try {
    console.log('Testing Prisma query...')
    
    // Try to query users table
    const users = await prisma.user.findMany()
    console.log('✅ Users query successful:', users.length, 'users found')
    
    // Try to create a test user
    const testUser = await prisma.user.create({
      data: {
        username: 'prisma-test-user'
      }
    })
    console.log('✅ User creation successful:', testUser.username)
    
    // Clean up - delete the test user
    await prisma.user.delete({
      where: { id: testUser.id }
    })
    console.log('✅ User deletion successful')
    
  } catch (error) {
    console.error('❌ Prisma query failed:', error.message)
    console.error('Error code:', error.code)
    console.error('Full error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testPrismaQuery()