# 🛡️ Node Auth Playbook

A **comprehensive authentication boilerplate** built with **Node.js, Express, MongoDB, and Passport.js**, covering multiple authentication strategies:

- ✅ Email & Password (JWT and Session)
- ✅ OAuth2 (Google, GitHub)
- ✅ Magic Link (passwordless login via email)
- ✅ TOTP (Two-Factor Authentication using Authenticator apps)
- ✅ Refresh Tokens with rotation & revocation
- ✅ Session-based authentication with cookies
- ✅ Swagger-powered API documentation

This project is meant to be an **open-source reference for modern authentication systems** in Node.js.

---

## 🚀 Features

- **JWT Authentication**  
  - Access + Refresh tokens  
  - Token revocation (logout)

- **Session Authentication**  
  - Login with cookies  
  - Protected session routes  

- **OAuth 2.0 / OpenID Connect**  
  - Google login  
  - GitHub login  

- **Passwordless Auth**  
  - Magic link login via email (Ethereal for dev, SMTP configurable for prod)

- **Two-Factor Authentication (2FA)**  
  - TOTP with Google Authenticator / Authy  
  - Enable/Disable & Verify flow  

- **Developer-friendly docs**  
  - 📖 Swagger UI at `/docs`  
  - Example `.env` file  

---

## 🛠️ Tech Stack

- **Node.js** (Express.js)  
- **MongoDB** (Mongoose ODM)  
- **Passport.js** (auth strategies)  
- **JWT (jsonwebtoken)**  
- **Nodemailer** (emails, magic links)  
- **Speakeasy + qrcode** (TOTP / 2FA)  
- **Swagger UI** (API docs)

---

## 🗄️ MongoDB Setup (Local)

### 🔹 1. Install MongoDB Compass

On Ubuntu:

```wget https://downloads.mongodb.com/compass/mongodb-compass_1.42.2_amd64.deb
sudo dpkg -i mongodb-compass_1.42.2_amd64.deb
sudo apt-get install -f -y
```


(Replace version if newer is available: Compass Download)

Now you can launch it from your Applications menu: MongoDB Compass.

### 🔹 2. Connect to Local Mongo

When Compass opens:

Connection String → enter:

```mongodb://localhost:27017```


Hit Connect ✅

If your local Mongo is running, you’ll see all databases.

### 🔹 3. Create Database & Collection

Inside Compass:

Click “Create Database”

Name it nodeauth

Add a collection, e.g. users

This matches what your Node.js app expects.

### 🔹 4. Use With Node.js

Your .env stays simple:

```MONGO_URI=mongodb://localhost:27017/nodeauth```


When you register/login from your app, Compass will show new user documents inside the users collection.

---

## 📦 Installation & Setup

### 1. Clone the repo
```bash
git clone https://github.com/sharadmrsingh/node-auth-playbook.git
cd node-auth-playbook
```
### 2. Install dependencies
```npm install```
### 3. Create .env file
```
PORT=4000
BASE_URL=http://localhost:4000

# Mongo
MONGO_URI=mongodb://localhost:27017/nodeauth

# JWT
JWT_ACCESS_SECRET=accesssecret
JWT_REFRESH_SECRET=refreshsecret

# OAuth (replace with real keys)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

# SMTP (use Ethereal for dev)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your-ethereal-user
SMTP_PASS=your-ethereal-pass
```

🔐 Where to get the keys?

**MongoDB**

- Local dev: use mongodb://localhost:27017/nodeauth

- Cloud: create a cluster at MongoDB Atlas
 and copy the connection string

**JWT Secrets**

- Generate any random strings (keep them private):

- openssl rand -base64 32


**Google OAuth**

- Go to Google Cloud Console

- Create project → Enable OAuth consent screen → Add credentials → OAuth Client ID → Application type: Web

- Authorized redirect URI:

http://localhost:4000/auth/google/callback


- Copy GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET

**GitHub OAuth**

- Go to GitHub Developer Settings
 → OAuth Apps → New OAuth App

Homepage URL:

http://localhost:4000


Authorization callback URL:

http://localhost:4000/auth/github/callback


- Copy GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET

**SMTP (Email / Magic Links)**

- For dev, use Ethereal Email
 → "Create Ethereal Account" → copy SMTP credentials

- For production, replace with your real SMTP provider (e.g., Gmail, SendGrid, Mailgun)

### 4. Start server
```npm run dev```
- Server will start at:
👉 http://localhost:4000

- Swagger docs:
👉 http://localhost:4000/docs

---

## 🔑 Authentication Flows
### JWT Auth

- POST /auth/register → Register new user

- POST /auth/login → Get access + refresh tokens

- POST /auth/refresh → Refresh access token

- POST /auth/logout → Revoke refresh token

- GET /private-jwt → Access JWT-protected route (requires Authorization: Bearer <token>)

### Session Auth

- POST /auth/session-login → Login via session (cookie)

- GET /private-session → Access session-protected route

- POST /auth/logout → Destroy session

### OAuth

- GET /auth/google → Google OAuth login

- GET /auth/github → GitHub OAuth login

### Magic Link

- POST /auth/magic/request → Request login link (email)

- GET /auth/magic/verify?token=...&email=... → Verify & login

### TOTP (2FA)

- POST /auth/totp/setup → Generate secret & QR code

- POST /auth/totp/enable → Enable with valid token

- POST /auth/totp/verify → Verify 2FA token

### 📖 API Docs (Swagger)

- Interactive docs available at:
👉 http://localhost:4000/docs

---

## 🤝 Contributing

- Contributions are welcome! 🎉

- Fork the repo

- Create a new branch (feature/your-feature)

- Commit your changes

- Push & open a PR

- Please follow conventional commit messages and keep code well-documented.

## 📜 License

- MIT License © 2025 Animesh Pratap Singh

- Free to use, modify, and distribute. See LICENSE
 for details.

### 🙌 Acknowledgements

- Passport.js

- Ethereal Email

- Swagger

**Open-source community 💙**