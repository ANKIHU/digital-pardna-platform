#!/bin/bash

# Digital Pardna AWS Deployment Script
# PardnaLink-Administration Account: 594194992190
# EC2 Instance: i-0c35787ee59f83a71

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="digital-pardna"
DOMAIN="pardnalink.com"
EC2_IP="54.221.21.228"
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID="594194992190"

echo -e "${BLUE}🚀 Digital Pardna AWS Deployment Script${NC}"
echo -e "${BLUE}Account: PardnaLink-Administration (${AWS_ACCOUNT_ID})${NC}"
echo -e "${BLUE}Domain: ${DOMAIN}${NC}"
echo ""

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if running on EC2 instance
check_environment() {
    print_info "Checking deployment environment..."
    
    if [ ! -f /sys/hypervisor/uuid ] || [ "$(head -c 3 /sys/hypervisor/uuid)" != "ec2" ]; then
        print_warning "This script is designed to run on your EC2 instance"
        print_info "Current environment: $(uname -a)"
    else
        print_status "Running on EC2 instance"
    fi
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_status "Docker and Docker Compose are available"
}

# Setup project directories
setup_directories() {
    print_info "Setting up project directories..."
    
    sudo mkdir -p /opt/pardna/{data,backups,logs,ssl}
    sudo mkdir -p /opt/pardna/data/{postgres,redis}
    sudo mkdir -p /opt/pardna/logs/{nginx,api,web,keeper}
    
    # Set permissions
    sudo chown -R $USER:$USER /opt/pardna
    chmod -R 755 /opt/pardna
    
    print_status "Directories created at /opt/pardna"
}

# Install dependencies
install_dependencies() {
    print_info "Installing system dependencies..."
    
    # Update package list
    sudo apt-get update
    
    # Install required packages
    sudo apt-get install -y \
        nginx \
        certbot \
        python3-certbot-nginx \
        curl \
        jq \
        htop \
        ufw \
        fail2ban
    
    print_status "System dependencies installed"
}

# Configure firewall
configure_firewall() {
    print_info "Configuring firewall..."
    
    # Enable UFW
    sudo ufw --force enable
    
    # Allow SSH
    sudo ufw allow ssh
    
    # Allow HTTP and HTTPS
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    
    # Allow application ports (for direct access during setup)
    sudo ufw allow 3000/tcp
    sudo ufw allow 4000/tcp
    
    print_status "Firewall configured"
}

