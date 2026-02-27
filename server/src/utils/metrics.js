class MetricsCollector {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        byMethod: {},
        byStatus: {},
        byRoute: {}
      },
      responseTime: {
        total: 0,
        count: 0,
        min: Infinity,
        max: 0,
        avg: 0
      },
      errors: {
        total: 0,
        byType: {}
      },
      database: {
        queries: 0,
        totalDuration: 0,
        avgDuration: 0
      },
      cache: {
        hits: 0,
        misses: 0,
        hitRate: 0
      }
    };
    
    this.startTime = Date.now();
  }

  // Record HTTP request
  recordRequest(method, route, statusCode, duration) {
    this.metrics.requests.total++;
    
    // By method
    this.metrics.requests.byMethod[method] = (this.metrics.requests.byMethod[method] || 0) + 1;
    
    // By status
    this.metrics.requests.byStatus[statusCode] = (this.metrics.requests.byStatus[statusCode] || 0) + 1;
    
    // By route (simplified)
    const simplifiedRoute = this.simplifyRoute(route);
    this.metrics.requests.byRoute[simplifiedRoute] = (this.metrics.requests.byRoute[simplifiedRoute] || 0) + 1;
    
    // Response time
    this.metrics.responseTime.total += duration;
    this.metrics.responseTime.count++;
    this.metrics.responseTime.min = Math.min(this.metrics.responseTime.min, duration);
    this.metrics.responseTime.max = Math.max(this.metrics.responseTime.max, duration);
    this.metrics.responseTime.avg = this.metrics.responseTime.total / this.metrics.responseTime.count;
    
    // Error tracking
    if (statusCode >= 400) {
      this.metrics.errors.total++;
      const errorType = statusCode >= 500 ? '5xx' : '4xx';
      this.metrics.errors.byType[errorType] = (this.metrics.errors.byType[errorType] || 0) + 1;
    }
  }

  // Record database query
  recordDbQuery(duration) {
    this.metrics.database.queries++;
    this.metrics.database.totalDuration += duration;
    this.metrics.database.avgDuration = this.metrics.database.totalDuration / this.metrics.database.queries;
  }

  // Record cache hit
  recordCacheHit() {
    this.metrics.cache.hits++;
    this.updateCacheHitRate();
  }

  // Record cache miss
  recordCacheMiss() {
    this.metrics.cache.misses++;
    this.updateCacheHitRate();
  }

  // Update cache hit rate
  updateCacheHitRate() {
    const total = this.metrics.cache.hits + this.metrics.cache.misses;
    this.metrics.cache.hitRate = total > 0 ? (this.metrics.cache.hits / total) * 100 : 0;
  }

  // Simplify route for grouping
  simplifyRoute(route) {
    // Remove query parameters
    const path = route.split('?')[0];
    
    // Replace IDs with :id
    return path.replace(/\/[0-9a-fA-F]{24}/g, '/:id')
               .replace(/\/\d+/g, '/:id');
  }

  // Get all metrics
  getMetrics() {
    const uptime = Date.now() - this.startTime;
    
    return {
      uptime: {
        ms: uptime,
        seconds: Math.floor(uptime / 1000),
        formatted: this.formatUptime(uptime)
      },
      requests: this.metrics.requests,
      responseTime: {
        ...this.metrics.responseTime,
        min: this.metrics.responseTime.min === Infinity ? 0 : this.metrics.responseTime.min
      },
      errors: {
        ...this.metrics.errors,
        rate: this.metrics.requests.total > 0 
          ? ((this.metrics.errors.total / this.metrics.requests.total) * 100).toFixed(2) + '%'
          : '0%'
      },
      database: this.metrics.database,
      cache: {
        ...this.metrics.cache,
        hitRate: this.metrics.cache.hitRate.toFixed(2) + '%'
      },
      timestamp: new Date().toISOString()
    };
  }

  // Get Prometheus-compatible metrics
  getPrometheusMetrics() {
    const metrics = this.getMetrics();
    let output = '';

    // HTTP requests total
    output += '# HELP http_requests_total Total number of HTTP requests\n';
    output += '# TYPE http_requests_total counter\n';
    output += `http_requests_total ${metrics.requests.total}\n\n`;

    // HTTP requests by method
    output += '# HELP http_requests_by_method_total HTTP requests by method\n';
    output += '# TYPE http_requests_by_method_total counter\n';
    for (const [method, count] of Object.entries(metrics.requests.byMethod)) {
      output += `http_requests_by_method_total{method="${method}"} ${count}\n`;
    }
    output += '\n';

    // HTTP requests by status
    output += '# HELP http_requests_by_status_total HTTP requests by status code\n';
    output += '# TYPE http_requests_by_status_total counter\n';
    for (const [status, count] of Object.entries(metrics.requests.byStatus)) {
      output += `http_requests_by_status_total{status="${status}"} ${count}\n`;
    }
    output += '\n';

    // Response time
    output += '# HELP http_response_time_ms HTTP response time in milliseconds\n';
    output += '# TYPE http_response_time_ms gauge\n';
    output += `http_response_time_ms{type="avg"} ${metrics.responseTime.avg.toFixed(2)}\n`;
    output += `http_response_time_ms{type="min"} ${metrics.responseTime.min}\n`;
    output += `http_response_time_ms{type="max"} ${metrics.responseTime.max}\n\n`;

    // Error rate
    output += '# HELP http_errors_total Total number of HTTP errors\n';
    output += '# TYPE http_errors_total counter\n';
    output += `http_errors_total ${metrics.errors.total}\n\n`;

    // Database queries
    output += '# HELP db_queries_total Total number of database queries\n';
    output += '# TYPE db_queries_total counter\n';
    output += `db_queries_total ${metrics.database.queries}\n\n`;

    output += '# HELP db_query_duration_ms Average database query duration\n';
    output += '# TYPE db_query_duration_ms gauge\n';
    output += `db_query_duration_ms ${metrics.database.avgDuration.toFixed(2)}\n\n`;

    // Cache metrics
    output += '# HELP cache_hits_total Total number of cache hits\n';
    output += '# TYPE cache_hits_total counter\n';
    output += `cache_hits_total ${metrics.cache.hits}\n\n`;

    output += '# HELP cache_misses_total Total number of cache misses\n';
    output += '# TYPE cache_misses_total counter\n';
    output += `cache_misses_total ${metrics.cache.misses}\n\n`;

    output += '# HELP cache_hit_rate Cache hit rate percentage\n';
    output += '# TYPE cache_hit_rate gauge\n';
    output += `cache_hit_rate ${this.metrics.cache.hitRate.toFixed(2)}\n\n`;

    // Uptime
    output += '# HELP process_uptime_seconds Process uptime in seconds\n';
    output += '# TYPE process_uptime_seconds counter\n';
    output += `process_uptime_seconds ${metrics.uptime.seconds}\n\n`;

    return output;
  }

  // Format uptime
  formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  // Reset metrics
  reset() {
    this.metrics = {
      requests: {
        total: 0,
        byMethod: {},
        byStatus: {},
        byRoute: {}
      },
      responseTime: {
        total: 0,
        count: 0,
        min: Infinity,
        max: 0,
        avg: 0
      },
      errors: {
        total: 0,
        byType: {}
      },
      database: {
        queries: 0,
        totalDuration: 0,
        avgDuration: 0
      },
      cache: {
        hits: 0,
        misses: 0,
        hitRate: 0
      }
    };
    this.startTime = Date.now();
  }
}

// Create singleton instance
const metricsCollector = new MetricsCollector();

export default metricsCollector;
