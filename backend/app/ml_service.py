import json
import os
import re
import numpy as np
from pathlib import Path
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Optional, Tuple

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

    def get_recommendations_with_bio(
        self,
        interests_list: List[str],
        bio: Optional[str] = None,
        top_k: int = 10,
        exclude_categories: Optional[List[str]] = None
    ) -> List[Dict]:
        """
        Рекомендации с учетом интересов и био студента

        Args:
            interests_list: список интересов ['STEM', 'Business']
            bio: текст о студенте (цели, амбиции)
            top_k: количество рекомендаций
            exclude_categories: категории для исключения

        Returns:
            list: список рекомендованных постов с scores
        """
        if not self.posts_embeddings or not self.model:
            return []

        # Получаем базовое рекомендации по интересам
        base_recommendations = self.get_recommendations(
            interests_list,
            top_k=top_k * 2,  # Берем больше для переранжирования
            exclude_categories=exclude_categories
        )

        if not base_recommendations or not bio:
            return base_recommendations[:top_k]

        # Если есть bio, переранжируем по комбинированному скору
        try:
            # Создаем эмбеддинг для bio
            bio_embedding = self.model.encode(bio, convert_to_numpy=True)

            # Переранжируем рекомендации с учетом bio
            for rec in base_recommendations:
                post_id = rec['post_id']
                if post_id in self.posts_embeddings:
                    post_embedding = np.array(self.posts_embeddings[post_id].get('embedding', []))

                    # Cosine similarity с bio
                    bio_similarity = np.dot(bio_embedding, post_embedding) / (
                        np.linalg.norm(bio_embedding) * np.linalg.norm(post_embedding) + 1e-8
                    )

                    # Комбинируем скор: 60% интересы, 40% bio
                    rec['score'] = rec['score'] * 0.6 + float(bio_similarity) * 0.4

            # Переранжируем
            base_recommendations = sorted(base_recommendations, key=lambda x: x['score'], reverse=True)

        except Exception as e:
            print(f"⚠️  Ошибка при обработке bio: {e}")

        return base_recommendations[:top_k]

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


