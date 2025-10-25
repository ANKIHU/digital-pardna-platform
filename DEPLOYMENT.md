# AWS Deployment Guide for Digital Pardna

## 📋 Prerequisites

### Required Tools
- [AWS CLI](https://aws.amazon.com/cli/) configured with appropriate permissions
- [Terraform](https://www.terraform.io/downloads) v1.0+
- [Docker](https://www.docker.com/) for local building/testing
- [Node.js 18+](https://nodejs.org/) and [pnpm](https://pnpm.io/)

### AWS Permissions Required
- EC2, VPC, Security Groups, Subnets
- ECS, ECR (Elastic Container Registry)
- RDS (PostgreSQL), ElastiCache (Redis)
- Application Load Balancer, Route 53
- CloudWatch, SNS for monitoring
- IAM roles and policies

## 🚀 Deployment Steps

### 1. Environment Setup

```bash
# Clone the repository
git clone <repository-url>
cd digital-pardna

# Install dependencies
pnpm install

# Set up environment files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
cp .env.example .env

# Edit environment files with your configuration
# See Configuration section below for required values
```

### 2. Infrastructure Deployment

```bash
# Navigate to infrastructure directory
cd infrastructure

# Initialize Terraform
terraform init

# Plan the deployment (review what will be created)
terraform plan -var="domain_name=yourdigitalpardna.com"

# Apply the infrastructure (creates AWS resources)
terraform apply -var="domain_name=yourdigitalpardna.com"

# Note the outputs (database endpoint, ECR URLs, etc.)
terraform output
```

### 3. Container Image Building

```bash
# Return to project root
cd ..

# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <ecr-registry-url>

# Build API image
docker build -f apps/api/Dockerfile -t <ecr-api-url>:latest .
docker push <ecr-api-url>:latest

# Build Web image
docker build -f apps/web/Dockerfile -t <ecr-web-url>:latest .
docker push <ecr-web-url>:latest

# Build Keeper image
docker build -f apps/keeper/Dockerfile -t <ecr-keeper-url>:latest .
docker push <ecr-keeper-url>:latest
```

### 4. Database Setup

```bash
# Update your API .env with the RDS endpoint from Terraform outputs
# DATABASE_URL=postgresql://pardna_user:PASSWORD@RDS_ENDPOINT/digital_pardna

# Run database migrations
cd apps/api
pnpm prisma migrate deploy
pnpm seed  # Optional: Add test data
```

### 5. Domain Configuration

```bash
# Update Route 53 DNS records to point to your Load Balancer
# Get the Load Balancer DNS name from Terraform outputs

# Example DNS records:
# yourdigitalpardna.com -> ALIAS -> <alb-dns-name>
# www.yourdigitalpardna.com -> ALIAS -> <alb-dns-name>
```

### 6. SSL Certificate Setup

```bash
# Option 1: AWS Certificate Manager (Recommended)
aws acm request-certificate \
  --domain-name yourdigitalpardna.com \
  --subject-alternative-names www.yourdigitalpardna.com \
  --validation-method DNS

# Option 2: Let's Encrypt (if using custom SSL)
# Update nginx/nginx.conf with your certificate paths
# Mount certificates in docker-compose.yml
```

## ⚙️ Configuration

### Required Environment Variables

**Apps/API (.env):**
```bash
# Database
DATABASE_URL="postgresql://pardna_user:PASSWORD@RDS_ENDPOINT/digital_pardna"
REDIS_URL="redis://:PASSWORD@REDIS_ENDPOINT:6379"

# Core Services
STRIPE_SECRET_KEY="sk_live_..."  # Stripe secret key
JWT_SECRET="your-jwt-secret-key"
ENCRYPTION_KEY="your-32-char-encryption-key"

# Jamaican Services (Production Required)
TAJ_CLIENT_ID="your-taj-client-id"
TAJ_CLIENT_SECRET="your-taj-client-secret"
BOJ_API_KEY="your-boj-api-key"
NCB_CLIENT_ID="your-ncb-client-id"
NCB_CLIENT_SECRET="your-ncb-client-secret"

# Communication Services
WHATSAPP_ACCESS_TOKEN="your-whatsapp-token"
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
SENDGRID_API_KEY="your-sendgrid-key"

# Optional Services
VERIFF_API_KEY="your-veriff-key"
CREDITINFO_CLIENT_ID="your-creditinfo-id"
```

**Apps/Web (.env.local):**
```bash
# API Configuration
NEXT_PUBLIC_API_URL="https://yourdigitalpardna.com/v1"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Analytics (Optional)
NEXT_PUBLIC_GA_TRACKING_ID="G-XXXXXXXXXX"
```

**Root (.env):**
```bash
# Docker Compose Environment
POSTGRES_PASSWORD="your-secure-db-password"
REDIS_PASSWORD="your-secure-redis-password"
NEXT_PUBLIC_API_URL="https://yourdigitalpardna.com/v1"
```

### GitHub Secrets (for CI/CD)

Add these secrets to your GitHub repository:

```bash
AWS_ACCESS_KEY_ID          # AWS access key with ECS/ECR permissions
AWS_SECRET_ACCESS_KEY      # AWS secret key
SLACK_WEBHOOK              # Slack webhook for deployment notifications (optional)
```

## 🔍 Monitoring & Maintenance

### CloudWatch Dashboard
Access your monitoring dashboard:
```
https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=digital-pardna-dashboard
```

### Log Access
```bash
# API logs
aws logs tail /ecs/digital-pardna-api --follow

# Web logs  
aws logs tail /ecs/digital-pardna-web --follow

# Keeper logs
aws logs tail /ecs/digital-pardna-keeper --follow
```

### Database Backups
```bash
# Manual backup
aws rds create-db-snapshot \
  --db-instance-identifier digital-pardna-db \
  --db-snapshot-identifier digital-pardna-backup-$(date +%Y%m%d%H%M%S)

# Automated backups are configured for 7-day retention
```

### Scaling
```bash
# Scale API service
aws ecs update-service \
  --cluster digital-pardna-cluster \
  --service digital-pardna-api \
  --desired-count 4

# Scale Web service
aws ecs update-service \
  --cluster digital-pardna-cluster \
  --service digital-pardna-web \
  --desired-count 4
```

## 🛠️ Troubleshooting

### Common Issues

**ECS Task Health Check Failures:**
```bash
# Check task logs
aws ecs describe-tasks --cluster digital-pardna-cluster --tasks <task-arn>

# Check service events
aws ecs describe-services --cluster digital-pardna-cluster --services digital-pardna-api
```

**Database Connection Issues:**
```bash
# Test database connectivity
docker run --rm -it postgres:15-alpine psql "postgresql://pardna_user:PASSWORD@RDS_ENDPOINT/digital_pardna" -c "SELECT version();"
```

**Load Balancer Issues:**
```bash
# Check target group health
aws elbv2 describe-target-health --target-group-arn <target-group-arn>

# Check ALB access logs (if enabled)
aws s3 ls s3://your-alb-logs-bucket/AWSLogs/
```

### Rollback Procedure
```bash
# Rollback to previous image
aws ecs update-service \
  --cluster digital-pardna-cluster \
  --service digital-pardna-api \
  --task-definition digital-pardna-api:PREVIOUS_REVISION

# Or use GitHub Actions to deploy a previous commit
```

## 🔐 Security Best Practices

### Post-Deployment Security
- [ ] Enable AWS GuardDuty for threat detection
- [ ] Configure AWS Config for compliance monitoring
- [ ] Set up CloudTrail for audit logging
- [ ] Enable VPC Flow Logs
- [ ] Configure Web Application Firewall (WAF)
- [ ] Regular security updates and patching

### SSL/TLS Configuration
- [ ] Use strong cipher suites (configured in nginx.conf)
- [ ] Enable HSTS headers
- [ ] Regular certificate renewal
- [ ] Monitor certificate expiration

## 📊 Performance Optimization

### Database Optimization
- Monitor slow queries with CloudWatch Insights
- Configure connection pooling in the API
- Set up read replicas for scaling reads
- Regular VACUUM and ANALYZE operations

### Caching Strategy
- Redis for session storage and caching
- CloudFront CDN for static assets
- Application-level caching for API responses

### Cost Optimization
- Use Reserved Instances for predictable workloads
- Enable ECS Spot instances for non-critical tasks
- Set up billing alerts and cost monitoring
- Regular review of resource utilization

---

## 🆘 Support

For deployment issues or questions:
- Technical Documentation: See individual app README files
- Infrastructure Issues: Check Terraform state and AWS CloudWatch
- Application Issues: Check ECS service logs and health checks

**Emergency Contacts:**
- DevOps Team: devops@yourdigitalpardna.com
- Security Issues: security@yourdigitalpardna.com