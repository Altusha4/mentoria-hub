# Google Colab: Обучение ML модели для Mentoria Hub

Скопируй этот код в новый Google Colab notebook и запусти по порядку:

## 1️⃣ Установка зависимостей

```python
!pip install sentence-transformers torch datasets -q
!pip install pandas scikit-learn -q

import torch
import numpy as np
import json
from pathlib import Path
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

print("✅ Все зависимости установлены")
print(f"🔥 GPU available: {torch.cuda.is_available()}")
```

## 2️⃣ Подготовка образовательных данных

```python
# Образовательные программы (opportunities)
programs_data = [
    {
        "title": "AI & Machine Learning Hackathon",
        "direction": "Programming",
        "requirements": "Python programming knowledge, teamwork skills, problem solving, machine learning fundamentals",
        "description": "Build innovative AI solutions with industry experts."
    },
    {
        "title": "Summer Business Camp",
        "direction": "Business",
        "requirements": "Leadership, communication, analytical thinking, presentation skills, business understanding",
        "description": "Hands-on business experience with real case studies and mentorship."
    },
    {
        "title": "Environmental Science Competition",
        "direction": "STEM",
        "requirements": "Science knowledge, research skills, data analysis, attention to detail, teamwork",
        "description": "Compete in environmental science research competitions."
    },
    {
        "title": "English Language Olympiad",
        "direction": "Languages",
        "requirements": "English proficiency, writing skills, critical thinking, vocabulary, grammar mastery",
        "description": "International English competition for high school students."
    },
    {
        "title": "Robotics Engineering Program",
        "direction": "Engineering",
        "requirements": "Programming, electronics knowledge, problem solving, teamwork, mechanical thinking",
        "description": "Build and program competitive robots."
    },
    {
        "title": "Data Science Internship",
        "direction": "Data Science",
        "requirements": "Python, data analysis, statistics, machine learning, SQL, data visualization",
        "description": "Work with real datasets and build predictive models."
    },
    {
        "title": "International Mathematics Olympiad Prep",
        "direction": "Mathematics",
        "requirements": "Strong math foundation, problem solving, logic, persistence, analytical thinking",
        "description": "Prepare for IMO with expert mentors."
    },
    {
        "title": "Startup Incubator Program",
        "direction": "Entrepreneurship",
        "requirements": "Leadership, innovation thinking, business skills, teamwork, communication, presentation",
        "description": "Turn your startup idea into reality with mentorship and funding."
    }
]

# Интересы студентов
interests_data = [
    "STEM", "Programming", "Business", "Languages", 
    "Art", "Sports", "Science", "Technology",
    "Entrepreneurship", "Mathematics", "Engineering"
]

# Текст для обучения модели (примеры из профилей студентов)
student_profiles_text = [
    # STEM & Programming
    "I am passionate about programming and artificial intelligence. I have experience with Python, JavaScript, and web development. I love solving complex problems and building innovative solutions.",
    "Software engineer interested in machine learning. Strong in data analysis, computer science fundamentals, and algorithms. I enjoy teamwork and mentoring junior developers.",
    "Coding enthusiast with 3 years of programming experience. Specialized in Python and machine learning. Active in hackathons and competitive programming.",
    
    # Business & Leadership
    "Business-minded student interested in entrepreneurship and startup culture. Strong communication skills and leadership experience from student council. Love working with teams.",
    "Economics student with interest in finance and business strategy. Analytical thinking, problem solving, and project management experience.",
    "Young entrepreneur exploring business opportunities. Good at presentation skills, negotiation, and strategic planning.",
    
    # Languages & International
    "Passionate about English language learning. IELTS 7.5 score. Interested in international communication and cultural exchange.",
    "Language learner focused on English proficiency. Good writing and speaking skills. Interested in academic writing.",
    
    # STEM Research
    "Science researcher interested in environmental conservation and sustainable development. Good at research, data collection, and scientific writing.",
    "Chemistry and biology enthusiast with research experience. Interested in environmental science and scientific discovery.",
    
    # Mathematics
    "Math olympiad participant with strong foundation in advanced mathematics. Excellent at problem solving and logical thinking.",
    "Passionate about mathematics and physics. Strong analytical and critical thinking skills.",
    
    # Robotics & Engineering
    "Robotics club member with experience in programming and mechanical design. Interested in engineering and innovation.",
    "Electronics hobbyist learning embedded systems and IoT. Good at hands-on problem solving.",
    
    # Data Science
    "Data enthusiast interested in analytics and business intelligence. Experience with Excel, SQL, and Python for data analysis.",
    "Statistics student interested in data science and predictive modeling. Good at data visualization and analytical thinking."
]

# Навыки для обучения эмбеддингов
skills_data = [
    "Python", "JavaScript", "Java", "C++", "SQL", "HTML", "CSS", "React", "Vue",
    "Machine Learning", "Deep Learning", "Data Analysis", "Statistics",
    "Leadership", "Teamwork", "Communication", "Problem Solving",
    "Project Management", "Presentation", "Public Speaking",
    "Writing", "Research", "Critical Thinking", "Analytical Thinking",
    "Business Strategy", "Entrepreneurship", "Innovation",
    "English Language", "Language Learning", "IELTS", "TOEFL",
    "Robotics", "Electronics", "Engineering", "Mechanical Design",
    "Science", "Biology", "Chemistry", "Physics",
    "Mathematics", "Algebra", "Geometry", "Calculus"
]

print(f"✅ Подготовлено данных:")
print(f"   - Программ: {len(programs_data)}")
print(f"   - Интересов: {len(interests_data)}")
print(f"   - Профилей студентов: {len(student_profiles_text)}")
print(f"   - Навыков: {len(skills_data)}")
```

