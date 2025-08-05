import axios from 'axios';
import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;

dotenv.config();

// Database connection test
async function testDatabaseConnection() {
  console.log('Testing Railway PostgreSQL connection...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_PUBLIC_URL,
    ssl: {
      rejectUnauthorized: false
    },
    max: 1,
    min: 0,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
  });

  try {
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // Test basic query
    const result = await client.query('SELECT NOW() as current_time, version()');
    console.log('✅ Database query successful');
    console.log('Time:', result.rows[0].current_time);
    console.log('PostgreSQL version:', result.rows[0].version.split(' ')[0]);
    
    // Test tables exist
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('✅ Available tables:', tables.rows.map(r => r.table_name));
    
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  } finally {
    await pool.end();
  }
}

// API configuration
const api = axios.create({
  baseURL: process.env.API_BASE_URL || 'http://localhost:5000/api/v1',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

// Test data
let testUser = {
  name: 'Railway Test User',
  email: `test${Date.now()}@example.com`,
  password: 'testpassword123'
};

const testEntry = {
  title: 'Railway Connection Test Entry',
  content: 'Testing Railway PostgreSQL integration with Vercel deployment'
};

let authToken = '';
let entryId = '';

async function waitForServerReady() {
  const maxAttempts = 10;
  const delay = 1000;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await api.get('/');
      if (response.status === 200) {
        console.log('✅ Server is ready');
        return true;
      }
    } catch (error) {
      if (attempt === maxAttempts) throw new Error('Server did not start in time');
      console.log(`⏳ Server not ready (attempt ${attempt}/${maxAttempts}), retrying...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

async function runAPITests() {
  try {
    console.log('\n=== API Tests ===');
    
    // Clear test data
    try {
      await api.delete('/test-cleanup');
      console.log('✅ Test data cleared');
    } catch (error) {
      console.log('ℹ️  No test data to clear');
    }
    
    // Create test user
    console.log('\n1. Testing user signup...');
    testUser.email = `test${Date.now()}@example.com`;
    const signupRes = await api.post('/auth/signup', testUser);
    console.log('✅ User created:', signupRes.data.message);
    
    // Authenticate
    console.log('\n2. Testing user login...');
    const loginRes = await api.post('/auth/login', {
      email: testUser.email,
      password: testUser.password
    });
    authToken = loginRes.data.token;
    console.log('✅ Authentication successful');
    
    // Set auth header
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    
    // Test user profile
    console.log('\n3. Testing profile access...');
    const profileRes = await api.get('/profile');
    console.log('✅ Profile retrieved:', profileRes.data.name);
    
    // Create entry
    console.log('\n4. Testing entry creation...');
    const createRes = await api.post('/entries', testEntry);
    entryId = createRes.data.id;
    console.log('✅ Entry created with ID:', entryId);
    
    // Get all entries
    console.log('\n5. Testing entries retrieval...');
    const entriesRes = await api.get('/entries');
    console.log('✅ Retrieved', entriesRes.data.entries.length, 'entries');
    
    // Get specific entry
    console.log('\n6. Testing single entry retrieval...');
    const singleEntryRes = await api.get(`/entries/${entryId}`);
    console.log('✅ Retrieved entry:', singleEntryRes.data.entry.title);
    
    // Update entry
    console.log('\n7. Testing entry update...');
    const updateRes = await api.put(`/entries/${entryId}`, {
      title: 'Updated Railway Test Entry',
      content: 'Updated content - Railway PostgreSQL working!'
    });
    console.log('✅ Entry updated:', updateRes.data.title);
    
    // Delete entry
    console.log('\n8. Testing entry deletion...');
    await api.delete(`/entries/${entryId}`);
    console.log('✅ Entry deleted successfully');
    
    console.log('\n🎉 All API tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Railway PostgreSQL + API Integration Tests\n');
  
  // Test database connection first
  const dbSuccess = await testDatabaseConnection();
  if (!dbSuccess) {
    console.error('❌ Database tests failed - stopping');
    process.exit(1);
  }
  
  // Test API if database works
  await waitForServerReady();
  const apiSuccess = await runAPITests();
  
  if (dbSuccess && apiSuccess) {
    console.log('\n✅ All tests passed! Railway PostgreSQL integration working correctly.');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed');
    process.exit(1);
  }
}

// Environment validation
if (!process.env.DATABASE_PUBLIC_URL) {
  console.error('❌ DATABASE_PUBLIC_URL not found in environment variables');
  process.exit(1);
}

runAllTests();