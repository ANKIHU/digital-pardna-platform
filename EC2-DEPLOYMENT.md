# Digital Pardna EC2 Deployment Guide

## 🎯 Deployment Strategy

Since we have limited AWS permissions, we'll deploy Digital Pardna directly to your existing EC2 instance using Docker Compose. This approach gives us full control and is production-ready.

## 📋 Current Infrastructure

**AWS Account**: PardnaLink-Administration (594194992190)
**EC2 Instance**: i-0c35787ee59f83a71 (t3.small)
**Public IP**: 54.221.21.228
**VPC**: vpc-0453830bd87ac50d9
**Region**: us-east-1

## 🚀 Deployment Steps

### Step 1: Connect to Your EC2 Instance

```bash
# Connect to your EC2 instance (replace with your key file)
ssh -i your-key.pem ec2-user@54.221.21.228

# Or if using Ubuntu
ssh -i your-key.pem ubuntu@54.221.21.228
```

### Step 2: Install Docker and Docker Compose

```bash
# Update system
sudo yum update -y  # Amazon Linux
# OR
sudo apt update && sudo apt upgrade -y  # Ubuntu

# Install Docker
sudo yum install -y docker  # Amazon Linux
# OR
sudo apt install -y docker.io  # Ubuntu

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to docker group
sudo usermod -a -G docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### Step 3: Clone and Prepare Digital Pardna

```bash
# Clone the repository
git clone <your-repository-url> digital-pardna
cd digital-pardna

# Create production environment files
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
cp apps/keeper/.env.example apps/keeper/.env
```

### Step 4: Configure Environment Variables

Edit the environment files with your production values:

**`.env` (Docker Compose environment):**
```bash
# Database Configuration
POSTGRES_PASSWORD=your_secure_database_password
REDIS_PASSWORD=your_secure_redis_password

# Domain Configuration
NEXT_PUBLIC_API_URL=https://pardnalink.com/v1
DOMAIN_NAME=pardnalink.com

# SSL Configuration
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/private.key
```

**`apps/api/.env` (API Configuration):**
```bash
# Database
DATABASE_URL="postgresql://pardna_user:your_secure_database_password@postgres:5432/digital_pardna"
REDIS_URL="redis://:your_secure_redis_password@redis:6379"

# Essential API Keys (Minimum for launch)
STRIPE_SECRET_KEY="sk_live_..."
JWT_SECRET="your-super-secret-jwt-key"
ENCRYPTION_KEY="your-32-character-encryption-key"

# Jamaican Services (Required for full functionality)
TAJ_CLIENT_ID="your-taj-client-id"
TAJ_CLIENT_SECRET="your-taj-client-secret"
BOJ_API_KEY="your-boj-api-key"
NCB_CLIENT_ID="your-ncb-client-id"
NCB_CLIENT_SECRET="your-ncb-client-secret"

# Communication APIs
WHATSAPP_ACCESS_TOKEN="your-whatsapp-token"
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
SENDGRID_API_KEY="your-sendgrid-key"

# Other required variables...
```

**`apps/web/.env.local` (Frontend Configuration):**
```bash
NEXT_PUBLIC_API_URL="https://pardnalink.com/v1"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
```

### Step 5: Create Production Nginx Configuration

```bash
# Create nginx directory
mkdir -p nginx

# Create nginx configuration
cat > nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream web {
        server web:3000;
    }
    
    upstream api {
        server api:4000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=web:10m rate=30r/s;

    server {
        listen 80;
        server_name pardnalink.com www.pardnalink.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name pardnalink.com www.pardnalink.com;

        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_private_key /etc/nginx/ssl/private.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # Security Headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

        # API routes
        location /v1/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_timeout 60s;
        }

        # Web application
        location / {
            limit_req zone=web burst=50 nodelay;
            proxy_pass http://web;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_timeout 60s;
        }
    }
}
EOF
```

### Step 6: Set Up SSL Certificates

**Option A: Let's Encrypt (Recommended)**
```bash
# Install certbot
sudo yum install -y certbot  # Amazon Linux
# OR
sudo apt install -y certbot  # Ubuntu

