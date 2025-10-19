#!/bin/bash

# EMI Calculator VPS Deployment Script
# This script automates the deployment process on a VPS

set -e  # Exit on error

echo "======================================"
echo "EMI Calculator Deployment Script"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if Docker is installed
echo "Checking prerequisites..."
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi
print_success "Docker is installed"

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi
print_success "Docker Compose is installed"

echo ""
echo "======================================"
echo "Starting Deployment"
echo "======================================"
echo ""

# Stop existing containers
print_info "Stopping existing containers..."
docker-compose down 2>/dev/null || true
print_success "Existing containers stopped"

# Build images
print_info "Building Docker images..."
docker-compose build --no-cache
print_success "Docker images built successfully"

# Start containers
print_info "Starting containers..."
docker-compose up -d
print_success "Containers started"

# Wait for services to be ready
print_info "Waiting for services to be ready..."
sleep 10

# Check container status
print_info "Checking container status..."
if docker-compose ps | grep -q "Up"; then
    print_success "All containers are running"
else
    print_error "Some containers failed to start"
    docker-compose ps
    exit 1
fi

# Health check
print_info "Performing health check..."
if curl -f http://localhost:3000/health &> /dev/null; then
    print_success "Health check passed"
else
    print_error "Health check failed"
    echo "Checking logs..."
    docker-compose logs --tail=50
    exit 1
fi

echo ""
echo "======================================"
echo "Deployment Successful!"
echo "======================================"
echo ""
echo "Application is running at:"
echo "  - http://localhost:3000"
echo "  - http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "API Documentation:"
echo "  - http://localhost:3000/docs"
echo ""
echo "Useful commands:"
echo "  - View logs: docker-compose logs -f"
echo "  - Stop: docker-compose down"
echo "  - Restart: docker-compose restart"
echo ""
