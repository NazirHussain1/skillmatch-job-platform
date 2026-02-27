# Monitoring, Metrics, and Health Checks

## Overview
The application includes comprehensive monitoring, metrics collection, structured logging, and health check endpoints.

## Health Check Endpoints

### Liveness Probe
**Endpoint:** `GET /health/live`

Checks if the application is running. Returns 200 if the process is alive.

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Readiness Probe
**Endpoint:** `GET /health/ready`

Checks if the application is ready to serve traffic (database and Redis connectivity).

```json
{
  "status": "ready",
  "checks": {
    "database": true,
    "redis": true,
    "overall": true
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Detailed Health Check
**Endpoint:** `GET /health/health`

Provides detailed health information including service response times and system metrics.

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "services": {
    "database": {
      "status": "healthy",
      "responseTime": "5ms"
    },
    "redis": {
      "status": "healthy",
      "responseTime": "2ms"
    }
  },
  "system": {
    "memory": {
      "used": 50000000,
      "total": 100000000,
      "percentage": "50.00%"
    },
    "cpu": { ... }
  }
}
```

## Metrics Endpoints

### JSON Metrics
**Endpoint:** `GET /health/metrics`

Returns metrics in JSON format.

```json
{
  "uptime": {
    "ms": 3600000,
    "seconds": 3600,
    "formatted": "1h 0m 0s"
  },
  "requests": {
    "total": 1000,
    "byMethod": { "GET": 800, "POST": 200 },
    "byStatus": { "200": 950, "404": 30, "500": 20 },
    "byRoute": { "/api/jobs": 500, "/api/users": 300 }
  },
  "responseTime": {
    "total": 50000,
    "count": 1000,
    "min": 5,
    "max": 500,
    "avg": 50
  },
  "errors": {
    "total": 50,
    "byType": { "4xx": 30, "5xx": 20 },
    "rate": "5.00%"
  },
  "database": {
    "queries": 5000,
    "totalDuration": 25000,
    "avgDuration": 5
  },
  "cache": {
    "hits": 800,
    "misses": 200,
    "hitRate": "80.00%"
  }
}
```

### Prometheus Metrics
**Endpoint:** `GET /health/metrics/prometheus`

Returns metrics in Prometheus format for scraping.

```
# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total 1000

# HELP http_response_time_ms HTTP response time in milliseconds
# TYPE http_response_time_ms gauge
http_response_time_ms{type="avg"} 50.00
...
```

## Structured Logging

### Log Levels
- `error`: Error events that might still allow the application to continue running
- `warn`: Warning events that might cause problems
- `info`: Informational messages that highlight progress
- `debug`: Detailed information for debugging (set LOG_LEVEL=debug)

### Log Format
All logs are in JSON format with the following structure:

```json
{
  "timestamp": "2024-01-01 00:00:00",
  "level": "info",
  "message": "Incoming request",
  "correlationId": "uuid-v4",
  "method": "GET",
  "url": "/api/jobs",
  "service": "skillmatch-api"
}
```

### Correlation IDs
Every request is assigned a unique correlation ID that tracks the request through the entire system. The correlation ID is:
- Generated automatically or taken from `X-Correlation-ID` header
- Included in all log entries for that request
- Returned in the response header `X-Correlation-ID`

### Sensitive Data Masking
The logger automatically masks sensitive fields:
- password
- token
- refreshToken
- authorization
- cookie
- secret

### Log Files
Logs are written to:
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only
- Console - Formatted output with colors

Log rotation:
- Max file size: 5MB
- Max files: 5 (oldest deleted when limit reached)

## Tracked Metrics

### HTTP Metrics
- Total requests
- Requests by method (GET, POST, PUT, DELETE)
- Requests by status code
- Requests by route
- Response time (min, max, avg)
- Error rate

### Database Metrics
- Total queries executed
- Total query duration
- Average query duration

### Cache Metrics
- Cache hits
- Cache misses
- Cache hit rate percentage

### System Metrics
- Uptime
- Memory usage
- CPU usage

## Usage Examples

### Kubernetes Liveness Probe
```yaml
livenessProbe:
  httpGet:
    path: /health/live
    port: 5000
  initialDelaySeconds: 30
  periodSeconds: 10
```

### Kubernetes Readiness Probe
```yaml
readinessProbe:
  httpGet:
    path: /health/ready
    port: 5000
  initialDelaySeconds: 10
  periodSeconds: 5
```

### Prometheus Scrape Config
```yaml
scrape_configs:
  - job_name: 'skillmatch-api'
    static_configs:
      - targets: ['localhost:5000']
    metrics_path: '/health/metrics/prometheus'
```

### Tracking Correlation IDs
```bash
# Send request with correlation ID
curl -H "X-Correlation-ID: my-custom-id" http://localhost:5000/api/jobs

# Check logs for that correlation ID
grep "my-custom-id" logs/combined.log
```

## Environment Variables

```env
# Logging
LOG_LEVEL=info  # Options: error, warn, info, debug
```

## Best Practices

1. **Always use correlation IDs** when debugging issues across multiple services
2. **Monitor cache hit rate** - aim for >80% for optimal performance
3. **Set up alerts** for error rate >5% or response time >500ms
4. **Use readiness probe** for zero-downtime deployments
5. **Scrape Prometheus metrics** every 15-30 seconds
6. **Rotate logs regularly** to prevent disk space issues
7. **Review error logs daily** to catch issues early
