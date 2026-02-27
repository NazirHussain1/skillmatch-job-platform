# Quick Reference - Monitoring & Observability

## 🚀 Quick Start

```bash
# Start server
npm start

# Check if server is alive
curl http://localhost:5000/health/live

# Check if server is ready
curl http://localhost:5000/health/ready

# View metrics
curl http://localhost:5000/health/metrics
```

## 📍 Endpoints

| Endpoint | Purpose | Response |
|----------|---------|----------|
| `/health/live` | Liveness probe | 200 if running |
| `/health/ready` | Readiness probe | 200 if ready to serve |
| `/health/health` | Detailed health | Full health status |
| `/health/metrics` | JSON metrics | All metrics in JSON |
| `/health/metrics/prometheus` | Prometheus metrics | Prometheus format |

## 📊 Key Metrics

```bash
# View all metrics
curl http://localhost:5000/health/metrics | jq

# View specific metric
curl http://localhost:5000/health/metrics | jq '.requests.total'
curl http://localhost:5000/health/metrics | jq '.cache.hitRate'
curl http://localhost:5000/health/metrics | jq '.responseTime.avg'
```

## 🔍 Correlation IDs

```bash
# Send request with custom correlation ID
curl -H "X-Correlation-ID: test-123" http://localhost:5000/api/jobs

# Find in logs
grep "test-123" logs/combined.log
grep "test-123" logs/error.log
```

## 📝 Logs

```bash
# View all logs
tail -f logs/combined.log

# View errors only
tail -f logs/error.log

# Search by correlation ID
grep "abc-123" logs/combined.log

# Search by user ID
grep "userId.*123" logs/combined.log

# View JSON formatted
tail logs/combined.log | jq
```

## 🎯 Common Monitoring Tasks

### Check Error Rate
```bash
curl http://localhost:5000/health/metrics | jq '.errors.rate'
```

### Check Response Time
```bash
curl http://localhost:5000/health/metrics | jq '.responseTime'
```

### Check Cache Performance
```bash
curl http://localhost:5000/health/metrics | jq '.cache'
```

### Check Database Performance
```bash
curl http://localhost:5000/health/metrics | jq '.database'
```

### Check Uptime
```bash
curl http://localhost:5000/health/metrics | jq '.uptime.formatted'
```

## 🚨 Alert Thresholds

| Metric | Threshold | Action |
|--------|-----------|--------|
| Error Rate | > 5% | Investigate immediately |
| Response Time | > 500ms | Check performance |
| Cache Hit Rate | < 70% | Review cache strategy |
| DB Query Time | > 100ms | Optimize queries |

## 🔧 Environment Variables

```env
# Logging
LOG_LEVEL=info          # error, warn, info, debug

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

## 📈 Prometheus Integration

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'skillmatch'
    static_configs:
      - targets: ['localhost:5000']
    metrics_path: '/health/metrics/prometheus'
    scrape_interval: 15s
```

## 🐳 Docker Health Checks

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5000/health/live || exit 1
```

## ☸️ Kubernetes Probes

```yaml
livenessProbe:
  httpGet:
    path: /health/live
    port: 5000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health/ready
    port: 5000
  initialDelaySeconds: 10
  periodSeconds: 5
```

## 🐛 Debugging

### Find slow requests
```bash
grep "duration.*[5-9][0-9][0-9]ms" logs/combined.log
```

### Find errors
```bash
grep "level.*error" logs/combined.log
```

### Trace a specific request
```bash
# Get correlation ID from response header
curl -v http://localhost:5000/api/jobs 2>&1 | grep "X-Correlation-ID"

# Search logs
grep "correlation-id-here" logs/combined.log
```

## 📊 Grafana Dashboard Queries

```promql
# Request rate
rate(http_requests_total[5m])

# Error rate
rate(http_errors_total[5m]) / rate(http_requests_total[5m])

# Average response time
http_response_time_ms{type="avg"}

# Cache hit rate
cache_hit_rate

# Database query duration
db_query_duration_ms
```

## 🔄 Log Rotation

Logs automatically rotate:
- Max file size: 5MB
- Max files: 5
- Old files deleted automatically

## 💡 Tips

1. **Always use correlation IDs** when debugging
2. **Monitor cache hit rate** - aim for >80%
3. **Set up alerts** for critical metrics
4. **Review error logs daily**
5. **Use readiness probe** for deployments
6. **Scrape metrics** every 15-30 seconds
7. **Keep log level at info** in production

## 📚 More Info

- Full documentation: `MONITORING.md`
- Implementation summary: `OBSERVABILITY_SUMMARY.md`
- Usage examples: `examples/monitoring-usage.js`
