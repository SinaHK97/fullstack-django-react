#!/bin/sh
set -e

# Wait for database if needed (basic retry)
if [ -n "$DB_HOST" ]; then
  echo "Waiting for database at $DB_HOST:$DB_PORT..."
  for i in 1 2 3 4 5 6 7 8 9 10; do
    nc -z "$DB_HOST" "${DB_PORT:-5432}" && break
    echo "Database not ready yet, retry $i..."
    sleep 2
  done
fi

python manage.py migrate --noinput

python manage.py loaddata user/fixtures/users.json
python manage.py loaddata delivery/fixtures/routes.json
python manage.py loaddata delivery/fixtures/orders.json


exec "$@" 