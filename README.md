# TaskFlow

A full-stack task management app built with the MERN stack. You can create tasks, set deadlines, track progress, get browser notifications for pending tasks, and switch between light/dark mode. Clean UI, works on mobile too.

---

## Tech Stack

**Frontend**
- React 19 + Vite
- React Router v7
- Axios
- Tailwind CSS
- Bootstrap Icons
- React Hot Toast

**Backend**
- Node.js + Express
- MongoDB Atlas + Mongoose
- JWT Authentication
- bcryptjs (password hashing)
- express-validator

---

## Project Structure

```
TASKFLOW/
├── frontend/                  # React + Vite app
│   ├── public/
│   ├── src/
│   │   ├── api/               # Axios instance + API calls
│   │   ├── components/        # Navbar, TaskModal, ReportModal, NotificationBell
│   │   ├── context/           # AuthContext, ThemeContext
│   │   ├── hooks/             # useTasks, useNotifications
│   │   └── pages/             # Home (landing), Dashboard, LoginForm, RegisterForm
│   ├── .env                   # ← you create this (see below)
│   └── package.json
│
└── backend/                   # Node.js + Express API
    ├── config/                # MongoDB connection
    ├── controllers/           # Auth + Task logic
    ├── middleware/            # JWT auth, error handler
    ├── models/                # User, Task schemas
    ├── routes/                # /api/auth, /api/tasks
    ├── .env                   # ← you create this (see below)
    └── server.js
```

---

## Prerequisites

Make sure you have these installed before starting:

- **Node.js** v18 or higher → https://nodejs.org
- **npm** v9 or higher (comes with Node)
- A **MongoDB Atlas** account (free tier is fine) → https://cloud.mongodb.com

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/ayush0068/TODO.git
cd TASKFLOW
```

---

### 2. Backend setup

```bash
cd backend
npm install
```

Now create the `.env` file inside the `backend/` folder:

```bash
# on Mac/Linux
touch .env

# on Windows (Command Prompt)
type nul > .env
```

Open that `.env` file and paste this in — fill in your own values:

```env
# ─── Server ───────────────────────────────────────────────────────────────────
PORT=5000 OR CHOOSE WHATEVER YOU WANT

# ─── MongoDB Atlas ────────────────────────────────────────────────────────────
# Go to: MongoDB Atlas → Your Cluster → Connect → Drivers
# Copy the connection string and replace <password> with your DB user password
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/taskflow?retryWrites=true&w=majority

# ─── JWT ──────────────────────────────────────────────────────────────────────
# Any long random string works here, just don't leave it as-is in production
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# ─── CORS ─────────────────────────────────────────────────────────────────────
# This should match where your frontend is running
CLIENT_URL=http://localhost:5173
```

> **How to get MONGO_URI:** Log in to MongoDB Atlas → click your cluster → click **Connect** → choose **Drivers** → copy the string shown. Replace `<password>` with the password of your database user (not your Atlas account password).

Start the backend server:

```bash
# development (auto-restarts on file changes)
npm run dev

# or plain node
npm start
```

You should see:
```
 Server running on http://localhost:5000
```

To confirm it's working, open http://localhost:5000 in your browser — it should return a JSON response saying the API is running.

---

### 3. Frontend setup

Open a **new terminal**, then:

```bash
cd frontend
npm install
```

Create the `.env` file inside the `frontend/` folder:

```bash
# on Mac/Linux
touch .env

# on Windows
type nul > .env
```

Paste this into it — **just this one line, no need to change anything if backend is on port 5000:**

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Visit **http://localhost:5173** in your browser.

---

## Running the app

You need **both servers running at the same time** — backend in one terminal, frontend in another.

| Terminal | Command | URL |
|---|---|---|
| Backend | `cd backend && npm run dev` | http://localhost:5000 |
| Frontend | `cd frontend && npm run dev` | http://localhost:5173 |

Register an account on the app, then log in. That's it.

---

## Features

- **Auth** — Register and login with JWT-based sessions
- **Tasks** — Create, edit, delete, mark complete/pending
- **Deadlines** — Optional due date per task with overdue detection
- **Search** — Live client-side search across title and description
- **Filters** — All / Pending / Done views
- **Pagination** — 8 tasks per page
- **Stats** — Total, done, pending, overdue counts + progress bar
- **Grid/List view** — Toggle between card grid and compact list
- **Reports** — Task summary modal with completion stats
- **Browser Notifications** — Get notified when a task is created, and hourly reminders for pending tasks. Deadline shown in notification if set.
- **Dark/Light mode** — Saved across sessions
- **Responsive** — Works on mobile and desktop

---

---

## Deployment

### Frontend on Vercel

1. Push your code to GitHub
2. Go to https://vercel.com → New Project → import your repo
3. Set the **root directory** to `frontend`
4. Add this environment variable in Vercel's dashboard:
   ```
   VITE_API_URL = https://your-backend-url.com/api
   ```
5. Deploy

### Backend on Render (or Railway)

1. Go to https://render.com → New Web Service → connect your repo
2. Set **root directory** to `backend`
3. Set **build command** to `npm install`
4. Set **start command** to `npm start`
5. Add all the environment variables from your `backend/.env` in the dashboard
6. After deploy, copy the URL Render gives you and update `VITE_API_URL` in your Vercel frontend settings

Also update `CLIENT_URL` in your backend env to your Vercel frontend URL so CORS works.

---

## API Endpoints

```
POST   /api/auth/register      Register new user
POST   /api/auth/login         Login, returns JWT token

GET    /api/tasks              Get all tasks (paginated)
POST   /api/tasks              Create new task
PUT    /api/tasks/:id          Update task
DELETE /api/tasks/:id          Delete task
PATCH  /api/tasks/:id/toggle   Toggle pending ↔ completed
```

All `/api/tasks` routes require `Authorization: Bearer <token>` header.

---

## Common Issues

**MongoDB connection fails**
- Double check your `MONGO_URI` — make sure the password doesn't have special characters that need URL-encoding (like `@` should be `%40`)
- In MongoDB Atlas, go to **Network Access** and add your IP (or use `0.0.0.0/0` to allow all IPs during development)

**CORS error in browser**
- Make sure `CLIENT_URL` in backend `.env` exactly matches where your frontend is running (no trailing slash)
- Restart the backend after changing `.env`

**Notifications not showing**
- Make sure you clicked Allow when the browser asked for permission
- On localhost it works fine, but on deployed sites you need HTTPS
- If you accidentally clicked Block, go to browser Settings → Site Settings → Notifications and reset it for your domain

**`nodemon` not found**
```bash
npm install -g nodemon
```

---

## License

MIT