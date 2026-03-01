// Jobs CRUD Test Script
// Run with: node test-jobs.js

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test data
const employerUser = {
  name: 'Employer Test',
  email: `employer${Date.now()}@example.com`,
  password: 'password123',
  role: 'employer'
};

const testJob = {
  title: 'Senior Software Engineer',
  company: 'Tech Corp',
  description: 'We are looking for an experienced software engineer with 5+ years of experience in Node.js and React.',
  location: 'San Francisco, CA',
  salary: 150000
};

let employerToken = '';
let createdJobId = '';

// Helper function for API calls
async function apiCall(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${API_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

// Test functions
async function setupEmployer() {
  console.log('\n🔧 Setting up employer account...');
  const result = await apiCall('POST', '/auth/register', employerUser);
  
  if (result.success) {
    console.log('✅ Employer account created');
    employerToken = result.data.data.token;
    return true;
  } else {
    console.log('❌ Failed to create employer:', result.error);
    return false;
  }
}

async function testGetAllJobs() {
  console.log('\n📋 Testing Get All Jobs...');
  const result = await apiCall('GET', '/jobs');
  
  if (result.success) {
    console.log('✅ Get all jobs successful');
    console.log(`Found ${result.data.data.length} jobs`);
    return true;
  } else {
    console.log('❌ Get all jobs failed:', result.error);
    return false;
  }
}

async function testCreateJob() {
  console.log('\n➕ Testing Create Job...');
  const result = await apiCall('POST', '/jobs', testJob, employerToken);
  
  if (result.success) {
    console.log('✅ Job created successfully');
    console.log('Title:', result.data.data.title);
    console.log('Company:', result.data.data.company);
    console.log('Salary:', result.data.data.salary);
    console.log('Job ID:', result.data.data._id);
    createdJobId = result.data.data._id;
    return true;
  } else {
    console.log('❌ Create job failed:', result.error);
    return false;
  }
}

async function testCreateJobWithoutAuth() {
  console.log('\n🚫 Testing Create Job Without Auth...');
  const result = await apiCall('POST', '/jobs', testJob);
  
  if (!result.success) {
    console.log('✅ Correctly rejected (no auth)');
    return true;
  } else {
    console.log('❌ Should have been rejected');
    return false;
  }
}

async function testGetSingleJob() {
  console.log('\n📄 Testing Get Single Job...');
  const result = await apiCall('GET', `/jobs/${createdJobId}`);
  
  if (result.success) {
    console.log('✅ Get single job successful');
    console.log('Title:', result.data.data.title);
    console.log('Company:', result.data.data.company);
    console.log('Employer:', result.data.data.employer.name);
    return true;
  } else {
    console.log('❌ Get single job failed:', result.error);
    return false;
  }
}

async function testUpdateJob() {
  console.log('\n✏️  Testing Update Job...');
  const updates = {
    title: 'Lead Software Engineer',
    salary: 180000,
    location: 'Remote'
  };
  
  const result = await apiCall('PUT', `/jobs/${createdJobId}`, updates, employerToken);
  
  if (result.success) {
    console.log('✅ Job updated successfully');
    console.log('New Title:', result.data.data.title);
    console.log('New Salary:', result.data.data.salary);
    console.log('New Location:', result.data.data.location);
    return true;
  } else {
    console.log('❌ Update job failed:', result.error);
    return false;
  }
}

async function testUpdateJobWithoutAuth() {
  console.log('\n🚫 Testing Update Job Without Auth...');
  const updates = { salary: 200000 };
  const result = await apiCall('PUT', `/jobs/${createdJobId}`, updates);
  
  if (!result.success) {
    console.log('✅ Correctly rejected (no auth)');
    return true;
  } else {
    console.log('❌ Should have been rejected');
    return false;
  }
}

async function testDeleteJobWithoutAuth() {
  console.log('\n🚫 Testing Delete Job Without Auth...');
  const result = await apiCall('DELETE', `/jobs/${createdJobId}`);
  
  if (!result.success) {
    console.log('✅ Correctly rejected (no auth)');
    return true;
  } else {
    console.log('❌ Should have been rejected');
    return false;
  }
}

async function testDeleteJob() {
  console.log('\n🗑️  Testing Delete Job...');
  const result = await apiCall('DELETE', `/jobs/${createdJobId}`, null, employerToken);
  
  if (result.success) {
    console.log('✅ Job deleted successfully');
    return true;
  } else {
    console.log('❌ Delete job failed:', result.error);
    return false;
  }
}

async function testGetDeletedJob() {
  console.log('\n🚫 Testing Get Deleted Job...');
  const result = await apiCall('GET', `/jobs/${createdJobId}`);
  
  if (!result.success) {
    console.log('✅ Correctly returns 404 for deleted job');
    return true;
  } else {
    console.log('❌ Should have returned 404');
    return false;
  }
}

async function testInvalidJobId() {
  console.log('\n🚫 Testing Invalid Job ID...');
  const result = await apiCall('GET', '/jobs/invalid-id');
  
  if (!result.success) {
    console.log('✅ Correctly rejected invalid ID');
    return true;
  } else {
    console.log('❌ Should have rejected invalid ID');
    return false;
  }
}

async function testCreateJobMissingFields() {
  console.log('\n🚫 Testing Create Job with Missing Fields...');
  const invalidJob = {
    title: 'Test Job'
    // Missing required fields
  };
  
  const result = await apiCall('POST', '/jobs', invalidJob, employerToken);
  
  if (!result.success) {
    console.log('✅ Correctly rejected (missing fields)');
    return true;
  } else {
    console.log('❌ Should have been rejected');
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('================================');
  console.log('🧪 Jobs CRUD API Tests');
  console.log('================================');
  console.log(`API URL: ${API_URL}`);
  
  const results = {
    passed: 0,
    failed: 0
  };

  // Setup
  if (!await setupEmployer()) {
    console.log('\n❌ Setup failed. Cannot continue tests.');
    return;
  }

  // Test 1: Get all jobs (empty or existing)
  if (await testGetAllJobs()) results.passed++;
  else results.failed++;

  // Test 2: Create job without auth
  if (await testCreateJobWithoutAuth()) results.passed++;
  else results.failed++;

  // Test 3: Create job with missing fields
  if (await testCreateJobMissingFields()) results.passed++;
  else results.failed++;

  // Test 4: Create job
  if (await testCreateJob()) results.passed++;
  else results.failed++;

  // Test 5: Get single job
  if (await testGetSingleJob()) results.passed++;
  else results.failed++;

  // Test 6: Update job without auth
  if (await testUpdateJobWithoutAuth()) results.passed++;
  else results.failed++;

  // Test 7: Update job
  if (await testUpdateJob()) results.passed++;
  else results.failed++;

  // Test 8: Delete job without auth
  if (await testDeleteJobWithoutAuth()) results.passed++;
  else results.failed++;

  // Test 9: Delete job
  if (await testDeleteJob()) results.passed++;
  else results.failed++;

  // Test 10: Get deleted job
  if (await testGetDeletedJob()) results.passed++;
  else results.failed++;

  // Test 11: Invalid job ID
  if (await testInvalidJobId()) results.passed++;
  else results.failed++;

  // Summary
  console.log('\n================================');
  console.log('📊 Test Summary');
  console.log('================================');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Total: ${results.passed + results.failed}`);
  console.log('================================\n');

  if (results.failed === 0) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️  Some tests failed. Check the output above.');
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${API_URL.replace('/api', '')}/api/health`);
    return true;
  } catch (error) {
    console.log('❌ Server is not running!');
    console.log('Please start the server with: npm run dev');
    return false;
  }
}

// Main execution
(async () => {
  if (await checkServer()) {
    await runTests();
  }
})();
