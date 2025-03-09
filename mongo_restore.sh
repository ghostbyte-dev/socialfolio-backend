# Install Environment file
source production.env 

BACKUP_DIR="/root/socialfolio_backup"
PROJECT_DIR="/root/socialfolio-backend"

if [ -z "$1" ]; then
    echo "Usage: ./restore.sh <backup_file> [public_backup_file]"
    exit 1
fi

MONGO_BACKUP_FILE="$1"
PUBLIC_BACKUP_FILE="$2"

if [ ! -f "$BACKUP_DIR/$MONGO_BACKUP_FILE" ]; then
    echo "Error: Backup file $BACKUP_DIR/$BACKUP_FILE not found!"
    exit 1
fi

echo "Restoring from $MONGO_BACKUP_FILE..."

docker exec mongo_db mongosh --username $MONGO_INITDB_ROOT_USERNAME --password $MONGO_INITDB_ROOT_PASSWORD --authenticationDatabase admin --eval "db.getSiblingDB('socialfolio').dropDatabase()"

/usr/bin/docker cp "$BACKUP_DIR/$MONGO_BACKUP_FILE" "mongo_db:/$MONGO_BACKUP_FILE"

# Backup MongoDB
/usr/bin/docker exec mongo_db mongorestore --username $MONGO_INITDB_ROOT_USERNAME \
 --password $MONGO_INITDB_ROOT_PASSWORD \
 --authenticationDatabase admin --nsInclude='socialfolio.*' --gzip --archive="/$MONGO_BACKUP_FILE"

echo "Restore completed from $MONGO_BACKUP_FILE"

if [ -n "$PUBLIC_BACKUP_FILE" ]; then
    if [ ! -f "$BACKUP_DIR/$PUBLIC_BACKUP_FILE" ]; then
        echo "Error: Public folder backup file $BACKUP_DIR/$PUBLIC_BACKUP_FILE not found!"
        exit 1
    fi

    echo "Restoring public folder from $PUBLIC_BACKUP_FILE..."
    
    tar -xzf "$BACKUP_DIR/$PUBLIC_BACKUP_FILE" -C "$PROJECT_DIR/public"
    
    echo "Public folder restore completed from $PUBLIC_BACKUP_FILE"
fi

echo "Restore process completed successfully."
