# Mentoria Hub — контекст проекта (хакатон)

> Передача контекста из веб-чата Claude в Claude Code (терминал).
> Claude Code автоматически читает `CLAUDE.md` из корня проекта. Прочитай его и продолжай работу отсюда.
> Останавливайся после каждого крупного шага и показывай результат, чтобы можно было проверить.

## ТЕКУЩИЙ СТАТУС (мы вот здесь)

### ✅ ФАЗА 1 + ФАЗА 2 + ФАЗА 3 ЗАВЕРШЕНЫ!

#### **Фаза 1: Бэкенд (FastAPI)**
- ✅ FastAPI + uvicorn, SQLAlchemy, sqladmin установлены
- ✅ SQLite БД + ORM-модели (8 моделей)
- ✅ Pydantic-схемы для API
- ✅ API-роуты с фильтрами (opportunities, courses)
- ✅ sqladmin админ-панель (`/admin`)
- ✅ Mock-данные: 10 возможностей, 3 курса, 8+ уроков
- ✅ CORS + Swagger UI (`/docs`)

#### **Фаза 2: Фронтенд (React + Vite)**
- ✅ React + Vite + Tailwind CSS (CDN) установлены
- ✅ React Router с 6 страницами:
  - Home (герой, фичи, CTA)
  - Opportunities (каталог с фильтрами, сохранение)
  - Courses (сетка курсов, прогресс)
  - Course (детали курса, список уроков)
  - Lesson (видео, контент, мини-тест, завершение)
  - Profile (мои курсы, сохранённое, прогресс)
- ✅ Компоненты: Header, Footer, OpportunityCard, CourseCard
- ✅ API утилиты для всех эндпоинтов
- ✅ Mentoria логотип интегрирован
- ✅ Tailwind CSS для стиля (адаптивный дизайн)

#### **Фаза 3: Аутентификация & Безопасность & Рекомендации**
- ✅ **JWT Authentication** (Production-Grade)
  - Access Token (30 мин)
  - Refresh Token (7 дней)
  - httpOnly Cookies (защита от XSS)
  - CSRF protection (samesite=lax)

- ✅ **Пароли с bcrypt**
  - Безопасное хеширование паролей
  - Проверка пароля при логине
  - Защита от enumeration атак

- ✅ **Math Captcha**
  - Простая проверка (2 + 3 = ?)
  - Защита от ботов
  - Без внешних API

- ✅ **Аутентификация страницы**
  - `/login` — вход по email + пароль
  - `/register` — регистрация с капчей (4 шага)
  - Защищённые маршруты (redirect на /login)

- ✅ **Рекомендации по интересам**
  - `/api/opportunities/{student_id}/recommended` — возможности
  - `/api/courses/{student_id}/recommended` — курсы
  - Фильтрация по тегам и направлениям
  - Home страница показывает персонализированный контент

- ✅ **API Endpoints**
  - `/api/auth/register` — регистрация с JWT
  - `/api/auth/login` — логин с паролем
  - `/api/auth/logout` — логаут
  - `/api/auth/refresh` — обновление токена

**СТАТУС: ПОЛНОСТЬЮ ГОТОВО К ДЕПЛОЮ** 🚀

## Что строим

**Mentoria Hub** — рабочий MVP EdTech-платформы для хакатона («Working MVP Challenge»).
Платформа, где школьники находят образовательные возможности (олимпиады, стажировки, стипендии, конкурсы) и проходят курсы Mentoria **асинхронно**, без живых занятий.

**Главный принцип:** это НЕ лендинг. Должен ощущаться как первая версия настоящего продукта с реальным пользовательским путём. Mock-данные ок, но путь должен быть живым и интерактивным.

**Целевая аудитория:** ученики 8–11 классов (Казахстан и другие страны), готовящиеся к поступлению, ищущие олимпиады/хакатоны/стажировки/стипендии и доступные курсы.

## Стек (финальный)

- **Backend:** Python 3.12 + **FastAPI** + SQLAlchemy + SQLite
  - JWT аутентификация (production-ready)
  - bcrypt хеширование паролей
  - sqladmin админ-панель (требование F)
  - REST API с фильтрами и рекомендациями
  
