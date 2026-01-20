|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/eventease` |
| `JWT_SECRET` | Secret key for JWT token signing | `your-super-secret-jwt-key-here` |
| `RESEND_API_KEY` | API key for Resend email service | `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `AZURE_STORAGE_ACCOUNT` | Azure Storage account name | `your-storage-account-name` |
| `AZURE_STORAGE_ACCESS_KEY` | Azure Storage access key | `your-storage-access-key-here` |
| `AZURITE_CONNECTION_STRING` | Local Azurite connection (dev only) | `UseDevelopmentStorage=true` |
| `AZURE_STORAGE_CONTAINER_NAME` | Azure blob container name | `uploads` |

## Infrastructure & Scaling

### Horizontal Autoscaling Benefits for EventEase
Horizontal autoscaling allows EventEase to handle high-traffic ticketing events by automatically increasing the number of container instances based on demand. This ensures optimal performance during peak times, such as concert ticket releases or major event registrations, by distributing load across multiple containers. Benefits include:
- Improved reliability and availability during traffic spikes.
- Cost efficiency by scaling down during low-traffic periods.
- Seamless user experience without downtime or slowdowns.

### Health Checks for Container Traffic
Health checks ensure that traffic is only routed to healthy containers, preventing issues like serving stale or broken content. For EventEase, this means:
- Automatic detection of unhealthy instances (e.g., due to memory leaks or database connection failures).
- Immediate removal of faulty containers from the load balancer rotation.
- Faster recovery times and consistent service quality for users.

### Cold Start Trade-off and Mitigation
Cold starts occur when a containerized application needs to initialize from scratch, causing delays in response times. For EventEase, this can impact user experience during sudden traffic increases. Mitigation strategies include:
- **Always On**: Keep a minimum number of instances running to reduce cold start frequency.
- **Pre-warmed Instances**: Use platform features to maintain warm instances ready for immediate scaling.
- These approaches minimize latency, ensuring quick response times for event registrations and ticket purchases.

## Domain & Security

### DNS Configuration (Azure/AWS)
To map your custom domain (e.g., eventease.com) to your application:

#### Azure App Service:
1. Navigate to your App Service in the Azure Portal.
2. Go to **Custom domains** under Settings.
3. Click **Add custom domain**.
4. Enter your domain name (e.g., eventease.com).
5. To find the **Custom Domain Verification ID**:
   - In the Azure Portal, go to your App Service > Custom domains.
   - The verification ID is displayed in the "Domain ownership" section.
   - Add a TXT record to your DNS zone with the name `@` and value as the verification ID.

**DNS Records:**
- **A Record**: Point your root domain to the App Service IP address.
  - Name: `@`
  - Type: A
  - Value: [Your App Service IP address, found in Custom domains section]
- **CNAME Record** for www subdomain:
  - Name: `www`
  - Type: CNAME
  - Value: `[your-app-service-name].azurewebsites.net`

#### AWS Load Balancer:
1. In the AWS Console, go to Route 53 or your DNS provider.
2. Create the following records:

**DNS Records:**
- **A Record** (Alias): Point your root domain to the Load Balancer.
  - Name: `@`
  - Type: A (Alias)
  - Alias Target: [Your Load Balancer DNS name]
- **CNAME Record** for www subdomain:
  - Name: `www`
  - Type: CNAME
  - Value: [Your Load Balancer DNS name]

### SSL/TLS Certificate
#### Azure App Service Managed Certificate:
1. In the Azure Portal, go to your App Service > TLS/SSL settings > Private Key Certificates (.pfx) or Public Key Certificates (.cer).
2. Click **App Service Managed Certificate**.
3. Select your custom domain and click **Create**.
4. For wildcard (*.domain.com), select the domain and enable wildcard.

**CNAME Validation Record:**
- Add this CNAME record to your DNS zone to complete certificate issuance:
  - Name: `acme-challenge.[your-domain]`
  - Type: CNAME
  - Value: `[validation-value-provided-by-azure]`

