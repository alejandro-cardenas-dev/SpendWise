#!/bin/sh
set -e

# Apply migrations on every start. Fine for a single instance; with several
# instances you would run this as a separate release step instead.
if [ "${RUN_MIGRATIONS:-1}" = "1" ]; then
  python manage.py migrate --noinput
fi

# Hand over to the real command (gunicorn). `exec` makes it PID 1 so it
# receives stop signals correctly.
exec "$@"