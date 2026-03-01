// Quick Authentication Test Script
// Run with: node test-auth.js

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test data
const testUser = {
  name: 'Test User',
  email: `test${Date.now()}@example.com`,
  password: 'password123',
  role: 'jobseeker'
};

let authToken = '';

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
async function testRegister() {
  console.log('\n📝 Testing Registration...');
  const result = await apiCall('POST', '/auth/register', testUser);
  
  if (result.success) {
    console.log('✅ Registration successful');
    console.log('User:', result.data.data.name);
    console.log('Email:', result.data.data.email);
    console.log('Role:', result.data.data.role);
    console.log('Token:', result.data.data.token.substring(0, 20) + '...');
    authToken = result.data.data.token;
    return true;
  } else {
    console.log('❌ Registration failed:', result.error);
    return false;
  }
}

async function testLogin() {
  console.log('\n🔐 Testing Login...');
  const result = await apiCall('POST', '/auth/login', {
    email: testUser.email,
    password: testUser.password
  });
  
  if (result.success) {
    console.log('✅ Login successful');
    console.log('User:', result.data.data.name);
    console.log('Token:', result.data.data.token.substring(0, 20) + '...');
    authToken = result.data.data.token;
    return true;
  } else {
    console.log('❌ Login failed:', result.error);
    return false;
  }
}

async function testGetProfile() {
  console.log('\n👤 Testing Get Profile...');
  const result = await apiCall('GET', '/auth/profile', null, authToken);
  
  if (result.success) {
    console.log('✅ Profile retrieved successfully');
    console.log('Name:', result.data.data.name);
    console.log('Email:', result.data.data.email);
    console.log('Role:', result.data.data.role);
    console.log('Created:', result.data.data.createdAt);
    return true;
  } else {
    console.log('❌ Get profile failed:', result.error);
    return false;
  }
}

async function testInvalidToken() {
  console.log('\n🚫 Testing Invalid Token...');
  const result = await apiCall('GET', '/auth/profile', null, 'invalid-token');
  
  if (!result.success) {
    console.log('✅ Invalid token correctly rejected');
    return true;
  } else {
    console.log('❌ Invalid token was accepted (should fail)');
    return false;
  }
}

async function testNoToken() {
  console.log('\n🚫 Testing No Token...');
  const result = await apiCall('GET', '/auth/profile', null, null);
  
  if (!result.success) {
    console.log('✅ No token correctly rejected');
    return true;
  } else {
    console.log('❌ No token was accepted (should fail)');
    return false;
  }
}

async function testInvalidCredentials() {
  console.log('\n🚫 Testing Invalid Credentials...');
  const result = await apiCall('POST', '/auth/login', {
    email: testUser.email,
    password: 'wrongpassword'
  });
  
  if (!result.success) {
    console.log('✅ Invalid credentials correctly rejected');
    return true;
  } else {
    console.log('❌ Invalid credentials were accepted (should fail)');
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('================================');
  console.log('🧪 Authentication System Tests');
  console.log('================================');
  console.log(`API URL: ${API_URL}`);
  
  const results = {
    passed: 0,
    failed: 0
  };

  // Test 1: Register
  if (await testRegister()) results.passed++;
  else results.failed++;

  // Test 2: Login
  if (await testLogin()) results.passed++;
  else results.failed++;

  // Test 3: Get Profile
  if (await testGetProfile()) results.passed++;
  else results.failed++;

  // Test 4: Invalid Token
  if (await testInvalidToken()) results.passed++;
  else results.failed++;

  // Test 5: No Token
  if (await testNoToken()) results.passed++;
  else results.failed++;

  // Test 6: Invalid Credentials
  if (await testInvalidCredentials()) results.passed++;
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
