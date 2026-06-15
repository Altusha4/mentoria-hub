import json
import os
import numpy as np
from pathlib import Path
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Optional

# Путь к модели и эмбеддингам
BASE_DIR = Path(__file__).parent.parent.parent
MODELS_DIR = BASE_DIR / "backend" / "models"
EMBEDDINGS_FILE = MODELS_DIR / "ml_embeddings.json"
MODEL_DIR = MODELS_DIR / "ml_recommender_model"

class RecommendationEngine:
    """ML движок для рекомендаций постов студентам"""

    def __init__(self):
        self.model = None
        self.embeddings_data = None
        self.posts_embeddings = {}
        self.interests_embeddings = {}
        self.student_interests = {}
        self._load_model()
        self._load_embeddings()

    def _load_model(self):
        """Загружает SentenceTransformer модель"""
        try:
            if MODEL_DIR.exists():
                print(f"📦 Загружаю модель из {MODEL_DIR}...")
                self.model = SentenceTransformer(str(MODEL_DIR))
                print("✅ Модель загружена!")
            else:
                print(f"⚠️  Папка модели не найдена: {MODEL_DIR}")
        except Exception as e:
            print(f"❌ Ошибка при загрузке модели: {e}")

    def _load_embeddings(self):
        """Загружает эмбеддинги и конфиг из JSON"""
        try:
            if EMBEDDINGS_FILE.exists():
                print(f"📥 Загружаю эмбеддинги из {EMBEDDINGS_FILE}...")
                with open(EMBEDDINGS_FILE, 'r', encoding='utf-8') as f:
                    self.embeddings_data = json.load(f)

                self.posts_embeddings = self.embeddings_data.get('posts_embeddings', {})
                self.interests_embeddings = self.embeddings_data.get('interests_embeddings', {})
                self.student_interests = self.embeddings_data.get('student_interests', {})

                # Конвертируем строковые ключи в int для posts
                self.posts_embeddings = {
                    int(k) if k.isdigit() else k: v
                    for k, v in self.posts_embeddings.items()
                }

                print(f"✅ Загружено {len(self.posts_embeddings)} постов")
                print(f"✅ Загружено {len(self.interests_embeddings)} интересов")
            else:
                print(f"⚠️  Файл эмбеддингов не найден: {EMBEDDINGS_FILE}")
        except Exception as e:
            print(f"❌ Ошибка при загрузке эмбеддингов: {e}")

    def get_student_interests(self, interests_list: List[str]) -> Optional[np.ndarray]:
        """
        Создает средний эмбеддинг для интересов студента

        Args:
            interests_list: список интересов студента ['STEM', 'Business']

        Returns:
            np.ndarray: средний эмбеддинг интересов или None
        """
        if not interests_list or not self.interests_embeddings:
            return None

        student_vectors = []
        for interest in interests_list:
            if interest in self.interests_embeddings:
                embedding = self.interests_embeddings[interest].get('embedding')
                if embedding:
                    student_vectors.append(np.array(embedding))

        if not student_vectors:
            return None

        return np.mean(student_vectors, axis=0)

    def get_recommendations(
        self,
        interests_list: List[str],
        top_k: int = 10,
        exclude_categories: Optional[List[str]] = None
    ) -> List[Dict]:
        """
        Дает рекомендации постов на основе интересов студента

        Args:
            interests_list: список интересов ['STEM', 'Business']
            top_k: количество рекомендаций
            exclude_categories: категории для исключения

        Returns:
            list: список рекомендованных постов с scores
        """
        if not self.posts_embeddings or not self.model:
            return []

        # Получаем эмбеддинг интересов студента
        student_embedding = self.get_student_interests(interests_list)
        if student_embedding is None:
            return []

        recommendations = []

        for post_id, post_data in self.posts_embeddings.items():
            # Пропускаем исключенные категории
            if exclude_categories and post_data.get('category') in exclude_categories:
                continue

            post_embedding = np.array(post_data.get('embedding', []))
            if len(post_embedding) == 0:
                continue

            # Cosine similarity
            similarity = np.dot(student_embedding, post_embedding) / (
                np.linalg.norm(student_embedding) * np.linalg.norm(post_embedding) + 1e-8
            )

            recommendations.append({
                'post_id': int(post_id),
                'title': post_data.get('title', 'Unknown'),
                'category': post_data.get('category', 'general'),
                'score': float(similarity)
            })

        # Сортируем по score (по убыванию)
        recommendations = sorted(recommendations, key=lambda x: x['score'], reverse=True)

        return recommendations[:top_k]

    def get_available_interests(self) -> List[str]:
        """Получить список доступных интересов"""
        return list(self.student_interests.keys())

    def is_ready(self) -> bool:
        """Проверить готовность движка"""
        return (
            self.model is not None and
            len(self.posts_embeddings) > 0 and
            len(self.interests_embeddings) > 0
        )


# Глобальный экземпляр движка
recommendation_engine = RecommendationEngine()

print(f"\n🤖 ML Recommendation Engine Status:")
print(f"   Ready: {recommendation_engine.is_ready()}")
print(f"   Posts: {len(recommendation_engine.posts_embeddings)}")
print(f"   Interests: {len(recommendation_engine.interests_embeddings)}")
