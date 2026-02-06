#!/bin/sh

# Set defaults if env vars are missing
DB_HOST=${MYSQL_HOST:-db}
DB_PORT=${MYSQL_PORT:-3306}
DB_USER=${MYSQL_USER:-portal_dev}
DB_PASS=${MYSQL_PASSWORD:-M@sunur1n}

echo "Waiting for database at $DB_HOST:$DB_PORT..."

# Wait for the MySQL service to be ready
until mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" -e "SELECT 1;" > /dev/null 2>&1; do
  echo "Database is not yet ready. Waiting..."
  sleep 2
done

echo "Database is ready! Starting the backend..."
# The final command to start your Node.js application
exec npm start