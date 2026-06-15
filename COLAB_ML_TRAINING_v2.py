"""
Google Colab Notebook для обучения модели рекомендаций (v2)
Копируй этот код в Google Colab: https://colab.research.google.com

ШАГ 1: Загрузи этот файл в Colab (или используй GitHub)
ШАГ 2: Запусти все ячейки
ШАГ 3: Скачай модель и embeddings файлы
"""

# ============ ЯЧЕЙКА 1: Установка зависимостей ============
import subprocess
import sys

print("📦 Устанавливаю зависимости...")
subprocess.check_call([sys.executable, "-m", "pip", "install", "-q",
    "sentence-transformers", "torch", "numpy", "scikit-learn", "pandas"])
print("✅ Зависимости установлены!")

# ============ ЯЧЕЙКА 2: Загрузка данных ============
import json
import numpy as np
from sentence_transformers import SentenceTransformer, util
import torch

print("📥 Загружаю данные...")

# ВАРИАНТ A: Если загружаешь posts_for_ml.json в Colab
try:
    with open('posts_for_ml.json', 'r', encoding='utf-8') as f:
        posts_data = json.load(f)
    print(f"✅ Загружено {len(posts_data['posts'])} постов из файла!")
except FileNotFoundError:
    # ВАРИАНТ B: Используем sample данные (для теста)
    print("⚠️  posts_for_ml.json не найден, использую sample данные...")
    posts_data = {
        "posts": [
            {
                "id": 1,
                "title": "Ищем мобилографа для летнего лагеря Shenber",
                "content": "Команда Shenber ищет опытного мобилографа для летнего лагеря на базе NIS IB. Даты: 29 июня - 5 июля. Рабочее время: 09:00-13:00. Требуется присутствие все дни.",
                "category": "hiring",
                "summary": "Вакансия мобилографа в летнем лагере Shenber на базе NIS IB"
            },
            {
                "id": 2,
                "title": "FEMUN 2026 REGISTRATION IS NOW OPEN",
                "content": "The Model United Nations conference is coming to Astana. Registration deadline: May 15, 2026. Fee: 5000 KZT. All high school students welcome!",
                "category": "opportunities",
                "summary": "FEMUN 2026 conference registration open for high school students in Astana"
            },
            {
                "id": 3,
                "title": "Ошибки, которые снижают баллы на IELTS и TOEFL",
                "content": "Learn common mistakes that reduce scores on English exams. Tips for improving pronunciation, grammar, and vocabulary. Free webinar!",
                "category": "tips",
                "summary": "Common mistakes on English exams and how to avoid them"
            },
            {
                "id": 4,
                "title": "Программа летних стажировок в Google",
                "content": "Google приглашает студентов на летнюю стажировку. Проект: AI и Machine Learning. Зарплата: 150,000 - 200,000 рублей в месяц. Дедлайн подачи: 30 апреля.",
                "category": "programs",
                "summary": "Летняя стажировка в Google по направлению AI и ML"
            },
            {
                "id": 5,
                "title": "Олимпиада по программированию КазСпИР 2026",
                "content": "Международная олимпиада по программированию. Категории: Junior (14-15), Senior (16-18). Призовой фонд: 500,000 рублей. Дедлайн регистрации: 25 мая.",
                "category": "opportunities",
                "summary": "Олимпиада по программированию с большим призовым фондом"
            },
            {
                "id": 6,
                "title": "Бизнес-семинар: Как запустить свой стартап",
                "content": "Научимся писать бизнес-план, привлекать инвестиции и строить команду. Спикер: успешный предприниматель. Место: онлайн. Дата: 20 апреля.",
                "category": "programs",
                "summary": "Семинар для начинающих предпринимателей о запуске стартапа"
            },
            {
                "id": 7,
                "title": "Курс по Data Science в Coursera",
                "content": "Бесплатный курс введение в Data Science. Длительность: 4 недели. Сертификат после завершения. Подходит для начинающих.",
                "category": "programs",
                "summary": "Бесплатный курс по Data Science на Coursera с сертификатом"
            },
            {
                "id": 8,
                "title": "Хакатон FinTech 2026",
                "content": "Создавай финтех-решения и выигрывай деньги! Команды 3-5 человек. Призовой фонд: 1,000,000 рублей. Дедлайн: 10 мая.",
                "category": "opportunities",
                "summary": "Крупный хакатон в сфере финансовых технологий"
            }
        ]
    }
    print(f"✅ Использую {len(posts_data['posts'])} sample постов для демонстрации!")

# Определим интересы студентов (категории)
student_interests = {
    'STEM': ['программирование', 'робототехника', 'искусственный интеллект', 'инженерия', 'data science'],
    'Business': ['бизнес', 'стартапы', 'предпринимательство', 'маркетинг', 'финансы'],
    'English': ['английский язык', 'языки', 'IELTS', 'TOEFL', 'коммуникация'],
    'Finance': ['финтех', 'инвестиции', 'экономика', 'финансовая грамотность'],
    'Leadership': ['лидерство', 'управление', 'командная работа', 'развитие лидера'],
    'Design': ['дизайн', 'креативность', 'UX/UI', 'графический дизайн']
}

print(f"✅ Определено {len(student_interests)} категорий интересов")

# ============ ЯЧЕЙКА 3: Загрузка модели SentenceTransformer ============
print("\n🤖 Загружаю модель SentenceTransformer (многоязычная)...")
model = SentenceTransformer('distiluse-base-multilingual-cased-v2')
print("✅ Модель загружена!")

