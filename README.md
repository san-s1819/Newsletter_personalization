# 🤖 AI Newsletter Subscription System

A modern, responsive newsletter subscription platform built with Node.js, Express, PostgreSQL, and vanilla JavaScript. Features a beautiful UI with category selection and experience-based personalization.

## 🏗️ Architecture

```
Frontend (index.html)
├── Experience Level Selection  
├── Multi-Select AI Categories
└── Form Validation & Submission

Backend (server.js)
├── Express Server
├── PostgreSQL Connection
├── API Endpoints
├── Data Validation
└── Error Handling

Database (PostgreSQL)
├── subscribers table
├── verification_pins table (ready for future)
└── admin_emails table (ready for future)
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v14 or higher)
- **PostgreSQL** (v12 or higher)
- **npm**

### 1. Clone Repository

```bash
git clone <your-repository-url>
cd Newsletter_personalization
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- `express` - Web framework
- `pg` - PostgreSQL client
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management
- `express-rate-limit` - Rate limiting (for future security)
- `nodemailer` - Email service (for future features)

### 3. Database Setup

#### Step 3.1: Create Database

```sql
-- Connect to PostgreSQL and create database
CREATE DATABASE newsletter_subscribers;
```

#### Step 3.2: Create Tables

Connect to your `newsletter_subscribers` database and run:

```sql
-- 1. Main subscribers table
CREATE TABLE subscribers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    ai_topic VARCHAR(255) NOT NULL,
    linkedin_url VARCHAR(500),
    subscribed_at TIMESTAMP DEFAULT NOW()
);

-- 2. Add verification column for future features
ALTER TABLE subscribers ADD COLUMN verified BOOLEAN DEFAULT FALSE;

-- 3. Verification pins table (for future PIN verification)
CREATE TABLE verification_pins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    pin VARCHAR(6) NOT NULL,
    purpose VARCHAR(20) NOT NULL CHECK (purpose IN ('subscribe', 'modify', 'admin')),
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Admin emails table (for future admin features)
CREATE TABLE admin_emails (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);
-- 5. Insert sample admin emails (replace with your actual emails)
INSERT INTO admin_emails (email) VALUES 
('admin1@example.com'),
('admin2@example.com')
ON CONFLICT (email) DO NOTHING;
```

#### Step 3.3: Environment Configuration

Create a `.env` file in the project root:

```env
# Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_NAME=newsletter_subscribers
DB_PASSWORD=your_password_here
DB_PORT=5432

# Server Configuration
PORT=3001

# Email Configuration (for future features)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Admin Emails (comma-separated)
ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

### 4. Start the Server

```bash
npm start
```

Or for development:

```bash
npm run dev
```

The server will start on `http://localhost:3001`

## 📊 Database Schema

### subscribers
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| name | VARCHAR(255) | Subscriber name |
| email | VARCHAR(255) | Unique email address |
| ai_topic | VARCHAR(255) | Selected AI interests (JSON array as string) |
| linkedin_url | VARCHAR(500) | Optional LinkedIn profile |
| subscribed_at | TIMESTAMP | Subscription timestamp |
| verified | BOOLEAN | Email verification status |

### verification_pins (Future)
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| email | VARCHAR(255) | Target email |
| pin | VARCHAR(6) | 6-digit PIN |
| purpose | VARCHAR(20) | subscribe/modify/admin |
| expires_at | TIMESTAMP | PIN expiration |
| used | BOOLEAN | Usage status |

### admin_emails (Future)
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| email | VARCHAR(255) | Admin email address |
| is_active | BOOLEAN | Active status |

## 🔄 Code Flow Diagram

### Server.js Execution Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        SERVER.JS EXECUTION FLOW                 │
└─────────────────────────────────────────────────────────────────┘

    ┌─────────────────┐
    │   node server.js │
    └─────────┬───────┘
              │
              ▼
    ┌─────────────────┐
    │ 1. Load .env    │
    │ require('dotenv')│
    └─────────┬───────┘
              │
              ▼
    ┌─────────────────┐
    │ 2. Import Deps  │
    │ express, pg,    │
    │ cors, path      │
    └─────────┬───────┘
              │
              ▼
    ┌─────────────────┐
    │ 3. Create App   │
    │ const app =     │
    │ express()       │
    └─────────┬───────┘
              │
              ▼
    ┌─────────────────┐
    │ 4. Setup DB     │
    │ Pool Connection │
    │ (PostgreSQL)    │
    └─────────┬───────┘
              │
              ▼
    ┌─────────────────┐
    │ 5. Middleware   │
    │ • CORS          │
    │ • JSON Parser   │
    │ • Static Files  │
    └─────────┬───────┘
              │
              ▼
    ┌─────────────────┐
    │ 6. Test DB      │
    │ Connection      │
    └─────────┬───────┘
              │
              ▼
    ┌─────────────────┐
    │ 7. Define Routes│
    │ • GET /         │
    │ • POST /api/sub │
    │ • GET /api/subs │
    └─────────┬───────┘
              │
              ▼
    ┌─────────────────┐
    │ 8. Start Server │
    │ app.listen(3001)│
    └─────────┬───────┘
              │
              ▼
    ┌─────────────────┐
    │ 9. Server Ready │
    │ Listening for   │
    │ HTTP Requests   │
    └─────────────────┘