# Setup SSL certificates
setup_ssl() {
    print_info "Setting up SSL certificates for ${DOMAIN}..."
    
    # Stop nginx if running
    sudo systemctl stop nginx 2>/dev/null || true
    
    # Get SSL certificate
    sudo certbot certonly --standalone \
        --non-interactive \
        --agree-tos \
        --email admin@${DOMAIN} \
        -d ${DOMAIN} \
        -d www.${DOMAIN}
    
    # Copy certificates to project directory
    sudo cp /etc/letsencrypt/live/${DOMAIN}/fullchain.pem /opt/pardna/ssl/${DOMAIN}.crt
    sudo cp /etc/letsencrypt/live/${DOMAIN}/privkey.pem /opt/pardna/ssl/${DOMAIN}.key
    sudo chown $USER:$USER /opt/pardna/ssl/*
    
    print_status "SSL certificates configured"
}

# Generate environment file
generate_env_file() {
    print_info "Generating production environment file..."
    
    if [ ! -f .env.production ]; then
        cp .env.production.example .env.production
        
        # Generate secure passwords
        DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
        REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
        JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
        SESSION_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
        
        # Update environment file
        sed -i "s/your_secure_postgres_password_32_chars_min/${DB_PASSWORD}/" .env.production
        sed -i "s/your_secure_redis_password_32_chars_min/${REDIS_PASSWORD}/" .env.production
        sed -i "s/your_jwt_secret_64_chars_minimum_for_production_security/${JWT_SECRET}/" .env.production
        sed -i "s/your_session_secret_64_chars_minimum/${SESSION_SECRET}/" .env.production
        sed -i "s|/opt/pardna/data|/opt/pardna/data|" .env.production
        
        print_status "Environment file generated at .env.production"
        print_warning "Please edit .env.production and add your API keys before continuing"
        print_info "Required API keys: Stripe, Banking APIs, KYC services, Communication services"
        
        read -p "Press Enter after you've configured the API keys in .env.production..."
    else
        print_status "Environment file already exists"
    fi
}

# Deploy with Docker Compose
deploy_application() {
    print_info "Deploying Digital Pardna application..."
    
    # Stop any existing containers
    docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
    
    # Build and start services
    docker-compose -f docker-compose.prod.yml up -d --build
    
    # Wait for services to be healthy
    print_info "Waiting for services to be healthy..."
    sleep 30
    
    # Check service health
    if docker-compose -f docker-compose.prod.yml ps | grep -q "Up (healthy)"; then
        print_status "Application deployed successfully"
    else
        print_error "Some services may not be healthy. Check with: docker-compose -f docker-compose.prod.yml ps"
    fi
}

# Setup database
setup_database() {
    print_info "Setting up database..."
    
    # Wait for PostgreSQL to be ready
    sleep 10
    
    # Run database migrations
    docker-compose -f docker-compose.prod.yml exec -T api npm run prisma:push
    
    # Seed initial data (optional)
    read -p "Do you want to seed the database with sample data? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose -f docker-compose.prod.yml exec -T api npm run seed
        print_status "Database seeded with sample data"
    fi
    
    print_status "Database setup completed"
}

# Configure Nginx
configure_nginx() {
    print_info "Configuring Nginx..."
    
    # Backup existing nginx config
    sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup 2>/dev/null || true
    
    # Copy our nginx configuration
    sudo cp nginx/nginx.conf /etc/nginx/
    sudo cp nginx/conf.d/pardnalink.conf /etc/nginx/sites-available/
    
    # Enable site
    sudo ln -sf /etc/nginx/sites-available/pardnalink.conf /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test nginx configuration
    sudo nginx -t
    
    # Start nginx
    sudo systemctl enable nginx
    sudo systemctl start nginx
    
    print_status "Nginx configured and started"
}

# Setup monitoring
setup_monitoring() {
    print_info "Setting up monitoring and logging..."
    
    # Create log rotation script
    cat > /opt/pardna/logrotate.sh << 'EOF'
#!/bin/bash
find /opt/pardna/logs -name "*.log" -type f -mtime +7 -delete
docker system prune -f
EOF
    
    chmod +x /opt/pardna/logrotate.sh
    
    # Add cron job for log rotation
    (crontab -l 2>/dev/null; echo "0 2 * * * /opt/pardna/logrotate.sh") | crontab -
    
    print_status "Monitoring and log rotation configured"
}

# Final checks
run_final_checks() {
    print_info "Running final deployment checks..."
    
    # Check if all containers are running
    RUNNING_CONTAINERS=$(docker-compose -f docker-compose.prod.yml ps -q | wc -l)
    
    if [ $RUNNING_CONTAINERS -ge 5 ]; then
        print_status "All containers are running"
    else
        print_warning "Some containers may not be running. Check: docker-compose -f docker-compose.prod.yml ps"
    fi
    
    # Check if web app is accessible
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health | grep -q "200"; then
        print_status "Web application is accessible"
    else
        print_warning "Web application may not be accessible"
    fi
    
    # Check if API is accessible
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/health | grep -q "200"; then
        print_status "API is accessible"
    else
        print_warning "API may not be accessible"
    fi
    
    # SSL certificate check
    if [ -f "/opt/pardna/ssl/${DOMAIN}.crt" ]; then
        print_status "SSL certificates are in place"
    else
        print_warning "SSL certificates may not be configured"
    fi
}

# Main deployment process
main() {
    echo -e "${BLUE}Starting Digital Pardna deployment...${NC}"
    echo ""
    
    check_environment
    setup_directories
    install_dependencies
    configure_firewall
    setup_ssl
    generate_env_file
    deploy_application
    setup_database
    configure_nginx
    setup_monitoring
    run_final_checks
    
    echo ""
    echo -e "${GREEN}🎉 Digital Pardna deployment completed!${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Configure your domain DNS to point to this server (${EC2_IP})"
    echo "2. Access your application at: https://${DOMAIN}"
    echo "3. Monitor logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo "4. Check container status: docker-compose -f docker-compose.prod.yml ps"
    echo ""
    echo -e "${YELLOW}Important files:${NC}"
    echo "- Application data: /opt/pardna/data"
    echo "- Logs: /opt/pardna/logs"
    echo "- SSL certificates: /opt/pardna/ssl"
    echo "- Environment config: .env.production"
    echo ""
}

# Run main function
main "$@"