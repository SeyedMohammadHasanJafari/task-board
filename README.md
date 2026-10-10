# TaskFlow — Real-Time Collaborative Kanban Workspace

TaskFlow is a production-grade, full-stack collaborative project management platform built on the MERN stack with TypeScript. It combines an interactive Kanban board with conflict-free concurrent rich-text editing (CRDTs), live multiplayer presence, and instant guest workspace sharing.

---

## Key Features

- **Multiplayer Kanban Canvas:** Drag-and-drop task workflow with optimistic UI updates and sub-50ms WebSocket state broadcast across connected team members.
- **Conflict-Free Concurrent Text Editing (CRDT):** Real-time task description collaboration powered by TipTap and Yjs over dedicated WebSockets (`/yjs`), eliminating merge conflicts and race conditions.
- **Live Spatial Presence & Cursors:** Remote cursor tracking throttled to 50ms intervals, paired with real-time online collaborator avatar stacks.
- **Zero-Friction Guest Workspace Links:** Instant guest session provisioning with assigned identities and color-coded avatars, allowing seamless external reviews without upfront registration.
- **Activity Feed & Audit Log:** Card-level commenting and timestamped event streams synchronized live across collaborators.
- **Responsive Dark-Themed UI:** Tailored aesthetic featuring accessible contrast ratios, fluid animations, and mobile-friendly drawer navigation.

---

## Architecture & Technology Stack

```
                          ┌───────────────────────────┐
                          │   Vite React 19 Client    │
                          │ (Tailwind CSS, Zustand,   │
                          │   TanStack Query, DnD)    │
                          └─────────────┬─────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    │ HTTP/REST         │ Socket.io         │ WebSockets (/yjs)
                    ▼                   ▼                   ▼
           ┌────────────────────────────────────────────────────────┐
           │                  Node.js / Express                     │
           │  ┌──────────────────┬─────────────────┬─────────────┐  │
           │  │ REST Controllers │ Socket Engine   │ Yjs Server  │  │
           │  │ (Auth, Board,    │ (Room Presence, │ (CRDT Doc   │  │
           │  │  Card, Activity) │  Card Actions)  │  Sync / WS) │  │
           │  └──────────────────┴─────────────────┴─────────────┘  │
           └────────────────────────────┬───────────────────────────┘
                                        │ Mongoose ODM
                                        ▼
                             ┌────────────────────┐
                             │  MongoDB Database  │
                             └────────────────────┘
```

### Frontend (`client/`)
- **Framework:** React 19 with Vite & TypeScript
- **Styling:** Tailwind CSS v4 & Framer Motion
- **State Management:** Zustand (UI state & optimistic actions)
- **Drag-and-Drop:** `@hello-pangea/dnd`
- **Rich Text / CRDT:** TipTap (ProseMirror) + Yjs (`y-websocket`)
- **Icons:** Lucide React

### Backend (`server/`)
- **Runtime:** Node.js with Express & TypeScript
- **Database:** MongoDB via Mongoose ODM
- **Real-Time Engine:** Socket.io (rooms, cursor broadcast, task events)
- **CRDT Sync Server:** Native WebSocket server (`ws`) handling Yjs binary sync protocol (`y-protocols`)
- **Authentication:** JWT with bcrypt password hashing + ephemeral guest sessions
- **Validation:** Zod schemas on all incoming payloads
- **Security:** Helmet, CORS origin restriction, non-root Docker runner

---

## Repository Structure

```
task-board/
├── client/                     # Frontend Vite SPA
│   ├── src/
│   │   ├── components/         # Modular React components
│   │   │   ├── auth/           # Route guards & session gates
│   │   │   ├── editor/         # TipTap Yjs collaborative editor
│   │   │   ├── kanban/         # Columns, task cards, card modal, activity feed
│   │   │   ├── layout/         # Navbar, collapsible workspace sidebar
│   │   │   └── presence/       # Online avatars & live multiplayer cursors
│   │   ├── lib/                # Axios instance & Socket.io client setup
│   │   ├── pages/              # Route views (Home, Login, Register, Dashboard, Board)
│   │   ├── store/              # Zustand state stores (Auth, Board, App, Socket)
│   │   └── types/              # Domain TypeScript interfaces
│   ├── Dockerfile              # Multi-stage production container with Nginx
│   └── nginx.conf              # SPA routing fallback & caching configuration
│
├── server/                     # Backend API & WebSocket Engine
│   ├── src/
│   │   ├── config/             # Database connection & environment parsing
│   │   ├── controllers/        # REST route handlers
│   │   ├── middlewares/        # Authentication, error handler, 404 handler
│   │   ├── models/             # Mongoose schemas (User, Board, Card, Activity)
│   │   ├── routes/             # Express routers
│   │   ├── socket/             # Socket.io events & Yjs CRDT WebSocket server
│   │   ├── utils/              # Guest profile generator & JWT utilities
│   │   └── validators/         # Zod input validation schemas
│   └── Dockerfile              # Multi-stage Alpine container
│
├── docker-compose.yml          # Container orchestration (MongoDB, Server, Client)
├── .env.example                # Root environment template
└── package.json                # Workspace script runner
```

---

## Getting Started

### Prerequisites
- **Node.js:** v20.x or higher (v22 recommended)
- **npm:** v10.x or higher
- **MongoDB:** v7.x running locally on port `27017` (or Docker)

### 1. Environment Configuration

Copy the example environment files or configure as needed:

```bash
# Server configuration (server/.env)
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/task-board
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
```

### 2. Install Dependencies

Install all dependencies across both client and server packages:

```bash
npm run install:all
```

### 3. Run in Development Mode

Run the backend and frontend development servers concurrently:

