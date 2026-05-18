#!/usr/bin/env node

const DEFAULT_TIMEOUT_MS = 15000;

const args = process.argv.slice(2);

const getArgValue = (name) => {
  const prefix = `--${name}=`;
  const match = args.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : undefined;
};

const normalizeBaseUrl = (value) => {
  if (!value) return '';
  return value.replace(/\/+$/, '');
};

const backendUrl = normalizeBaseUrl(getArgValue('backend') || process.env.BACKEND_URL);
const frontendUrl = normalizeBaseUrl(getArgValue('frontend') || process.env.FRONTEND_URL);

const timeoutMs = Number(getArgValue('timeout') || process.env.SMOKE_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);

if (!backendUrl) {
  process.stderr.write('Missing backend URL. Use --backend=https://api.example.com or BACKEND_URL.\n');
  process.exit(1);
}

const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }
};

const assertResponse = async ({ name, url, expectedStatus = 200, validate }) => {
  const response = await fetchWithTimeout(url);
  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text().catch(() => '');

  if (response.status !== expectedStatus) {
    throw new Error(`${name} failed: expected ${expectedStatus}, got ${response.status} for ${url}`);
  }

  if (validate) {
    validate(body, response);
  }

  process.stdout.write(`PASS ${name}\n`);
  return body;
};

const run = async () => {
  await assertResponse({
    name: 'backend health',
    url: `${backendUrl}/api/health`,
    validate: (body) => {
      if (!body || body.status !== 'OK') {
        throw new Error('backend health failed: response did not contain status OK');
      }
    }
  });

  await assertResponse({
    name: 'backend readiness',
    url: `${backendUrl}/api/ready`,
    validate: (body) => {
      if (!body || body.ready !== true || body.status !== 'ready') {
        throw new Error('backend readiness failed: API is running but not production-ready');
      }
    }
  });

  const jobsBody = await assertResponse({
    name: 'public jobs API',
    url: `${backendUrl}/api/jobs?limit=1`,
    validate: (body) => {
      if (!body || body.success !== true || !body.data || !Array.isArray(body.data.jobs)) {
        throw new Error('public jobs API failed: response shape is invalid');
      }
    }
  });

  const firstJob = jobsBody.data.jobs[0];

  if (firstJob?._id) {
    await assertResponse({
      name: 'public job detail API',
      url: `${backendUrl}/api/jobs/${firstJob._id}`,
      validate: (body) => {
        if (!body || body.success !== true || !body.data || body.data._id !== firstJob._id) {
          throw new Error('public job detail API failed: response shape is invalid');
        }
      }
    });
  } else {
    process.stdout.write('SKIP public job detail API: no active public jobs found\n');
  }

  if (frontendUrl) {
    await assertResponse({
      name: 'frontend home',
      url: frontendUrl,
      validate: (body) => {
        if (typeof body !== 'string' || !body.includes('SkillMatch')) {
          throw new Error('frontend home failed: HTML did not include SkillMatch');
        }
      }
    });

    await assertResponse({
      name: 'frontend jobs route',
      url: `${frontendUrl}/jobs`,
      validate: (body) => {
        if (typeof body !== 'string' || !body.includes('SkillMatch')) {
          throw new Error('frontend jobs route failed: SPA fallback did not return app HTML');
        }
      }
    });

    if (firstJob?._id) {
      await assertResponse({
        name: 'frontend job details route',
        url: `${frontendUrl}/jobs/${firstJob._id}`,
        validate: (body) => {
          if (typeof body !== 'string' || !body.includes('SkillMatch')) {
            throw new Error('frontend job details route failed: SPA fallback did not return app HTML');
          }
        }
      });
    }
  }

  process.stdout.write('Smoke test completed.\n');
};

run().catch((error) => {
  process.stderr.write(`FAIL ${error.message}\n`);
  process.exit(1);
});
