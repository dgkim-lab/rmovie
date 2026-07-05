#!/usr/bin/env sh
set -eu

load_compose_database_env() {
  env_file=${ENV_FILE:-.env}
  [ -f "$env_file" ] || return 0

  while IFS= read -r line || [ -n "$line" ]; do
    case "$line" in
      ''|'#'*) continue ;;
    esac

    key=${line%%=*}
    value=${line#*=}
    case "$key" in
      RMOVIE_DB_NAME|RMOVIE_DB_USER|RMOVIE_DB_PASSWORD)
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

load_compose_database_env

: "${RMOVIE_DB_NAME:=rmovie}"
: "${RMOVIE_DB_USER:=rmovie}"
: "${RMOVIE_DB_PASSWORD:=replace-me}"

command -v docker >/dev/null 2>&1 || {
  echo "docker is required for db:studio:docker" >&2
  exit 1
}

docker compose up -d postgres
docker compose run --rm db-setup
docker compose run --rm migrate

export DATABASE_URL="postgresql://${RMOVIE_DB_USER}:${RMOVIE_DB_PASSWORD}@localhost:5432/${RMOVIE_DB_NAME}"
exec npx prisma studio
