# 🤖 Kai9000 - AI Task Automation Platform

An advanced full-stack application for managing tasks and conversations with AI assistance.

## 📋 Overview

Kai9000 combines:
- 💬 **Conversational AI** through an interactive chat interface
- 🤖 **Task Management** with priority and status tracking
- 🔄 **AI-Powered Assistance** for task automation
- 🔗 **RESTful APIs** for seamless integration
- ⚙️ **Scalable Architecture** with Docker support

## 🏗️ Tech Stack

- **Backend**: Node.js + Express + PostgreSQL + Sequelize
- **Frontend**: React 18 + React Router + Axios
- **AI Service**: Node.js + Express
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT tokens
- **DevOps**: Docker & Docker Compose
- **Logging**: Winston

## 📁 Project Structure

```
Kai9000/
├── backend/
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── routes/          # API routes
│   │   ├── middleware/       # Auth & error handling
│   │   ├── db/
│   │   │   └── models/      # Database models
│   │   ├── utils/           # Utilities & validators
│   │   └── index.js         # Main entry point
│   ├── package.json
│   └── .env.example
├── ai-service/
│   ├── src/
│   │   ├── utils/
│   │   └── index.js
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/       # Reusable components
│   │   ├── services/         # API services
│   │   ├── styles/          # CSS files
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   ├── .env.example
│   └── Dockerfile
├── docker-compose.yml
├── .gitignore
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- PostgreSQL v12+
- Docker & Docker Compose (optional)

### Installation

**Option 1: Docker (Recommended)**
```bash
git clone https://github.com/taylorlexi426-design/Kai9000.git
cd Kai9000
docker-compose up -d
```

**Option 2: Manual Setup**

1. **Backend**
   ```bash
   cd backend
   cp .env.example .env
   npm install
   npm run dev
   ```

2. **AI Service**
   ```bash
   cd ai-service
   npm install
   npm run dev
   ```

3. **Frontend**
   ```bash
   cd frontend
   cp .env.example .env
   npm install
   npm start
   ```

### Access Points
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- AI Service: http://localhost:5001

## 🎯 Core Features

- ✅ User Authentication (Register/Login with JWT)
- ✅ Task Management (Create, Read, Update, Delete)
- ✅ Task Conversations (AI-powered chat per task)
- ✅ Priority & Status Tracking
- ✅ Real-time Message Handling
- ✅ User Profiles & Settings
- ✅ RESTful API Architecture
- ✅ Docker Containerization

## 📚 API Endpoints

### Authentication
```
POST   /api/v1/auth/register       # Register new user
POST   /api/v1/auth/login          # Login user
POST   /api/v1/auth/logout         # Logout user
```

### Users
```
GET    /api/v1/users/profile       # Get user profile
PUT    /api/v1/users/profile       # Update user profile
```

### Tasks
```
GET    /api/v1/tasks               # Get all user tasks
POST   /api/v1/tasks               # Create new task
GET    /api/v1/tasks/:id           # Get task details
PUT    /api/v1/tasks/:id           # Update task
DELETE /api/v1/tasks/:id           # Delete task
```

### Conversations
```
GET    /api/v1/conversations/:taskId              # Get task conversations
POST   /api/v1/conversations                       # Create conversation
GET    /api/v1/conversations/:conversationId/messages   # Get messages
POST   /api/v1/conversations/:conversationId/messages   # Add message
```

### Chat (AI assistant)
```
POST   /api/v1/chat/message        # Send a chat message, get an AI reply (may trigger a device command)
GET    /api/v1/chat/history        # Get chat message history
```

### Device Control (Termux)
```
GET    /api/v1/device/status       # Get current device status (battery, wifi, last command)
GET    /api/v1/device/history      # Get device command history
POST   /api/v1/device/command      # Run a device command, e.g. { "action": "screen", "params": { "state": "on" } }
```

## 📱 Device Control & Web UI

Kai9000 ships with a Termux-based device control module
(`backend/src/services/deviceService.js`) that shells out to
[`termux-api`](https://wiki.termux.com/wiki/Termux:API) commands to control
the screen (via `termux-wake-lock`/`termux-wake-unlock`), brightness, volume,
notifications, apps, and files. When `termux-api` isn't installed (e.g. in a
regular dev/CI environment) commands are simulated so the rest of the app
keeps working.

A minimal HTML/CSS/JS web frontend is served directly by the backend from
`backend/public/`. Once the backend is running, open
`http://localhost:5000` in a (mobile) browser to chat with Kai9000, view
device status, and see the command history — no separate frontend build is
required.

## 🔧 Environment Variables

### Backend (.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kai9000_db
DB_USER=postgres
DB_PASSWORD=password
BACKEND_PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=debug
AI_SERVICE_URL=http://localhost:5001
AI_API_KEY=your_ai_api_key
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_AI_URL=http://localhost:5001
```

## 🗄️ Database Schema

### Users
- id (UUID, PK)
- email (unique)
- password (hashed)
- firstName, lastName
- avatar, bio
- isActive, lastLogin
- timestamps

### Tasks
- id (UUID, PK)
- userId (FK)
- title, description
- status (pending, in_progress, completed, failed)
- priority (low, medium, high)
- dueDate, result
- timestamps

### Conversations
- id (UUID, PK)
- taskId (FK)
- title, context
- status (active, archived, completed)
- timestamps

### Messages
- id (UUID, PK)
- conversationId (FK)
- sender (user, ai)
- content, metadata
- timestamps

## 🚀 Deployment

### Docker Compose
```bash
docker-compose up -d
```

### Individual Services
```bash
# Backend
docker build -t kai9000-backend ./backend
docker run -p 5000:5000 kai9000-backend

# Frontend
docker build -t kai9000-frontend ./frontend
docker run -p 3000:3000 kai9000-frontend

# AI Service
docker build -t kai9000-ai ./ai-service
docker run -p 5001:5001 kai9000-ai
```

## 📝 Development

```bash
# Backend (from backend/)
npm run dev        # Development with nodemon

# Frontend (from frontend/)
npm start          # Development server
npm run build      # Production build

# AI Service (from ai-service/)
npm run dev        # Development server
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- Issues: [GitHub Issues](https://github.com/taylorlexi426-design/Kai9000/issues)
- Discussions: [GitHub Discussions](https://github.com/taylorlexi426-design/Kai9000/discussions)

---

**Kai9000** - Your AI-powered task automation platform. Built with flexibility, security, and scalability in mind. 🚀
