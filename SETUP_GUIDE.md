# 🚀 AulBridge Full Stack Setup Guide

## Project Structure

```
upbeat-unfold-main/
├── frontend/              # React frontend (existing)
│   ├── src/
│   ├── package.json
│   └── ...
├── backend/              # Node.js/Express backend (NEW)
│   ├── src/
│   ├── package.json
│   ├── .env
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── README.md
└── ...
```

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (free tier available at https://supabase.com)
- OpenAI API key (https://platform.openai.com/api-keys)

## Step-by-Step Setup

### 1. Frontend Setup

```bash
# Already set up, just install dependencies
npm install
npm run dev
```

Frontend runs on: **http://localhost:5173**

### 2. Supabase Setup

1. Go to https://supabase.com and create a new project
2. In your project settings, copy:
   - **Project URL** (SUPABASE_URL)
   - **Anonymous Key** (SUPABASE_ANON_KEY) 
   - **Service Role Key** (SUPABASE_SERVICE_ROLE_KEY)

3. Create database tables (in SQL Editor):

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

### 3. Backend Setup

#### Option A: Local Setup (No Docker)

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Update .env file with your keys
# Edit .env and fill in:
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - OPENAI_API_KEY

# Run development server
npm run dev
```

Backend runs on: **http://localhost:3000**

#### Option B: Docker Setup

```bash
# From backend directory
docker-compose up
```

This will start:
- Backend API: http://localhost:3000
- PostgreSQL: localhost:5432

### 4. Environment Variables

**Backend `.env` file** should contain:

```env
PORT=3000
NODE_ENV=development

# From Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# OpenAI API Key
OPENAI_API_KEY=sk-...

# CORS
FRONTEND_URL=http://localhost:5173
```

## Testing the Setup

### 1. Check Backend Health

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-06-19T10:00:00.000Z",
  "uptime": 1234.5,
  "environment": "development"
}
```

### 2. Test Chat API

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "What is 2+2?"}
    ]
  }'
```

### 3. Test Registration

```bash
curl -X POST http://localhost:3000/api/account/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123",
    "name": "Test Student"
  }'
```

## Available Scripts

### Frontend
```bash
npm run dev        # Development server
npm run build      # Build for production
npm run lint       # Lint code
```

### Backend
```bash
npm run dev        # Development server with hot reload
npm run build      # Build TypeScript
npm start          # Run production build
npm run lint       # Lint code
npm run format     # Format code
```

## API Endpoints

### Health
- `GET /api/health` - Server status
- `GET /api/health/ready` - Readiness check

### Chat
- `POST /api/chat` - Send message to AI tutor

### Account
- `POST /api/account/register` - Register user
- `POST /api/account/login` - Login user
- `GET /api/account/profile` - Get user profile (requires token)
- `POST /api/account/logout` - Logout

## Troubleshooting

### Backend won't start
1. Check if port 3000 is in use: `lsof -i :3000`
2. Verify all environment variables are set
3. Check Node.js version: `node --version` (should be 18+)

### Supabase connection fails
1. Verify SUPABASE_URL and keys are correct
2. Check network connectivity
3. Verify your Supabase project is active

### OpenAI API errors
1. Check if API key is valid
2. Verify API key has remaining credits
3. Check API key permissions in OpenAI dashboard

### CORS errors
1. Update FRONTEND_URL in backend .env
2. Restart backend after changing .env

## Next Steps

1. ✅ Set up frontend (done)
2. ✅ Set up backend (done)
3. ✅ Configure Supabase database
4. Connect frontend to backend APIs
5. Deploy to production

## Deployment

### Vercel (Frontend)
```bash
cd frontend
npm run build
# Deploy to Vercel
```

### Railway/Render/Heroku (Backend)
1. Push code to GitHub
2. Connect repository to deployment platform
3. Set environment variables
4. Deploy

## Support

For issues, check:
- Backend README: `backend/README.md`
- Frontend docs: Review the main README.md
- Supabase docs: https://supabase.com/docs