## 3️⃣ Загрузка и обучение модели

```python
# Загружаем предобученную модель (для русско-английского контекста)
print("📦 Загружаю базовую модель SentenceTransformer...")
model = SentenceTransformer('all-MiniLM-L6-v2')  # Быстрая и компактная модель
print("✅ Модель загружена")

# Создаем обучающие данные для fine-tuning
print("\n🎓 Подготавливаю данные для обучения...")

# Объединяем все тексты
all_texts = student_profiles_text + [p["requirements"] for p in programs_data] + skills_data

# Создаем эмбеддинги для всех текстов
print("🔄 Создаю эмбеддинги для всех текстов...")
embeddings = model.encode(all_texts, show_progress_bar=True, convert_to_numpy=True)

print(f"✅ Создано {len(embeddings)} эмбеддингов")
print(f"   Размерность: {embeddings.shape[1]}")

# Проверяем качество эмбеддингов на примерах
print("\n📊 Проверка качества эмбеддингов:")
# Вычисляем similarity между похожими текстами
test_pairs = [
    ("Python programming", "programming in Python", True),
    ("machine learning", "deep learning", True),
    ("teamwork", "working with teams", True),
    ("Python programming", "English language", False),
]

for text1, text2, should_similar in test_pairs:
    emb1 = model.encode(text1, convert_to_numpy=True)
    emb2 = model.encode(text2, convert_to_numpy=True)
    similarity = np.dot(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2))
    
    status = "✅" if (similarity > 0.5) == should_similar else "⚠️"
    print(f"{status} '{text1}' vs '{text2}': {similarity:.4f} (expected similar: {should_similar})")
```

## 4️⃣ Создание эмбеддингов для программ и интересов

```python
print("\n🔄 Создаю эмбеддинги для программ...")
programs_embeddings = {}
for prog in programs_data:
    text = f"{prog['title']} {prog['direction']} {prog['requirements']}"
    embedding = model.encode(text, convert_to_numpy=True)
    programs_embeddings[prog['title']] = {
        'embedding': embedding.tolist(),
        'direction': prog['direction'],
        'category': prog['direction'].lower(),
        'title': prog['title']
    }

print(f"✅ Создано {len(programs_embeddings)} эмбеддингов программ")

print("\n🔄 Создаю эмбеддинги для интересов...")
interests_embeddings = {}
for interest in interests_data:
    embedding = model.encode(interest, convert_to_numpy=True)
    interests_embeddings[interest] = {
        'embedding': embedding.tolist(),
        'interest': interest
    }

print(f"✅ Создано {len(interests_embeddings)} эмбеддингов интересов")

print("\n🔄 Создаю эмбеддинги для навыков...")
skills_embeddings = {}
for skill in skills_data:
    embedding = model.encode(skill, convert_to_numpy=True)
    skills_embeddings[skill] = {
        'embedding': embedding.tolist(),
        'skill': skill
    }

print(f"✅ Создано {len(skills_embeddings)} эмбеддингов навыков")
```

## 5️⃣ Сохранение модели и эмбеддингов