class OpportunitySuccessChanceAnalyzer:
    """ML анализ вероятности получения оффера на программу"""

    def __init__(self, model: Optional[SentenceTransformer] = None):
        self.model = model or recommendation_engine.model
        self.common_skills = {
            'python', 'javascript', 'sql', 'java', 'c++', 'html', 'css', 'react', 'vue',
            'leadership', 'teamwork', 'communication', 'problem solving', 'analysis',
            'public speaking', 'project management', 'machine learning', 'data analysis',
            'research', 'writing', 'presentation', 'organization', 'planning'
        }

    def extract_skills_from_text(self, text: Optional[str]) -> List[str]:
        """Извлекает навыки из текста (CV, bio, activities)"""
        if not text:
            return []

        text_lower = text.lower()
        found_skills = []

        for skill in self.common_skills:
            if skill in text_lower:
                found_skills.append(skill)

        return list(set(found_skills))  # убираем дубликаты

    def extract_required_skills(self, requirements: Optional[str]) -> List[str]:
        """Парсит требуемые навыки из requirements программы"""
        if not requirements:
            return []

        required = []
        for skill in self.common_skills:
            if skill in requirements.lower():
                required.append(skill)

        return list(set(required))

    def calculate_skill_match(self, student_skills: List[str], required_skills: List[str]) -> float:
        """
        Семантическое сравнение навыков (0-1)
        Использует embeddings для учета синонимов и близких навыков.
        Пороги: 0.7+ = отличный, 0.5+ = хороший, 0.3+ = приемлемый матч
        """
        if not required_skills:
            return 0.5  # если нет требований, нейтральный скор

        if not student_skills:
            return 0.3  # студент может иметь косвенные навыки

        # Нормализуем навыки (lowercase)
        student_skills_norm = [s.strip().lower() for s in student_skills]
        required_skills_norm = [s.strip().lower() for s in required_skills]

        # Сначала проверяем точные совпадения
        exact_matches = len(set(student_skills_norm) & set(required_skills_norm))
        if exact_matches == len(required_skills_norm):
            return 1.0  # все требуемые навыки есть

        if not self.model:
            # Fallback на точное совпадение если модель не загружена
            return min(exact_matches / len(required_skills_norm), 1.0)

        try:
            # Семантическое сравнение через embeddings
            similarity_scores = []

            for req_skill in required_skills_norm:
                best_similarity = 0.0

                # Сравниваем со всеми навыками студента
                for student_skill in student_skills_norm:
                    # Пропускаем если уже точное совпадение
                    if req_skill == student_skill:
                        best_similarity = 1.0
                        break

                    try:
                        req_emb = self.model.encode(req_skill, convert_to_numpy=True)
                        student_emb = self.model.encode(student_skill, convert_to_numpy=True)

                        # Cosine similarity
                        similarity = float(np.dot(req_emb, student_emb) / (
                            np.linalg.norm(req_emb) * np.linalg.norm(student_emb) + 1e-8
                        ))
                        best_similarity = max(best_similarity, similarity)
                    except:
                        pass

                # Добавляем даже низкие сходства (они тоже помогают)
                # Если совсем нет совпадения (< 0.2), но хоть что-то есть (> 0.1) - считаем это поиском
                similarity_scores.append(max(best_similarity, 0.1))  # минимум 0.1 если поиск был

            # Вычисляем средний score по всем требуемым навыкам
            match_score = np.mean(similarity_scores) if similarity_scores else 0.3
            return float(max(0.0, min(match_score, 1.0)))

        except Exception as e:
            print(f"⚠️  Ошибка при семантическом сравнении навыков: {e}")
            # Fallback на точное совпадение
            return float(min(exact_matches / len(required_skills_norm), 1.0))

    def calculate_interest_match(self, student_interests: str, program_direction: str) -> float:
        """Семантическое сравнение интересов и направления (0-1)"""
        if not self.model:
            return 0.5

        try:
            student_emb = self.model.encode(student_interests, convert_to_numpy=True)
            program_emb = self.model.encode(program_direction, convert_to_numpy=True)

            # Cosine similarity
            similarity = np.dot(student_emb, program_emb) / (
                np.linalg.norm(student_emb) * np.linalg.norm(program_emb) + 1e-8
            )
            return float(max(0.0, similarity))
        except Exception as e:
            print(f"⚠️  Ошибка при расчете интерес-матча: {e}")
            return 0.5

    def calculate_semantic_match(self, student_text: str, program_requirements: str) -> float:
        """Семантическое сравнение текста студента с требованиями (0-1)"""
        if not self.model or not student_text or not program_requirements:
            return 0.5

        try:
            student_emb = self.model.encode(student_text, convert_to_numpy=True)
            req_emb = self.model.encode(program_requirements, convert_to_numpy=True)

            # Cosine similarity
            similarity = np.dot(student_emb, req_emb) / (
                np.linalg.norm(student_emb) * np.linalg.norm(req_emb) + 1e-8
            )
            return float(max(0.0, similarity))
        except Exception as e:
            print(f"⚠️  Ошибка при семантическом сравнении: {e}")
            return 0.5

    def calculate_academic_score(
        self,
        gpa: Optional[float],
        ielts: Optional[float],
        toefl: Optional[int],
        sat: Optional[int],
        requirements: Optional[str]
    ) -> Tuple[float, Dict]:
        """Рассчитывает академический скор (0-1) и детали"""
        details = {
            'gpa': None,
            'ielts': None,
            'toefl': None,
            'sat': None,
            'available_metrics': 0
        }

        scores = []

        # GPA (0-4.0 → 0-1)
        if gpa is not None:
            norm_gpa = min(gpa / 4.0, 1.0)
            scores.append(norm_gpa)
            details['gpa'] = float(norm_gpa)
            details['available_metrics'] += 1

        # IELTS (0-9 → 0-1)
        if ielts is not None:
            norm_ielts = min(ielts / 9.0, 1.0)
            scores.append(norm_ielts)
            details['ielts'] = float(norm_ielts)
            details['available_metrics'] += 1

        # TOEFL (0-120 → 0-1)
        if toefl is not None:
            norm_toefl = min(toefl / 120.0, 1.0)
            scores.append(norm_toefl)
            details['toefl'] = float(norm_toefl)
            details['available_metrics'] += 1

        # SAT (0-1600 → 0-1)
        if sat is not None:
            norm_sat = min(sat / 1600.0, 1.0)
            scores.append(norm_sat)
            details['sat'] = float(norm_sat)
            details['available_metrics'] += 1

        if scores:
            return float(np.mean(scores)), details

        # Если нет метрик - возвращаем низкий скор
        return 0.3, details

    def analyze_success_chance(
        self,
        student_profile: Dict,
        opportunity: Dict
    ) -> Dict:
        """
        Комплексный анализ шансов получения оффера

        Args:
            student_profile: {
                'interests': 'STEM,Programming',
                'subjects': 'Math,Physics',
                'goals': 'Get into top university',
                'bio': 'Passionate about AI...',
                'cv_text': 'Skills: Python...',
                'activities': 'Coding club...',
                'certificates': 'Python cert...',
                'skills': 'Python,Leadership,ML',  # NEW! Explicit skills
                'motivation_letter': '...',
                'grade': 10,
                'gpa': 3.8,
                'ielts_score': 7.5,
                'toefl_score': 105,
                'sat_score': 1450
            }
            opportunity: {
                'title': 'AI Hackathon',
                'direction': 'Programming',
                'requirements': 'Python, ML, teamwork, GPA 3.5+',
                'grade_level': '10-11'
            }

        Returns:
            {
                'success_probability': 0.75,  # 0-1
                'score_breakdown': {...},
                'matching_skills': [...],
                'missing_skills': [...],
                'recommendations': [...]
            }
        """

        # 1. Извлекаем и сравниваем навыки
        # Комбинируем явные навыки + навыки из текста
        explicit_skills = [s.strip() for s in (student_profile.get('skills', '') or '').split(',') if s.strip()]
        student_text = f"{student_profile.get('cv_text', '')} {student_profile.get('activities', '')} {student_profile.get('certificates', '')}"
        extracted_skills = self.extract_skills_from_text(student_text)
        student_skills = list(set(explicit_skills + extracted_skills))  # объединяем и убираем дубликаты
        required_skills = self.extract_required_skills(opportunity.get('requirements', ''))

        skill_match = self.calculate_skill_match(student_skills, required_skills)
        matching_skills = list(set(student_skills) & set(required_skills))
        missing_skills = [s for s in required_skills if s not in student_skills]

        # 2. Интерес-матч (10% вес - минимум)
        interest_match = self.calculate_interest_match(
            student_profile.get('interests', ''),
            opportunity.get('direction', '')
        )

        # 3. Семантическое сравнение с requirements (25% вес - важно!)
        student_motivation = f"{student_profile.get('bio', '')} {student_profile.get('motivation_letter', '')} {student_profile.get('goals', '')}"
        semantic_match = self.calculate_semantic_match(
            student_motivation,
            opportunity.get('requirements', '')
        )

        # 4. Навыки (35% вес - основное!)
        # skill_match уже рассчитан

        # 5. Академический уровень (25% вес - важно!)
        academic_score, academic_details = self.calculate_academic_score(
            student_profile.get('gpa'),
            student_profile.get('ielts_score'),
            student_profile.get('toefl_score'),
            student_profile.get('sat_score'),
            opportunity.get('requirements')
        )

        # 6. Полнота профиля (5% вес)
        profile_fields = [
            student_profile.get('cv_text'),
            student_profile.get('motivation_letter'),
            student_profile.get('activities'),
            student_profile.get('certificates'),
            student_profile.get('gpa'),
            student_profile.get('ielts_score')
        ]
        profile_completeness = len([f for f in profile_fields if f]) / len(profile_fields)

        # ИТОГОВЫЙ СКОР (динамические веса!)
        total_score = (
            0.10 * interest_match +      # Интересы
            0.25 * semantic_match +      # Семантика
            0.35 * skill_match +         # Навыки - основное!
            0.25 * academic_score +      # Академика
            0.05 * profile_completeness  # Полнота профиля
        )

        return {
            'success_probability': float(total_score),
            'score_breakdown': {
                'interest_match': float(interest_match),
                'semantic_match': float(semantic_match),
                'skill_match': float(skill_match),
                'academic_score': float(academic_score),
                'profile_completeness': float(profile_completeness),
            },
            'matching_skills': matching_skills,
            'missing_skills': missing_skills,
            'academic_details': academic_details,
            'recommendations': self._generate_recommendations(
                student_profile, opportunity, missing_skills, academic_details
            )
        }

    def _generate_recommendations(
        self,
        student: Dict,
        opportunity: Dict,
        missing_skills: List[str],
        academic_details: Dict
    ) -> List[str]:
        """Генерирует умные рекомендации для улучшения шансов"""
        recommendations = []

        # Рекомендации по навыкам (учитываем что могут быть близкие навыки)
        if missing_skills:
            top_missing = missing_skills[:2]
            skills_str = ', '.join(top_missing)
            # Более мягкая формулировка - может быть они уже имеют близкие навыки
            recommendations.append(f"Develop or highlight: {skills_str}")

        # Рекомендации по академике
        if academic_details['available_metrics'] == 0:
            recommendations.append("Add academic metrics (GPA, IELTS/TOEFL) to strengthen profile")
        else:
            if academic_details['gpa'] is not None and academic_details['gpa'] < 0.7:
                recommendations.append("Boost your GPA (many programs prefer 3.5+)")
            if academic_details['ielts'] is not None and academic_details['ielts'] < 0.7:
                recommendations.append("Improve English proficiency (target IELTS 7.0+)")
            if academic_details['toefl'] is not None and academic_details['toefl'] < 0.7:
                recommendations.append("Strengthen English skills (target TOEFL 100+)")

        # Рекомендации по профилю
        if not student.get('motivation_letter'):
            recommendations.append("Write a motivation letter explaining your goals")
        if not student.get('cv_text'):
            recommendations.append("Add your CV to showcase your background")
        if not student.get('activities'):
            recommendations.append("List your activities to show commitment and teamwork")

        return recommendations[:3]  # максимум 3 рекомендации


# Глобальный анализатор
success_chance_analyzer = OpportunitySuccessChanceAnalyzer()
