const { PrismaClient } = require('@prisma/client')

async function testConnection() {
  // Test with postgres user
  const prismaPostgres = new PrismaClient({
    datasources: {
      db: {
        url: "postgresql://postgres@localhost:5432/take_home_assessment?schema=public"
      }
    }
  })

  // Test with system user
  const prismaUser = new PrismaClient({
    datasources: {
      db: {
        url: "postgresql://srinivas_mundlamuri@optum.com@localhost:5432/take_home_assessment?schema=public"
      }
    }
  })

  try {
    console.log('Testing postgres user connection...')
    await prismaPostgres.$connect()
    console.log('✅ Postgres user connection works!')
    await prismaPostgres.$disconnect()
  } catch (error) {
    console.log('❌ Postgres user connection failed:', error.message)
  }

  try {
    console.log('Testing system user connection...')
    await prismaUser.$connect()
    console.log('✅ System user connection works!')
    await prismaUser.$disconnect()
  } catch (error) {
    console.log('❌ System user connection failed:', error.message)
  }
}

testConnection()