const http = require('http');

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const fullPath = '/api' + (path.startsWith('/') ? path : '/' + path);
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: fullPath,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          parsed = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('COMMERCEPILOT AI: POST-LOGIN & NAVIGATION TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - ${details}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await request('GET', '/health');
    assert(health.status === 200 && health.body.success, 'Server health check responsive');

    // 2. Login with Invalid Credentials
    const badLogin = await request('POST', '/auth/login', {
      email: 'nonexistent_seller@commercepilot.ai',
      password: 'WrongPassword123!'
    });
    assert(badLogin.status === 401 && !badLogin.body.success, 'Invalid login rejected with HTTP 401');

    // 3. Register New Merchant User
    const testEmail = `merchant_${Date.now()}@autotestseller.in`;
    const testPassword = 'SecureMerchantPassword2026!';
    const regRes = await request('POST', '/auth/register', {
      fullName: 'Vikramaditya Rao',
      email: testEmail,
      password: testPassword,
      businessName: 'Veda Luxe Organics',
      businessType: 'Independent Fashion & Cosmetics',
      country: 'India',
      phoneNumber: '+91 9876543210'
    });

    assert(
      regRes.status === 201 && regRes.body.success && regRes.body.token,
      'Merchant registration generates token & store'
    );
    assert(
      regRes.body.user && regRes.body.user.isOnboarded === true,
      'Registered user is initialized with isOnboarded: true for direct dashboard entry'
    );
    assert(
      regRes.body.store && regRes.body.store.name === 'Veda Luxe Organics',
      'Store instance created and linked to registered user'
    );

    const token = regRes.body.token;

    // 4. Session Restoration (/auth/me) with JWT
    const meRes = await request('GET', '/auth/me', null, {
      Authorization: `Bearer ${token}`
    });
    assert(
      meRes.status === 200 && meRes.body.success && meRes.body.user.email === testEmail,
      'Session restoration (/auth/me) returns authenticated merchant profile'
    );

    // 5. Login with Valid Credentials
    const loginRes = await request('POST', '/auth/login', {
      email: testEmail,
      password: testPassword
    });

    assert(
      loginRes.status === 200 && loginRes.body.success && loginRes.body.token,
      'Merchant login successful and generates valid JWT session'
    );
    assert(
      loginRes.body.user && loginRes.body.user.isOnboarded === true,
      'Login user payload contains isOnboarded: true'
    );

    // 6. Access Protected Operational Workspace APIs with Token
    const ordersRes = await request('GET', '/orders', null, {
      Authorization: `Bearer ${token}`
    });
    assert(
      ordersRes.status === 200 && ordersRes.body.success,
      'Authorized access to /api/orders operational workspace endpoint'
    );

    const inventoryRes = await request('GET', '/inventory', null, {
      Authorization: `Bearer ${token}`
    });
    assert(
      inventoryRes.status === 200 && inventoryRes.body.success,
      'Authorized access to /api/inventory operational workspace endpoint'
    );

    const deliveriesRes = await request('GET', '/deliveries', null, {
      Authorization: `Bearer ${token}`
    });
    assert(
      deliveriesRes.status === 200 && deliveriesRes.body.success,
      'Authorized access to /api/deliveries operational workspace endpoint'
    );

    const analyticsRes = await request('GET', '/analytics', null, {
      Authorization: `Bearer ${token}`
    });
    assert(
      analyticsRes.status === 200 && analyticsRes.body.success,
      'Authorized access to /api/analytics operational workspace endpoint'
    );

    // 7. Unauthenticated Access Guard
    const unauthorizedOrders = await request('GET', '/orders');
    assert(
      unauthorizedOrders.status === 401,
      'Unauthenticated request to operational workspace blocked with 401'
    );

    // 8. Logout
    const logoutRes = await request('POST', '/auth/logout', null, {
      Authorization: `Bearer ${token}`
    });
    assert(logoutRes.status === 200 && logoutRes.body.success, 'Merchant logout succeeds');

    console.log('\n----------------------------------------------------');
    console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log('----------------------------------------------------');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
