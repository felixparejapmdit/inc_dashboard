#!/bin/sh
set -e

echo "⏳ Waiting for MySQL at $MYSQL_HOST:$MYSQL_PORT..."
until nc -z -v -w30 $MYSQL_HOST $MYSQL_PORT; do
  echo "❌ Waiting for MySQL..."
  sleep 2
done

echo "✅ MySQL is up - starting backend"
exec npm start
