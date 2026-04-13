# NeuralPath — Full-Stack Personalized Learning Path Generator

AMOLED black + neon green theme · DP + Greedy algorithms · JWT auth · MongoDB · Next.js + Express

---

## Project Structure

```
neuralpath/
├── frontend/          # Next.js (React) — deploy to Vercel
│   ├── pages/         # index, login, signup, onboard, dashboard, path, analytics, settings
│   ├── components/    # Navbar, Layout, TopicDetail, QuizModal, ProtectedRoute, Toast
│   ├── context/       # AuthContext, PathContext (global state)
│   ├── utils/         # api.js (axios + all API helpers)
│   └── styles/        # globals.css (AMOLED theme, shared classes)
│
└── backend/           # Node.js + Express — deploy to Render/Railway
    ├── server.js
    ├── models/        # User.js (Mongoose)
    ├── controllers/   # auth, user, path, progress, quiz
    ├── routes/        # auth, user, path, progress, quiz
    ├── services/      # algorithmService.js (DAG, DP, Greedy, Ebbinghaus)
    └── middleware/    # auth.js (JWT verification)
```

---

## Quick Start (Local)

### 1. Backend

```bash
cd backend
npm install

# Copy and fill in your values
cp .env.example .env
# Set MONGO_URI and JWT_SECRET in .env

npm run dev          # runs on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install

# Copy and set API URL
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:5000/api

npm run dev          # runs on http://localhost:3000
```

Visit http://localhost:3000 — sign up, complete onboarding, and your path is generated.

---

## Environment Variables

### Backend `.env`
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/neuralpath
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## Deployment

### Backend → Render (free tier)

1. Push `backend/` to a GitHub repo (or a subfolder)
2. Go to https://render.com → **New Web Service**
3. Connect your repo → set **Root Directory** to `backend`
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add environment variables: `MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL`
7. Deploy → copy your Render URL (e.g. `https://neuralpath-api.onrender.com`)

### Frontend → Vercel

1. Push `frontend/` to a GitHub repo
2. Go to https://vercel.com → **Add New Project** → import repo
3. Set **Root Directory** to `frontend`
4. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://neuralpath-api.onrender.com/api`
5. Click **Deploy** → live at `https://neuralpath.vercel.app`

### MongoDB Atlas (free)

1. https://cloud.mongodb.com → Create free M0 cluster
2. Database Access → Add user with password
3. Network Access → Add IP `0.0.0.0/0` (allow all)
4. Connect → Drivers → copy connection string
5. Paste into `MONGO_URI` in your backend env

---

## API Reference

| Method | Route                         | Auth | Description                    |
|--------|-------------------------------|------|--------------------------------|
| POST   | /api/auth/signup              | No   | Create account                 |
| POST   | /api/auth/login               | No   | Login → JWT token              |
| GET    | /api/user/profile             | Yes  | Get full user object           |
| PUT    | /api/user/update              | Yes  | Update preferences             |
| POST   | /api/path/generate            | Yes  | Run DP+Greedy, return path     |
| GET    | /api/path/topics              | Yes  | Full knowledge graph           |
| GET    | /api/path/topic/:id           | Yes  | Single topic + resources       |
| POST   | /api/progress/complete-topic  | Yes  | Mark topic done                |
| POST   | /api/progress/log-hours       | Yes  | Log study hours                |
| GET    | /api/progress/revisions       | Yes  | Spaced revision schedule       |
| GET    | /api/quiz/questions/:topicId  | Yes  | Get quiz questions             |
| POST   | /api/quiz/submit              | Yes  | Submit answers → score + adapt |

---

## Algorithm Details

All in `backend/services/algorithmService.js`:

- **topoSort()** — Kahn's BFS on the prerequisite DAG
- **dpPath(completed, mode, level)** — DP scoring: `score = w_t×time_eff + w_i×importance + w_d×difficulty_match`
  - Fast mode:     w_t=0.6, w_i=0.3, w_d=0.1
  - Balanced mode: w_t=0.3, w_i=0.4, w_d=0.3
  - Deep mode:     w_t=0.1, w_i=0.5, w_d=0.4
- **greedyNext(path, scores)** — boosts weak-area topics by ×1.25
- **retention(daysAgo, score)** — Ebbinghaus: `e^(-0.1×days) × score`
- **rankResources(topicName)** — Greedy: sorts by `rating × relevance`
- **buildRevisionSchedule()** — assigns daysLeft based on quiz score
- **calcBurnout(weeklyHours, scores)** — detects overload from hours + score drop
- **explainDecision()** — returns human-readable AI explanation

---

## Features

- ✅ JWT authentication (signup / login / protected routes)
- ✅ MongoDB user persistence (progress, scores, streak, badges)
- ✅ DP + Greedy path generation via backend API
- ✅ Adaptive quiz system (auto-complete / re-insert / revision)
- ✅ Spaced repetition (Ebbinghaus forgetting curve)
- ✅ Burnout detection
- ✅ Peer benchmarking
- ✅ Skill gap analysis
- ✅ Explainable AI decisions
- ✅ 3 learning modes (Fast / Balanced / Deep)
- ✅ Onboarding wizard
- ✅ Full AMOLED black + neon green theme preserved
- ✅ Responsive design
