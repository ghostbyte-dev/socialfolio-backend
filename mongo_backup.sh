source /root/socialfolio-backend/production.env
# Generate timestamp (format: YYYYMMDD_HHMMSS)
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

PROJECT_DIR="/root/socialfolio-backend"
# Define backup file name
MONGO_BACKUP_FILE="backup_$TIMESTAMP.dump"
PUBLIC_BACKUP_FILE="public_backup_$TIMESTAMP.tar.gz"

# Backup MongoDB
/usr/bin/docker exec mongo_db mongodump --username $MONGO_INITDB_ROOT_USERNAME \
 --password $MONGO_INITDB_ROOT_PASSWORD \
 --authenticationDatabase admin --db socialfolio --gzip --archive="/$MONGO_BACKUP_FILE"

/usr/bin/docker cp mongo_db:"/$MONGO_BACKUP_FILE" /root/socialfolio_backup/

/usr/bin/docker exec mongo_db rm "/$MONGO_BACKUP_FILE"

tar -czf /root/socialfolio_backup/$PUBLIC_BACKUP_FILE -C "$PROJECT_DIR/public" .

echo "Backup completed:"
echo "  - MongoDB: /root/socialfolio_backup/$MONGO_BACKUP_FILE"
echo "  - Public folder: /root/socialfolio_backup/$PUBLIC_BACKUP_FILE"
find /root/socialfolio_backup -type f -mtime +14 -delete
echo "remove old backup"