- **Frontend:** React 18 + **Vite** + **Tailwind CSS (CDN)**
  - Без сборки — экономит время, быстрые обновления (HMR)
  - React Router v6 для навигации
  - Modern UI/UX (Tailwind компоненты)
  
- **Безопасность:**
  - JWT + httpOnly Cookies (защита от XSS)
  - bcrypt пароли (10 rounds)
  - Math Captcha (защита от ботов)
  - CSRF protection (samesite=lax)
  
- **Данные:** SQLite + mock-данные (seed.py)

- **Деплой:** Render / Railway / Heroku (универсально для Python + React)

## ✅ Обязательные функции MVP (ВСЕ 6 ВЫПОЛНЕНЫ!)

- [x] **A. Главная страница** ✅ — Герой + ценностное предложение + карточки фич + персонализированный контент + рекомендации + приветствие с именем студента.
- [x] **B. Каталог возможностей** ✅ — 10+ карточек, категория/направление/формат/класс фильтры, сохранение в избранное, дедлайн countdown, требования.
- [x] **C. Курсы** ✅ — 3 курса, 8+ уроков, видео-плейсхолдеры, мини-тесты, прогресс-бар (%), завершение уроков.
- [x] **D. Личный кабинет ученика** ✅ — Мои курсы (с прогрессом), сохранённые возможности, прогресс по урокам, информация профиля.
- [x] **E. Система рекомендаций** ✅ — Онбординг на регистрации (интересы, предметы, цели), умная фильтрация по тегам, персонализированная Home.
- [x] **F. Админ-панель** ✅ — sqladmin для всех моделей, CRUD операции, управление без перезагрузки приложения.

## 🎁 Дополнительные реализованные функции

- ✅ **JWT Authentication** — Production-grade безопасность
- ✅ **bcrypt Пароли** — Криптографически безопасное хеширование
- ✅ **Math Captcha** — Защита от ботов (без внешних API)
- ✅ **httpOnly Cookies** — CSRF protection, защита от XSS
- ✅ **Responsive Design** — Адаптивность на мобильные устройства
- ✅ **Mock-данные** — Реалистичные данные для демонстрации

## Эскиз моделей данных (Django)

- **StudentProfile** (OneToOne к User): grade (8–11), interests (теги), subjects, goals
- **Opportunity**: title, category, direction (Business/STEM/Finance/...), format, deadline, description, requirements, apply_url, grade_level, tags
- **SavedOpportunity**: user → opportunity (избранное)
- **Course**: title, description, difficulty_level
- **Lesson**: course (FK), title, content, video_url, order
- **Quiz / MiniTask**: привязка к lesson или course, вопросы
- **Enrollment**: user → course, progress (%)
- **LessonProgress**: user → lesson, completed (bool)

## Пользовательский путь для демо

1. Ученик открывает Mentoria Hub → регистрируется → выбирает интересы (Бизнес, STEM, английский, поступление).
2. Платформа показывает рекомендованные возможности и курсы.
3. Ученик сохраняет хакатон и летнюю программу в избранное.
4. Открывает курс «Английский для академического успеха», проходит первый урок + мини-тест.
5. Личный кабинет обновляет прогресс и показывает ближайшие дедлайны.
6. Админ через админ-панель добавляет новую олимпиаду или курс.

## ✅ ВЫПОЛНЕННЫЙ ПЛАН ПО ФАЗАМ

### ✅ Фаза 1 — Скелет проекта и данные
- ✅ FastAPI + SQLAlchemy + SQLite
- ✅ 8 ORM-моделей (StudentProfile, Opportunity, Course, Lesson, Quiz, Enrollment, etc.)
- ✅ sqladmin админ-панель (требование F)
- ✅ Mock-данные: 10 возможностей + 3 курса + 8+ уроков
- ✅ REST API с фильтрами, Swagger UI (/docs)

