# User Authentication API

A secure, scalable RESTful User Authentication and Authorization API built with **Node.js**, **Express.js**, **MongoDB (Mongoose)**, and **JSON Web Tokens (JWT)**.

---

## 🚀 Features

- **User Registration**:
  - Validates required fields (`name`, `email`, `password`).
  - Email format validation and lowercase normalization.
  - Password minimum length enforcement (minimum 6 characters).
  - Secure one-way password hashing using `bcryptjs` (salt rounds: 10).
  - Unique email check to prevent duplicate user registrations.
  - Optional `mobile` number support.

- **User Authentication (Login)**:
  - Secure verification of email and hashed password.
  - Issues signed **JSON Web Tokens (JWT)** with 24-hour expiration.

- **Protected Routes**:
  - Reusable JWT authentication middleware verifying the `Authorization: Bearer <token>` header.
  - Endpoints to fetch authenticated user profile (`/api/auth/profile` and `/api/auth/me`) with sensitive data (password hash) automatically excluded.

- **Robust Error & Route Handling**:
  - Handles 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), and 500 (Internal Server Error) with consistent JSON responses.
  - Built-in CORS support.

- **Automated Testing**:
  - Built-in test suite covering 12 positive and negative test cases without external test framework overhead.

---

## 🛠️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/) (v18+)
- **Framework**: [Express.js](https://expressjs.com/) (v5)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **Security & Cryptography**: [bcryptjs](https://www.npmjs.com/package/bcryptjs) & [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
- **Configuration**: [dotenv](https://www.npmjs.com/package/dotenv)

---

## 📁 Project Structure

```
User Authentication/
├── config/
│   └── db.js            # MongoDB connection logic and DNS fallback configuration
├── middleware/
│   └── auth.js          # JWT Bearer token authentication middleware
├── model/
│   └── User.js          # Mongoose schema and model definition for Users
├── routes/
│   └── auth.js          # Authentication routes (register, login, profile, me)
├── .env                 # Environment variables configuration (ignored by git)
├── package.json         # Project dependencies, scripts, and metadata
├── Server.js            # Express server initialization, middleware, and entry point
├── test-api.js          # Automated end-to-end API test script
└── README.md            # Project documentation and API reference
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory and configure the following variables:

```env
# Server Port
PORT=8000

# MongoDB Connection String
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/user_auth?retryWrites=true&w=majority

# JWT Secret Key for Token Signing
JWT_SECRET=your_super_secret_jwt_key_here
```

---

## 📥 Installation & Setup

1. **Clone or open the project directory**:
   ```bash
   cd "User Authentication"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   - **Production mode**:
     ```bash
     npm start
     ```
   - **Development mode (auto-reload)**:
     ```bash
     npm run dev
     ```

   The server will start listening at: `http://localhost:8000`

---

## 🧪 Running Automated Tests

Make sure the server is running, then run the test script:

```bash
npm test
```

This runs `test-api.js` which verifies all 12 test cases:
- Root health route (`GET /`)
- Required fields validation on registration
- Email format validation
- Password length restriction
- Successful user registration
- Prevention of duplicate email registration
- Password mismatch rejection on login
- Successful login & JWT issuance
- Unauthorized access rejection on protected routes
- Invalid token rejection
- Authenticated profile retrieval (excluding password)
- 404 handling for unknown routes

---

## 📡 API Reference & Postman Guide

### Base URL
`http://localhost:8000`

---

### 1. Root / Health Check
Check API operational status.

- **Method**: `GET`
- **URL**: `/`
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "User Authentication API is running",
    "endpoints": {
      "register": "POST /api/auth/register",
      "login": "POST /api/auth/login",
      "profile": "GET /api/auth/profile (Requires Bearer Token)"
    }
  }
  ```

---

### 2. User Registration
Register a new user account.

- **Method**: `POST`
- **URL**: `/api/auth/register`
- **Headers**:
  - `Content-Type: application/json`
- **Request Body (JSON)**:
  ```json
  {
    "name": "Subrata Garai",
    "email": "subrata@example.com",
    "password": "securePassword123!",
    "mobile": "+1234567890"
  }
  ```
  *(Note: `mobile` is optional. `name`, `email`, and `password` (min 6 characters) are required.)*

- **Success Response (`201 Created`)**:
  ```json
  {
    "message": "User registered successfully",
    "user": {
      "id": "67dd5a4f7832a87d60e7e123",
      "name": "Subrata Garai",
      "email": "subrata@example.com",
      "mobile": "+1234567890"
    }
  }
  ```

- **Error Responses**:
  - `400 Bad Request`: Missing fields, invalid email format, password `< 6` characters, or duplicate email.
    ```json
    { "message": "User already exists" }
    ```

---

### 3. User Login
Authenticate an existing user and receive a JWT token.

- **Method**: `POST`
- **URL**: `/api/auth/login`
- **Headers**:
  - `Content-Type: application/json`
- **Request Body (JSON)**:
  ```json
  {
    "email": "subrata@example.com",
    "password": "securePassword123!"
  }
  ```

- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "67dd5a4f7832a87d60e7e123",
      "name": "Subrata Garai",
      "email": "subrata@example.com",
      "mobile": "+1234567890"
    }
  }
  ```

- **Error Responses**:
  - `401 Unauthorized`: Invalid email or incorrect password.
    ```json
    { "message": "Invalid email or password" }
    ```

---

### 4. Get User Profile (Protected)
Fetch the authenticated user's profile using the JWT token.

- **Method**: `GET`
- **URL**: `/api/auth/profile` *(alias: `/api/auth/me`)*
- **Headers**:
  - `Authorization: Bearer <your_jwt_token>`
  *(In Postman: Select **Auth** tab → Type **Bearer Token** → Paste the token)*

- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Profile fetched successfully",
    "user": {
      "id": "67dd5a4f7832a87d60e7e123",
      "name": "Subrata Garai",
      "email": "subrata@example.com",
      "mobile": "+1234567890",
      "createdAt": "2026-03-21T18:00:00.000Z",
      "updatedAt": "2026-03-21T18:00:00.000Z"
    }
  }
  ```

- **Error Responses**:
  - `401 Unauthorized`: Missing or malformed token.
    ```json
    { "message": "Access denied. No token provided." }
    ```
  - `401 Unauthorized`: Expired or invalid token.
    ```json
    { "message": "Invalid or expired token." }
    ```

---

## 🔒 Security Best Practices Implemented

1. **Password Hashing**: One-way bcrypt hashing with cost factor 10 to protect user credentials.
2. **Sensitive Data Protection**: Passwords are never returned in responses; database queries explicitly exclude `-password`.
3. **Stateless JWT Authorization**: Verified on each protected request via middleware.
4. **Data Normalization**: Emails are trimmed and converted to lowercase before lookup or creation.
5. **CORS Configured**: Cross-Origin Resource Sharing enabled for frontend integration.
6. **Graceful Error Handling**: 404 handler for unknown endpoints and global middleware to capture unhandled server errors.
