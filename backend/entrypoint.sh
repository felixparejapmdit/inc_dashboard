#!/bin/sh

# Set defaults if env vars are missing
DB_HOST=${MYSQL_HOST:-db}
DB_PORT=${MYSQL_PORT:-3306}
DB_USER=${MYSQL_USER:-portal_dev}
DB_PASS=${MYSQL_PASSWORD:-M@sunur1n}

echo "Waiting for database at $DB_HOST:$DB_PORT..."

until mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" -e "SELECT 1;"; do
  echo "Database is not yet ready. Retrying in 2 seconds..."
  sleep 2
done

echo "Database is ready! Starting the backend..."

apply_file_organizer_schema() {
  if [ "${APPLY_FILE_ORGANIZER_SCHEMA:-true}" = "false" ]; then
    echo "Skipping File Organizer schema bootstrap."
    return 0
  fi

  SCHEMA_SCRIPT="/usr/src/app/directus/scripts/apply-file-organizer-schema.js"
  if [ ! -f "$SCHEMA_SCRIPT" ]; then
    echo "File Organizer schema script not found at $SCHEMA_SCRIPT. Skipping bootstrap."
    return 0
  fi

  MAX_ATTEMPTS=${FILE_ORGANIZER_SCHEMA_RETRIES:-24}
  RETRY_DELAY=${FILE_ORGANIZER_SCHEMA_RETRY_DELAY:-5}
  ATTEMPT=1

  echo "Applying File Organizer schema..."
  while [ "$ATTEMPT" -le "$MAX_ATTEMPTS" ]; do
    if node "$SCHEMA_SCRIPT"; then
      echo "File Organizer schema applied successfully."
      return 0
    fi

    if [ "$ATTEMPT" -lt "$MAX_ATTEMPTS" ]; then
      echo "File Organizer schema bootstrap failed (attempt $ATTEMPT/$MAX_ATTEMPTS). Retrying in ${RETRY_DELAY}s..."
      sleep "$RETRY_DELAY"
    fi

    ATTEMPT=$((ATTEMPT + 1))
  done

  echo "Warning: File Organizer schema bootstrap could not be completed after ${MAX_ATTEMPTS} attempts."
  return 1
}

apply_file_organizer_schema || true

# The final command to start your Node.js application
exec npm start
