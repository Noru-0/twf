# Bus Ticket Frontend - Complete CI/CD, Docker & Deployment Guide

> **Single comprehensive guide for Next.js frontend CI/CD pipelines, Docker setup, secrets management, and deployment strategies.**

## 📋 Table of Contents

1. [🚀 CI/CD Workflows](#-cicd-workflows)
2. [🔑 Secrets Configuration](#-secrets-configuration)
3. [🐳 Docker Setup](#-docker-setup)
4. [💻 Local Development](#-local-development)
5. [🚀 Deployment Options](#-deployment-options)
6. [🔧 Useful Commands](#-useful-commands)
7. [🔍 Monitoring & Performance](#-monitoring--performance)
8. [🚨 Troubleshooting](#-troubleshooting)
9. [📈 Performance Optimizations](#-performance-optimizations)
10. [🔒 Security Best Practices](#-security-best-practices)

---

## 🚀 CI/CD Workflows

### Available Workflows

#### 1. Main CI/CD Pipeline (`.github/workflows/ci-cd.yml`)
**Triggers**: Push to `main`, `develop`, `feature/*` branches and PRs

**Features**:
- ✅ **Secrets validation** - Ensures all required secrets are available
- ✅ **Separate staging/production builds** - Different environment variables
- ✅ **Comprehensive testing** - ESLint, TypeScript checking, unit tests
- ✅ **Next.js optimizations** - Standalone builds, optimized artifacts
- ✅ **Staging deployment** - Develop branch → Render staging
- ✅ **Production deployment** - Main branch → production environment
- ✅ **Enhanced verification** - Robust deployment checking with retries

**Workflow Structure**:
```yaml
Jobs:
├── validate-secrets      # Check staging & production secrets
├── test-and-lint        # ESLint + TypeScript + unit tests  
├── build-staging        # Build for develop branch
├── build-production     # Build for main branch
├── deploy-staging       # Deploy develop → staging
└── deploy-production    # Deploy main → production
```

#### 2. Docker Pipeline (`.github/workflows/docker.yml`)
**Triggers**: Push to `main`, `develop` branches and version tags

**Features**:
- ✅ **Multi-platform Docker builds** (amd64, arm64)
- ✅ **GitHub Container Registry** integration
- ✅ **Build caching** for faster builds
- ✅ **Security vulnerability scanning** with Trivy
- ✅ **Standalone Next.js builds** for optimal Docker images

---

## 🔑 Secrets Configuration

### Required GitHub Repository Secrets

Add these secrets in GitHub (`Settings` → `Secrets and Variables` → `Actions` → `Repository secrets`):

#### API Configuration (Staging & Production)
```bash
# Production API
NEXT_PUBLIC_API_URL=https://your-backend-api.onrender.com

# Staging API  
NEXT_PUBLIC_API_URL_STAGING=https://your-staging-api.onrender.com
```

#### Authentication (Staging & Production)
```bash
# Production Authentication
NEXTAUTH_URL=https://your-frontend.onrender.com
NEXTAUTH_SECRET=your-nextauth-secret-32-chars

# Staging Authentication
NEXTAUTH_URL_STAGING=https://your-staging-frontend.onrender.com
```

#### Render Deployment
```bash
RENDER_API_KEY=your-render-api-key
RENDER_SERVICE_ID=your-frontend-service-id
RENDER_STAGING_SERVICE_ID=your-staging-frontend-service-id
```

#### External Services
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

#### Docker Registry
```bash
DOCKER_USERNAME=your-github-username
DOCKER_PASSWORD=your-github-personal-access-token
```

#### Testing & Monitoring
```bash
CODECOV_TOKEN=your-codecov-token
SENTRY_DSN=your-frontend-sentry-dsn
```

### GitHub Environment Configuration

#### 1. Create Environments
Go to `Settings` → `Environments` and create:
- **development** - For feature branch testing
- **staging** - For develop branch deployment  
- **production** - For main branch deployment

#### 2. Environment Protection Rules
```yaml
production:
  required_reviewers: 1-2 team members
  deployment_branches: main only
  
staging:
  required_reviewers: none
  deployment_branches: develop, main
```

#### 3. Environment Variables per Environment
```bash
# Development
NODE_ENV=development
LOG_LEVEL=debug

# Staging  
NODE_ENV=staging
LOG_LEVEL=info

# Production
NODE_ENV=production
LOG_LEVEL=error
```

### Render Service Configuration

#### Frontend Service Environment Variables
```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=${{NEXT_PUBLIC_API_URL}}
NEXTAUTH_URL=${{NEXTAUTH_URL}}
NEXTAUTH_SECRET=${{NEXTAUTH_SECRET}}
```

### Security Best Practices

1. **Never commit secrets** to repository
2. **Use different secrets** for each environment
3. **Separate staging/production** API URLs and credentials
4. **Rotate secrets regularly** (quarterly recommended)
5. **Limit secret access** to required team members only

### Secret Validation Commands

```bash
# Validate Next.js configuration
npm run build -- --dry-run

# Check environment variables
npm run validate:env

# Test API connectivity
npm run test:api
```

---

## 🐳 Docker Setup

### Next.js Docker Configuration

This project uses **standalone Next.js builds** optimized for Docker containers.

#### Dockerfile Structure
```dockerfile
Architecture:
├── Dependencies stage (install dependencies)
├── Builder stage (build Next.js app)  
└── Runner stage (lightweight production image)
   └── Standalone output (minimal runtime)
```

### Docker Compose Usage

#### Development Environment
```bash
# Start development services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f frontend-dev

# Stop services
docker-compose -f docker-compose.dev.yml down
```

#### Production Environment
```bash
# Start production services
docker-compose --profile production up -d

# With Nginx proxy
docker-compose --profile nginx up -d

# Stop services
docker-compose --profile production down
```

### Available Docker Services

#### Development (`docker-compose.dev.yml`)
- **frontend-dev**: Next.js app with hot reload (port 8000)
- **storybook-dev**: Component development (port 6006, optional)

#### Production (`docker-compose.yml`)
- **frontend**: Production Next.js app (port 8000)
- **frontend-prod**: Alternative production setup (port 8001)
- **nginx**: Load balancer/proxy (ports 80/443, optional)

### Environment Variables

#### Required for Development
```bash
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3001
PORT=8000
```

#### Required for Production
```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-production-api.com
```

**Important**: Use `NEXT_PUBLIC_` prefix for client-side variables.

### Next.js Configuration

The `next.config.ts` is optimized for CI/CD and Docker:

```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',           // For Docker deployments
  experimental: {
    outputFileTracingRoot: undefined,
  },
  images: {
    unoptimized: false,          // Enable image optimization
  },
};

export default nextConfig;
```

---

## 💻 Local Development

### Setup Instructions

#### Without Docker
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your settings

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

#### With Docker (Recommended)
```bash
# Build and start development environment
docker-compose -f docker-compose.dev.yml up --build

# Run specific commands in container
docker-compose exec frontend-dev npm run lint
docker-compose exec frontend-dev npm run build
```

### Available Scripts
```bash
npm run dev           # Start development server on port 8000
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint
npm run lint:fix      # Run ESLint with auto-fix
npm run type-check    # TypeScript type checking
```

### Environment Configuration

#### Development (`.env.local`)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=local-nextauth-secret
NODE_ENV=development
```

#### Production
Set these in deployment platform or CI/CD secrets:
```bash
NEXT_PUBLIC_API_URL=https://your-production-api.com
NEXTAUTH_URL=https://your-frontend.com
NEXTAUTH_SECRET=production-nextauth-secret
NODE_ENV=production
```

---

## 🚀 Deployment Options

### Option 1: Render Deployment (Recommended)

#### Staging (Develop Branch)
- **Automatic deployment** when pushing to `develop` branch
- **Environment**: Staging with separate API endpoints
- **URL**: `https://bus-ticket-frontend-staging.onrender.com`

#### Production (Main Branch)
- **Manual/automatic deployment** when pushing to `main` branch
- **Environment**: Production with production API
- **URL**: `https://bus-ticket-frontend.onrender.com`

#### Render Setup
1. Create Render account and web services
2. Add environment variables in Render dashboard
3. Configure GitHub repository secrets
4. Push to trigger deployment

### Option 2: Vercel Deployment
```yaml
- name: Deploy to Vercel
  uses: amondnet/vercel-action@v25
  with:
    vercel-token: ${{ secrets.VERCEL_TOKEN }}
    github-token: ${{ secrets.GITHUB_TOKEN }}
    vercel-args: '--prod'
```

### Option 3: Netlify Deployment
```yaml
- name: Deploy to Netlify
  uses: nwtgck/actions-netlify@v2.0
  with:
    publish-dir: './.next'
    production-branch: main
    github-token: ${{ secrets.GITHUB_TOKEN }}
    deploy-message: "Deploy from GitHub Actions"
  env:
    NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
    NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### Option 4: AWS S3 + CloudFront
```yaml
- name: Deploy to AWS S3
  run: |
    aws s3 sync .next/ s3://${{ secrets.AWS_S3_BUCKET }} --delete
    aws cloudfront create-invalidation --distribution-id ${{ secrets.AWS_CLOUDFRONT_DISTRIBUTION_ID }} --paths "/*"
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    AWS_DEFAULT_REGION: us-east-1
```

### Option 5: Docker Compose Production
```bash
# Deploy using docker-compose on your server
docker-compose --profile production up -d --build
```

---

## 🔧 Useful Commands

### Docker Commands
```bash
# Build services
docker-compose build

# Start specific service
docker-compose up frontend

# Execute commands in running container
docker-compose exec frontend-dev npm run lint
docker-compose exec frontend-dev npm run build

# View container logs
docker-compose logs frontend

# Clean up (removes volumes too)
docker-compose down -v

# Start with Storybook
docker-compose --profile storybook up -d
```

### Development Commands
```bash
# Analyze bundle size
npm run build && npm run analyze

# Check for outdated dependencies
npm outdated

# Update dependencies
npm update

# Clear Next.js cache
rm -rf .next

# Type checking
npx tsc --noEmit
```

### Build Optimization
```bash
# Build with bundle analysis
ANALYZE=true npm run build

# Check build size
npm run build
du -sh .next

# Test production build locally
npm run build && npm start
```

---

## 🔍 Monitoring & Performance

### Build Optimization
- **Static Generation**: Pages pre-built for better performance
- **Code Splitting**: Automatic code splitting for optimal bundles
- **Image Optimization**: Built-in Next.js image optimization
- **Bundle Analysis**: Analyze bundle sizes regularly

### Health Checks
- **Frontend**: `http://localhost:8000`
- **Production**: Automatic Docker health checks included
- **Storybook**: `http://localhost:6006` (if enabled)

### Performance Monitoring
- **Lighthouse**: Regular performance audits
- **Web Vitals**: Core Web Vitals tracking
- **Bundle Analysis**: Monitor bundle size changes
- **Error Tracking**: Set up Sentry or similar tools

### CI/CD Monitoring
- **Workflow Status**: Check Actions tab in GitHub
- **Deployment Status**: Monitor in Environments tab
- **Security Alerts**: Review in Security tab
- **Performance**: Track build times and bundle sizes

---

## 🚨 Troubleshooting

### Common Issues

#### 1. Build Fails on Dependencies
```bash
# Ensure package-lock.json is committed
git add package-lock.json
git commit -m "Add package-lock.json"

# Verify Node.js version (should be 18+)
node --version

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 2. Environment Variables Not Working
```bash
# Check if using correct prefix
# Client-side: NEXT_PUBLIC_API_URL
# Server-side: API_URL (no prefix needed)

# Verify in container
docker-compose exec frontend-dev printenv | grep NEXT_PUBLIC
```

#### 3. Docker Build Issues
```bash
# Check Dockerfile syntax
docker build -t test-frontend .

# Verify .dockerignore
cat .dockerignore

# Check if standalone output is configured
grep -A 5 -B 5 "standalone" next.config.ts
```

#### 4. Hot Reload Not Working
```bash
# Enable polling for Docker
WATCHPACK_POLLING=true npm run dev

# Check file permissions
ls -la

# Restart development container
docker-compose -f docker-compose.dev.yml restart frontend-dev
```

#### 5. Deployment Fails
```bash
# Verify deployment secrets are set
# Check GitHub repository secrets

# Test build locally
npm run build

# Check deployment logs in GitHub Actions
```

#### 6. GitHub Actions Workflow Fails
- **Secrets missing**: Verify staging and production secrets
- **Build failures**: Check Next.js configuration
- **Deployment failures**: Verify Render service IDs
- **Artifact issues**: Check build output size

### Performance Issues

#### Large Bundle Sizes
```bash
# Analyze bundle composition
npm run build
npm run analyze

# Use dynamic imports for large components
const BigComponent = dynamic(() => import('./BigComponent'))

# Remove unused dependencies
npm uninstall unused-package
```

#### Slow Build Times
```bash
# Enable dependency caching in CI
# (already configured in workflows)

# Use incremental builds
npm run build

# Clear build cache
rm -rf .next

# Enable Docker BuildKit
DOCKER_BUILDKIT=1 docker-compose build
```

#### Memory Issues
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Monitor container resources
docker stats

# Optimize images and assets
npm install next-optimized-images
```

### Deployment Verification Issues

#### Render Deployment Not Ready
```bash
# Check deployment logs in Render dashboard
# Verify environment variables in Render
# Check service configuration

# Manual verification
curl -f https://your-staging-frontend.onrender.com
```

#### Artifact Upload/Download Issues
```bash
# Check artifact size (should be minimal)
ls -la .next/

# Verify only essential files are included:
# - .next/ directory
# - next.config.ts
```

---

## 📈 Performance Optimizations

### CI/CD Optimizations
- **Dependency Caching**: npm packages cached between runs
- **Build Artifact Optimization**: Only essential files uploaded
- **Separate Build Jobs**: Staging and production builds isolated
- **Enhanced Verification**: Robust deployment checking with retries
- **Parallel Jobs**: Multiple checks run simultaneously
- **Docker Layer Caching**: Optimized for faster builds

### Application Optimizations
- **Standalone Builds**: Optimized for production deployment
- **Static Generation**: Pre-build pages at build time
- **Image Optimization**: Automatic image optimization
- **Code Splitting**: Automatic route-based code splitting
- **Bundle Splitting**: Separate vendor and app bundles
- **Compression**: Gzip compression enabled

### Deployment Optimizations
- **Minimal Artifacts**: Reduced deployment package size
- **Environment-Specific Builds**: Optimized for each environment
- **Health Check Retries**: Reliable deployment verification
- **Rolling Deployments**: Zero-downtime deployments

---

## 🔒 Security Best Practices

### Secret Management
- **GitHub Secrets**: All secrets stored securely
- **Environment Separation**: Different secrets for staging/production
- **Regular Rotation**: Rotate secrets quarterly
- **Access Control**: Limit secret access to required team members
- **No Client Exposure**: Secrets never exposed to browser

### Application Security
- **Environment Variables**: Proper NEXT_PUBLIC_ prefix usage
- **API Security**: Secure communication with backend
- **CORS Configuration**: Proper CORS setup
- **CSP Headers**: Content Security Policy implementation
- **HTTPS**: Always use HTTPS in production

### Infrastructure Security
- **Vulnerability Scanning**: Automatic Docker image scanning
- **Dependency Scanning**: Regular dependency updates
- **Access Controls**: Protected branches and required reviews
- **Network Security**: Proper network isolation
- **Container Security**: Run containers as non-root users

### CI/CD Security
- **Protected Branches**: Require reviews for main branches
- **Environment Protection**: Deployment approvals for production
- **Secret Validation**: Automatic secret availability checking
- **Deployment Verification**: Robust health checking

---

## 🌟 Key Improvements in Updated Workflow

### ✅ Fixed Issues
1. **No More Fallback Operators** - Removed invalid `||` syntax
2. **Optimized Artifacts** - Only `.next/` and `next.config.ts` uploaded
3. **Separate Build Jobs** - Staging and production builds isolated
4. **Enhanced Verification** - 15-20 retry attempts with 30-second intervals
5. **Better Secret Validation** - Staging and production secrets checked separately

### ✅ Environment Separation
- **Staging Secrets**: `*_STAGING` suffixed secrets for develop branch
- **Production Secrets**: Regular secrets for main branch
- **Build Isolation**: Separate jobs prevent environment mixing

### ✅ Deployment Reliability
- **Extended Retry Logic**: Up to 15 attempts for staging, 20 for production
- **Detailed Logging**: Clear status messages for each attempt
- **Proper Error Handling**: Graceful failure with informative messages

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Render Documentation](https://render.com/docs)

---

## 🆘 Getting Help

1. **Check Logs**: Container logs and workflow logs first
2. **GitHub Issues**: Review repository issues
3. **Documentation**: Consult Next.js and React docs
4. **Community**: Next.js Discord, Stack Overflow
5. **Debug Mode**: Use browser dev tools and debug mode
6. **Performance**: Use Lighthouse and React DevTools

---

**This optimized CI/CD setup provides production-ready deployment with proper environment separation and reliable verification! 🚀**

## 🚀 CI/CD Workflows

### Available Workflows

#### 1. Main CI/CD Pipeline (`.github/workflows/ci-cd.yml`)
**Triggers**: Push to `main`, `develop`, `feature/*` branches and PRs

**Features**:
- ✅ Dependency caching for faster builds
- ✅ ESLint code quality checks
- ✅ Next.js production build optimization
- ✅ Static export generation
- ✅ Build artifact management
- ✅ Automated deployment

#### 2. Docker Pipeline (`.github/workflows/docker.yml`)
**Triggers**: Push to `main`, `develop` branches and version tags

**Features**:
- ✅ Multi-platform Docker builds (amd64, arm64)
- ✅ GitHub Container Registry integration
- ✅ Image caching for performance
- ✅ Security vulnerability scanning with Trivy
- ✅ Automated deployment support

## 🛠️ Setup Instructions

### 1. Repository Secrets

Add these secrets in GitHub (`Settings` → `Secrets and variables` → `Actions`):

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://your-backend-api.com

# Deployment Secrets (choose based on strategy)
VERCEL_TOKEN=your_vercel_token
NETLIFY_AUTH_TOKEN=your_netlify_auth_token
NETLIFY_SITE_ID=your_netlify_site_id
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=your_s3_bucket_name
AWS_CLOUDFRONT_DISTRIBUTION_ID=your_cloudfront_id
DOCKER_HUB_USERNAME=your_dockerhub_username
DOCKER_HUB_ACCESS_TOKEN=your_dockerhub_token
KUBECONFIG=your_base64_encoded_kubeconfig
```

### 2. GitHub Environment Protection (Optional)

To enable deployment protection rules:

1. Go to `Settings` → `Environments`
2. Create new environment named `production`
3. Configure protection rules:
   - **Required reviewers**: Add team members
   - **Deployment branches**: Restrict to `main` branch
   - **Wait timer**: Optional delay before deployment

4. Update workflows by uncommenting environment sections:
```yaml
environment: 
  name: production
  url: ${{ steps.deploy.outputs.url }}
```

## 🐳 Docker Development

### Quick Start Commands

#### Development Environment
```bash
# Start development services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f frontend-dev

# Stop services
docker-compose -f docker-compose.dev.yml down
```

#### Production Environment
```bash
# Start production services
docker-compose --profile production up -d

# With Nginx proxy
docker-compose --profile nginx up -d

# Stop services
docker-compose --profile production down
```

### Available Docker Services

#### Development (`docker-compose.dev.yml`)
- **frontend-dev**: Next.js app with hot reload (port 8000)
- **storybook-dev**: Component development (port 6006, optional)

#### Production (`docker-compose.yml`)
- **frontend**: Production Next.js app (port 8000)
- **frontend-prod**: Alternative production setup (port 8001)
- **nginx**: Load balancer/proxy (ports 80/443, optional)

### Environment Configuration

1. Copy environment file:
```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` with your configuration:
```bash
# Environment variables for development
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
PORT=8000
FAST_REFRESH=true
WATCHPACK_POLLING=true
```

## 💻 Local Development

### Without Docker
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your settings

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### With Docker
```bash
# Build and start development environment
docker-compose -f docker-compose.dev.yml up --build

# Run specific commands in container
docker-compose exec frontend-dev npm run lint
docker-compose exec frontend-dev npm run build
```

### Available Scripts
```bash
npm run dev           # Start development server on port 8000
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint
npm run lint:fix      # Run ESLint with auto-fix
```

## ⚙️ Next.js Configuration

The `next.config.ts` is optimized for CI/CD and Docker:

```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',           // For Docker deployments
  experimental: {
    outputFileTracingRoot: undefined,
  },
  images: {
    unoptimized: false,          // Enable image optimization
  },
};

export default nextConfig;
```

### Environment Variables

#### Development (`.env.local`)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
```

#### Production
Set these in deployment platform or CI/CD secrets:
```bash
NEXT_PUBLIC_API_URL=https://your-production-api.com
NODE_ENV=production
```

**Important**: Use `NEXT_PUBLIC_` prefix for client-side variables.

## 🚀 Deployment Options

### Option 1: Vercel Deployment
Uncomment in `.github/workflows/ci-cd.yml`:
```yaml
- name: Deploy to Vercel
  uses: amondnet/vercel-action@v25
  with:
    vercel-token: ${{ secrets.VERCEL_TOKEN }}
    github-token: ${{ secrets.GITHUB_TOKEN }}
    vercel-args: '--prod'
```

### Option 2: Netlify Deployment
```yaml
- name: Deploy to Netlify
  uses: nwtgck/actions-netlify@v2.0
  with:
    publish-dir: './.next'
    production-branch: main
    github-token: ${{ secrets.GITHUB_TOKEN }}
    deploy-message: \"Deploy from GitHub Actions\"
  env:
    NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
    NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### Option 3: AWS S3 + CloudFront
```yaml
- name: Deploy to AWS S3
  run: |
    aws s3 sync .next/ s3://${{ secrets.AWS_S3_BUCKET }} --delete
    aws cloudfront create-invalidation --distribution-id ${{ secrets.AWS_CLOUDFRONT_DISTRIBUTION_ID }} --paths \"/*\"
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    AWS_DEFAULT_REGION: us-east-1
```

### Option 4: Kubernetes Deployment
```yaml
- name: Deploy to Kubernetes
  run: |
    kubectl set image deployment/frontend-app frontend=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
    kubectl rollout status deployment/frontend-app
  env:
    KUBECONFIG: ${{ secrets.KUBECONFIG }}
```

### Option 5: Docker Compose Production
```bash
# Deploy using docker-compose on your server
docker-compose --profile production up -d --build
```

## 🔧 Useful Commands

### Docker Commands
```bash
# Build services
docker-compose build

# Start specific service
docker-compose up frontend

# Execute commands in running container
docker-compose exec frontend-dev npm run lint
docker-compose exec frontend-dev npm run build

# View container logs
docker-compose logs frontend

# Clean up (removes volumes too)
docker-compose down -v

# Start with Storybook
docker-compose --profile storybook up -d
```

### Development Commands
```bash
# Analyze bundle size
npm run build && npm run analyze

# Check for outdated dependencies
npm outdated

# Update dependencies
npm update

# Clear Next.js cache
rm -rf .next

# Type checking
npx tsc --noEmit
```

## 🎨 Storybook Development (Optional)

Storybook is available for component development:

```bash
# Start Storybook with Docker
docker-compose --profile storybook up -d

# Access at http://localhost:6006

# Stop Storybook
docker-compose --profile storybook down
```

## 🌐 Nginx Configuration (Production)

For production with Nginx proxy, create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend-prod:3000;
    }

    server {
        listen 80;
        server_name your-domain.com;
        
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
    
    # SSL configuration (optional)
    # server {
    #     listen 443 ssl;
    #     server_name your-domain.com;
    #     ssl_certificate /etc/nginx/ssl/cert.pem;
    #     ssl_certificate_key /etc/nginx/ssl/key.pem;
    #     
    #     location / {
    #         proxy_pass http://frontend;
    #         proxy_set_header Host $host;
    #         proxy_set_header X-Real-IP $remote_addr;
    #         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    #         proxy_set_header X-Forwarded-Proto $scheme;
    #     }
    # }
}
```

## 🔍 Monitoring & Performance

### Build Optimization
- **Static Generation**: Pages pre-built for better performance
- **Code Splitting**: Automatic code splitting for optimal bundles
- **Image Optimization**: Built-in Next.js image optimization
- **Bundle Analysis**: Analyze bundle sizes regularly

### Health Checks
- **Frontend**: `http://localhost:8000`
- **Production**: Automatic Docker health checks included
- **Storybook**: `http://localhost:6006` (if enabled)

### Performance Monitoring
- **Lighthouse**: Regular performance audits
- **Web Vitals**: Core Web Vitals tracking
- **Bundle Analysis**: Monitor bundle size changes
- **Error Tracking**: Set up Sentry or similar tools

### CI/CD Monitoring
- **Workflow Status**: Check Actions tab in GitHub
- **Deployment Status**: Monitor in Environments tab
- **Security Alerts**: Review in Security tab
- **Performance**: Track build times and bundle sizes

## 🚨 Troubleshooting

### Common Issues

#### 1. Build Fails on Dependencies
```bash
# Ensure package-lock.json is committed
git add package-lock.json
git commit -m \"Add package-lock.json\"

# Verify Node.js version (should be 18+)
node --version

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 2. Environment Variables Not Working
```bash
# Check if using correct prefix
# Client-side: NEXT_PUBLIC_API_URL
# Server-side: API_URL (no prefix needed)

# Verify in container
docker-compose exec frontend-dev printenv | grep NEXT_PUBLIC
```

#### 3. Docker Build Issues
```bash
# Check Dockerfile syntax
docker build -t test-frontend .

# Verify .dockerignore
cat .dockerignore

# Check if standalone output is configured
grep -A 5 -B 5 \"standalone\" next.config.ts
```

#### 4. Hot Reload Not Working
```bash
# Enable polling for Docker
WATCHPACK_POLLING=true npm run dev

# Check file permissions
ls -la

# Restart development container
docker-compose -f docker-compose.dev.yml restart frontend-dev
```

#### 5. Deployment Fails
```bash
# Verify deployment secrets are set
# Check GitHub repository secrets

# Test build locally
npm run build

# Check deployment logs in GitHub Actions
```

#### 6. Linting Errors
```bash
# Run linting locally first
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Check ESLint configuration
cat .eslintrc.json
```

### Performance Issues

#### Large Bundle Sizes
```bash
# Analyze bundle composition
npm run build
npm run analyze

# Use dynamic imports for large components
const BigComponent = dynamic(() => import('./BigComponent'))

# Remove unused dependencies
npm uninstall unused-package
```

#### Slow Build Times
```bash
# Enable dependency caching in CI
# (already configured in workflows)

# Use incremental builds
npm run build

# Clear build cache
rm -rf .next

# Enable Docker BuildKit
DOCKER_BUILDKIT=1 docker-compose build
```

#### Memory Issues
```bash
# Increase Node.js memory limit
NODE_OPTIONS=\"--max-old-space-size=4096\" npm run build

# Monitor container resources
docker stats

# Optimize images and assets
npm install next-optimized-images
```

## 📈 Performance Optimizations

### CI/CD Optimizations
- **Dependency Caching**: npm packages cached between runs
- **Build Artifact Caching**: `.next` folder cached when possible
- **Parallel Jobs**: Multiple checks run simultaneously
- **Conditional Deployment**: Only deploys on successful builds
- **Docker Layer Caching**: Optimized for faster builds
- **Multi-platform Builds**: Support for different architectures

### Application Optimizations
- **Static Generation**: Pre-build pages at build time
- **Image Optimization**: Automatic image optimization
- **Code Splitting**: Automatic route-based code splitting
- **Bundle Splitting**: Separate vendor and app bundles
- **Compression**: Gzip compression enabled
- **CDN**: Serve static assets from CDN

## 🔒 Security Best Practices

- **Dependency Scanning**: Automatic vulnerability scanning with Trivy
- **Secret Management**: All sensitive data in GitHub Secrets
- **Environment Isolation**: Separate dev/staging/production
- **Code Quality**: Automated linting and formatting
- **Access Controls**: Protected branches and required reviews
- **CSP Headers**: Content Security Policy implementation
- **HTTPS**: Always use HTTPS in production
- **Environment Variables**: Never expose secrets to client-side

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)

## 🆘 Getting Help

1. **Check Logs**: Container logs and workflow logs first
2. **GitHub Issues**: Review repository issues
3. **Documentation**: Consult Next.js and React docs
4. **Community**: Next.js Discord, Stack Overflow
5. **Debug Mode**: Use browser dev tools and debug mode
6. **Performance**: Use Lighthouse and React DevTools