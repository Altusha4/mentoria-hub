# 👥 Mentoria Hub - Contributors Guide

**Привет коллаборейторам!** 👋

Это гайд для того чтобы вы могли начать работать над проектом Mentoria Hub.

## 🚀 Quick Start (5 минут)

### 1. Клонируй репозиторий

```bash
git clone https://github.com/Altusha4/mentoria-hub.git
cd mentoria-hub
```

### 2. Установи зависимости

**Backend (Python 3.12+):**
```bash
cd backend
pip install -r requirements.txt
```

**Frontend (Node 16+):**
```bash
cd frontend
npm install
```

### 3. Запусти серверы

**Terminal 1 - Backend:**
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 4. Открой в браузере

```
Frontend: http://localhost:5173
Backend API: http://localhost:8000/api
API Docs: http://localhost:8000/docs
```

---

## 📁 Структура проекта

```
mentoria-hub/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app
│   │   ├── models.py         # SQLAlchemy models (8 моделей)
│   │   ├── schemas.py        # Pydantic schemas
│   │   ├── database.py       # DB config
│   │   ├── auth.py           # JWT + bcrypt
│   │   ├── ml_service.py     # ML recommendations
│   │   └── routers/
│   │       ├── auth.py       # /api/auth endpoints
│   │       ├── students.py   # /api/students endpoints
│   │       ├── opportunities.py
│   │       ├── courses.py
│   │       └── recommendations.py
│   ├── tests/
│   │   ├── test_auth.py      # Auth tests
│   │   └── test_recommendations.py
│   ├── models/               # ML embeddings
│   ├── requirements.txt      # Python deps
│   └── app.db               # SQLite database
│
├── frontend/
│   ├── src/
│   │   ├── pages/           # 9 pages
│   │   │   ├── Home.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Opportunities.jsx
│   │   │   ├── OpportunityDetail.jsx (NEW!)
│   │   │   ├── Courses.jsx
│   │   │   ├── Course.jsx
│   │   │   ├── Lesson.jsx
│   │   │   ├── ProfileNew.jsx
│   │   │   ├── Updates.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   └── Search.jsx
│   │   ├── components/      # 8 components
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── OpportunityCard.jsx
│   │   │   ├── CourseCard.jsx
│   │   │   ├── SmartRecommendations.jsx
│   │   │   ├── MathCaptcha.jsx
│   │   │   ├── TelegramUpdates.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── utils/
│   │   │   └── api.js       # API client
│   │   ├── App.jsx          # Router
│   │   └── main.jsx         # Entry point
│   ├── package.json
│   └── tailwind.config.js
│
├── CONTRIBUTORS_GUIDE.md     # Этот файл
├── CLAUDE.md                 # Project context
└── README.md
```

---

## 🎯 Current Features

✅ **Authentication**
- JWT tokens (30 min access, 7 days refresh)
- bcrypt password hashing
- Math captcha
- httpOnly cookies

✅ **User Profiles**
- Bio field for personalization
- Avatar emoji system (12 options)
- Interests & goals tracking
- Dark mode

✅ **Opportunities Catalog**
- 10+ opportunities with deadlines
- Category, direction, format filters
- Save/unsave functionality
- Full detail pages

✅ **Courses & Learning**
- 3 courses with 8+ lessons
- Video players
- Mini quizzes
- Progress tracking

✅ **ML Recommendations**
- 96 Telegram posts integrated
- Personalized by interests + bio
- Smart matching algorithm (v2.1)
- Real-time recommendations

---

## 💻 Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

Backend: Edit files in `backend/app/`
Frontend: Edit files in `frontend/src/`

### 3. Test Locally

**Run backend tests:**
```bash
cd backend
python -m pytest tests/ -v
```

**Test in browser:**
- Frontend: http://localhost:5173
- Try the full user journey
- Check console for errors

### 4. Commit Changes

```bash
git add .
git commit -m "feat: your feature description"
```

### 5. Push to Remote

```bash
git push origin feature/your-feature-name
```

### 6. Create Pull Request

```bash
gh pr create --title "Your PR Title" --body "PR description"
```

---

## 📊 API Endpoints (20+)

### Authentication
- `POST /api/auth/register` - Register with bio
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token

### Students
- `GET /api/students/{id}` - Get profile
- `PUT /api/students/{id}` - Update profile (includes bio)

