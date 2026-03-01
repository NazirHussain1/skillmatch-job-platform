// Applications System Test Script
// Run with: node test-applications.js

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test data
const jobseekerUser = {
  name: 'Jobseeker Test',
  email: `jobseeker${Date.now()}@example.com`,
  password: 'password123',
  role: 'jobseeker'
};

const employerUser = {
  name: 'Employer Test',
  email: `employer${Date.now()}@example.com`,
  password: 'password123',
  role: 'employer'
};

const testJob = {
  title: 'Senior Software Engineer',
  company: 'Tech Corp',
  description: 'We are looking for an experienced software engineer.',
  location: 'San Francisco, CA',
  salary: 150000
};

let jobseekerToken = '';
let employerToken = '';
let createdJobId = '';
let createdApplicationId = '';

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

// Setup functions
async function setupJobseeker() {
  console.log('\n🔧 Setting up jobseeker account...');
  const result = await apiCall('POST', '/auth/register', jobseekerUser);
  
  if (result.success) {
    console.log('✅ Jobseeker account created');
    jobseekerToken = result.data.data.token;
    return true;
  } else {
    console.log('❌ Failed to create jobseeker:', result.error);
    return false;
  }
}

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

async function setupJob() {
  console.log('\n🔧 Creating test job...');
  const result = await apiCall('POST', '/jobs', testJob, employerToken);
  
  if (result.success) {
    console.log('✅ Job created');
    console.log('Job ID:', result.data.data._id);
    createdJobId = result.data.data._id;
    return true;
  } else {
    console.log('❌ Failed to create job:', result.error);
    return false;
  }
}

// Test functions
async function testCreateApplication() {
  console.log('\n📝 Testing Create Application...');
  const result = await apiCall('POST', `/applications/${createdJobId}`, null, jobseekerToken);
  
  if (result.success) {
    console.log('✅ Application created successfully');
    console.log('Application ID:', result.data.data._id);
    console.log('Job:', result.data.data.job.title);
    console.log('Status:', result.data.data.status);
    createdApplicationId = result.data.data._id;
    return true;
  } else {
    console.log('❌ Create application failed:', result.error);
    return false;
  }
}

async function testDuplicateApplication() {
  console.log('\n🚫 Testing Duplicate Application...');
  const result = await apiCall('POST', `/applications/${createdJobId}`, null, jobseekerToken);
  
  if (!result.success) {
    console.log('✅ Correctly rejected duplicate application');
    return true;
  } else {
    console.log('❌ Should have rejected duplicate');
    return false;
  }
}

async function testCreateApplicationWithoutAuth() {
  console.log('\n🚫 Testing Create Application Without Auth...');
  const result = await apiCall('POST', `/applications/${createdJobId}`);
  
  if (!result.success) {
    console.log('✅ Correctly rejected (no auth)');
    return true;
  } else {
    console.log('❌ Should have been rejected');
    return false;
  }
}

async function testCreateApplicationInvalidJob() {
  console.log('\n🚫 Testing Create Application with Invalid Job...');
  const result = await apiCall('POST', '/applications/507f1f77bcf86cd799439999', null, jobseekerToken);
  
  if (!result.success) {
    console.log('✅ Correctly rejected (job not found)');
    return true;
  } else {
    console.log('❌ Should have been rejected');
    return false;
  }
}

async function testGetMyApplications() {
  console.log('\n📋 Testing Get My Applications...');
  const result = await apiCall('GET', '/applications/my', null, jobseekerToken);
  
  if (result.success) {
    console.log('✅ Get my applications successful');
    console.log(`Found ${result.data.data.length} application(s)`);
    if (result.data.data.length > 0) {
      console.log('First application:', result.data.data[0].job.title);
    }
    return true;
  } else {
    console.log('❌ Get my applications failed:', result.error);
    return false;
  }
}

