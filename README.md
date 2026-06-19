# 🌉 AulBridge - AI Platform for Rural Students

**Платформа для подготовки учеников сельских регионов к поступлению в элитные учебные заведения (НИШ, БИЛ, РФМШ)**

## 📌 О проекте

AulBridge — это умная образовательная платформа, которая использует AI для персонализированной подготовки талантливых учеников из сельских районов Казахстана к вступительным экзаменам в лучшие школы.

**Ключевые особенности:**
- 🤖 AI-репетитор на основе GPT-3.5 Turbo (OpenAI)
- 📊 Личные планы обучения, адаптированные к уровню и темпу студента
- 📈 Отслеживание прогресса и точности выполнения заданий
- 💬 Интерактивный чат с разбором ошибок
- 🌍 Поддержка трёх языков: Казахский, Русский, Английский
- 🔐 Безопасная аутентификация через Supabase
- 📱 Адаптивный дизайн (мобильный + десктоп)

## 🏗️ Архитектура

```
AulBridge Full Stack
├── Frontend (React + TypeScript + Vite)
│   └── src/
│       ├── components/      # UI компоненты
│       ├── routes/          # TanStack Router маршруты
│       ├── hooks/           # React hooks
│       ├── lib/             # Утилиты
│       └── styles.css       # Tailwind CSS
│
├── Backend (Node.js + Express)
│   └── src/
│       ├── routes/          # API endpoints
│       │   ├── chat.ts      # OpenAI API
│       │   ├── account.ts   # Supabase Auth
│       │   └── health.ts    # Health check
│       ├── utils/           # Helpers
│       ├── middleware/      # Express middleware
│       └── server.ts        # Main server
│
└── Database (Supabase/PostgreSQL)
    ├── user_profiles
    ├── progress
    └── chat_history
```

## 📋 Требования

