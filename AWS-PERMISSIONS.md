# AWS Permissions Required for Digital Pardna Deployment
## PardnaLink-Administration Account (594194992190)

This document outlines the exact AWS permissions needed for deploying Digital Pardna to your AWS infrastructure.

## Current Status
Your AWS user `aws-recovery@paradisekool.com` currently lacks several key permissions. To enable full deployment, please add these permissions to your AWS account.

## Required AWS Services & Permissions

### 1. Application Load Balancer (ALB)
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "elasticloadbalancing:CreateLoadBalancer",
                "elasticloadbalancing:DeleteLoadBalancer",
                "elasticloadbalancing:DescribeLoadBalancers",
                "elasticloadbalancing:ModifyLoadBalancerAttributes",
                "elasticloadbalancing:CreateTargetGroup",
                "elasticloadbalancing:DeleteTargetGroup",
                "elasticloadbalancing:DescribeTargetGroups",
                "elasticloadbalancing:ModifyTargetGroup",
                "elasticloadbalancing:RegisterTargets",
                "elasticloadbalancing:DeregisterTargets",
                "elasticloadbalancing:DescribeTargetHealth",
                "elasticloadbalancing:CreateListener",
                "elasticloadbalancing:DeleteListener",
                "elasticloadbalancing:DescribeListeners",
                "elasticloadbalancing:CreateRule",
                "elasticloadbalancing:DeleteRule",
                "elasticloadbalancing:DescribeRules"
            ],
            "Resource": "*"
        }
    ]
}
```

### 2. Route53 Domain Management
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "route53:CreateHostedZone",
                "route53:DeleteHostedZone",
                "route53:GetHostedZone",
                "route53:ListHostedZones",
                "route53:CreateResourceRecordSet",
                "route53:DeleteResourceRecordSet",
                "route53:ChangeResourceRecordSets",
                "route53:GetChange",
                "route53:ListResourceRecordSets"
            ],
            "Resource": "*"
        }
    ]
}
```

### 3. SSL Certificate Management (ACM)
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "acm:RequestCertificate",
                "acm:DeleteCertificate",
                "acm:DescribeCertificate",
                "acm:ListCertificates",
                "acm:AddTagsToCertificate",
                "acm:RemoveTagsFromCertificate"
            ],
            "Resource": "*"
        }
    ]
}
```

### 4. Security Groups
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
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
                "ec2:DescribeInstances"
            ],
            "Resource": "*"
        }
    ]
}
```

### 5. Tagging Resources
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "tag:GetResources",
                "tag:TagResources",
                "tag:UntagResources"
            ],
            "Resource": "*"
        }
    ]
}
```

## Combined Policy for Digital Pardna Deployment

Create a new IAM policy called `DigitalPardnaDeploymentPolicy` with the following permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "LoadBalancerManagement",
            "Effect": "Allow",
            "Action": [
                "elasticloadbalancing:*"
            ],
            "Resource": "*"
        },
        {
            "Sid": "Route53Management",
            "Effect": "Allow",
            "Action": [
                "route53:*"
            ],
            "Resource": "*"
        },
        {
            "Sid": "CertificateManagement",
            "Effect": "Allow",
            "Action": [
                "acm:*"
            ],
            "Resource": "*"
        },
        {
            "Sid": "SecurityGroupManagement",
            "Effect": "Allow",
            "Action": [
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
                "ec2:DescribeNetworkInterfaces"
            ],
            "Resource": "*"
        },
        {
            "Sid": "TaggingResources",
            "Effect": "Allow",
            "Action": [
                "tag:GetResources",
                "tag:TagResources",
                "tag:UntagResources"
            ],
            "Resource": "*"
        }
    ]
}
```

## How to Add Permissions

1. **Log into AWS Console** as an administrator for PardnaLink-Administration account
2. **Navigate to IAM** > Policies
3. **Create Policy** > JSON tab
4. **Paste the combined policy** above
5. **Name it**: `DigitalPardnaDeploymentPolicy`
6. **Attach to user**: `aws-recovery@paradisekool.com`

## Alternative: Using AWS Managed Policies

If you prefer AWS managed policies, attach these to your user:

- `ElasticLoadBalancingFullAccess`
- `Route53FullAccess`
- `AWSCertificateManagerFullAccess`
- `AmazonEC2FullAccess` (for security groups only)

## Verification Commands

After adding permissions, verify with these AWS CLI commands:

```bash
# Test Load Balancer permissions
aws elbv2 describe-load-balancers

# Test Route53 permissions
aws route53 list-hosted-zones

# Test ACM permissions
aws acm list-certificates

# Test EC2 permissions
aws ec2 describe-security-groups
aws ec2 describe-vpcs
aws ec2 describe-instances
```

## Minimal Deployment Option

If you cannot obtain all permissions, we can deploy using:
1. **Docker Compose only** on your existing EC2 instance
2. **Manual DNS configuration** outside of AWS
3. **Let's Encrypt certificates** instead of ACM
4. **Direct EC2 access** without load balancer

## Security Notes

- These permissions are scoped for deployment only
- Consider creating a separate deployment IAM role
- Remove unnecessary permissions after successful deployment
- Use AWS Organizations SCPs for additional security if needed

## Support

If you encounter permission issues during deployment:
1. Check the specific error message from Terraform
2. Verify the exact action being denied
3. Add the minimum required permission for that action
4. Test the deployment again

The configuration is optimized for your PardnaLink-Administration account (594194992190) and will work seamlessly once permissions are in place.