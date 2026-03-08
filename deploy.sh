#!/bin/bash

# ============================================
# Nidaan Backend - Deploy Script
# ============================================
# Prerequisites:
#   1. AWS CLI installed:   pip install awscli
#   2. SAM CLI installed:   pip install aws-sam-cli
#   3. AWS configured:      aws configure
# ============================================

set -e  # Exit on any error

# ── CONFIG ──────────────────────────────────
STACK_NAME="nidaan-backend"
REGION="ap-south-1"
S3_BUCKET="nidaan-deploy-$(date +%s)"  # Unique bucket name
# ────────────────────────────────────────────

echo ""
echo "======================================"
echo "   Nidaan Backend Deployment"
echo "======================================"
echo ""

# Step 1: Check prerequisites
echo "▶ Checking prerequisites..."

if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Install it: pip install awscli"
    exit 1
fi

if ! command -v sam &> /dev/null; then
    echo "❌ SAM CLI not found. Install it: pip install aws-sam-cli"
    exit 1
fi

echo "✅ AWS CLI and SAM CLI found"

# Step 2: Check AWS credentials
echo ""
echo "▶ Checking AWS credentials..."
aws sts get-caller-identity > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ AWS credentials not configured. Run: aws configure"
    exit 1
fi
echo "✅ AWS credentials valid"

# Step 3: Create S3 bucket for deployment artifacts
echo ""
echo "▶ Creating S3 deployment bucket: $S3_BUCKET"
aws s3 mb s3://$S3_BUCKET --region $REGION
echo "✅ S3 bucket created"

# Step 4: Build SAM application
echo ""
echo "▶ Building SAM application..."
sam build
echo "✅ Build complete"

# Step 5: Deploy
echo ""
echo "▶ Deploying to AWS (this takes ~2-3 minutes)..."
sam deploy \
    --stack-name $STACK_NAME \
    --s3-bucket $S3_BUCKET \
    --region $REGION \
    --capabilities CAPABILITY_IAM \
    --no-confirm-changeset \
    --no-fail-on-empty-changeset

echo ""
echo "======================================"
echo "✅ Deployment complete!"
echo ""

# Step 6: Get and display the API URL
API_URL=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
    --output text)

echo "🌐 Your API URL:"
echo "   $API_URL"
echo ""
echo "📋 Save this URL — add it to your frontend .env files as:"
echo "   VITE_API_URL=$API_URL"
echo ""
echo "🧪 Test your API:"
echo "   python test_api.py $API_URL"
echo "======================================"
echo ""