# Install Environment file
source production.env 

if [ -z "$1" ]; then
    echo "Usage: ./restore.sh <backup_file>"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "/root/socialfolio_backup/$BACKUP_FILE" ]; then
    echo "Error: Backup file /root/socialfolio_backup/$BACKUP_FILE not found!"
    exit 1
fi

echo "Restoring from $BACKUP_FILE..."

docker exec mongo_db mongosh --username $MONGO_INITDB_ROOT_USERNAME --password $MONGO_INITDB_ROOT_PASSWORD --authenticationDatabase admin --eval "db.getSiblingDB('socialfolio').dropDatabase()"

/usr/bin/docker cp "/root/socialfolio_backup/$BACKUP_FILE" "mongo_db:/$BACKUP_FILE"

# Backup MongoDB
/usr/bin/docker exec mongo_db mongorestore --username $MONGO_INITDB_ROOT_USERNAME \
 --password $MONGO_INITDB_ROOT_PASSWORD \
 --authenticationDatabase admin --nsInclude='socialfolio.*' --gzip --archive="/$BACKUP_FILE"

echo "Restore completed from $BACKUP_FILE"