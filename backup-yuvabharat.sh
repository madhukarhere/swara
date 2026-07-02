#!/bin/bash
# Daily backup of the yuvabharat SQL Server database (running in the `sqlserver` Docker container).
# Backups are written to the host folder mounted at the container's /var/opt/mssql/backup.
set -euo pipefail

CONTAINER="sqlserver"
DB="yuvabharat"
SA_PASS="SwaraDev@2026"
HOST_BACKUP_DIR="/Users/madhukarmudunuru/work/RND/swara/backup"
RETENTION_DAYS=14

TS=$(date +%Y%m%d_%H%M%S)
BAK_FILE="${DB}_FULL_${TS}.bak"

# Make sure the container is up; start it if it isn't.
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
  docker start "${CONTAINER}"
  sleep 10
fi

docker exec "${CONTAINER}" /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "${SA_PASS}" -C \
  -Q "BACKUP DATABASE [${DB}] TO DISK='/var/opt/mssql/backup/${BAK_FILE}' WITH FORMAT, INIT, COMPRESSION, STATS=10;"

echo "$(date '+%Y-%m-%d %H:%M:%S') Backup written: ${HOST_BACKUP_DIR}/${BAK_FILE}"

# Prune old yuvabharat backups (keep last RETENTION_DAYS days).
find "${HOST_BACKUP_DIR}" -name "${DB}_FULL_*.bak" -type f -mtime +${RETENTION_DAYS} -print -delete