# Get SSL certificate
sudo certbot certonly --standalone -d pardnalink.com -d www.pardnalink.com

# Create nginx SSL directory
sudo mkdir -p nginx/ssl

# Copy certificates to nginx directory
sudo cp /etc/letsencrypt/live/pardnalink.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/pardnalink.com/privkey.pem nginx/ssl/private.key
sudo chown -R $USER:$USER nginx/ssl
```

**Option B: Self-Signed (Development)**
```bash
# Create self-signed certificates
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/private.key \
  -out nginx/ssl/cert.pem \
  -subj "/C=JM/ST=Kingston/L=Kingston/O=PardnaLink/CN=pardnalink.com"
```

### Step 7: Deploy the Application

```bash
# Build and start the services
docker-compose up -d --build

# Check if services are running
docker-compose ps

# View logs
docker-compose logs -f api
docker-compose logs -f web
docker-compose logs -f nginx
```

### Step 8: Initialize the Database

```bash
# Run database migrations
docker-compose exec api npx prisma migrate deploy

# Seed the database (optional)
docker-compose exec api npx prisma db seed
```

### Step 9: Configure Domain DNS

Update your domain DNS settings to point to your EC2 instance:

```
Type: A
Name: @
Value: 54.221.21.228
TTL: 300

Type: A
Name: www
Value: 54.221.21.228
TTL: 300
```

## 🔍 Verification & Testing

### Health Checks
```bash
# Test API health
curl https://pardnalink.com/v1/health

# Test web health
curl https://pardnalink.com/api/health

# Check service status
docker-compose ps
```

### Monitoring
```bash
# Monitor logs
docker-compose logs -f

# Monitor resource usage
docker stats

# Check disk space
df -h
```

## 🔧 Maintenance Commands

### Updates
```bash
# Pull latest code
git pull origin main

# Rebuild and restart services
docker-compose up -d --build

# Restart specific service
docker-compose restart api
```

### Backups
```bash
# Backup database
docker-compose exec postgres pg_dump -U pardna_user digital_pardna > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup environment files
tar -czf config_backup_$(date +%Y%m%d_%H%M%S).tar.gz .env apps/api/.env apps/web/.env.local nginx/ssl/
```

### SSL Certificate Renewal
```bash
# Renew Let's Encrypt certificates
sudo certbot renew

# Update nginx certificates
sudo cp /etc/letsencrypt/live/pardnalink.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/pardnalink.com/privkey.pem nginx/ssl/private.key

# Restart nginx
docker-compose restart nginx
```

## 🚨 Troubleshooting

### Common Issues

**Service won't start:**
```bash
docker-compose logs service-name
docker-compose exec service-name sh  # Debug inside container
```

**Database connection issues:**
```bash
docker-compose exec postgres psql -U pardna_user -d digital_pardna
```

**Permission issues:**
```bash
sudo chown -R $USER:$USER /path/to/directory
```

**Port conflicts:**
```bash
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
```

## 📊 Performance Optimization

### Monitoring Setup
```bash
# Install monitoring tools
docker run -d --name=node_exporter --net="host" prom/node-exporter
docker run -d --name=cadvisor --net="host" google/cadvisor
```

### Scaling Options
```bash
# Scale specific services
docker-compose up -d --scale api=2 --scale web=2

# Load balancing with nginx
# (Update nginx.conf to include multiple upstream servers)
```

---

## ✅ Deployment Complete!

Your Digital Pardna platform should now be running at:
- **Web App**: https://pardnalink.com
- **API**: https://pardnalink.com/v1
- **Health Checks**: https://pardnalink.com/v1/health

The platform includes:
- ✅ Full payment processing (Stripe + Jamaican banking)
- ✅ KYC verification and compliance reporting
- ✅ Multi-channel communication (WhatsApp, SMS, Email)
- ✅ Real-time pardna circle management
- ✅ Production security and monitoring

**Next Steps**: Configure your API keys, test the payment flows, and onboard your first users!