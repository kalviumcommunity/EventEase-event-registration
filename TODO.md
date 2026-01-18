# Secrets Management Implementation TODO

## 1. Utility Setup
- [x] Install @azure/identity and @azure/keyvault-secrets packages
- [x] Create src/lib/secrets.ts with getSecret function using DefaultAzureCredential and SecretClient
- [x] Implement caching layer to avoid redundant network calls

## 2. Runtime Injection
- [x] Create src/lib/config.ts with initializeConfig() function
- [x] Fetch critical secrets (DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, RESEND_API_KEY) during server startup
- [x] Export secrets as constant object for app-wide import

## 3. Environment Variable Replacement
- [x] Update src/lib/env.ts to use config instead of process.env
- [x] Ensure server-side only access to secrets

## 4. Access Control Setup
- [x] Provide Azure CLI command for granting Key Vault Secrets User role to App Service Managed Identity

## 5. Verification & Audit
- [x] Create src/app/api/admin/debug-secrets/route.ts
- [x] Log secret keys (not values) to console for verification
- [x] Implement VaultConfigurationError for missing secrets

## 6. Documentation
- [x] Add 'Secrets Management' section to README.md
- [x] Document Least Privilege principle
- [x] Describe JWT_SECRET rotation strategy using Azure Function

## 7. Testing & Validation
- [x] Test secret retrieval during app startup
- [x] Verify caching functionality
- [x] Ensure no client-side exposure of secrets
