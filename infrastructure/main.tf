# Digital Pardna AWS Deployment - PardnaLink Account
# Account: PardnaLink-Administration (594194992190)
# Optimized for existing infrastructure with minimal AWS configuration

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "PardnaLink"
      Environment = var.environment
      ManagedBy   = "terraform"
      Application = "digital-pardna"
      Account     = "PardnaLink-Administration"
      AccountID   = "594194992190"
    }
  }
}

# Variables
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "digital-pardna"
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "pardnalink.com"
}

variable "existing_vpc_id" {
  description = "Existing VPC ID"
  type        = string
  default     = "vpc-0453830bd87ac50d9"
}

variable "existing_ec2_instance_id" {
  description = "Existing EC2 instance ID"
  type        = string
  default     = "i-0c35787ee59f83a71"
}

# Use hardcoded values to avoid permission issues
locals {
  vpc_id = "vpc-0453830bd87ac50d9"
  availability_zones = ["us-east-1a", "us-east-1b"]
  # Use existing subnets if possible, or create new ones
  subnet_cidrs = ["172.31.100.0/24", "172.31.101.0/24"]
}

# ECR Repositories (minimal permissions needed)
# Data sources for existing infrastructure
data "aws_vpc" "existing" {
  id = var.existing_vpc_id
}

data "aws_instance" "existing_ec2" {
  instance_id = var.existing_ec2_instance_id
}

data "aws_subnets" "existing" {
  filter {
    name   = "vpc-id"
    values = [var.existing_vpc_id]
  }
}

# Security Group for Digital Pardna Application
resource "aws_security_group" "digital_pardna" {
  name_prefix = "${var.app_name}-"
  description = "Security group for Digital Pardna application"
  vpc_id      = data.aws_vpc.existing.id

  # HTTP access
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS access
  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # API port
  ingress {
    description = "API"
    from_port   = 4000
    to_port     = 4000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Web app port
  ingress {
    description = "Web App"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # SSH access (existing)
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Database ports (for internal communication)
  ingress {
    description = "PostgreSQL"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    self        = true
  }

  ingress {
    description = "Redis"
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    self        = true
  }

  # All outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.app_name}-security-group"
    Environment = var.environment
  }
}

# Application Load Balancer (Optional - for production scaling)
resource "aws_lb" "digital_pardna" {
  name               = "${var.app_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.digital_pardna.id]
  subnets            = data.aws_subnets.existing.ids

  enable_deletion_protection = false

  tags = {
    Name        = "${var.app_name}-alb"
    Environment = var.environment
  }
}

# Target Group for Web App
resource "aws_lb_target_group" "web" {
  name     = "${var.app_name}-web-tg"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.existing.id

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }

  tags = {
    Name        = "${var.app_name}-web-target-group"
    Environment = var.environment
  }
}

# Target Group for API
resource "aws_lb_target_group" "api" {
  name     = "${var.app_name}-api-tg"
  port     = 4000
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.existing.id

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }

  tags = {
    Name        = "${var.app_name}-api-target-group"
    Environment = var.environment
  }
}

# ALB Listener for HTTP (redirects to HTTPS)
resource "aws_lb_listener" "web_http" {
  load_balancer_arn = aws_lb.digital_pardna.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# Route53 Hosted Zone for domain
resource "aws_route53_zone" "main" {
  name = var.domain_name

  tags = {
    Name        = "${var.app_name}-hosted-zone"
    Environment = var.environment
  }
}

# ACM Certificate for SSL
resource "aws_acm_certificate" "main" {
  domain_name       = var.domain_name
  validation_method = "DNS"

  subject_alternative_names = [
    "*.${var.domain_name}"
  ]

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name        = "${var.app_name}-certificate"
    Environment = var.environment
  }
}

# Route53 records for certificate validation
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.main.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = aws_route53_zone.main.zone_id
}

# Certificate validation
resource "aws_acm_certificate_validation" "main" {
  certificate_arn         = aws_acm_certificate.main.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}

# ALB Listener for HTTPS
resource "aws_lb_listener" "web_https" {
  load_balancer_arn = aws_lb.digital_pardna.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
  certificate_arn   = aws_acm_certificate_validation.main.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.web.arn
  }
}

# API listener rule
resource "aws_lb_listener_rule" "api" {
  listener_arn = aws_lb_listener.web_https.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }

  condition {
    path_pattern {
      values = ["/api/*", "/v1/*"]
    }
  }
}

# Route53 A record pointing to ALB
resource "aws_route53_record" "main" {
  zone_id = aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_lb.digital_pardna.dns_name
    zone_id                = aws_lb.digital_pardna.zone_id
    evaluate_target_health = true
  }
}

# Attach existing EC2 instance to target groups
resource "aws_lb_target_group_attachment" "web" {
  target_group_arn = aws_lb_target_group.web.arn
  target_id        = data.aws_instance.existing_ec2.id
  port             = 3000
}

resource "aws_lb_target_group_attachment" "api" {
  target_group_arn = aws_lb_target_group.api.arn
  target_id        = data.aws_instance.existing_ec2.id
  port             = 4000
}

# Outputs
output "load_balancer_dns" {
  description = "DNS name of the load balancer"
  value       = aws_lb.digital_pardna.dns_name
}

output "domain_nameservers" {
  description = "Name servers for the domain"
  value       = aws_route53_zone.main.name_servers
}

output "security_group_id" {
  description = "ID of the security group"
  value       = aws_security_group.digital_pardna.id
}

output "certificate_arn" {
  description = "ARN of the SSL certificate"
  value       = aws_acm_certificate.main.arn
}

output "existing_ec2_info" {
  description = "Information about existing EC2 instance"
  value = {
    instance_id = data.aws_instance.existing_ec2.id
    public_ip   = data.aws_instance.existing_ec2.public_ip
    private_ip  = data.aws_instance.existing_ec2.private_ip
    vpc_id      = data.aws_instance.existing_ec2.vpc_security_group_ids
  }
}

output "deployment_instructions" {
  description = "Next steps for deployment"
  value = <<-EOT
    ✅ AWS Infrastructure Ready for PardnaLink Account (594194992190)
    
    Next Steps:
    1. Update domain nameservers to: ${join(", ", aws_route53_zone.main.name_servers)}
    2. SSH to EC2 instance: ssh -i your-key.pem ec2-user@${data.aws_instance.existing_ec2.public_ip}
    3. Deploy Docker containers using the provided docker-compose.yml
    4. Configure environment variables for production
    5. Access your application at: https://${var.domain_name}
    
    Load Balancer: ${aws_lb.digital_pardna.dns_name}
    Security Group: ${aws_security_group.digital_pardna.id}
  EOT
}

output "terraform_status" {
  description = "Terraform deployment status"
  value       = "✅ Complete AWS infrastructure ready for PardnaLink Account (594194992190) deployment!"
}