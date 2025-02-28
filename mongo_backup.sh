source production.env

# Generate timestamp (format: YYYYMMDD_HHMMSS)
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Define backup file name
BACKUP_FILE="backup_$TIMESTAMP.dump"

# Backup MongoDB
/usr/bin/docker exec mongo_db mongodump --username $MONGO_INITDB_ROOT_USERNAME \
 --password $MONGO_INITDB_ROOT_PASSWORD \
 --authenticationDatabase admin --db socialfolio --gzip --archive="/$BACKUP_FILE"

/usr/bin/docker cp mongo_db:"/$BACKUP_FILE" /root/socialfolio_backup/

/usr/bin/docker exec mongo_db rm "/$BACKUP_FILE"

echo "Backup completed: /root/socialfolio_backup/$BACKUP_FILE"