async function testGetJobApplications() {
  console.log('\n📋 Testing Get Job Applications (Employer)...');
  const result = await apiCall('GET', `/applications/job/${createdJobId}`, null, employerToken);
  
  if (result.success) {
    console.log('✅ Get job applications successful');
    console.log(`Found ${result.data.data.length} application(s)`);
    if (result.data.data.length > 0) {
      console.log('Applicant:', result.data.data[0].applicant.name);
      console.log('Status:', result.data.data[0].status);
    }
    return true;
  } else {
    console.log('❌ Get job applications failed:', result.error);
    return false;
  }
}

async function testGetJobApplicationsUnauthorized() {
  console.log('\n🚫 Testing Get Job Applications (Unauthorized)...');
  const result = await apiCall('GET', `/applications/job/${createdJobId}`, null, jobseekerToken);
  
  if (!result.success) {
    console.log('✅ Correctly rejected (not job owner)');
    return true;
  } else {
    console.log('❌ Should have been rejected');
    return false;
  }
}

async function testUpdateApplicationStatus() {
  console.log('\n✏️  Testing Update Application Status...');
  const result = await apiCall('PUT', `/applications/${createdApplicationId}`, 
    { status: 'accepted' }, employerToken);
  
  if (result.success) {
    console.log('✅ Application status updated');
    console.log('New status:', result.data.data.status);
    return true;
  } else {
    console.log('❌ Update status failed:', result.error);
    return false;
  }
}

async function testUpdateApplicationStatusUnauthorized() {
  console.log('\n🚫 Testing Update Status (Unauthorized)...');
  const result = await apiCall('PUT', `/applications/${createdApplicationId}`, 
    { status: 'rejected' }, jobseekerToken);
  
  if (!result.success) {
    console.log('✅ Correctly rejected (not employer)');
    return true;
  } else {
    console.log('❌ Should have been rejected');
    return false;
  }
}

async function testUpdateApplicationInvalidStatus() {
  console.log('\n🚫 Testing Update with Invalid Status...');
  const result = await apiCall('PUT', `/applications/${createdApplicationId}`, 
    { status: 'invalid-status' }, employerToken);
  
  if (!result.success) {
    console.log('✅ Correctly rejected (invalid status)');
    return true;
  } else {
    console.log('❌ Should have been rejected');
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('================================');
  console.log('🧪 Applications System Tests');
  console.log('================================');
  console.log(`API URL: ${API_URL}`);
  
  const results = {
    passed: 0,
    failed: 0
  };

  // Setup
  if (!await setupJobseeker()) {
    console.log('\n❌ Jobseeker setup failed. Cannot continue.');
    return;
  }
  
  if (!await setupEmployer()) {
    console.log('\n❌ Employer setup failed. Cannot continue.');
    return;
  }
  
  if (!await setupJob()) {
    console.log('\n❌ Job setup failed. Cannot continue.');
    return;
  }

  // Test 1: Create application without auth
  if (await testCreateApplicationWithoutAuth()) results.passed++;
  else results.failed++;

  // Test 2: Create application with invalid job
  if (await testCreateApplicationInvalidJob()) results.passed++;
  else results.failed++;

  // Test 3: Create application
  if (await testCreateApplication()) results.passed++;
  else results.failed++;

  // Test 4: Duplicate application
  if (await testDuplicateApplication()) results.passed++;
  else results.failed++;

  // Test 5: Get my applications
  if (await testGetMyApplications()) results.passed++;
  else results.failed++;

  // Test 6: Get job applications (unauthorized)
  if (await testGetJobApplicationsUnauthorized()) results.passed++;
  else results.failed++;

  // Test 7: Get job applications (employer)
  if (await testGetJobApplications()) results.passed++;
  else results.failed++;

  // Test 8: Update status (unauthorized)
  if (await testUpdateApplicationStatusUnauthorized()) results.passed++;
  else results.failed++;

  // Test 9: Update status with invalid value
  if (await testUpdateApplicationInvalidStatus()) results.passed++;
  else results.failed++;

  // Test 10: Update application status
  if (await testUpdateApplicationStatus()) results.passed++;
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