#### AWS ACM Public Certificate:
1. In the AWS Console, go to Certificate Manager (ACM).
2. Click **Request a certificate** > **Request a public certificate**.
3. Enter your domain name (e.g., eventease.com) and wildcard (*.eventease.com).
4. Choose **DNS validation**.
5. Add the CNAME records provided by ACM to your DNS zone.

**CNAME Validation Records:**
- For root domain: `acme-challenge.eventease.com` CNAME [value]
- For wildcard: `acme-challenge.eventease.com` CNAME [value]

### HTTPS Enforcement
#### Application-Level (next.config.ts):
The `next.config.ts` file includes a permanent 301 redirect from HTTP to HTTPS for all routes, handling dynamic paths correctly with `:path*`.

#### Infrastructure-Level:
- **Azure**: In App Service > TLS/SSL settings, enable **HTTPS Only**.
- **AWS**: In Load Balancer settings, configure listeners to redirect HTTP (80) to HTTPS (443).

### Verification
Use these commands to verify DNS propagation and HTTPS enforcement:

**DNS Propagation:**
```
nslookup eventease.com
nslookup www.eventease.com
```

**HTTPS Redirect:**
```
curl -I http://eventease.com
curl -I http://www.eventease.com
```
Expected: HTTP status 301 Moved Permanently, Location header pointing to HTTPS.

### Additional Explanations
- **DNS Validation vs Email Validation**: DNS validation is preferred for certificate renewals as it automates the process without manual email confirmation, reducing the risk of renewal failures. Email validation requires periodic manual intervention.
- **HSTS (Strict-Transport-Security)**: This header prevents protocol downgrade attacks by instructing browsers to only connect via HTTPS for a specified period (e.g., 2 years). It enhances security by mitigating man-in-the-middle attacks that attempt to force HTTP connections.
=======
## Environment Variables

### Build-time Variables (Inlined into the JS bundle)
These variables are prefixed with `NEXT_PUBLIC_` and are accessible in both server and client components. They are embedded in the client-side bundle, so they must be non-sensitive.

| Variable | Description | Example | Visibility |
|----------|-------------|---------|------------|
| `NEXT_PUBLIC_APP_URL` | Public application URL | `https://eventease.com` | Public |

### Runtime Variables (Accessible only via Server Components/API routes)
These variables are server-side only and are loaded from Azure Key Vault. They are never exposed to the client.

| Variable | Description | Example | Visibility |
|----------|-------------|---------|------------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/eventease` | Private |
| `JWT_SECRET` | Secret key for JWT access token signing | `your-super-secret-jwt-key-here` | Private |
| `JWT_REFRESH_SECRET` | Secret key for JWT refresh token signing | `your-refresh-secret-key-here` | Private |
| `RESEND_API_KEY` | API key for Resend email service | `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | Private |
| `AZURE_STORAGE_ACCOUNT` | Azure Storage account name | `your-storage-account-name` | Private |
| `AZURE_STORAGE_ACCESS_KEY` | Azure Storage access key | `your-storage-access-key-here` | Private |
| `AZURITE_CONNECTION_STRING` | Local Azurite connection (dev only) | `UseDevelopmentStorage=true` | Private |
| `AZURE_STORAGE_CONTAINER_NAME` | Azure blob container name | `uploads` | Private |
| `AZURE_STORAGE_CONNECTION_STRING` | Azure Storage connection string | `DefaultEndpointsProtocol=https;...` | Private |

## Security Best Practices

### Environment Variable Security
- **Never commit secrets**: Use Azure Key Vault for production secrets. Local development uses `.env.local` (not committed).
- **Prefix public variables**: Only variables prefixed with `NEXT_PUBLIC_` are accessible in client-side code.
- **Validate all variables**: All environment variables are validated using Zod schemas at startup.
- **Use server-only imports**: For Next.js 16, consider importing `server-only` in server-side utilities to prevent accidental client-side imports.

### File System Security
- **.gitignore protection**: Ensure `.env*`, `.env.local`, and `.env*.local` are in `.gitignore`.
- **No .env in git**: Run `git ls-files | findstr .env.local` to verify `.env.local` is not tracked.
- **Placeholder examples**: `.env.example` contains all variables with placeholder values only.

