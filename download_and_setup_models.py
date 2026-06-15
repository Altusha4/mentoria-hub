#!/usr/bin/env python3
"""
📥 Download and Setup ML Models Script
Автоматически скачивает модель и эмбеддинги, распаковывает и устанавливает их
"""

import os
import sys
import json
import shutil
import zipfile
import urllib.request
from pathlib import Path
from typing import Tuple, Optional


# ============================================================================
# CONFIGURATION
# ============================================================================

PROJECT_ROOT = Path(__file__).parent
MODELS_DIR = PROJECT_ROOT / "backend" / "models"
MODEL_NAME = "ml_recommender_model"
EMBEDDINGS_FILE = "ml_embeddings.json"


# ============================================================================
# CHECK IF FILES EXIST LOCALLY
# ============================================================================

def check_existing_files() -> Tuple[bool, bool]:
    """
    Проверяет наличие файлов модели локально

    Returns:
        (model_exists, embeddings_exists)
    """
    model_path = MODELS_DIR / MODEL_NAME
    embeddings_path = MODELS_DIR / EMBEDDINGS_FILE

    model_exists = model_path.exists() and (model_path / "config.json").exists()
    embeddings_exists = embeddings_path.exists() and embeddings_path.stat().st_size > 1000000

    return model_exists, embeddings_exists


def print_status():
    """Выводит статус текущих файлов"""
    print("\n" + "="*70)
    print("📊 ПРОВЕРКА НАЛИЧИЯ ФАЙЛОВ")
    print("="*70)

    model_exists, embeddings_exists = check_existing_files()

    print(f"\n📁 Models Directory: {MODELS_DIR}")
    print(f"   📦 Model ({MODEL_NAME}/): {'✅ Найдена' if model_exists else '❌ Не найдена'}")
    print(f"   📄 Embeddings ({EMBEDDINGS_FILE}): {'✅ Найдена' if embeddings_exists else '❌ Не найдена'}")

    if model_exists and embeddings_exists:
        print("\n✅ ВСЕ ФАЙЛЫ НА МЕСТЕ! Модель готова к использованию.")
        return True
    else:
        print("\n⚠️  ТРЕБУЕТСЯ ЗАГРУЗКА!")
        return False


# ============================================================================
# DOWNLOAD FROM GOOGLE DRIVE
# ============================================================================

def download_from_google_drive(file_id: str, destination: Path) -> bool:
    """
    Скачивает файл с Google Drive по ID

    Args:
        file_id: ID файла в Google Drive
        destination: Куда сохранить файл

    Returns:
        True если успешно
    """
    print(f"\n⬇️  Скачиваю файл с Google Drive...")

    try:
        url = f"https://drive.google.com/uc?export=download&id={file_id}"
        urllib.request.urlretrieve(url, destination)
        print(f"✅ Файл скачан: {destination}")
        return True
    except Exception as e:
        print(f"❌ Ошибка при скачивании: {e}")
        return False


# ============================================================================
# EXTRACT AND INSTALL
# ============================================================================

def extract_zip(zip_path: Path, extract_to: Path) -> bool:
    """Распаковывает ZIP архив"""
    print(f"\n📦 Распаковываю архив...")

    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_to)

        print(f"✅ Архив распакован в: {extract_to}")
        return True
    except Exception as e:
        print(f"❌ Ошибка при распаковке: {e}")
        return False


def setup_models_directory():
    """Подготавливает директорию для моделей"""
    print(f"\n📁 Подготавливаю директорию для моделей...")

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    print(f"✅ Директория готова: {MODELS_DIR}")


# ============================================================================
# MANUAL SETUP INSTRUCTIONS
# ============================================================================

def print_manual_setup_instructions():
    """Выводит инструкции для ручной загрузки"""
    print("\n" + "="*70)
    print("📥 ИНСТРУКЦИИ ДЛЯ РУЧНОЙ ЗАГРУЗКИ")
    print("="*70)

    print("""
🔴 ВАРИАНТ 1: Google Colab (РЕКОМЕНДУЕТСЯ)

1. Откройи Google Colab notebook с кодом обучения:
   https://colab.research.google.com

2. Запусти скрипт обучения:
   python train_ml_model_v3.py

3. После обучения скачай файлы:
   ✅ ml_recommender_model/ (папка с моделью)
   ✅ ml_embeddings.json (файл с эмбеддингами)

4. Распакуй архив ml_recommender_model.zip

5. Скопируй оба файла в нужную папку:
   cp -r ml_recommender_model backend/models/
   cp ml_embeddings.json backend/models/

═══════════════════════════════════════════════════════════════════

🟢 ВАРИАНТ 2: Локально (на этом компьютере)

1. Установи зависимости:
   pip install sentence-transformers torch numpy -q

2. Запусти скрипт обучения:
   python train_ml_model_v3.py

3. Файлы автоматически сохранятся в:
   backend/models/ml_recommender_model/
   backend/models/ml_embeddings.json

═══════════════════════════════════════════════════════════════════

🔵 ВАРИАНТ 3: Использовать облако (Google Drive)

1. Загрузи файлы на Google Drive

2. Скопируй file_id из ссылки на файл

3. Используй скрипт для автоматической загрузки:
   python download_and_setup_models.py --drive-id YOUR_FILE_ID

═══════════════════════════════════════════════════════════════════
""")

    print(f"\n📂 Целевая папка: {MODELS_DIR}")
    print(f"   - Модель должна быть в: {MODELS_DIR / MODEL_NAME}/")
    print(f"   - Эмбеддинги должны быть в: {MODELS_DIR / EMBEDDINGS_FILE}")


