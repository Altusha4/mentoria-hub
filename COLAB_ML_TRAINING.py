"""
Google Colab Notebook для обучения модели рекомендаций
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

# Данные постов (скопируй содержимое posts_for_ml.json в переменную)
posts_data = {
    "posts": [
        # Это будет заполнено данными из posts_for_ml.json
        # Для простоты, я создам sample данные
    ]
}

# Если загружаешь из файла, используй:
# with open('posts_for_ml.json', 'r', encoding='utf-8') as f:
#     posts_data = json.load(f)

# Определим интересы студентов (категории)
student_interests = {
    'STEM': ['программирование', 'научные исследования', 'робототехника', 'математика'],
    'Business': ['бизнес', 'предпринимательство', 'маркетинг', 'финансы'],
    'English': ['английский язык', 'языки', 'лингвистика'],
    'Art': ['искусство', 'дизайн', 'креативность', 'музыка'],
    'Science': ['наука', 'биология', 'химия', 'физика'],
    'Leadership': ['лидерство', 'управление', 'командная работа']
}

print(f"✅ Загружено {len(posts_data['posts']) if posts_data['posts'] else 0} постов")
print(f"✅ Определено {len(student_interests)} категорий интересов")

# ============ ЯЧЕЙКА 3: Загрузка модели SentenceTransformer ============
print("🤖 Загружаю модель SentenceTransformer...")
# Используем многоязычную модель для Russian + English
model = SentenceTransformer('distiluse-base-multilingual-cased-v2')
print("✅ Модель загружена!")

# ============ ЯЧЕЙКА 4: Создание эмбеддингов постов ============
print("🔄 Создаю эмбеддинги постов...")

posts_embeddings = {}
if posts_data['posts']:
    for post in posts_data['posts']:
        # Комбинируем title + summary для лучших эмбеддингов
        text = f"{post['title']} {post['summary']}" if post.get('summary') else post['title']
        embedding = model.encode(text, convert_to_tensor=False)
        posts_embeddings[post['id']] = {
            'embedding': embedding.tolist(),
            'title': post['title'],
            'category': post.get('category', 'general'),
            'text': text[:200]  # Первые 200 символов для дебага
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
print("📊 Создаю функцию рекомендаций...")

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

# Тестируем
test_recommendations = get_recommendations(['STEM', 'Science'], posts_embeddings, interests_embeddings)
print(f"✅ Функция рекомендаций готова!")
print(f"\n📌 Пример рекомендаций для студента с интересами [STEM, Science]:")
for i, rec in enumerate(test_recommendations[:3], 1):
    print(f"   {i}. {rec['title'][:50]}... (score: {rec['score']:.2f})")

# ============ ЯЧЕЙКА 7: Сохранение модели и данных ============
print("\n💾 Сохраняю эмбеддинги и конфиг...")

# Сохраняем эмбеддинги в JSON
export_data = {
    'posts_embeddings': posts_embeddings,
    'interests_embeddings': interests_embeddings,
    'student_interests': student_interests,
    'model_name': 'distiluse-base-multilingual-cased-v2',
    'version': '1.0'
}

# Сохраняем в JSON
with open('ml_embeddings.json', 'w', encoding='utf-8') as f:
    json.dump(export_data, f, ensure_ascii=False)

print("✅ Эмбеддинги сохранены в ml_embeddings.json")

# Сохраняем саму модель
model.save('ml_recommender_model')
print("✅ Модель сохранена в папке ml_recommender_model")

# ============ ЯЧЕЙКА 8: Скачивание файлов ============
print("\n📥 Готово к скачиванию!")
print("""
Скачай эти файлы из Colab:
1. ml_embeddings.json - эмбеддинги и конфиг
2. ml_recommender_model (папка) - сама модель

Положи их в:
backend/models/
""")

# ============ ДОПОЛНИТЕЛЬНО: Анализ ============
print("\n📊 Анализ данных:")
print(f"Всего постов: {len(posts_embeddings)}")
print(f"Размер эмбеддинга: {len(list(posts_embeddings.values())[0]['embedding']) if posts_embeddings else 'N/A'}")
print(f"Категории постов: {set(p['category'] for p in posts_embeddings.values()) if posts_embeddings else 'N/A'}")
print(f"Интересы студентов: {list(interests_embeddings.keys())}")
