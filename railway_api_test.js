import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// Configure Axios for API requests
const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' }
});

// Test data
let testUser = {
  name: 'Test User',
  email: `test${Date.now()}@example.com`,
  password: 'testpassword123'
};

const testEntry = {
  title: 'Test Entry',
  content: 'This is a test entry for Railway database'
};

let authToken = '';
let entryId = '';

// Function to check if server is ready
async function waitForServerReady() {
  const maxAttempts = 10;
  const delay = 1000; // 1 second between checks
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await api.get('/');
      if (response.status === 200) return true;
    } catch (error) {
      if (attempt === maxAttempts) throw new Error('Server did not start in time');
      console.log(`Server not ready yet (attempt ${attempt}/${maxAttempts}), retrying...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

async function runTests() {
  try {
    console.log('Starting Railway API tests...');
    console.log('Waiting for server to be ready...');
    await waitForServerReady();
    console.log('Server is ready!');
    
    // Clear test data
    console.log('Clearing previous test data...');
    try {
      await api.delete('/test-cleanup');
      console.log('Test data cleared');
    } catch (cleanupError) {
      console.log('No test data to clear or cleanup endpoint not available');
    }
    
    console.log('Starting API tests...');
    
    // Create test user
    console.log('\n=== Creating test user ===');
    testUser.email = `test${Date.now()}@example.com`; // Unique email each run
    const signupRes = await api.post('/auth/signup', testUser);
    console.log('User created:', signupRes.data);
    
    // Authenticate and get token
    console.log('\n=== Authenticating test user ===');
    const loginRes = await api.post('/auth/login', {
      email: testUser.email,
      password: testUser.password
    });
    authToken = loginRes.data.token;
    console.log('Authentication successful. Token received');
    
    // Set auth header for all requests
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    
    // Create test entry
    console.log('\n=== Creating test entry ===');
    const createRes = await api.post('/entries', testEntry);
    entryId = createRes.data.id;
    console.log('Entry created with ID:', entryId);
    
    // Test get all entries
    console.log('\n=== Testing get all entries ===');
    const entriesRes = await api.get('/entries');
    console.log(`Found ${entriesRes.data.entries.length} entries`);
    
    // Test get specific entry
    console.log('\n=== Testing get specific entry ===');
    const singleEntryRes = await api.get(`/entries/${entryId}`);
    console.log('Retrieved entry:', singleEntryRes.data.entry.title);
    
    // Test update entry
    console.log('\n=== Testing update entry ===');
    const updateRes = await api.put(`/entries/${entryId}`, {
      title: 'Updated Test Entry',
      content: 'Updated content for Railway test'
    });
    console.log('Entry updated:', updateRes.data.title);
    
    // Test delete entry
    console.log('\n=== Testing delete entry ===');
    const deleteRes = await api.delete(`/entries/${entryId}`);
    console.log('Entry deleted:', deleteRes.data.message || 'Success');
    
    console.log('\n=== All tests passed successfully! ===');
    return true;
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
    return false;
  }
}

runTests();
