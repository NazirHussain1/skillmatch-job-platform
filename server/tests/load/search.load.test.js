/**
 * Load Test for Search Endpoint
 * 
 * Run with: node tests/load/search.load.test.js
 * Or with artillery: artillery run tests/load/search.artillery.yml
 */

import http from 'http';
import https from 'https';

class LoadTester {
  constructor(config) {
    this.baseUrl = config.baseUrl || 'http://localhost:5000';
    this.concurrency = config.concurrency || 10;
    this.duration = config.duration || 60000; // 60 seconds
    this.rampUp = config.rampUp || 5000; // 5 seconds
    
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      errors: {},
      startTime: null,
      endTime: null
    };
  }

  async makeRequest(path, options = {}) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const url = new URL(path, this.baseUrl);
      const protocol = url.protocol === 'https:' ? https : http;

      const req = protocol.request(url, {
        method: options.method || 'GET',
        headers: options.headers || {}
      }, (res) => {
        let data = '';

        res.on('data', chunk => {
          data += chunk;
        });

        res.on('end', () => {
          const responseTime = Date.now() - startTime;
          
          resolve({
            statusCode: res.statusCode,
            responseTime,
            data: data ? JSON.parse(data) : null
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (options.body) {
        req.write(JSON.stringify(options.body));
      }

      req.end();
    });
  }

  async runTest() {
    console.log('🚀 Starting load test...');
    console.log(`   Base URL: ${this.baseUrl}`);
    console.log(`   Concurrency: ${this.concurrency}`);
    console.log(`   Duration: ${this.duration}ms`);
    console.log(`   Ramp-up: ${this.rampUp}ms\n`);

    this.stats.startTime = Date.now();
    const endTime = this.stats.startTime + this.duration;
    
    const workers = [];
    const rampUpDelay = this.rampUp / this.concurrency;

    // Ramp up workers
    for (let i = 0; i < this.concurrency; i++) {
      await new Promise(resolve => setTimeout(resolve, rampUpDelay));
      workers.push(this.worker(endTime));
    }

    // Wait for all workers to complete
    await Promise.all(workers);

    this.stats.endTime = Date.now();
    this.printResults();
  }

  async worker(endTime) {
    const searchQueries = [
      '/api/search/jobs?search=developer',
      '/api/search/jobs?search=engineer&location=Remote',
      '/api/search/jobs?search=designer&type=Full-time',
      '/api/search/jobs?search=manager&experienceLevel=senior',
      '/api/search/jobs?skills=JavaScript,React',
      '/api/search/jobs?salaryMin=80000&salaryMax=120000',
      '/api/search/jobs?search=data+scientist&location=San+Francisco',
      '/api/search/jobs?search=product+manager&type=Remote',
    ];

    while (Date.now() < endTime) {
      const query = searchQueries[Math.floor(Math.random() * searchQueries.length)];
      
      try {
        this.stats.totalRequests++;
        
        const result = await this.makeRequest(query);
        
        if (result.statusCode >= 200 && result.statusCode < 300) {
          this.stats.successfulRequests++;
          this.stats.responseTimes.push(result.responseTime);
        } else {
          this.stats.failedRequests++;
          this.recordError(`HTTP ${result.statusCode}`);
        }
      } catch (error) {
        this.stats.failedRequests++;
        this.recordError(error.message);
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  recordError(error) {
    this.stats.errors[error] = (this.stats.errors[error] || 0) + 1;
  }

  printResults() {
    const duration = (this.stats.endTime - this.stats.startTime) / 1000;
    const responseTimes = this.stats.responseTimes.sort((a, b) => a - b);
    
    const avg = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const min = responseTimes[0];
    const max = responseTimes[responseTimes.length - 1];
    const p50 = responseTimes[Math.floor(responseTimes.length * 0.5)];
    const p95 = responseTimes[Math.floor(responseTimes.length * 0.95)];
    const p99 = responseTimes[Math.floor(responseTimes.length * 0.99)];

    console.log('\n📊 Load Test Results');
    console.log('═══════════════════════════════════════\n');
    
    console.log('Request Statistics:');
    console.log(`  Total Requests:      ${this.stats.totalRequests}`);
    console.log(`  Successful:          ${this.stats.successfulRequests} (${(this.stats.successfulRequests / this.stats.totalRequests * 100).toFixed(2)}%)`);
    console.log(`  Failed:              ${this.stats.failedRequests} (${(this.stats.failedRequests / this.stats.totalRequests * 100).toFixed(2)}%)`);
    console.log(`  Requests/sec:        ${(this.stats.totalRequests / duration).toFixed(2)}\n`);

    console.log('Response Time (ms):');
    console.log(`  Min:                 ${min}`);
    console.log(`  Max:                 ${max}`);
    console.log(`  Average:             ${avg.toFixed(2)}`);
    console.log(`  Median (p50):        ${p50}`);
    console.log(`  95th percentile:     ${p95}`);
    console.log(`  99th percentile:     ${p99}\n`);

    if (Object.keys(this.stats.errors).length > 0) {
      console.log('Errors:');
      Object.entries(this.stats.errors).forEach(([error, count]) => {
        console.log(`  ${error}: ${count}`);
      });
      console.log('');
    }

    // Performance assessment
    console.log('Performance Assessment:');
    if (avg < 100) {
      console.log('  ✅ Excellent - Average response time < 100ms');
    } else if (avg < 500) {
      console.log('  ✅ Good - Average response time < 500ms');
    } else if (avg < 1000) {
      console.log('  ⚠️  Fair - Average response time < 1000ms');
    } else {
      console.log('  ❌ Poor - Average response time > 1000ms');
    }

    if (p95 < 500) {
      console.log('  ✅ Excellent - 95th percentile < 500ms');
    } else if (p95 < 1000) {
      console.log('  ⚠️  Fair - 95th percentile < 1000ms');
    } else {
      console.log('  ❌ Poor - 95th percentile > 1000ms');
    }

    const successRate = this.stats.successfulRequests / this.stats.totalRequests * 100;
    if (successRate > 99) {
      console.log('  ✅ Excellent - Success rate > 99%');
    } else if (successRate > 95) {
      console.log('  ✅ Good - Success rate > 95%');
    } else if (successRate > 90) {
      console.log('  ⚠️  Fair - Success rate > 90%');
    } else {
      console.log('  ❌ Poor - Success rate < 90%');
    }

    console.log('\n═══════════════════════════════════════\n');
  }
}

// Run the test
const tester = new LoadTester({
  baseUrl: process.env.API_URL || 'http://localhost:5000',
  concurrency: parseInt(process.env.CONCURRENCY) || 10,
  duration: parseInt(process.env.DURATION) || 60000,
  rampUp: parseInt(process.env.RAMP_UP) || 5000
});

tester.runTest().catch(console.error);
