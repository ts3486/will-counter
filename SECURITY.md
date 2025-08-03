# Security Guidelines for Will Counter Application

## Environment Variables and Secrets Management

### ✅ Implemented
- Environment variable validation at startup
- No hardcoded secrets in source code
- Secure environment configuration with validation
- Masked sensitive data in logs

### 📋 Security Checklist
- [ ] Rotate secrets every 90 days
- [ ] Use different secrets for dev/staging/production
- [ ] Monitor Auth0 and Supabase dashboards for unauthorized access
- [ ] Restrict database access to specific IP addresses

## Input Validation

### ✅ Implemented
- Comprehensive input validation for all API endpoints
- Email format validation with normalization
- Auth0 ID format validation
- Parameter length and format restrictions
- Request parameter sanitization

### 🔒 Validation Rules
- Email: Must be valid format, max 255 characters
- Auth0 ID: Alphanumeric with allowed special chars, max 100 characters
- User ID: Alphanumeric with allowed special chars, max 100 characters
- Days parameter: Integer between 1-365

## Rate Limiting

### ✅ Implemented
- Per-IP rate limiting with different tiers:
  - Default endpoints: 60 requests/minute
  - Authentication endpoints: 5 requests/minute
  - Increment endpoints: 10 requests/minute
- Automatic cleanup of rate limit tracking data

### ⚙️ Configuration
Rate limits can be adjusted in `RateLimitConfig.kt` based on usage patterns.

## Error Handling

### ✅ Implemented
- Generic error responses that don't leak internal details
- Unique error IDs for debugging
- Separate internal logging vs user-facing messages
- Structured error codes for API consistency

### 📊 Error Codes
- `VALIDATION_001`: Invalid input provided
- `AUTH_001`: Authentication required
- `AUTH_002`: Access denied
- `USER_001`: User not found
- `RESOURCE_001`: Resource not found
- `RATE_001`: Rate limit exceeded
- `INTERNAL_001`: Internal server error
- `DB_001`: Database operation failed

## Dependency Security

### 🔄 Maintenance Required
- Regular dependency updates (monthly)
- Security vulnerability scanning
- Monitoring for CVE announcements

### 📦 Current Dependencies
All dependencies are using stable, maintained versions:
- Ktor 2.3.12 (latest stable)
- Kotlin 1.9.25
- PostgreSQL driver 42.7.3
- Auth0 libraries (latest)

## Additional Security Measures

### ✅ CORS Configuration
- Configured for production safety
- Can be restricted to specific domains

### ✅ Authentication
- JWT token validation
- Auth0 integration with proper verification
- No token leakage in logs

### 🔐 Production Recommendations
1. Use HTTPS only in production
2. Configure specific CORS origins
3. Set up monitoring and alerting
4. Regular security audits
5. Database connection pooling with limits
6. Request size limits
7. Timeout configurations

## Testing

### ✅ Security Tests
- Input validation tests
- Rate limiting verification
- Error handling validation

Run tests with: `./gradlew test`

## Monitoring

### 📈 Recommended Monitoring
- Failed authentication attempts
- Rate limit violations
- Error rates by endpoint
- Unusual access patterns
- Database connection health

---

Last updated: $(date)
Security review frequency: Monthly