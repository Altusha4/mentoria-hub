# ⚡ Mentoria Hub - Setup Guide (5 минут)

## 🎯 Быстрый старт

### Шаг 1: Клонируй репозиторий
```bash
git clone https://github.com/Altusha4/mentoria-hub.git
cd mentoria-hub
```

### Шаг 2: Установи зависимости

**Python 3.12+ требуется:**
```bash
# Backend
cd backend
pip install -r requirements.txt
cd ..
```

**Node 16+ требуется:**
```bash
# Frontend
cd frontend
npm install
cd ..
```

### Шаг 3: Запусти серверы (2 терминала)

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

### Шаг 4: Открой в браузере

```
🌐 Frontend:  http://localhost:5173
📡 Backend:   http://localhost:8000/api
📖 API Docs:  http://localhost:8000/docs
🔧 Admin:     http://localhost:8000/admin
```

---

## ✅ Проверь что работает

1. **Home page:** http://localhost:5173
   - Видишь логотип Mentoria?
   - Видишь кнопку "Sign up here"? ✅

2. **Register:** Нажми Sign up
   - Заполни форму с любыми данными
   - Напиши в Bio: "I love coding"
   - Решай капчу (простая математика)
   - Нажми Create Account ✅

3. **После регистрации:**
   - Видишь аватар emoji? (случайный из 12 опций)
   - Видишь "Personalized Recommendations"? ✅
   - Видишь рекомендации с match %? ✅

4. **Test features:**
   - Нажми Opportunities → Видишь 10 карточек? ✅
   - Нажми "Learn More" → Видишь детали? ✅
   - Нажми Profile → Видишь свою bio? ✅
   - Нажми Dark Mode (footer) → Меняется тема? ✅

---

## 📚 Структура каталогов

```
backend/
├── app/
│   ├── main.py              # FastAPI app
│   ├── models.py            # Database models
│   ├── schemas.py           # API schemas
│   ├── auth.py              # JWT + bcrypt
│   ├── ml_service.py        # ML recommendations
│   └── routers/             # API endpoints
├── tests/                   # Pytest tests (15)
├── requirements.txt         # Python deps
└── app.db                  # SQLite database

frontend/
├── src/
│   ├── pages/              # 9 pages (Home, Login, Register, etc)
│   ├── components/         # 8 components (Header, Footer, Cards)
│   ├── utils/api.js        # API client
│   └── App.jsx             # Router
├── package.json
└── tailwind.config.js
```

---

## 🔗 Key API Endpoints

**Authentication:**
- `POST /api/auth/register` - Регистрация с bio
- `POST /api/auth/login` - Вход
- `POST /api/auth/logout` - Выход

**Данные:**
- `GET /api/opportunities/` - 10 возможностей
- `GET /api/courses/` - 3 курса
- `POST /api/recommendations/student/{id}` - Персональные рекомендации

**Тестирование:**
- `GET /api/recommendations/status` - Статус ML (должен быть ready: true)

---

## 🧪 Запусти тесты

```bash
cd backend
python -m pytest tests/ -v

# Результат: 15/15 tests passing ✅
```

---

## 🐛 Troubleshooting

| Проблема | Решение |
|----------|---------|
| Port 8000 занят | `lsof -ti:8000 \| xargs kill -9` |
| Module not found | `pip install -r requirements.txt` |
| npm не работает | `npm install` в frontend директории |
| БД проблемы | `rm backend/app.db` и перезагрузи |
| Видишь ошибки? | Проверь console (F12) и backend логи |

---

## 📖 Дальше

- Прочитай **CONTRIBUTORS_GUIDE.md** для деталей
- Прочитай **CLAUDE.md** для контекста проекта
- Создай feature branch и начни кодить!

---

**Questions?** Ask in GitHub issues или PR comments. 🚀
