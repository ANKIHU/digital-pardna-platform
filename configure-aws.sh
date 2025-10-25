#!/bin/bash

echo "🔧 Configure AWS CLI for PardnaLink account 594194992190"
echo "Enter your PardnaLink AWS credentials:"

aws configure

echo "✅ Verifying account..."
aws sts get-caller-identity