# ============ ЯЧЕЙКА 4: Создание эмбеддингов постов ============
print("\n🔄 Создаю эмбеддинги постов...")

posts_embeddings = {}
for post in posts_data['posts']:
    # Комбинируем title + summary для лучших эмбеддингов
    text = f"{post['title']} {post.get('summary', '')} {post['content'][:200]}"
    embedding = model.encode(text, convert_to_tensor=False)
    posts_embeddings[post['id']] = {
        'embedding': embedding.tolist(),
        'title': post['title'],
        'category': post.get('category', 'general'),
        'text': text[:150]
    }

print(f"✅ Создано {len(posts_embeddings)} эмбеддингов постов")

# ============ ЯЧЕЙКА 5: Создание эмбеддингов интересов ============
print("🔄 Создаю эмбеддинги интересов студентов...")

interests_embeddings = {}
for interest_name, keywords in student_interests.items():
    # Комбинируем интерес и его ключевые слова
    text = f"{interest_name} {' '.join(keywords)}"
    embedding = model.encode(text, convert_to_tensor=False)
    interests_embeddings[interest_name] = {
        'embedding': embedding.tolist(),
        'keywords': keywords
    }

print(f"✅ Создано {len(interests_embeddings)} эмбеддингов интересов")

# ============ ЯЧЕЙКА 6: Функция рекомендации ============
print("\n📊 Создаю функцию рекомендаций...")

def get_recommendations(student_interests_list, posts_embeddings, interests_embeddings, top_k=5):
    """
    Даёт рекомендации постов для студента на основе его интересов

    Args:
        student_interests_list: список интересов студента ['STEM', 'Business']
        posts_embeddings: dict с эмбеддингами постов
        interests_embeddings: dict с эмбеддингами интересов
        top_k: количество рекомендаций

    Returns:
        list: рекомендованные посты с scores
    """
    if not student_interests_list or not posts_embeddings:
        return []

    # Создаём средний эмбеддинг интересов студента
    student_vectors = []
    for interest in student_interests_list:
        if interest in interests_embeddings:
            student_vectors.append(interests_embeddings[interest]['embedding'])

    if not student_vectors:
        return []

    student_embedding = np.mean(student_vectors, axis=0)

    # Вычисляем similarity с каждым постом
    recommendations = []
    for post_id, post_data in posts_embeddings.items():
        post_embedding = np.array(post_data['embedding'])

        # Cosine similarity
        similarity = np.dot(student_embedding, post_embedding) / (
            np.linalg.norm(student_embedding) * np.linalg.norm(post_embedding) + 1e-8
        )

        recommendations.append({
            'post_id': post_id,
            'title': post_data['title'],
            'category': post_data['category'],
            'score': float(similarity)
        })

    # Сортируем по score (по убыванию)
    recommendations = sorted(recommendations, key=lambda x: x['score'], reverse=True)

    return recommendations[:top_k]

print("✅ Функция рекомендаций готова!")

# ============ ЯЧЕЙКА 7: Тестирование рекомендаций ============
print("\n🧪 Тестирую рекомендации...")

test_cases = [
    ['STEM'],
    ['Business', 'Finance'],
    ['English', 'Leadership'],
    ['STEM', 'Finance'],
]

for test_interests in test_cases:
    recs = get_recommendations(test_interests, posts_embeddings, interests_embeddings, top_k=3)
    print(f"\n📌 Интересы: {test_interests}")
    for i, rec in enumerate(recs, 1):
        print(f"   {i}. {rec['title'][:50]}... (score: {rec['score']:.3f})")

# ============ ЯЧЕЙКА 8: Сохранение модели и данных ============
print("\n\n💾 Сохраняю эмбеддинги и конфиг...")

# Сохраняем эмбеддинги в JSON
export_data = {
    'posts_embeddings': posts_embeddings,
    'interests_embeddings': interests_embeddings,
    'student_interests': student_interests,
    'model_name': 'distiluse-base-multilingual-cased-v2',
    'version': '2.0',
    'total_posts': len(posts_embeddings),
    'total_interests': len(interests_embeddings)
}

# Сохраняем в JSON
with open('ml_embeddings.json', 'w', encoding='utf-8') as f:
    json.dump(export_data, f, ensure_ascii=False)

print("✅ Эмбеддинги сохранены в ml_embeddings.json")

# Сохраняем саму модель
model.save('ml_recommender_model')
print("✅ Модель сохранена в папке ml_recommender_model")

# ============ ЯЧЕЙКА 9: Скачивание файлов ============
print("\n" + "="*50)
print("📥 ГОТОВО К СКАЧИВАНИЮ!")
print("="*50)
print("""
Скачай эти файлы из Colab (слева в Files):
1. ml_embeddings.json (основной конфиг с эмбеддингами)
2. ml_recommender_model/ (папка с моделью)

Положи их в backend/models/:
backend/
└── models/
    ├── ml_embeddings.json
    └── ml_recommender_model/

После этого я создам API эндпоинт для рекомендаций!
""")

# ============ СТАТИСТИКА ============
print("\n📊 Финальная статистика:")
print(f"✅ Всего постов обработано: {len(posts_embeddings)}")
print(f"✅ Размер эмбеддинга: {len(list(posts_embeddings.values())[0]['embedding'])}")
print(f"✅ Интересы студентов: {list(interests_embeddings.keys())}")
print(f"✅ Модель: {export_data['model_name']}")
print(f"✅ Версия: {export_data['version']}")
