#!/usr/bin/env python3
"""
🤖 ML Model Training Script for Mentoria Hub
Обучает SentenceTransformer модель на образовательных данных
Создает эмбеддинги для программ, интересов и навыков
"""

import sys
import json
import shutil
from pathlib import Path

try:
    import torch
    import numpy as np
    from sentence_transformers import SentenceTransformer
except ImportError:
    print("❌ Требуются зависимости. Установи:")
    print("   pip install sentence-transformers torch numpy")
    sys.exit(1)


# ============================================================================
# 1️⃣ ПОДГОТОВКА ОБРАЗОВАТЕЛЬНЫХ ДАННЫХ
# ============================================================================

def prepare_data():
    """Подготавливает образовательные данные для обучения"""
    print("\n" + "="*70)
    print("1️⃣  ПОДГОТОВКА ОБРАЗОВАТЕЛЬНЫХ ДАННЫХ")
    print("="*70)

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
    print(f"   📚 Программ: {len(programs_data)}")
    print(f"   💜 Интересов: {len(interests_data)}")
    print(f"   👥 Профилей студентов: {len(student_profiles_text)}")
    print(f"   🎯 Навыков: {len(skills_data)}")

    return programs_data, interests_data, student_profiles_text, skills_data


# ============================================================================
# 2️⃣ ЗАГРУЗКА И ОБУЧЕНИЕ МОДЕЛИ
# ============================================================================

