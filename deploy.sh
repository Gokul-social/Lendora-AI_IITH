#!/bin/bash

# Lendora AI - Deployment Script
# Quick deployment helper for Docker

set -e

echo "========================================"
echo "Lendora AI - Deployment Script"
echo "========================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "[ERROR] Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "[ERROR] Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Parse arguments
MODE=${1:-dev}
COMPOSE_FILE="docker-compose.yml"

if [ "$MODE" == "prod" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
    echo "[INFO] Using production configuration"
else
    echo "[INFO] Using development configuration"
fi

# Build and start services
echo "[INFO] Building Docker images..."
docker-compose -f $COMPOSE_FILE build

echo "[INFO] Starting services..."
docker-compose -f $COMPOSE_FILE up -d

# Wait for services to be healthy
echo "[INFO] Waiting for services to start..."
sleep 10

# Check backend health
echo "[INFO] Checking backend health..."
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "[OK] Backend is healthy"
else
    echo "[WARNING] Backend health check failed. Check logs with: docker-compose logs backend"
fi

# Check frontend
echo "[INFO] Checking frontend..."
if curl -f http://localhost:80 > /dev/null 2>&1; then
    echo "[OK] Frontend is accessible"
else
    echo "[WARNING] Frontend check failed. Check logs with: docker-compose logs frontend"
fi

echo "========================================"
echo "Deployment Complete!"
echo "========================================"
echo ""
echo "Services:"
echo "  - Backend API: http://localhost:8000"
echo "  - Frontend:    http://localhost:80"
echo "  - API Docs:    http://localhost:8000/docs"
echo ""
echo "Useful commands:"
echo "  - View logs:   docker-compose -f $COMPOSE_FILE logs -f"
echo "  - Stop:        docker-compose -f $COMPOSE_FILE down"
echo "  - Restart:     docker-compose -f $COMPOSE_FILE restart"
echo "========================================"

