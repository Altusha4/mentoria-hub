"""
📥 Google Colab - Download Models Script
Этот скрипт запускается в Google Colab ПОСЛЕ обучения модели
Он скачивает файлы на твой компьютер
"""

# ============================================================================
# ДЛЯ GOOGLE COLAB - ЗАПУСТИ ЭТО ПОСЛЕ ОБУЧЕНИЯ МОДЕЛИ
# ============================================================================

# 1️⃣ СКАЧИВАЕМ ФАЙЛЫ
from google.colab import files
import shutil
import os

print("\n" + "="*70)
print("📥 СКАЧИВАНИЕ ФАЙЛОВ ИЗ GOOGLE COLAB")
print("="*70)

# Проверяем что файлы существуют
model_path = "/content/models/ml_recommender_model"
embeddings_path = "/content/models/ml_embeddings.json"

print(f"\n🔍 Проверяю наличие файлов...")
if os.path.exists(model_path):
    print(f"✅ Модель найдена: {model_path}")
else:
    print(f"❌ Модель не найдена!")

if os.path.exists(embeddings_path):
    size_mb = os.path.getsize(embeddings_path) / 1024 / 1024
    print(f"✅ Эмбеддинги найдены: {embeddings_path} ({size_mb:.2f} MB)")
else:
    print(f"❌ Эмбеддинги не найдены!")

# Архивируем модель для скачивания
print(f"\n📦 Подготавливаю модель к скачиванию...")
shutil.make_archive('/content/ml_recommender_model', 'zip', '/content/models/ml_recommender_model')
print(f"✅ Архив создан")

# Скачиваем файлы
print(f"\n⬇️  НАЧИНАЮ СКАЧИВАНИЕ...")
print(f"Два файла появятся в диалоговом окне ниже:")
print(f"  1. ml_recommender_model.zip")
print(f"  2. ml_embeddings.json")
print(f"\nЖди, скачивание может занять до 1 минуты...")

print(f"\n{'='*70}")
print(f"Файл 1: Модель")
print(f"{'='*70}")
files.download('/content/ml_recommender_model.zip')

print(f"\n{'='*70}")
print(f"Файл 2: Эмбеддинги")
print(f"{'='*70}")
files.download('/content/ml_embeddings.json')

# Инструкции
print(f"\n\n{'='*70}")
print(f"✅ СКАЧИВАНИЕ ЗАВЕРШЕНО!")
print(f"{'='*70}")

print(f"""
📥 СЛЕДУЮЩИЕ ШАГИ НА ТВОЕМ КОМПЬЮТЕРЕ:

1️⃣  РАСПАКУЙ архив:
   unzip ml_recommender_model.zip

2️⃣  СКОПИРУЙ файлы в проект:
   cp -r ml_recommender_model ~/IdeaProjects/mentoria-hub/backend/models/
   cp ml_embeddings.json ~/IdeaProjects/mentoria-hub/backend/models/

3️⃣  ПЕРЕЗАГРУЗИ бэкенд:
   cd ~/IdeaProjects/mentoria-hub
   pkill -f uvicorn
   python -m uvicorn backend.app.main:app --reload

4️⃣  ПРОВЕРЬ установку:
   python download_and_setup_models.py

5️⃣  ОТКРОЙИ приложение:
   http://localhost:5173
   http://localhost:8000/docs
""")

print(f"\n🎉 ГОТОВО! Модель установлена и готова к использованию!")
