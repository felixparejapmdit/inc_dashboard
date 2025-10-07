#!/bin/sh

# Wait for the MySQL service to be ready
# Use the internal container port, which is 3306
until mysql -h"db" -P"3306" -u"portal_dev" -p"M@sunur1n" -e "SELECT 1;" > /dev/null 2>&1; do
  echo "Database is not yet ready. Waiting..."
  sleep 2
done

echo "Database is ready! Starting the backend..."
# The final command to start your Node.js application
exec npm start