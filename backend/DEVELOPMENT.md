# Backend Development Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Edit `backend/.env` and fill in your actual values:

```env
# Supabase (from https://supabase.com)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# OpenAI (from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-...

# JWT Secret (choose any random string)
JWT_SECRET=your-secret-key-here
```

### 3. Run Development Server

```bash
npm run dev
```

Server will start on `http://localhost:3000`

## Build Commands

- `npm run dev` - Compile TypeScript and run server
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run production build
- `npm run lint` - Check code with ESLint
- `npm run format` - Format code with Prettier

## Project Structure

```
backend/
├── src/
│   ├── server.ts              # Express app
│   ├── routes/                # API endpoints
│   │   ├── chat.ts           # /api/chat (OpenAI)
│   │   ├── account.ts        # /api/account (Auth)
│   │   └── health.ts         # /api/health
│   ├── utils/
│   │   └── supabase.ts       # Supabase client
│   ├── middleware/           # Express middleware
│   └── controllers/          # Business logic
├── dist/                     # Compiled JavaScript
├── package.json
├── tsconfig.json            # TypeScript config
├── .env                     # Environment variables (local, not in git)
└── .env.example             # Template for .env
```

## API Endpoints

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Chat with AI
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "What is 2 + 2?"}
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

Run these SQL queries in Supabase SQL Editor:

```sql
-- User Profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  readiness_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Progress Tracking
CREATE TABLE progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  accuracy DECIMAL(5,2),
  time_spent_minutes INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat History
CREATE TABLE chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Deployment

### Docker

```bash
docker build -t aulbridge-backend .
docker run -p 3000:3000 \
  -e SUPABASE_URL=... \
  -e SUPABASE_ANON_KEY=... \
  -e OPENAI_API_KEY=... \
  aulbridge-backend
```

### Docker Compose

```bash
docker-compose up
```

## Troubleshooting

### Port 3000 already in use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>
```

### Environment variables not loaded
- Check `.env` file exists in `backend/` directory
- Restart dev server after changing `.env`

### TypeScript errors
- Run `npx tsc --noEmit` to check for errors
- Make sure all types are installed: `npm install --save-dev @types/cors @types/jsonwebtoken`

### Connection errors to Supabase
- Verify URL and keys are correct
- Check Supabase project is active
- Verify network connectivity

## Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment | development, production |
| SUPABASE_URL | Supabase project URL | https://xxx.supabase.co |
| SUPABASE_ANON_KEY | Anon key from Supabase | eyJhbGc... |
| SUPABASE_SERVICE_ROLE_KEY | Service role key | eyJhbGc... |
| OPENAI_API_KEY | OpenAI API key | sk-... |
| JWT_SECRET | JWT signing secret | your-secret |
| FRONTEND_URL | Frontend origin for CORS | http://localhost:5173 |

## Support

For issues:
1. Check `.env` file is configured
2. Check `npm install` completed successfully
3. Check TypeScript compiles: `npx tsc --noEmit`
4. Check Supabase/OpenAI keys are valid
