#!/bin/bash

# This script helps fix the database connection
echo "Current DATABASE_URL in .env:"
grep "DATABASE_URL" .env

echo ""
echo "Suggested fix:"
echo 'DATABASE_URL="postgresql://srinivas_mundlamuri@optum.com@localhost:5432/take_home_assessment?schema=public"'

echo ""
echo "Or try this simpler version:"
echo 'DATABASE_URL="postgresql://localhost:5432/take_home_assessment?schema=public"'

echo ""
echo "After updating your .env file, run:"
echo "npx prisma migrate reset"
echo "npx prisma migrate dev --name init"