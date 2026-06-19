# AulBridge Backend

Express.js backend for AulBridge with Supabase integration.

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

**Required environment variables:**
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `OPENAI_API_KEY` - Your OpenAI API key

### 3. Run Development Server

```bash
npm run dev
```

Server will start on `http://localhost:3000`

## Available Endpoints

### Health Check
- `GET /api/health` - Server status
- `GET /api/health/ready` - Readiness check

### Authentication (Account)
- `POST /api/account/register` - Register new user
- `POST /api/account/login` - Login user
- `GET /api/account/profile` - Get user profile (requires Bearer token)
- `POST /api/account/logout` - Logout user

### Chat
- `POST /api/chat` - Send message to AI tutor

## API Examples

### Chat with AI Tutor

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "How do I solve 2x + 5 = 13?"}
    ]
  }'
```

### Register User

```bash
curl -X POST http://localhost:3000/api/account/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "SecurePassword123",
    "name": "John Doe"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/account/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "SecurePassword123"
  }'
```

## Database Setup

### Supabase Tables

Create the following tables in your Supabase project:

#### Users Profile
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  readiness_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Progress Tracking
```sql
CREATE TABLE progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  accuracy DECIMAL(5,2),
  time_spent_minutes INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Chat History
```sql
CREATE TABLE chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Docker Setup

### Build Docker Image

```bash
docker build -t aulbridge-backend .
```

### Run with Docker Compose

```bash
docker-compose up
```

This will start:
- Backend API on port 3000
- PostgreSQL database on port 5432

## Development

### Code Structure
```
src/
├── server.ts           # Main Express app
├── routes/             # API routes
│   ├── chat.ts        # Chat endpoints
│   ├── account.ts     # Auth endpoints
│   └── health.ts      # Health check
├── middleware/        # Express middleware
├── controllers/       # Business logic
└── utils/            # Helper functions
```

### Build for Production

```bash
npm run build
npm start
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment | development, production |
| SUPABASE_URL | Supabase project URL | https://xxx.supabase.co |
| SUPABASE_ANON_KEY | Supabase anonymous key | eyJhbGc... |
| SUPABASE_SERVICE_ROLE_KEY | Service role key | eyJhbGc... |
| OPENAI_API_KEY | OpenAI API key | sk-... |
| JWT_SECRET | JWT signing secret | your-secret |
| FRONTEND_URL | Frontend origin for CORS | http://localhost:5173 |

## Troubleshooting

### "Missing required Supabase environment variables"
Make sure your `.env` file has `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

### "AI tutor is not configured"
Add `OPENAI_API_KEY` to your `.env` file.

### CORS errors
Update `FRONTEND_URL` environment variable to match your frontend URL.

## License

MIT
