# 📥 Установка ML Модели - Быстрый Гайд

## 🎯 Что нужно сделать

У тебя есть **3 варианта** загрузки модели. Выбери один!

---

## ✅ ВАРИАНТ 1: Google Colab (⭐ РЕКОМЕНДУЕТСЯ)

Самый быстрый и простой способ! **Займет 5-10 минут.**

### Шаг 1: Откройи Google Colab
```
https://colab.research.google.com
```

### Шаг 2: Создай новый notebook
- Нажми "New notebook"

### Шаг 3: Скопируй и запусти скрипт обучения
Скопируй содержимое файла **`train_ml_model_v3.py`** в одну ячейку Colab

Нажми **Shift+Enter** - скрипт начнет обучение

### Шаг 4: Ждешь ~7 минут
Должен вывести что-то типа:
```
✅ ОБУЧЕНИЕ ЗАВЕРШЕНО УСПЕШНО!
📊 СТАТИСТИКА ДАТАСЕТА:
   📚 Программ: 1470
   💜 Интересов: 103
   👥 Профилей студентов: 221
   🎯 Навыков: 292
```

### Шаг 5: Скачиваешь файлы
В новой ячейке скопируй содержимое **`colab_download_script.py`**

Нажми **Shift+Enter**

Появятся 2 окна для скачивания:
- ✅ `ml_recommender_model.zip`
- ✅ `ml_embeddings.json`

Скачай оба файла!

### Шаг 6: Устанавливаешь на компьютер
```bash
# Распакуй архив
unzip ml_recommender_model.zip

# Скопируй в проект
cp -r ml_recommender_model ~/IdeaProjects/mentoria-hub/backend/models/
cp ml_embeddings.json ~/IdeaProjects/mentoria-hub/backend/models/
```

### Шаг 7: Перезагрузи бэкенд
```bash
cd ~/IdeaProjects/mentoria-hub
pkill -f uvicorn
python -m uvicorn backend.app.main:app --reload
```

### Шаг 8: Проверь установку
```bash
python download_and_setup_models.py
```

Должно вывести:
```
✅ Модель найдена
✅ Эмбеддинги найдены
✅ Качество данных отлично!
```

### ✅ ГОТОВО!
```bash
http://localhost:5173     # Фронтенд
http://localhost:8000/docs # Бэкенд API
```

---

## 🔧 ВАРИАНТ 2: Локально (если есть GPU)

Если на твоем компьютере есть NVIDIA GPU - можешь обучить локально.

### Шаг 1: Установи зависимости
```bash
pip install sentence-transformers torch numpy -q
```

### Шаг 2: Запусти обучение
```bash
cd ~/IdeaProjects/mentoria-hub
python train_ml_model_v3.py
```

**Займет 5-10 минут** в зависимости от GPU

### Шаг 3: Проверь что все установилось
```bash
python download_and_setup_models.py
```

### ✅ ГОТОВО!
Файлы автоматически сохранятся в:
- `backend/models/ml_recommender_model/`
- `backend/models/ml_embeddings.json`

---

## 🌐 ВАРИАНТ 3: Загрузить с Google Drive

Если ты уже загрузил файлы на Google Drive.

### Шаг 1: Скопируй file_id из ссылки
```
https://drive.google.com/file/d/YOUR_FILE_ID/view?usp=sharing
                               ^^^^^^^^^^
                            Копируй это!
```

### Шаг 2: Запусти скрипт загрузки
```bash
cd ~/IdeaProjects/mentoria-hub
python download_and_setup_models.py --drive-id YOUR_FILE_ID
```

### ✅ ГОТОВО!

---

## 🔍 Проверка Установки

Убедись что файлы на месте:
```bash
ls -la backend/models/
# Должны быть:
# - ml_recommender_model/ (папка с моделью)
# - ml_embeddings.json (файл ~15 MB)
```

Запусти проверку:
```bash
python download_and_setup_models.py
```

Должно вывести:
```
✅ Модель найдена
✅ Эмбеддинги найдены
✅ Качество данных отлично!
```

---

## 🚀 После Установки

1. **Перезагрузи бэкенд:**
```bash
pkill -f uvicorn
python -m uvicorn backend.app.main:app --reload
```

2. **Проверь что модель загружена:**
```bash
curl http://localhost:8000/docs
```

3. **Откройи приложение:**
```bash
http://localhost:5173
```

4. **Тестируй "Check My Success Chance":**
- Зайди в профиль студента
- Откройи любую программу
- Нажми кнопку "✨ Check My Success Chance"
- Должна появиться модальное окно с анализом!

---

## ❓ Часто Задаваемые Вопросы

### Q: Какой вариант выбрать?
**A:** Если сомневаешься - выбери **ВАРИАНТ 1 (Google Colab)**. Это самый простой способ.

### Q: Где скачиваются файлы в Google Colab?
**A:** В папку "Загрузки" на твоем компьютере.

### Q: Сколько времени займет?
**A:** 
- Google Colab: 5-10 минут обучения + скачивание
- Локально: 5-10 минут (с GPU), 30+ минут (без GPU)

### Q: Какой размер файлов?
**A:**
- Модель: ~90 MB (в архиве ~30 MB)
- Эмбеддинги: ~15 MB

### Q: Что если обучение прерывается?
**A:** В Google Colab просто запусти скрипт снова. Colab сохраняет прогресс.

### Q: Можно ли использовать готовую модель?
**A:** Пока не рекомендуется - нужна своя обученная модель для твоего датасета.

---

## 📁 Структура после установки

```
mentoria-hub/
├── backend/
│   └── models/
│       ├── ml_recommender_model/        ← Папка с моделью
│       │   ├── config.json
│       │   ├── pytorch_model.bin
│       │   ├── sentence_bert_config.json
│       │   └── ...
│       └── ml_embeddings.json            ← Файл с эмбеддингами (15 MB)
├── train_ml_model_v3.py
├── colab_download_script.py
├── download_and_setup_models.py
└── SETUP_ML_MODELS.md                    ← Этот файл
```

---

## 🎉 Успехов!

Если все работает - поздравляем! 🚀

ML модель установлена и готова к использованию.

Теперь можешь:
- ✅ Проверять шансы студентов на программы
- ✅ Получать персональные рекомендации
- ✅ Анализировать профили со специальностями

**Happy ML! 🤖**
