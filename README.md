# Mentoria Hub — EdTech MVP

Платформа для школьников, где они находят образовательные возможности (олимпиады, стажировки, курсы) и проходят асинхронные курсы.

## Быстрый старт

### 1. Установка зависимостей
```bash
pip install -r requirements.txt
```

### 2. Запуск бэкенда (FastAPI)
```bash
python -m uvicorn backend.app.main:app --reload
```
- API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- Админ-панель: http://localhost:8000/admin

### 3. Основные эндпоинты
- `GET /api/opportunities/` — список возможностей (фильтры: category, direction, format, grade_level)
- `GET /api/courses/` — список курсов с уроками
- `GET /api/courses/{id}` — детали курса
- `POST /api/courses/{course_id}/enroll/{student_id}` — записать на курс
- `POST /api/courses/lesson/{lesson_id}/complete/{student_id}` — отметить урок выполненным

## Структура проекта

```
backend/
├── app/
│   ├── main.py          # FastAPI приложение, CORS, sqladmin
│   ├── database.py      # SQLAlchemy + SQLite
│   ├── models.py        # ORM-модели
│   ├── schemas.py       # Pydantic-схемы
│   ├── admin.py         # sqladmin конфигурация
│   ├── seed.py          # Mock-данные
│   └── routers/
│       ├── opportunities.py
│       └── courses.py
frontend/                 # React+Vite (в разработке)
```

## Модели данных

- **StudentProfile** — профиль ученика (класс, интересы, цели)
- **Opportunity** — образовательные возможности (олимпиады, стажировки, конкурсы)
- **SavedOpportunity** — сохранённые возможности (избранное)
- **Course** — курсы
- **Lesson** — уроки в курсе
- **Quiz** — мини-тесты
- **Enrollment** — записи ученика на курсы
- **LessonProgress** — прогресс по урокам

## В разработке

- Фаза 2: фронтенд (главная, каталог, личный кабинет)
- Фаза 3: онбординг и рекомендации
- Фаза 4: полировка UX и бонусы
- Фаза 5: деплой на Render/Railway

## Дедлайн сдачи

До 00:00 18 июня на почту mentoriaorganization@gmail.com
