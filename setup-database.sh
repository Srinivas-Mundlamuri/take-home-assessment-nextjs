#!/bin/bash

echo "🔧 Setting up database and environment for Take Home Assessment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << 'EOF'
# Database
DATABASE_URL="postgresql://postgres@localhost:5432/take_home_assessment?schema=public"

# NextAuth Configuration (Optional - we use custom JWT auth)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key-change-this-in-production"

# JWT Secret
JWT_SECRET="your-jwt-secret-key-change-this-in-production-too"
EOF
    echo "✅ .env file created!"
else
    echo "⚠️  .env file already exists. Please make sure DATABASE_URL is set correctly:"
    echo "DATABASE_URL=\"postgresql://postgres@localhost:5432/take_home_assessment?schema=public\""
fi

# Test database connection
echo ""
echo "🔍 Testing database connection..."
node test-db.js

echo ""
echo "🗄️  Generating Prisma client..."
npx prisma generate

echo ""
echo "🚀 Running database migrations..."
npx prisma migrate dev --name init

echo ""
echo "✅ Database setup complete! You can now run:"
echo "   npm run dev"