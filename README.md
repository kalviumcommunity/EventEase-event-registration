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
=======
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/eventease` |
| `JWT_SECRET` | Secret key for JWT access token signing | `your-super-secret-jwt-key-here` |
| `JWT_REFRESH_SECRET` | Secret key for JWT refresh token signing | `your-refresh-secret-key-here` |
| `RESEND_API_KEY` | API key for Resend email service | `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `AZURE_STORAGE_ACCOUNT` | Azure Storage account name | `your-storage-account-name` |
| `AZURE_STORAGE_ACCESS_KEY` | Azure Storage access key | `your-storage-access-key-here` |
| `AZURITE_CONNECTION_STRING` | Local Azurite connection (dev only) | `UseDevelopmentStorage=true` |
| `AZURE_STORAGE_CONTAINER_NAME` | Azure blob container name | `uploads` |
