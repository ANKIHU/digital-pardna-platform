# Start PardnaLink Server

## On EC2 Server:
```bash
cd /home/ec2-user/digital-pardna-platform/backend
pm2 start dist/index.js --name "pardnalink-api"
# OR
node dist/index.js
```

## Check if running:
```bash
pm2 status
# OR
curl http://localhost:3001/v1/health
```

## Then run tests from your local machine:
```bash
cd /Users/macbookair/Downloads/digital-pardna/testing
./customer-tests.sh
./corporate-tests.sh
./third-party-tests.sh
```

The server must be running on port 3001 before tests can work.