- **Node.js** 18+ 
- **npm** 8+, **pnpm** 7+ или **bun** 1+
- **Git** 2.0+
- **Supabase** аккаунт (бесплатно на https://supabase.com)
- **OpenAI API Key** (для AI функций)

## 🚀 Быстрый старт

### 1. Клонирование и установка

```bash
# Клонируем репозиторий
git clone https://github.com/aidanaakylbek/-01-.git
cd upbeat-unfold-main

# Устанавливаем зависимости фронтенда
npm install

# Переходим в папку бэкенда и устанавливаем там
cd backend
npm install
cd ..
```

### 2. Конфигурация Supabase

1. Создайте проект на https://supabase.com
2. Скопируйте в `backend/.env`:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

3. Создайте таблицы в SQL Editor Supabase (см. [backend/README.md](backend/README.md#database-setup))

### 3. Конфигурация OpenAI

1. Получите API ключ на https://platform.openai.com/api-keys
2. Добавьте в `backend/.env`:
   ```
   OPENAI_API_KEY=sk-your-key
   ```

### 4. Запуск проекта

**Терминал 1 - Фронтенд:**
```bash
npm run dev
# Запустится на http://localhost:5173
```

**Терминал 2 - Бэкенд:**
```bash
cd backend
npm run dev
# Запустится на http://localhost:3000
```

Или через Docker:
```bash
cd backend
docker-compose up
```

## 📚 Структура проекта

### Фронтенд

```
src/
├── components/
│   ├── ui/                    # Shadcn/ui компоненты
│   ├── navbar.tsx             # Навбар с языками
│   ├── site-footer.tsx        # Подвал
│   └── ai-assistant.tsx       # AI чат
├── routes/
│   ├── __root.tsx             # Корневой layout
│   ├── index.tsx              # Главная страница
│   ├── home.tsx               # Dashboard
│   ├── plan.tsx               # План обучения
│   ├── progress.tsx           # Прогресс
│   ├── reports.tsx            # Отчёты
│   ├── login.tsx              # Вход
│   ├── register.tsx           # Регистрация
│   └── api/chat.ts            # Chat API route
├── hooks/
│   ├── use-language.tsx       # Переводы (KZ, RU, EN)
│   ├── use-account-dashboard.ts
│   └── use-mobile.tsx
├── lib/
│   ├── utils.ts               # Утилиты
│   ├── error-page.ts
│   └── api/
│       └── account.functions.ts
└── styles.css                 # Tailwind CSS
```

### Бэкенд

```
backend/src/
├── routes/
│   ├── chat.ts                # POST /api/chat (OpenAI)
│   ├── account.ts             # POST/GET /api/account
│   └── health.ts              # GET /api/health
├── utils/
│   └── supabase.ts            # Supabase клиент
├── middleware/
└── server.ts                  # Express app
```

## 🔌 API Endpoints

### Chat (AI Репетитор)
```bash
POST /api/chat
{
  "messages": [
    {"role": "user", "content": "Как решить это уравнение?"}
  ]
}
```

### Account (Аутентификация)
```bash
POST /api/account/register
POST /api/account/login
GET /api/account/profile
POST /api/account/logout
```

### Health Check
```bash
GET /api/health
GET /api/health/ready
```

## 🛠️ Доступные команды

### Фронтенд

```bash
npm run dev        # Разработка (Vite)
npm run build      # Сборка для production
npm run preview    # Просмотр build
npm run lint       # ESLint проверка
npm run format     # Prettier форматирование
```

### Бэкенд

```bash
cd backend

npm run dev        # Разработка (hot reload)
npm run build      # TypeScript компиляция
npm start          # Запуск production build
npm run lint       # ESLint проверка
npm run format     # Prettier форматирование
```

## 🌐 Поддерживаемые языки

- 🇰🇿 **Казахский** (KZ)
- 🇷🇺 **Русский** (RU)
- 🇬🇧 **Английский** (EN)

## 🗄️ База данных

### Supabase таблицы

- `auth.users` — Встроенная аутентификация
- `user_profiles` — Профили пользователей
- `progress` — Отслеживание прогресса
- `chat_history` — История чатов

## 📦 Основные зависимости

### Фронтенд
- **React 18** - UI библиотека
- **TypeScript** - Типизация
- **Vite** - Build tool
- **TanStack Router** - Маршрутизация
- **Tailwind CSS** - Стилизация
- **Shadcn/ui** - UI компоненты
- **Zod** - Валидация схем

### Бэкенд
- **Express** - Web фреймворк
- **TypeScript** - Типизация
- **Supabase JS** - БД клиент
- **OpenAI** - AI API
- **Zod** - Валидация
- **CORS** - Cross-origin

## 🔐 Окружение

### Frontend `.env`
```env
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
```

### Backend `.env`
```env
PORT=3000
NODE_ENV=development
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=sk-...
JWT_SECRET=...
FRONTEND_URL=http://localhost:5173
```

## 📖 Дополнительные гайды

- **[Полная инструкция по настройке](SETUP_GUIDE.md)** - Детальная установка и конфигурация
- **[Backend документация](backend/README.md)** - API, Docker, примеры
- **[Frontend структура](src/routes/README.md)** - Маршруты и компоненты

## 🐛 Troubleshooting

### Порт 3000 занят
```bash
# Найти процесс
lsof -i :3000
# Использовать другой порт
PORT=3001 npm run dev
```

### CORS ошибки
- Проверьте `FRONTEND_URL` в backend `.env`
- Перезагрузите бэкенд

### OpenAI API ошибки
- Проверьте API key на https://platform.openai.com
- Убедитесь, что есть баланс в аккаунте

### Supabase не подключается
- Проверьте URL и ключи
- Убедитесь, что проект активен

## 🚀 Развёртывание

### Frontend (Vercel)
```bash
npm run build
# Загрузить на Vercel
```

### Backend (Railway/Render/Heroku)
1. Push код на GitHub
2. Связать репо с платформой
3. Установить Environment variables
4. Deploy

## 📝 Лицензия

MIT License - см. файл LICENSE

## 👥 Контрибьютинг

Contributions приветствуются! Откройте PR с описанием изменений.

## 📞 Поддержка

Проблемы? Откройте Issue в репозитории.

---

**Создано для студентов сельских регионов Казахстана 🌾**
*Мост к светлому будущему через образование*
