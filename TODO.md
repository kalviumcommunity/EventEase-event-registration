# TODO: Implement Secure File Uploads to Azure Blob Storage with SAS Tokens

## Infrastructure Setup
- [ ] Add Azurite service to docker-compose.yml for local Azure Storage emulation
- [ ] Install @azure/storage-blob SDK via npm
- [ ] Update .env.local with placeholders for Azure environment variables

## Backend Implementation
- [ ] Add new error codes to errorCodes.ts for Azure-related errors
- [ ] Create src/lib/handleError.ts utility for wrapping operations in try-catch
- [ ] Create src/lib/azureStorage.ts with singleton BlobServiceClient and generateUploadSasUrl function
- [ ] Create src/app/api/upload/sas/route.ts API route with POST handler for SAS URL generation

## Frontend Implementation
- [ ] Create src/components/FileUpload.tsx React component for file upload workflow

## Documentation
- [ ] Create docs/FILE_UPLOADS.md explaining SAS security, CORS, and BlockBlob requirements

## Testing & Verification
- [ ] Test implementation locally with Azurite
- [ ] Verify CORS settings for production Azure Storage
- [ ] Update frontend to integrate FileUpload component
