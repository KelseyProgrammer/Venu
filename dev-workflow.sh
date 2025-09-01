#!/bin/bash

# VENU Development Workflow Script
# This script provides an efficient development workflow to catch issues early

set -e  # Exit on any error

echo "🚀 VENU Development Workflow"
echo "=========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "backend/package.json" ]; then
    print_error "Please run this script from the VENU project root directory"
    exit 1
fi

# Function to run type checking
run_type_check() {
    print_status "Running TypeScript type checking..."
    
    # Frontend type check
    if npm run type-check > /dev/null 2>&1; then
        print_success "Frontend type check passed"
    else
        print_error "Frontend type check failed"
        npm run type-check
        return 1
    fi
    
    # Backend type check
    if cd backend && npm run type-check > /dev/null 2>&1; then
        print_success "Backend type check passed"
        cd ..
    else
        print_error "Backend type check failed"
        cd ..
        cd backend && npm run type-check
        cd ..
        return 1
    fi
}

# Function to run linting
run_linting() {
    print_status "Running ESLint checks..."
    
    # Frontend linting
    if npm run lint > /dev/null 2>&1; then
        print_success "Frontend linting passed"
    else
        print_warning "Frontend linting issues found"
        npm run lint
    fi
    
    # Backend linting
    if cd backend && npm run lint > /dev/null 2>&1; then
        print_success "Backend linting passed"
        cd ..
    else
        print_warning "Backend linting issues found"
        cd ..
        cd backend && npm run lint
        cd ..
    fi
}

# Function to run a quick build test
run_build_test() {
    print_status "Running quick build test..."
    
    # Test frontend build
    if npm run build:frontend > /dev/null 2>&1; then
        print_success "Frontend build test passed"
    else
        print_error "Frontend build test failed"
        npm run build:frontend
        return 1
    fi
}

# Function to clean build artifacts
clean_builds() {
    print_status "Cleaning build artifacts..."
    npm run clean
    print_success "Build artifacts cleaned"
}

# Function to install dependencies
install_deps() {
    print_status "Installing dependencies..."
    
    # Frontend dependencies
    if npm install; then
        print_success "Frontend dependencies installed"
    else
        print_error "Failed to install frontend dependencies"
        return 1
    fi
    
    # Backend dependencies
    if cd backend && npm install; then
        print_success "Backend dependencies installed"
        cd ..
    else
        print_error "Failed to install backend dependencies"
        cd ..
        return 1
    fi
}

# Function to start development servers
start_dev() {
    print_status "Starting development servers..."
    npm run dev:both
}

# Function to show available commands
show_help() {
    echo "Available commands:"
    echo "  check     - Run type checking and linting"
    echo "  build     - Run full build process"
    echo "  clean     - Clean build artifacts"
    echo "  install   - Install all dependencies"
    echo "  dev       - Start development servers"
    echo "  validate  - Run complete validation (type check + lint + build test)"
    echo "  help      - Show this help message"
}

# Main script logic
case "${1:-help}" in
    "check")
        print_status "Running development checks..."
        run_type_check
        run_linting
        print_success "Development checks completed"
        ;;
    "build")
        print_status "Running full build process..."
        run_type_check
        run_linting
        clean_builds
        npm run build
        print_success "Full build completed successfully"
        ;;
    "clean")
        clean_builds
        ;;
    "install")
        install_deps
        ;;
    "dev")
        start_dev
        ;;
    "validate")
        print_status "Running complete validation..."
        run_type_check
        run_linting
        run_build_test
        print_success "Complete validation passed!"
        ;;
    "help"|*)
        show_help
        ;;
esac