def load_and_train_model(programs_data, student_profiles_text, skills_data):
    """Загружает и обучает SentenceTransformer модель"""
    print("\n" + "="*70)
    print("2️⃣  ЗАГРУЗКА И ОБУЧЕНИЕ МОДЕЛИ")
    print("="*70)

    # Загружаем предобученную модель
    print("\n📦 Загружаю базовую модель SentenceTransformer...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    print("✅ Модель загружена успешно")
    print(f"   🔥 GPU available: {torch.cuda.is_available()}")

    # Объединяем все тексты
    all_texts = student_profiles_text + [p["requirements"] for p in programs_data] + skills_data

    # Создаем эмбеддинги для всех текстов
    print("\n🔄 Создаю эмбеддинги для всех текстов...")
    embeddings = model.encode(all_texts, show_progress_bar=True, convert_to_numpy=True)

    print(f"✅ Создано {len(embeddings)} эмбеддингов")
    print(f"   📊 Размерность: {embeddings.shape[1]}")

    # Проверяем качество эмбеддингов на примерах
    print("\n📊 Проверка качества эмбеддингов:")
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
        expected = "должны быть похожи" if should_similar else "НЕ должны быть похожи"
        print(f"   {status} '{text1}' vs '{text2}'")
        print(f"      Similarity: {similarity:.4f} ({expected})")

    return model, embeddings


# ============================================================================
# 3️⃣ СОЗДАНИЕ ЭМБЕДДИНГОВ ДЛЯ ПРОГРАММ, ИНТЕРЕСОВ И НАВЫКОВ
# ============================================================================

def create_embeddings(model, programs_data, interests_data, skills_data):
    """Создает эмбеддинги для программ, интересов и навыков"""
    print("\n" + "="*70)
    print("3️⃣  СОЗДАНИЕ СПЕЦИАЛИЗИРОВАННЫХ ЭМБЕДДИНГОВ")
    print("="*70)

    # Эмбеддинги для программ
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

    # Эмбеддинги для интересов
    print("\n🔄 Создаю эмбеддинги для интересов...")
    interests_embeddings = {}
    for interest in interests_data:
        embedding = model.encode(interest, convert_to_numpy=True)
        interests_embeddings[interest] = {
            'embedding': embedding.tolist(),
            'interest': interest
        }
    print(f"✅ Создано {len(interests_embeddings)} эмбеддингов интересов")

    # Эмбеддинги для навыков
    print("\n🔄 Создаю эмбеддинги для навыков...")
    skills_embeddings = {}
    for skill in skills_data:
        embedding = model.encode(skill, convert_to_numpy=True)
        skills_embeddings[skill] = {
            'embedding': embedding.tolist(),
            'skill': skill
        }
    print(f"✅ Создано {len(skills_embeddings)} эмбеддингов навыков")

    return programs_embeddings, interests_embeddings, skills_embeddings


# ============================================================================
# 4️⃣ СОХРАНЕНИЕ МОДЕЛИ И ЭМБЕДДИНГОВ
# ============================================================================

def save_model_and_embeddings(model, programs_embeddings, interests_embeddings,
                               skills_embeddings, embeddings_shape, output_dir):
    """Сохраняет модель и эмбеддинги в файлы"""
    print("\n" + "="*70)
    print("4️⃣  СОХРАНЕНИЕ МОДЕЛИ И ЭМБЕДДИНГОВ")
    print("="*70)

    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    # Сохраняем модель
    model_path = output_path / "ml_recommender_model"
    print(f"\n💾 Сохраняю модель...")
    model.save(str(model_path))
    print(f"✅ Модель сохранена: {model_path}")

    # Сохраняем эмбеддинги в JSON
    print(f"\n💾 Сохраняю эмбеддинги...")
    embeddings_data = {
        'programs_embeddings': programs_embeddings,
        'interests_embeddings': interests_embeddings,
        'skills_embeddings': skills_embeddings,
        'model_info': {
            'model_name': 'all-MiniLM-L6-v2',
            'embedding_dim': embeddings_shape[1],
            'total_programs': len(programs_embeddings),
            'total_interests': len(interests_embeddings),
            'total_skills': len(skills_embeddings)
        }
    }

    embeddings_file = output_path / "ml_embeddings.json"
    with open(embeddings_file, 'w', encoding='utf-8') as f:
        json.dump(embeddings_data, f, indent=2)

    print(f"✅ Эмбеддинги сохранены: {embeddings_file}")
    file_size = len(json.dumps(embeddings_data)) / 1024 / 1024
    print(f"   📦 Размер файла: {file_size:.2f} MB")

    return model_path, embeddings_file


# ============================================================================
# 5️⃣ ТЕСТИРОВАНИЕ МОДЕЛИ
# ============================================================================

def test_model(model, programs_embeddings, skills_data):
    """Тестирует обученную модель на примерах"""
    print("\n" + "="*70)
    print("5️⃣  ТЕСТИРОВАНИЕ МОДЕЛИ")
    print("="*70)

    # Тест 1: Рекомендации для студента с интересом к программированию
    print("\n📝 Тест 1: Студент интересуется программированием")
    print("-" * 70)
    student_interests = "Programming, Machine Learning, Technology"
    student_emb = model.encode(student_interests, convert_to_numpy=True)

    similarities = {}
    for prog_name, prog_data in programs_embeddings.items():
        prog_emb = np.array(prog_data['embedding'])
        sim = np.dot(student_emb, prog_emb) / (np.linalg.norm(student_emb) * np.linalg.norm(prog_emb))
        similarities[prog_name] = float(sim)

    sorted_progs = sorted(similarities.items(), key=lambda x: x[1], reverse=True)
    print(f"Интересы студента: {student_interests}\n")
    print("Рекомендованные программы:")
    for i, (prog_name, score) in enumerate(sorted_progs[:3], 1):
        print(f"   {i}. {prog_name}: {score:.4f}")

    # Тест 2: Сравнение навыков
    print("\n📝 Тест 2: Семантическое сравнение навыков")
    print("-" * 70)
    student_skills = "Programming languages, Working with teams, Machine learning basics"
    required_skills = "Python programming, teamwork skills"

    student_emb = model.encode(student_skills, convert_to_numpy=True)
    required_emb = model.encode(required_skills, convert_to_numpy=True)
    similarity = np.dot(student_emb, required_emb) / (np.linalg.norm(student_emb) * np.linalg.norm(required_emb))

    print(f"Навыки студента: '{student_skills}'")
    print(f"Требуемые навыки: '{required_skills}'")
    print(f"Similarity Score: {similarity:.4f}")

    if similarity > 0.7:
        quality = "Отличный матч ✅"
    elif similarity > 0.5:
        quality = "Хороший матч ✓"
    else:
        quality = "Приемлемый матч"

    print(f"Match Quality: {quality}")


# ============================================================================
# 6️⃣ ОСНОВНАЯ ФУНКЦИЯ
# ============================================================================

def main():
    """Основная функция для запуска полного цикла обучения"""
    print("\n")
    print("╔" + "="*68 + "╗")
    print("║" + " "*15 + "🤖 MENTORIA HUB ML MODEL TRAINING" + " "*21 + "║")
    print("╚" + "="*68 + "╝")

    # Определяем путь для сохранения
    if 'google.colab' in sys.modules:
        # В Google Colab
        output_dir = "/content/models"
        print("\n📍 Запуск в Google Colab")
    else:
        # Локально
        script_dir = Path(__file__).parent
        output_dir = script_dir / "backend" / "models"
        print(f"\n📍 Запуск локально")

    try:
        # 1. Подготовка данных
        programs_data, interests_data, student_profiles_text, skills_data = prepare_data()

        # 2. Загрузка и обучение модели
        model, embeddings = load_and_train_model(programs_data, student_profiles_text, skills_data)

        # 3. Создание эмбеддингов
        programs_emb, interests_emb, skills_emb = create_embeddings(
            model, programs_data, interests_data, skills_data
        )

        # 4. Сохранение
        model_path, embeddings_file = save_model_and_embeddings(
            model, programs_emb, interests_emb, skills_emb, embeddings.shape, output_dir
        )

        # 5. Тестирование
        test_model(model, programs_emb, skills_data)

        # Финальное сообщение
        print("\n" + "="*70)
        print("✅ ОБУЧЕНИЕ ЗАВЕРШЕНО УСПЕШНО!")
        print("="*70)
        print(f"\n📂 Файлы сохранены:")
        print(f"   📦 Модель: {model_path}/")
        print(f"   📄 Эмбеддинги: {embeddings_file}")

        if 'google.colab' in sys.modules:
            print("\n📥 Скачайте файлы из Google Colab:")
            print("   1. ml_recommender_model/ (распакуй потом)")
            print("   2. ml_embeddings.json")
            print("\n📂 Затем скопируйте в проект:")
            print("   backend/models/ml_recommender_model/")
            print("   backend/models/ml_embeddings.json")
        else:
            print(f"\n✅ Файлы готовы к использованию!")
            print(f"\n🚀 Перезагрузите бэкенд:")
            print("   pkill -f uvicorn")
            print("   python -m uvicorn backend.app.main:app --reload")

        return True

    except Exception as e:
        print(f"\n❌ ОШИБКА: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
