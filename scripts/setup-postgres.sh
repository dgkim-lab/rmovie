#!/usr/bin/env sh
set -eu

load_database_env() {
  env_file=${ENV_FILE:-.env}
  [ -f "$env_file" ] || return 0

  while IFS= read -r line || [ -n "$line" ]; do
    case "$line" in
      ''|'#'*) continue ;;
    esac

    key=${line%%=*}
    value=${line#*=}
    case "$key" in
      POSTGRES_ADMIN_URL|RMOVIE_DB_NAME|RMOVIE_DB_USER|RMOVIE_DB_PASSWORD)
        eval "current_value=\${$key-}"
        [ -n "$current_value" ] && continue
        case "$value" in
          \"*\") value=${value#\"}; value=${value%\"} ;;
          \'*\') value=${value#\'}; value=${value%\'} ;;
        esac
        export "$key=$value"
        ;;
    esac
  done < "$env_file"
}

load_database_env

: "${POSTGRES_ADMIN_URL:=postgresql://postgres:postgres@localhost:5432/postgres}"
: "${RMOVIE_DB_NAME:=rmovie}"
: "${RMOVIE_DB_USER:=rmovie}"
: "${RMOVIE_DB_PASSWORD:?Set RMOVIE_DB_PASSWORD before running db:setup}"

command -v psql >/dev/null 2>&1 || {
  echo "psql is required. Install the PostgreSQL client first." >&2
  exit 1
}

psql "$POSTGRES_ADMIN_URL" \
  --set=ON_ERROR_STOP=1 \
  --set=app_db="$RMOVIE_DB_NAME" \
  --set=app_user="$RMOVIE_DB_USER" \
  --set=app_password="$RMOVIE_DB_PASSWORD" <<'SQL'
SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', :'app_user', :'app_password')
WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = :'app_user') \gexec

SELECT format('ALTER ROLE %I LOGIN PASSWORD %L', :'app_user', :'app_password') \gexec

SELECT format('CREATE DATABASE %I OWNER %I', :'app_db', :'app_user')
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = :'app_db') \gexec

SELECT format('ALTER DATABASE %I OWNER TO %I', :'app_db', :'app_user') \gexec
SQL

echo "Database and role are ready."
echo "Set DATABASE_URL=postgresql://${RMOVIE_DB_USER}:<password>@localhost:5432/${RMOVIE_DB_NAME}"
echo "Then run: npm run db:deploy"
