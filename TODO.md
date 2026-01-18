# TODO: Containerize EventEase for Production

## 1. Update Dockerfile to Multi-Stage Build
- [ ] Modify Dockerfile to use multi-stage build with Builder and Runner stages
- [ ] Use node:20-alpine as base image
- [ ] Builder stage: Install dependencies, copy source, run npm run build
- [ ] Runner stage: Copy .next, public, node_modules; set NODE_ENV=production; EXPOSE 3000; use non-root user

## 2. Create .dockerignore File
- [ ] Create .dockerignore to exclude unnecessary files (node_modules, .git, etc.)

## 3. Create GitHub Actions CI/CD Pipeline
- [ ] Create .github/workflows/deploy.yml
- [ ] Trigger on push to main branch
- [ ] Authenticate with Azure Container Registry (ACR)
- [ ] Build and tag Docker image with GitHub SHA
- [ ] Push image to ACR
- [ ] Deploy to Azure App Service for Containers

## 4. Add Infrastructure & Scaling Section to README.md
- [ ] Explain benefits of Horizontal Autoscaling for EventEase
- [ ] Describe how Health Checks ensure traffic to healthy containers
- [ ] Discuss Cold Start trade-off and mitigation with Always On or Pre-warmed instances

## 5. Provide Local Verification Commands
- [ ] Document commands to build image locally and run on port 3000