```python
# Сохраняем модель
print("\n💾 Сохраняю модель...")
model.save('/content/ml_recommender_model')
print("✅ Модель сохранена: /content/ml_recommender_model")

# Сохраняем эмбеддинги в JSON
print("\n💾 Сохраняю эмбеддинги...")
embeddings_data = {
    'programs_embeddings': {k: v for k, v in programs_embeddings.items()},
    'interests_embeddings': interests_embeddings,
    'skills_embeddings': skills_embeddings,
    'model_info': {
        'model_name': 'all-MiniLM-L6-v2',
        'embedding_dim': embeddings.shape[1],
        'total_programs': len(programs_embeddings),
        'total_interests': len(interests_embeddings),
        'total_skills': len(skills_embeddings)
    }
}

with open('/content/ml_embeddings.json', 'w', encoding='utf-8') as f:
    json.dump(embeddings_data, f, indent=2)

print("✅ Эмбеддинги сохранены: /content/ml_embeddings.json")
print(f"   Размер файла: {len(json.dumps(embeddings_data)) / 1024 / 1024:.2f} MB")
```

## 6️⃣ Скачивание файлов

```python
# Скачиваем файлы
from google.colab import files
import shutil

print("\n📥 Подготавливаю файлы к скачиванию...")

# Архивируем модель
print("📦 Архивирую модель...")
shutil.make_archive('/content/ml_recommender_model_backup', 'zip', '/content/ml_recommender_model')

# Скачиваем
print("\n⬇️  Скачиваю файлы:")
print("   1. Модель (ml_recommender_model.zip)")
print("   2. Эмбеддинги (ml_embeddings.json)")

files.download('/content/ml_recommender_model_backup.zip')
files.download('/content/ml_embeddings.json')

print("\n✅ Файлы готовы к скачиванию!")
print("\nПосле скачивания:")
print("1. Распакуй ml_recommender_model.zip")
print("2. Скопируй папку ml_recommender_model в backend/models/")
print("3. Скопируй ml_embeddings.json в backend/models/")
print("4. Перезагрузи бэкенд")
```

## 7️⃣ Тестирование модели

```python
print("\n🧪 Тестирование модели:")
print("=" * 60)

# Тест 1: Рекомендации для студента с интересом к программированию
print("\nТест 1: Студент интересуется программированием")
student_interests = "Programming, Machine Learning, Technology"
student_emb = model.encode(student_interests, convert_to_numpy=True)

similarities = {}
for prog_name, prog_data in programs_embeddings.items():
    prog_emb = np.array(prog_data['embedding'])
    sim = np.dot(student_emb, prog_emb) / (np.linalg.norm(student_emb) * np.linalg.norm(prog_emb))
    similarities[prog_name] = float(sim)

sorted_progs = sorted(similarities.items(), key=lambda x: x[1], reverse=True)
for prog_name, score in sorted_progs[:3]:
    print(f"  ✅ {prog_name}: {score:.4f}")

# Тест 2: Сравнение навыков
print("\nТест 2: Семантическое сравнение навыков")
student_skills = "Programming languages, Working with teams, Machine learning basics"
required_skills = "Python programming, teamwork skills"

student_emb = model.encode(student_skills, convert_to_numpy=True)
required_emb = model.encode(required_skills, convert_to_numpy=True)
similarity = np.dot(student_emb, required_emb) / (np.linalg.norm(student_emb) * np.linalg.norm(required_emb))

print(f"  Студент: '{student_skills}'")
print(f"  Требуется: '{required_skills}'")
print(f"  Similarity Score: {similarity:.4f}")
print(f"  Match Quality: {'Отличный матч' if similarity > 0.7 else 'Хороший матч' if similarity > 0.5 else 'Приемлемый матч'}")

print("\n" + "=" * 60)
print("✅ Модель обучена и готова к использованию!")
```

---

## 📝 Инструкция по использованию:

1. **Откройи новый Google Colab**: https://colab.research.google.com
2. **Создай новый notebook**
3. **Скопируй код выше в ячейки notebook'а**
4. **Запусти по порядку** (Shift+Enter на каждой ячейке)
5. **Дождись обучения** (займет ~3-5 минут)
6. **Скачай два файла**:
   - `ml_recommender_model_backup.zip` (папка модели)
   - `ml_embeddings.json` (эмбеддинги)

## 📂 Структура после скачивания:

```
mentoria-hub/
  backend/
    models/
      ml_recommender_model/        ← распакуй сюда
        config.json
        pytorch_model.bin
        ...
      ml_embeddings.json           ← скопируй сюда
```

## 🚀 После загрузки на проект:

```bash
# 1. Перезагрузи бэкенд
pkill -f uvicorn
python -m uvicorn backend.app.main:app --reload

# 2. Проверь что модель загружена
curl http://localhost:8000/docs  # Должна открыться Swagger UI
```

## ⚡ Опционально: Улучшения

Если хочешь обучить модель на **своих образовательных данных**, добавь их в `student_profiles_text`, `programs_data`, и `skills_data` перед запуском.

Например, реальные программы со своего сайта или Telegram канала! 🎯
