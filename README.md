# 🚀 User Onboarding & Identity Microservices

A robust, scalable microservices-based system for user onboarding and identity management. This project demonstrates best practices using **Node.js**, **Kafka**, and **PostgreSQL**, featuring asynchronous communication for robust OTP and email workflows.

## 🌟 Key Features

*   **Microservices Architecture**: Decoupled services for better scalability and maintainability.
*   **Asynchronous Messaging**: Uses **Apache Kafka** for reliable event-driven communication (e.g., sending OTPs).
*   **Security First**: Implements **JWT** authentication, **Bcrypt** password hashing, **Helmet** for headers, and **Rate Limiting**.
*   **Data Integrity**: Uses **PostgreSQL** with Sequelize ORM for structured data and **Redis** for temporary OTP storage.
*   **Containerized**: Fully Dockerized for easy deployment.

---

## 🛠️ Tech Stack

*   **Backend**: Node.js, Express.js
*   **Database**: PostgreSQL (Primary), Redis (Caching/Temp Store)
*   **Message Broker**: Apache Kafka (via Zookeeper)
*   **Email Provider**: SendGrid
*   **Containerization**: Docker & Docker Compose

---

## 🏗️ Architecture

The system consists of two main services:

1.  **User Service**: Handles HTTP requests for registration, login, and profile management. It acts as a **Producer** sending events to Kafka.
2.  **Email Service**: Listens to Kafka topics (e.g., `send-otp`) and sends emails via SendGrid. It acts as a **Consumer**.

**Flow:**
`User Registers` → `Save to Redis (Temp)` → `Produce 'send-otp' event` → `Email Service Consumes event` → `Send Email via SendGrid` → `User Verifies OTP` → `Save to Postgres (Permanent)`

---

## 🚀 Getting Started

### Prerequisites

*   **Docker** and **Docker Compose** installed.
*   (Optional) **Node.js** v18+ if running locally without Docker.

### Method 1: Docker Compose (Recommended)

Run the entire system with a single command:

```bash
# 1. Start all services (Postgres, Redis, Zookeeper, Kafka, User Service, Email Service)
docker-compose up --build
```

The User Service will be available at `http://localhost:3000`.

### Method 2: Manual Setup

If you prefer running services individually:

<details>
<summary>Click to expand Manual Setup Instructions</summary>

1.  **Start Infrastructure (Postgres, Redis, Kafka)**
    You can still use Docker for the infra:
    ```bash
    docker-compose up -d postgres redis zookeeper kafka
    ```

2.  **User Service**
    ```bash
    cd user-service
    npm install
    # Copy .env.example if available, or create .env (see below)
    npm run dev
    ```

3.  **Email Service**
    ```bash
    cd email-service
    npm install
    # Create .env (see below)
    npm run dev
    ```
</details>

---

## ⚙️ Environment Variables

### User Service (`user-service/.env`)

```env
PORT=3000
DB_USER=user
DB_HOST=postgres      # Use 'localhost' if running outside Docker
DB_NAME=user_db
DB_PASSWORD=password
DB_PORT=5432          # Mapped to 5433 in docker-compose for localhost
REDIS_HOST=redis      # Use 'localhost' if running outside Docker
REDIS_PORT=6379       # Mapped to 6380 in docker-compose for localhost
KAFKA_BROKER=kafka:29092 # Use 'localhost:9092' if running outside Docker
JWT_SECRET=supersecretkey123
```

### Email Service (`email-service/.env`)

```env
KAFKA_BROKER=kafka:29092 # Use 'localhost:9092' if running outside Docker
SENDGRID_API_KEY=SG.your_sendgrid_api_key...
FROM_EMAIL=your_verified_email@example.com
```

---

## 📡 API Documentation

### 1. Register User & Send OTP
**POST** `/api/auth/register`

Generates an OTP, temporarily stores user data in Redis, and triggers an email.

**Body:**
```json
{
  "name": "Rajinder",
  "email": "rajinder@example.com",
  "password": "securePassword123"
}
```

### 2. Verify OTP
**POST** `/api/auth/verify-otp`

Validates the OTP. If correct, creates the permanent user in PostgreSQL.

**Body:**
```json
{
  "email": "rajinder@example.com",
  "otp": "123456"
}
```

### 3. Login
**POST** `/api/auth/login`

Returns a JWT token for authenticated requests.

**Body:**
```json
{
  "email": "rajinder@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Logged in successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { ... }
  }
}
```

### 4. Get Profile (Protected)
**GET** `/api/auth/profile`

**Headers:**
`Authorization: Bearer <your_token_here>`

---

## 📂 Project Structure

```
├── docker-compose.yml       # Orchestrates all services
├── user-service/            # Express App (Producer)
│   ├── src/
│   │   ├── config/          # DB, Redis, Kafka Config
│   │   ├── controllers/     # Auth Logic
│   │   ├── models/          # Sequelize Models
│   │   ├── routes/          # API Routes
│   │   └── ...
├── email-service/           # Microservice (Consumer)
    ├── src/
        ├── config/          # Kafka Consumer Config
        ├── utils/           # SendGrid Helper
        └── ...
```

---

Made with ❤️ by the AntiGravity Team.
