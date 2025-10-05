#!/bin/bash

echo "Current DATABASE_URL:"
grep "DATABASE_URL" .env

echo ""
echo "The issue: No username specified in the connection string"
echo ""
echo "Try one of these connection strings in your .env file:"
echo ""
echo "Option 1 (with your current user):"
echo 'DATABASE_URL="postgresql://srinivas_mundlamuri%40optum.com@localhost:5432/take_home_assessment?schema=public"'
echo ""
echo "Option 2 (using postgres user):"
echo 'DATABASE_URL="postgresql://postgres@localhost:5432/take_home_assessment?schema=public"'
echo ""
echo "Note: %40 is the URL-encoded version of @ symbol"