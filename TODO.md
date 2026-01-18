# Domain Mapping and SSL/TLS Configuration for EventEase

## Tasks to Complete
- [x] Edit next.config.ts to add permanent 301 redirect from HTTP to HTTPS
- [x] Update README.md with "Domain & Security" section including DNS, SSL, HTTPS enforcement, verification, and explanations
- [x] Verify all changes are implemented correctly

## DNS Configuration
- Provide A record and CNAME record values for Azure/AWS
- Explain finding Custom Domain Verification ID

## SSL/TLS Certificate
- Guide for App Service Managed Certificate (Azure) or ACM Public Certificate (AWS)
- CNAME validation record for DNS Zone

## HTTPS Enforcement
- next.config.ts redirect logic
- Portal settings for "HTTPS Only"

## Verification
- nslookup and curl commands

## Documentation
- README.md section
- Explanations on DNS validation vs Email, HSTS role
