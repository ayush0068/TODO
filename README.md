# TaskFlow — Task Management App

A clean, minimal task management web application built with the MERN stack.

## Tech Stack

**Frontend:** React 18 + Vite, Tailwind CSS, React Router, Axios, React Hot Toast, Lucide React  
**Backend (planned):** Node.js, Express.js, MongoDB, Mongoose, JWT  

---

## Project Structure

```
taskflow/
├── frontend/          # React + Vite app
│   ├── src/
│   │   ├── api/       # Axios API calls
│   │   ├── components/# Reusable UI components
│   │   ├── context/   # Theme & Auth context
│   │   ├── hooks/     # Custom React hooks
│   │   └── pages/     # Login, Register, Dashboard
│   └── ...
└── backend/           # Node.js + Express (scaffold)
```

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm v9 or higher

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/taskflow.git
cd taskflow
```

### 2. Setup Frontend

```bash
cd frontend
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

Edit `.env` if your backend runs on a different port:

```
VITE_API_URL=http://localhost:5000/api
```

### 3. Run the Frontend

```bash
npm run dev
```

Visit **http://localhost:5173** in your browser.

> **Note:** The app works in demo mode without a backend connected. You can register/login and manage tasks — all data is stored locally for preview purposes.

---

## Features

- **Authentication** — Register & Login with form validation
- **Task Management** — Create, edit, delete, and toggle tasks
- **Search** — Filter tasks by keyword in real time
- **Filter** — View All / Pending / Completed tasks
- **Pagination** — Tasks paginated (8 per page)
- **Progress Stats** — Visual progress bar with task counts
- **Theme Toggle** — Light/Dark mode with smooth Telegram-style animation
- **Responsive** — Works on mobile, tablet, and desktop
- **Demo Mode** — Fully functional without a backend (uses local state)

---

## Screenshots

> Add screenshots here after running the app.

---

## Deployment

### Frontend (Vercel)

```bash
cd frontend
npm run build
# Upload the dist/ folder to Vercel or Netlify
```

### Backend (coming soon)

Backend deployment guide will be added after backend implementation.

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first.

## License

MIT



# ------------------------------------- Frontend ------------------------------------------------

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# ------------------------------------- /Frontend ------------------------------------------------


# ------------------------------------- Backend ------------------------------------------------
# Backend

This folder contain the Node.js + Express.js + MongoDB backend.

## Structure

backend/
├── config/
│   └── db.js            # MongoDB connection
├── controllers/
│   ├── authController.js
│   └── taskController.js
├── middleware/
│   └── authMiddleware.js  # JWT verification
├── models/
│   ├── User.js
│   └── Task.js
├── routes/
│   ├── authRoutes.js
│   └── taskRoutes.js
├── .env
├── package.json
└── server.js

## API Endpoints

POST   /api/auth/register
POST   /api/auth/login

GET    /api/tasks
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id
PATCH  /api/tasks/:id/toggle
# ------------------------------------- /Backend ------------------------------------------------