### Opportunities
- `GET /api/opportunities/` - List all
- `GET /api/opportunities/{id}` - Get details
- `POST /api/opportunities/{id}/save/{student_id}` - Save
- `DELETE /api/opportunities/{id}/unsave/{student_id}` - Unsave

### Courses
- `GET /api/courses/` - List all
- `GET /api/courses/{id}` - Get details
- `POST /api/courses/{id}/enroll/{student_id}` - Enroll
- `GET /api/courses/{student_id}/enrolled` - Get enrolled

### Lessons
- `GET /api/courses/lesson/{id}` - Get lesson
- `POST /api/courses/lesson/{id}/complete/{student_id}` - Mark complete

### Recommendations
- `POST /api/recommendations/get` - Get recommendations
- `GET /api/recommendations/interests` - List interests
- `POST /api/recommendations/student/{id}` - Personalized recs
- `GET /api/recommendations/status` - ML engine status

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
python -m pytest tests/ -v          # Run all tests
python -m pytest tests/test_auth.py -v  # Run auth tests
python -m pytest tests/test_recommendations.py -v  # Run ML tests
```

### Frontend Testing

Test manually in browser:
1. Register → Check avatar appears
2. View Home → Check recommendations load
3. Browse opportunities → Click details
4. Check profile → Edit bio
5. Test dark mode → Click toggle
6. Logout/Login → Check avatar loads

---

## 🔧 Tech Stack

**Backend:**
- Python 3.12
- FastAPI
- SQLAlchemy
- SQLite
- Sentence Transformers (ML)
- bcrypt

**Frontend:**
- React 18
- Vite
- React Router
- Tailwind CSS (CDN)
- Fetch API

**Security:**
- JWT tokens
- bcrypt hashing
- httpOnly cookies
- Math captcha
- CSRF protection

---

## 🐛 Common Issues & Fixes

### Issue: API port already in use

```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Or use different port
python -m uvicorn app.main:app --port 8001
```

### Issue: Module not found

```bash
# Reinstall dependencies
pip install -r requirements.txt
npm install
```

### Issue: Avatar not showing

- Check avatar_emoji is returned from `/api/auth/register`
- Verify SessionStorage saves it: `sessionStorage.getItem('avatarEmoji')`
- Refresh page if stuck

### Issue: Recommendations not loading

- Check ML model is ready: `GET /api/recommendations/status`
- Verify student has interests set
- Check browser console for errors
- Try POST: `/api/recommendations/student/{student_id}`

### Issue: Database issues

```bash
# Delete old database and restart
rm backend/app.db
python -m uvicorn app.main:app --reload
```

---

## 📝 Key Features You Can Work On

### Backend Tasks
- [ ] Add email verification
- [ ] Implement password reset
- [ ] Add rate limiting
- [ ] Create admin endpoints
- [ ] Add logging
- [ ] Improve ML algorithm

### Frontend Tasks
- [ ] Add notifications
- [ ] Improve mobile UI
- [ ] Add animations
- [ ] Create dashboard
- [ ] Add filters/search
- [ ] Implement sharing

### Testing Tasks
- [ ] Add more backend tests
- [ ] Add frontend tests (React Testing Library)
- [ ] Integration tests
- [ ] E2E tests (Cypress)

---

## 🎯 Git Best Practices

### Before starting work
```bash
git pull origin main
git checkout -b feature/descriptive-name
```

### Commit messages format
```
feat: add new feature
fix: fix a bug
docs: update documentation
refactor: refactor code
test: add tests
style: format code
```

### Keep branch updated
```bash
git fetch origin
git rebase origin/main
```

### Push and create PR
```bash
git push origin feature/your-feature
gh pr create --title "Your title"
```

---

## 📞 Communication

**Issues & Bugs:** Create GitHub issue
**Features:** Discuss in PR
**Questions:** Ask in comments

---

## ✨ Project Status

- **Frontend:** 9 pages, 8 components, all routes working
- **Backend:** 20+ API endpoints, 15 tests, ML recommendations
- **Database:** 8 models, 96 posts, mock data
- **Security:** JWT + bcrypt, production-ready
- **Ready for:** Hackathon submission (deadline: 2026-06-18)

---

## 🚀 Next Steps

1. Clone the repo
2. Install dependencies
3. Run both servers
4. Test in browser (register with bio)
5. Find something to work on
6. Create feature branch
7. Make changes
8. Push and create PR

---

**Happy coding! 💻**

Questions? Check CLAUDE.md for project context or ask in PR comments.