```bash
# Terminal 1: Backend Server (runs on http://localhost:5000)
npm run dev:server

# Terminal 2: Frontend Client (runs on http://localhost:5173)
npm run dev:client
```

Visit `http://localhost:5173` in your browser.

---

## Cloud Deployment (Vercel & Persistent Backend)

Because TaskFlow leverages **stateful WebSockets (Socket.io room presence)** and **Yjs CRDT binary WebSockets (`/yjs`)**, the industry-standard architecture separates the static frontend from the stateful real-time backend:

1. **Frontend Client:** Deployed to **Vercel** (Global Edge CDN, automatic SSL, SPA rewrites).
2. **Backend Server:** Deployed to **Render**, **Railway**, **Fly.io**, or any standard VPS (Persistent Node.js environment supporting long-lived WebSocket connections).
3. **Database:** Hosted on **MongoDB Atlas** (Free tier M0 cluster).

### Step 1: Set up Free MongoDB Atlas
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Network Access**, add `0.0.0.0/0` (allow access from cloud providers).
3. Copy your connection string: `mongodb+srv://<user>:<password>@cluster0.mongodb.net/task-board?retryWrites=true&w=majority`.

### Step 2: Deploy Backend (e.g., Render / Railway)
1. Link your GitHub repository to [Render.com](https://render.com) as a **Web Service**.
2. Settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
3. Set Environment Variables:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `MONGODB_URI=<Your MongoDB Atlas Connection String>`
   - `JWT_SECRET=<A secure random secret>`
   - `CLIENT_URL=https://<your-app>.vercel.app`
4. Copy your backend service URL (e.g., `https://taskflow-api.onrender.com`).

### Step 3: Deploy Frontend on Vercel
1. Import your GitHub repository into [Vercel](https://vercel.com).
2. Configure Project:
   - **Framework Preset:** Vite
   - **Root Directory:** `client` (or `./` using the included `vercel.json`)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add Environment Variables in Vercel:
   - `VITE_API_URL=https://<your-backend-url>/api`
   - `VITE_SOCKET_URL=https://<your-backend-url>`
   - `VITE_WS_URL=wss://<your-backend-url>`
4. Click **Deploy**. Vercel will build the frontend and serve it at `https://<your-app>.vercel.app`.

---

## Production Deployment via Docker Compose

The project includes an optimized multi-stage `docker-compose.yml` configuration:

```bash
# Build and start MongoDB, Express API, and Nginx SPA
docker compose up --build -d
```

- **Frontend Client:** `http://localhost` (Port 80)
- **Backend API:** `http://localhost:5000`
- **MongoDB:** `localhost:27017`

To check service health and logs:

```bash
docker compose ps
docker compose logs -f server
```

---

## API & Real-Time Specifications

### REST Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Service and MongoDB connectivity check | No |
| `POST` | `/api/auth/register` | Create user account | No |
| `POST` | `/api/auth/login` | Authenticate with email/password | No |
| `POST` | `/api/auth/guest` | Generate ephemeral guest session | No |
| `GET` | `/api/auth/me` | Retrieve authenticated profile | Yes |
| `GET` | `/api/boards` | List user workspaces & memberships | Yes |
| `POST` | `/api/boards` | Create a new board workspace | Yes |
| `GET` | `/api/boards/:id` | Fetch board, columns, and cards | Optional (Guests allowed) |
| `PATCH` | `/api/boards/:id` | Update board title / settings | Yes |
| `DELETE` | `/api/boards/:id` | Cascade delete board, cards & logs | Yes |
| `POST` | `/api/boards/:id/columns` | Add column | Yes |
| `PATCH` | `/api/boards/:id/columns/:colId` | Update column title/order | Yes |
| `DELETE` | `/api/boards/:id/columns/:colId` | Remove column and associated cards | Yes |
| `POST` | `/api/boards/:id/cards` | Create new card in column | Yes |
| `PATCH` | `/api/cards/:id` | Update card title, tags, priority | Yes |
| `PATCH` | `/api/cards/:id/move` | Update column placement and order | Yes |
| `DELETE` | `/api/cards/:id` | Delete card | Yes |
| `GET` | `/api/cards/:id/activities` | List comments and audit logs | Optional |
| `POST` | `/api/cards/:id/activities` | Post new comment or action | Yes |

### WebSocket Events (Socket.io)

| Event Name | Direction | Payload |
|---|---|---|
| `join-board` | Client -> Server | `{ boardId, user: { userId, name, avatarColor, isGuest } }` |
| `presence-update` | Server -> Client | Array of active collaborators in board |
| `cursor-move` | Client -> Server | `{ boardId, x, y, user }` (throttled at 50ms) |
| `cursor-update` | Server -> Others | Broadcast cursor coordinates |
| `cursor-removed` | Server -> Others | Cleanup cursor on user disconnect |
| `card-move` | Client -> Server | `{ boardId, cardId, sourceColumn, destColumn, newOrder, siblingIds }` |
| `card-moved` | Server -> Others | Optimistic sync of card drag action |
| `card-created` | Client -> Server / Server -> Others | Real-time card instantiation |
| `card-updated` | Client -> Server / Server -> Others | Card metadata changes |
| `card-deleted` | Client -> Server / Server -> Others | Card removal |

---

## Quality & Build Verification

Run the automated checks across both projects:

```bash
# Typecheck and production build
npm run build

# Frontend linting
npm run lint:client
```

### Functional & Manual QA Protocol

For step-by-step end-to-end verification (covering dual-window presence, CRDT collaborative editing, drag-and-drop sync, and guest link onboarding), refer to the [Manual QA Protocol](TESTING_GUIDE.md).

---

## License

All right reserved.