### Code Security
- **No process.env in client**: Client components should never access `process.env` directly.
- **Server-side validation**: All server-side environment access goes through validated `env` object.
- **Azure Key Vault**: Production secrets are stored securely in Azure Key Vault, not in files.

## Testing

### Testing Pyramid
The testing pyramid is a concept in software testing that illustrates the ideal distribution of different types of automated tests in a project. It emphasizes having more low-level unit tests and fewer high-level end-to-end tests, forming a pyramid shape:

- **Unit Tests** (Base of the pyramid): Test individual functions, components, or modules in isolation. These are fast, reliable, and provide quick feedback.
- **Integration Tests** (Middle layer): Test interactions between different parts of the system, such as API calls or database operations.
- **End-to-End Tests** (Top of the pyramid): Test the entire application flow from the user's perspective, simulating real user interactions.

### Coverage Thresholds
EventEase maintains an 80% coverage threshold for lines, branches, and functions to ensure code resilience. This threshold:
- Encourages comprehensive testing without being overly restrictive
- Helps catch regressions and maintain code quality
- Balances development speed with testing rigor
- Ensures critical paths are well-tested while allowing flexibility for less critical code

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Structure
- **Unit Tests**: Located in `src/__tests__/` with `.test.tsx` or `.test.ts` extensions
- **Setup**: `src/__tests__/setup.ts` configures Jest environment and mocks
- **Configuration**: `jest.config.ts` uses Next.js transformer for compatibility with Turbopack
 
 # #   C I / C D   P i p e l i n e  
  
 T h i s   p r o j e c t   u s e s   * * G i t H u b   A c t i o n s * *   f o r   C o n t i n u o u s   I n t e g r a t i o n   a n d   C o n t i n u o u s   D e p l o y m e n t   ( C I / C D ) .   T h e   p i p e l i n e   r u n s   a u t o m a t i c a l l y   o n   p u s h   a n d   p u l l   r e q u e s t s   t o   ` m a i n `   a n d   ` d e v e l o p `   b r a n c h e s .  
  
 # # #   W o r k f l o w   C o n f i g u r a t i o n  
  
 T h e   w o r k f l o w   i s   d e f i n e d   i n   ` . g i t h u b / w o r k f l o w s / c i . y m l ` .  
  
 # # #   S t a g e s  
 1 .   * * L i n t * * :   C h e c k s   f o r   c o d e   q u a l i t y   a n d   s t y l e   i s s u e s   u s i n g   E S L i n t   ( ` n p m   r u n   l i n t ` ) .  
 2 .   * * T e s t * * :   R u n s   u n i t   t e s t s   w i t h   J e s t   a n d   g e n e r a t e s   a   c o v e r a g e   r e p o r t   ( ` n p m   t e s t   - -   - - c o v e r a g e ` ) .  
 3 .   * * B u i l d * * :   C o m p i l e s   t h e   N e x t . j s   a p p l i c a t i o n   t o   e n s u r e   v a l i d   p r o d u c t i o n   b u i l d   ( ` n p m   r u n   b u i l d ` ) .  
 4 .   * * D e p l o y * * :   ( O p t i o n a l )   D e p l o y s   t h e   a p p l i c a t i o n   t o   c l o u d   p r o v i d e r s   w h e n   c h a n g e s   a r e   p u s h e d   t o   ` m a i n ` .  
  
 # # #   O p t i m i z a t i o n s  
 -   * * C a c h i n g * * :   ` n p m `   d e p e n d e n c i e s   a r e   c a c h e d   t o   s p e e d   u p   w o r k f l o w   e x e c u t i o n .  
 -   * * C o n c u r r e n c y * * :   P r e v e n t s   r e d u n d a n t   b u i l d s   b y   c a n c e l l i n g   i n - p r o g r e s s   r u n s   f o r   t h e   s a m e   b r a n c h .  
  
 # # #   S e c r e t s  
 C l o u d   d e p l o y m e n t   c r e d e n t i a l s   s h o u l d   b e   s t o r e d   i n   G i t H u b   S e c r e t s :  
 -   ` A W S _ A C C E S S _ K E Y _ I D `  
 -   ` A W S _ S E C R E T _ A C C E S S _ K E Y `  
 