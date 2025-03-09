# Install Environment file
source production.env 

if [ -z "$1" ]; then
    echo "Usage: ./restore.sh <backup_file> [public_backup_file]"
    exit 1
fi

MONGO_BACKUP_FILE="$1"
PUBLIC_BACKUP_FILE="$2"

if [ ! -f "/root/socialfolio_backup/$MONGO_BACKUP_FILE" ]; then
    echo "Error: Backup file /root/socialfolio_backup/$BACKUP_FILE not found!"
    exit 1
fi

echo "Restoring from $MONGO_BACKUP_FILE..."

docker exec mongo_db mongosh --username $MONGO_INITDB_ROOT_USERNAME --password $MONGO_INITDB_ROOT_PASSWORD --authenticationDatabase admin --eval "db.getSiblingDB('socialfolio').dropDatabase()"

/usr/bin/docker cp "/root/socialfolio_backup/$MONGO_BACKUP_FILE" "mongo_db:/$MONGO_BACKUP_FILE"

# Backup MongoDB
/usr/bin/docker exec mongo_db mongorestore --username $MONGO_INITDB_ROOT_USERNAME \
 --password $MONGO_INITDB_ROOT_PASSWORD \
 --authenticationDatabase admin --nsInclude='socialfolio.*' --gzip --archive="/$MONGO_BACKUP_FILE"

echo "Restore completed from $MONGO_BACKUP_FILE"

if [ -n "$PUBLIC_BACKUP_FILE" ]; then
    if [ ! -f "/root/socialfolio_backup/$PUBLIC_BACKUP_FILE" ]; then
        echo "Error: Public folder backup file /root/socialfolio_backup/$PUBLIC_BACKUP_FILE not found!"
        exit 1
    fi

    echo "Restoring public folder from $PUBLIC_BACKUP_FILE..."
    
    tar -xzf "/root/socialfolio_backup/$PUBLIC_BACKUP_FILE" -C /path/to/socialfolio/public
    
    echo "Public folder restore completed from $PUBLIC_BACKUP_FILE"
fi

echo "Restore process completed successfully."
