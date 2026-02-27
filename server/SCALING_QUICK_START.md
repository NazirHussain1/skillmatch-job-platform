# Horizontal Scaling Quick Start Guide

## Prerequisites

### 1. MongoDB Replica Set
Transactions require MongoDB to run as a replica set.

```bash
# Local development - convert standalone to replica set
mongod --replSet rs0

# In mongo shell
rs.initiate()
```

### 2. Redis Server
Required for horizontal scaling.

```bash
# Install Redis
# macOS
brew install redis

# Ubuntu/Debian
sudo apt-get install redis-server

# Start Redis
redis-server
```

### 3. Install Dependencies
```bash
cd server
npm install
```

## Configuration

### Environment Variables
```env
# MongoDB (must be replica set for transactions)
MONGODB_URI=mongodb://localhost:27017/skillmatch?replicaSet=rs0

# Redis (required for scaling)
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_secret_key_min_32_characters
JWT_EXPIRE=15m
JWT_REFRESH_SECRET=your_refresh_secret_key_min_32_characters
JWT_REFRESH_EXPIRE=7d

# Other configs...
```

## Single Server Deployment

```bash
# Start the server
npm start
```

Server runs on port 5000 by default.

## Multi-Server Deployment

### Option 1: Manual (Development)

```bash
# Terminal 1 - Server 1
PORT=5001 npm start

# Terminal 2 - Server 2
PORT=5002 npm start

# Terminal 3 - Server 3
PORT=5003 npm start
```

### Option 2: PM2 (Production)

```bash
# Install PM2
npm install -g pm2

# Create ecosystem.config.js
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'skillmatch-1',
      script: 'src/server.js',
      env: { PORT: 5001 }
    },
    {
      name: 'skillmatch-2',
      script: 'src/server.js',
      env: { PORT: 5002 }
    },
    {
      name: 'skillmatch-3',
      script: 'src/server.js',
      env: { PORT: 5003 }
    }
  ]
};
EOF

# Start all instances
pm2 start ecosystem.config.js

# Monitor
pm2 monit

# Logs
pm2 logs
```

### Option 3: Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  mongodb:
    image: mongo:7
    command: mongod --replSet rs0
    ports:
      - "27017:27017"

  app1:
    build: .
    environment:
      - PORT=5001
      - REDIS_URL=redis://redis:6379
      - MONGODB_URI=mongodb://mongodb:27017/skillmatch?replicaSet=rs0
    depends_on:
      - redis
      - mongodb

  app2:
    build: .
    environment:
      - PORT=5002
      - REDIS_URL=redis://redis:6379
      - MONGODB_URI=mongodb://mongodb:27017/skillmatch?replicaSet=rs0
    depends_on:
      - redis
      - mongodb

  app3:
    build: .
    environment:
      - PORT=5003
      - REDIS_URL=redis://redis:6379
      - MONGODB_URI=mongodb://mongodb:27017/skillmatch?replicaSet=rs0
    depends_on:
      - redis
      - mongodb

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - app1
      - app2
      - app3
```

## Load Balancer Configuration

### Nginx

```nginx
# nginx.conf
upstream backend {
    least_conn;  # or ip_hash, or round_robin
    server app1:5001;
    server app2:5002;
    server app3:5003;
}

server {
    listen 80;

    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # WebSocket support for Socket.IO
    location /socket.io/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### HAProxy

```
# haproxy.cfg
frontend http_front
    bind *:80
    default_backend http_back

backend http_back
    balance roundrobin
    option httpchk GET /health/live
    server server1 app1:5001 check
    server server2 app2:5002 check
    server server3 app3:5003 check
```

## Verification

### 1. Check Health
```bash
# Check each server
curl http://localhost:5001/health/ready
curl http://localhost:5002/health/ready
curl http://localhost:5003/health/ready
```

### 2. Test Load Balancing
```bash
# Through load balancer
for i in {1..10}; do
  curl http://localhost/health/live
done
```

### 3. Test Socket.IO
```bash
# Connect to different servers
# Should receive events from any server
```

### 4. Test Rate Limiting
```bash
# Should work across all servers
for i in {1..100}; do
  curl http://localhost/api/jobs
done
```

### 5. Test Token Blacklist
```bash
# Login on server 1
TOKEN=$(curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.data.token')

# Logout on server 2
curl -X POST http://localhost:5002/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"

# Try to use token on server 3 (should fail)
curl http://localhost:5003/api/users/me \
  -H "Authorization: Bearer $TOKEN"
```

## Monitoring

### Check Connected Servers
```bash
# Redis CLI
redis-cli

# Check Socket.IO adapter keys
KEYS socket.io*

# Check rate limiter keys
KEYS rl:*

# Check token blacklist
KEYS blacklist:*
```

### Monitor Logs
```bash
# PM2
pm2 logs

# Docker
docker-compose logs -f

# Check for Redis adapter messages
grep "Redis adapter" logs/combined.log
```

## Troubleshooting

### Issue: Transactions Fail
```
Error: Transaction numbers are only allowed on a replica set member
```
**Solution**: Ensure MongoDB is running as replica set
```bash
mongod --replSet rs0
# In mongo shell: rs.initiate()
```

### Issue: Socket.IO Events Not Received
```
Warning: Socket.IO running without Redis adapter
```
**Solution**: Check Redis connection
```bash
redis-cli ping  # Should return PONG
```

### Issue: Rate Limiting Not Working Across Servers
```
Rate limiter using memory store
```
**Solution**: Verify Redis URL in environment
```bash
echo $REDIS_URL
# Should be: redis://localhost:6379
```

### Issue: Token Blacklist Not Working
```
Token not blacklisted across servers
```
**Solution**: Check Redis connection and logs
```bash
# Check Redis
redis-cli
KEYS blacklist:*

# Check logs
grep "blacklist" logs/combined.log
```

## Performance Tuning

### Redis Connection Pool
```javascript
// config/redis.js
const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
  connectionName: 'skillmatch-api'
});
```

### MongoDB Connection Pool
```javascript
// config/database.js
mongoose.connect(uri, {
  maxPoolSize: 10,
  minPoolSize: 2,
  socketTimeoutMS: 45000
});
```

### PM2 Cluster Mode
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'skillmatch',
    script: 'src/server.js',
    instances: 'max',  // Use all CPU cores
    exec_mode: 'cluster'
  }]
};
```

## Scaling Checklist

- ✅ MongoDB running as replica set
- ✅ Redis server running and accessible
- ✅ REDIS_URL configured in environment
- ✅ Load balancer configured
- ✅ Health checks enabled
- ✅ Monitoring setup
- ✅ Logs aggregated
- ✅ No sticky sessions required
- ✅ All servers identical
- ✅ Stateless architecture verified

## Next Steps

1. Set up monitoring (Prometheus + Grafana)
2. Configure log aggregation (ELK stack)
3. Set up alerts for critical metrics
4. Implement auto-scaling (Kubernetes HPA)
5. Add CDN for static assets
6. Configure database read replicas
7. Set up Redis Cluster for HA

## Resources

- [MongoDB Replica Set](https://docs.mongodb.com/manual/replication/)
- [Redis Cluster](https://redis.io/topics/cluster-tutorial)
- [Socket.IO Redis Adapter](https://socket.io/docs/v4/redis-adapter/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Load Balancing](https://nginx.org/en/docs/http/load_balancing.html)