### ✅ Фаза 2 — Студенческая часть
- ✅ Home страница с фичами и CTA
- ✅ Каталог возможностей (10+ карточек, 4 типа фильтров, сохранение)
- ✅ Курсы: список → детали → уроки → видео + мини-тест → прогресс
- ✅ Личный кабинет (сохранённое + мои курсы + прогресс)
- ✅ Tailwind CSS (адаптивный дизайн, никакой сборки)

### ✅ Фаза 3 — Аутентификация и рекомендации
- ✅ JWT Authentication (Access + Refresh Tokens)
- ✅ bcrypt пароли (production-ready)
- ✅ Math Captcha (защита от ботов)
- ✅ Login + Register страницы
- ✅ Онбординг с интересами, предметами, целями
- ✅ Система рекомендаций (по тегам): персонализированный контент
- ✅ httpOnly Cookies + CSRF protection

### ⏳ Фаза 4 — Полировка (опционально)
- Улучшения UX/дизайна
- Дополнительные бонусные функции

### ⏳ Фаза 5 — Деплой
- Подготовка к production
- Deployment на Render/Railway/Heroku
- Проверка на боевом сайте

### ⏳ Фаза 6 — Сдача
- Презентация (5–8 слайдов)
- Видео-демо (≤ 4 минуты)
- Тех-объяснение
- Сдача на mentoriaorganization@gmail.com (дедлайн: 00:00 18 июня)

## Дедлайн и формат сдачи

- Подача: **до 00:00 18 июня**. После дедлайна не принимают.
- Видео: максимум **4 минуты**.
- Всё на почту **mentoriaorganization@gmail.com**.

## Критерии оценки (на что оптимизировать)

| Критерий | Вес |
|---|---|
| Функциональность MVP | 25% |
| Понимание проблемы | 20% |
| UX и дизайн | 20% |
| Влияние для Mentoria | 20% |
| Инновации / креативность | 15% |

## 🚀 **Быстрый старт локально**

```bash
# Terminal 1: Backend
cd /path/to/mentoria-hub
python -m uvicorn backend.app.main:app --reload

# Terminal 2: Frontend
cd /path/to/mentoria-hub/frontend
npm run dev
```

- **Backend:** http://localhost:8000
  - API: http://localhost:8000/api
  - Swagger UI: http://localhost:8000/docs
  - Admin Panel: http://localhost:8000/admin

- **Frontend:** http://localhost:5173
  - Login: http://localhost:5173/login
  - Register: http://localhost:5173/register

## 📊 **Статистика проекта**

| Метрика | Значение |
|---------|----------|
| **Коммитов** | 25+ (Фазы 1–3) |
| **Backend файлы** | 10+ (models, routers, auth, etc.) |
| **Frontend файлы** | 12+ (pages, components, utils) |
| **API endpoints** | 20+ (opportunities, courses, auth, students) |
| **ORM модели** | 8 (полная схема EdTech) |
| **React компоненты** | 6+ (Header, Footer, Cards, etc.) |
| **Pages/Routes** | 8 (Home, Login, Register, Opportunities, Courses, Course, Lesson, Profile) |
| **Mock данные** | 10 возможностей + 3 курса + 8+ уроков |
| **Security** | JWT + bcrypt + Captcha + CSRF |

## ✨ **Ключевые особенности**

🔐 **Безопасность Production-Grade:**
- JWT Authentication (30 мин access, 7 дней refresh)
- bcrypt пароли (10 rounds)
- httpOnly Cookies (XSS защита)
- Math Captcha (bot защита)
- CSRF protection

📱 **Современный стек:**
- FastAPI (REST API)
- React 18 + Vite (no build step via CDN)
- SQLAlchemy ORM
- Tailwind CSS

🎯 **Полный user journey:**
1. Регистрация с капчей
2. Онбординг (интересы, предметы)
3. Персонализированные рекомендации
4. Поиск и сохранение возможностей
5. Прохождение курсов с прогрессом
6. Личный кабинет со статистикой

## Правило приоритизации

**ВЫПОЛНЕНО:** все 6 обязательных функций (A–F) + дополнительная безопасность (JWT + bcrypt + Captcha). Рабочий полный путь ✅
