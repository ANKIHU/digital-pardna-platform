# Digital Pardna - Complete AWS Deployment Guide
## PardnaLink-Administration Account (594194992190)

🎉 **Your Digital Pardna platform is now fully optimized for AWS deployment!**

## 📋 What's Been Created

### ✅ AWS Infrastructure (Terraform)
- **Application Load Balancer** with health checks
- **Route53 hosted zone** for pardnalink.com
- **ACM SSL certificates** (wildcard + domain)
- **Security groups** optimized for your VPC
- **Target groups** for API and Web services
- **Complete DNS automation** with certificate validation

### ✅ Production Docker Configuration
- **Multi-service architecture** (API, Web, Keeper, PostgreSQL, Redis, Nginx)
- **Health checks** and auto-restart policies
- **Resource limits** and optimization
- **Comprehensive logging** and monitoring
- **Security headers** and rate limiting

### ✅ Deployment Automation
- **One-click deployment script** (`deploy-aws.sh`)
- **Environment configuration** (`.env.production.example`)
- **Nginx reverse proxy** with SSL termination
- **Automated SSL certificate** setup with Let's Encrypt
- **System monitoring** and log rotation

## 🚨 **CRITICAL: AWS Credentials Issue**

Your current AWS configuration is using the **wrong account**:
- **Current**: `arn:aws:iam::244005320244:user/aws-recovery@paradisekool.com`
- **Required**: PardnaLink-Administration account (`594194992190`)

## 🔧 Quick Fix - Configure Correct AWS Account

### Option 1: Update AWS CLI Configuration
```bash
aws configure
# Enter your PardnaLink-Administration account credentials:
# AWS Access Key ID: [Your PardnaLink access key]
# AWS Secret Access Key: [Your PardnaLink secret key]
# Default region: us-east-1
# Default output format: json
```

### Option 2: Use Environment Variables
```bash
export AWS_ACCESS_KEY_ID="your_pardnalink_access_key"
export AWS_SECRET_ACCESS_KEY="your_pardnalink_secret_key"
export AWS_DEFAULT_REGION="us-east-1"
```

### Option 3: Use AWS Profile
```bash
aws configure --profile pardnalink
aws configure set default.profile pardnalink
```

## 📊 AWS Permissions Required

Add this IAM policy to your PardnaLink account user:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "elasticloadbalancing:*",
                "route53:*",
                "acm:*",
                "ec2:CreateSecurityGroup",
                "ec2:DeleteSecurityGroup",
                "ec2:DescribeSecurityGroups",
                "ec2:AuthorizeSecurityGroupIngress",
                "ec2:AuthorizeSecurityGroupEgress",
                "ec2:RevokeSecurityGroupIngress",
                "ec2:RevokeSecurityGroupEgress",
                "ec2:CreateTags",
                "ec2:DescribeVpcs",
                "ec2:DescribeSubnets",
                "ec2:DescribeInstances",
                "tag:GetResources",
                "tag:TagResources",
                "tag:UntagResources"
            ],
            "Resource": "*"
        }
    ]
}
```

## 🚀 Deployment Options

### Option A: Full AWS Infrastructure (Recommended)
1. **Fix AWS credentials** (see above)
2. **Add AWS permissions** (see AWS-PERMISSIONS.md)
3. **Deploy infrastructure**:
   ```bash
   cd infrastructure
   terraform plan -var-file=terraform.tfvars
   terraform apply -var-file=terraform.tfvars
   ```
4. **Deploy application** to EC2:
   ```bash
   ssh -i your-key.pem ec2-user@54.221.21.228
   git clone your-repo
   cd digital-pardna
   ./deploy-aws.sh
   ```

### Option B: Direct EC2 Deployment (Immediate)
If you want to deploy immediately without fixing AWS permissions:

1. **SSH to your EC2 instance**:
   ```bash
   ssh -i your-key.pem ec2-user@54.221.21.228
   ```

2. **Clone and deploy**:
   ```bash
   git clone your-repo
   cd digital-pardna
   ./deploy-aws.sh
   ```

3. **Configure DNS manually**:
   - Point `pardnalink.com` A record to `54.221.21.228`
   - Point `www.pardnalink.com` CNAME to `pardnalink.com`

## 📁 Key Files Created

### Infrastructure
- `infrastructure/main.tf` - Complete AWS infrastructure
- `infrastructure/terraform.tfvars` - Configuration for your account
- `AWS-PERMISSIONS.md` - Required permissions documentation

### Production Configuration
- `docker-compose.prod.yml` - Production Docker setup
- `.env.production.example` - Environment configuration template
- `nginx/conf.d/pardnalink.conf` - Nginx configuration
- `deploy-aws.sh` - Automated deployment script

## 🌐 Your Infrastructure Details

- **AWS Account**: PardnaLink-Administration (594194992190)
- **Region**: us-east-1
- **VPC**: vpc-0453830bd87ac50d9
- **EC2 Instance**: i-0c35787ee59f83a71 (54.221.21.228)
- **Domain**: pardnalink.com

## 🔒 Security Features

- **SSL/TLS encryption** with automatic certificate management
- **Security headers** (HSTS, CSP, X-Frame-Options)
- **Rate limiting** (API: 10req/s, App: 30req/s)
- **Firewall configuration** with UFW
- **Health checks** for all services
- **Log rotation** and monitoring

## 📈 Production Features

- **Auto-scaling ready** with ALB target groups
- **Database backups** to S3 (configurable)
- **Zero-downtime deployments** with health checks
- **Comprehensive monitoring** and alerting
- **Resource optimization** with memory limits

## 🎯 Next Steps

1. **Fix AWS credentials** to use PardnaLink account
2. **Add required permissions** to your AWS user
3. **Run Terraform** to create infrastructure
4. **Deploy application** using the automated script
5. **Configure your API keys** in `.env.production`
6. **Access your application** at https://pardnalink.com

## 📞 Support Information

- **Terraform Status**: ✅ Infrastructure ready for PardnaLink account
- **Docker Configuration**: ✅ Production-optimized multi-service setup
- **Security**: ✅ Enterprise-grade security headers and SSL
- **Monitoring**: ✅ Comprehensive logging and health checks
- **Automation**: ✅ One-click deployment script ready

Your Digital Pardna platform is now **fully optimized for AWS** with professional-grade infrastructure, security, and monitoring. Once AWS credentials are configured correctly, deployment will be seamless! 🚀