```

### Request Processing Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    POST /api/subscribe FLOW                      │
└─────────────────────────────────────────────────────────────────┘

Request Arrives
      │
      ▼
┌─────────────────┐
│ 1. Extract Body │
│ const { name,   │
│ email, ai_topic,│
│ linkedin } =    │
│ req.body        │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐     NO   ┌─────────────────┐
│ 2. Validate     │◄─────────│ Return 400      │
│ Required Fields │          │ Error Response  │
│ name, email,    │          └─────────────────┘
│ ai_topic exist? │
└─────────┬───────┘
          │ YES
          ▼
┌─────────────────┐     NO   ┌─────────────────┐
│ 3. Validate     │◄─────────│ Return 400      │
│ Email Format    │          │ Invalid Email   │
│ with Regex      │          └─────────────────┘
└─────────┬───────┘
          │ YES
          ▼
┌─────────────────┐     NO   ┌─────────────────┐
│ 4. Validate     │◄─────────│ Return 400      │
│ LinkedIn URL    │          │ Invalid URL     │
│ (if provided)   │          └─────────────────┘
└─────────┬───────┘
          │ YES/SKIP
          ▼
┌─────────────────┐
│ 5. Prepare SQL  │
│ INSERT INTO     │
│ subscribers...  │
│ VALUES ($1,$2..)│
└─────────┬───────┘
          │
          ▼
┌─────────────────┐     ERROR ┌─────────────────┐
│ 6. Execute      │◄──────────│ Handle DB Error │
│ pool.query()    │           │ • Duplicate Key │
│ with params     │           │ • Server Error  │
└─────────┬───────┘           └─────────────────┘
          │ SUCCESS
          ▼
┌─────────────────┐
│ 7. Log Result   │
│ console.log     │
│ ('User sub..')  │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ 8. Send 201     │
│ Success Response│
│ with subscriber │
│ data            │
└─────────────────┘
```

### Frontend User Interaction Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND USER FLOW                           │
└─────────────────────────────────────────────────────────────────┘

User Opens Browser
      │
      ▼
┌─────────────────┐
│ 1. Visit        │
│ localhost:3001  │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ 2. Server Sends │
│ index.html +    │
│ CSS + JS        │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ 3. Page Renders │
│ • 2-Column Form │
│ • Experience    │
│ • Categories    │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ 4. User Fills   │
│ Form Fields     │
│ • Name, Email   │
│ • Experience    │
│ • Interests     │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ 5. Client-Side  │
│ Validation      │
│ • Required      │
│ • Email Format  │
│ • At least 1    │
│   category      │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ 6. Submit via   │
│ fetch() POST    │
│ to /api/sub     │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ 7. Show Success │
│ or Error Message│
│ in UI           │
└─────────────────┘
```

## 🛠️ API Endpoints

### POST /api/subscribe
Subscribe a new user to the newsletter.

**Request Body:**
```json
{
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "experience_level": "Advanced",
    "ai_topics": [
        "LLMs, NLP & Language Model Advances",
        "Core ML Research & Tutorials"
    ],
    "linkedin": "https://linkedin.com/in/adalovelace"
}
```

**Response (Success):**
```json
{
    "message": "Successfully subscribed! Welcome to the AI Newsletter.",
    "subscriber": {
        "id": 5,
        "email": "ada@example.com",
        "subscribed_at": "2025-05-29T14:45:00.000Z"
    }
}
```

**Response (Error):**
```json
{
    "message": "This email address is already subscribed."
}
```

### GET /api/subscribers
Get all subscribers (protected endpoint - future admin feature).

**Response:**
```json
{
    "total": 10,
    "subscribers": [
        {
            "id": 1,
            "name": "Ada Lovelace",
            "email": "ada@example.com",
            "ai_topic": "[\"LLMs, NLP & Language Model Advances\"]",
            "linkedin_url": "https://linkedin.com/in/adalovelace",
            "subscribed_at": "2025-05-29T14:45:00.000Z"
        }
    ]
}
```

### GET /
Serves the main HTML page.

## 🎨 Frontend Features

### Responsive Design
- **Desktop**: 2-column layout with equal heights
- **Tablet**: Responsive grid adjustments
- **Mobile**: Single column stack

### Form Validation
- **Required fields**: Name, email, experience level, at least one category
- **Email format**: Regex validation
- **LinkedIn URL**: Optional URL validation
- **Real-time feedback**: Immediate error/success messages

## 🔒 Security Features (Current)
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: Parameterized queries
- **CORS Configuration**: Controlled cross-origin requests
- **Email Uniqueness**: Database constraint prevents duplicates

## 🚀 Future Enhancements (Planned)
- **PIN Verification**: Email-based verification system
- **Admin Dashboard**: Subscriber management interface
- **Email Campaigns**: Newsletter sending functionality
- **Rate Limiting**: API abuse prevention
- **Preference Management**: User self-service updates

## 📁 Project Structure

```
Newsletter_personalization/
├── index.html              # Frontend application
├── server.js               # Backend server
├── package.json            # Dependencies and scripts
├── package-lock.json       # Dependency lock file
├── .env                    # Environment variables
├── .gitignore              # Git ignore rules
├── README.md               # This file
├── database-setup.sql      # Database schema
├── setup-database.js       # Database setup script
└── simple-verify.js        # Database verification tool
```
---

Made with ❤️ for the AI community 