# ============================================================================
# VERIFY INSTALLATION
# ============================================================================

def verify_installation() -> bool:
    """Проверяет что всё установлено правильно"""
    print("\n" + "="*70)
    print("🔍 ПРОВЕРКА УСТАНОВКИ")
    print("="*70)

    model_path = MODELS_DIR / MODEL_NAME
    embeddings_path = MODELS_DIR / EMBEDDINGS_FILE

    # Проверяем модель
    print("\n📦 Проверяю модель...")
    if not model_path.exists():
        print(f"❌ Папка модели не найдена: {model_path}")
        return False

    config_file = model_path / "config.json"
    if not config_file.exists():
        print(f"❌ config.json не найден в модели")
        return False

    print(f"✅ Модель найдена")

    # Проверяем эмбеддинги
    print("\n📄 Проверяю эмбеддинги...")
    if not embeddings_path.exists():
        print(f"❌ Файл эмбеддингов не найден: {embeddings_path}")
        return False

    file_size_mb = embeddings_path.stat().st_size / 1024 / 1024
    if file_size_mb < 10:
        print(f"⚠️  Файл эмбеддингов слишком маленький: {file_size_mb:.2f} MB")
        return False

    # Проверяем содержимое JSON
    try:
        with open(embeddings_path, 'r') as f:
            data = json.load(f)

        progs = len(data.get('programs_embeddings', {}))
        interests = len(data.get('interests_embeddings', {}))
        skills = len(data.get('skills_embeddings', {}))

        print(f"✅ Эмбеддинги найдены")
        print(f"   - Программ: {progs}")
        print(f"   - Интересов: {interests}")
        print(f"   - Навыков: {skills}")

        if progs > 100 and interests > 50 and skills > 100:
            print(f"✅ Качество данных отлично!")
        else:
            print(f"⚠️  Данных может быть недостаточно")

    except Exception as e:
        print(f"❌ Ошибка при чтении JSON: {e}")
        return False

    return True


# ============================================================================
# NEXT STEPS
# ============================================================================

def print_next_steps():
    """Выводит что делать дальше"""
    print("\n" + "="*70)
    print("🚀 СЛЕДУЮЩИЕ ШАГИ")
    print("="*70)

    print(f"""
1. ✅ Модель и эмбеддинги установлены в:
   {MODELS_DIR}

2. 🔄 Перезагрузи бэкенд:
   pkill -f uvicorn
   python -m uvicorn backend.app.main:app --reload

3. 🧪 Проверь что модель загружается:
   curl http://localhost:8000/docs

4. 📱 Откройи фронтенд и тестируй:
   http://localhost:5173

5. 🎯 Протестируй "Check My Success Chance" на странице программы
""")


# ============================================================================
# MAIN
# ============================================================================

def main():
    """Основная функция"""
    print("\n" + "╔" + "="*68 + "╗")
    print("║" + " "*15 + "📥 ML MODELS DOWNLOAD & SETUP" + " "*25 + "║")
    print("╚" + "="*68 + "╝")

    # Проверяем наличие файлов
    all_exist = print_status()

    if all_exist:
        print("\n✅ Модель уже установлена!")
        if verify_installation():
            print_next_steps()
            return True

    # Если файлов нет - выводим инструкции
    print_manual_setup_instructions()

    print("\n" + "="*70)
    print("📋 ВЫБЕРИ СПОСОБ ЗАГРУЗКИ:")
    print("="*70)
    print("""
1️⃣  Google Colab (Рекомендуется - быстро и просто)
   - Откройи https://colab.research.google.com
   - Скопируй код из train_ml_model_v3.py
   - Запусти обучение
   - Скачай файлы и распакуй в backend/models/

2️⃣  Локально на этом компьютере (Если есть GPU)
   - pip install sentence-transformers torch numpy
   - python train_ml_model_v3.py
   - Файлы автоматически сохранятся

3️⃣  Google Drive (Если уже есть файлы)
   - Загрузи файлы на Drive
   - Скопируй file_id
   - python download_and_setup_models.py --drive-id FILE_ID
""")

    return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
