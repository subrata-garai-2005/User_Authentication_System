const http = require("http");
require("dotenv").config();

const PORT = process.env.PORT || 8000;
const BASE_URL = `http://localhost:${PORT}`;

const request = (method, path, data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on("error", reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log("=== Starting User Authentication API Tests ===\n");
  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, extraInfo = "") => {
    if (condition) {
      console.log(`PASS: ${testName}`);
      passed++;
    } else {
      console.error(`FAIL: ${testName} ${extraInfo}`);
      failed++;
    }
  };

  try {
    // 1. Root route
    const rootRes = await request("GET", "/");
    assert(rootRes.status === 200, "GET / returns 200 OK");

    // 2. Register: Missing fields
    const missingFields = await request("POST", "/api/auth/register", {
      name: "Test",
    });
    assert(
      missingFields.status === 400,
      "POST /api/auth/register rejects missing fields with 400"
    );

    // 3. Register: Invalid email format
    const invalidEmail = await request("POST", "/api/auth/register", {
      name: "Test",
      email: "invalid-email",
      password: "password123",
    });
    assert(
      invalidEmail.status === 400,
      "POST /api/auth/register rejects invalid email format with 400"
    );

    // 4. Register: Short password
    const shortPassword = await request("POST", "/api/auth/register", {
      name: "Test",
      email: "test@example.com",
      password: "123",
    });
    assert(
      shortPassword.status === 400,
      "POST /api/auth/register rejects short password (< 6 chars) with 400"
    );

    // 5. Register: Valid user
    const testEmail = `user_${Date.now()}@example.com`;
    const regRes = await request("POST", "/api/auth/register", {
      name: "Subrata Garai",
      email: testEmail,
      password: "securePassword123!",
      mobile: "+1234567890",
    });
    assert(
      regRes.status === 201 &&
        regRes.body.user &&
        regRes.body.user.email === testEmail.toLowerCase() &&
        regRes.body.user.mobile === "+1234567890",
      "POST /api/auth/register creates user with mobile and 201 Created"
    );

    // 6. Register: Duplicate email
    const dupRes = await request("POST", "/api/auth/register", {
      name: "Duplicate User",
      email: testEmail,
      password: "securePassword123!",
    });
    assert(
      dupRes.status === 400 && dupRes.body.message === "User already exists",
      "POST /api/auth/register prevents duplicate user with 400"
    );

    // 7. Login: Invalid credentials (wrong password)
    const wrongPass = await request("POST", "/api/auth/login", {
      email: testEmail,
      password: "wrongPassword",
    });
    assert(
      wrongPass.status === 401,
      "POST /api/auth/login rejects wrong password with 401"
    );

    // 8. Login: Valid credentials (with uppercase variation to test normalization)
    const loginRes = await request("POST", "/api/auth/login", {
      email: testEmail.toUpperCase(),
      password: "securePassword123!",
    });
    assert(
      loginRes.status === 200 && !!loginRes.body.token,
      "POST /api/auth/login succeeds with 200 and returns JWT token"
    );

    const token = loginRes.body.token;

    // 9. Protected route without token
    const noTokenRes = await request("GET", "/api/auth/profile");
    assert(
      noTokenRes.status === 401,
      "GET /api/auth/profile without token returns 401 Unauthorized"
    );

    // 10. Protected route with invalid token
    const invalidTokenRes = await request("GET", "/api/auth/profile", null, "bad_token_123");
    assert(
      invalidTokenRes.status === 401,
      "GET /api/auth/profile with invalid token returns 401 Unauthorized"
    );

    // 11. Protected route with valid token
    const profileRes = await request("GET", "/api/auth/profile", null, token);
    assert(
      profileRes.status === 200 &&
        profileRes.body.user &&
        profileRes.body.user.email === testEmail.toLowerCase() &&
        !profileRes.body.user.password,
      "GET /api/auth/profile with valid token returns user profile without password"
    );

    // 12. 404 Route handling
    const notFoundRes = await request("GET", "/api/unknown-endpoint");
    assert(
      notFoundRes.status === 404,
      "GET /api/unknown-endpoint returns 404 Not Found"
    );

    console.log(`\n=== Tests Completed: ${passed} Passed, ${failed} Failed ===`);
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error("Test execution error:", err);
    process.exit(1);
  }
};

runTests();
