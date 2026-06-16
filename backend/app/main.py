from dotenv import load_dotenv
from pathlib import Path
load_dotenv(Path(__file__).resolve().parents[2] / ".env")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqladmin import Admin

from .database import init_db, engine
from .admin import register_admin
from .routers import opportunities, courses
from .seed import seed_data

app = FastAPI(title="Mentoria Hub API", version="0.1.0")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
init_db()

# Register routers
from .routers import students, auth, telegram, recommendations, notifications
app.include_router(auth.router)
app.include_router(opportunities.router)
app.include_router(courses.router)
app.include_router(students.router)
app.include_router(telegram.router)
app.include_router(recommendations.router)
app.include_router(notifications.router)

# Setup sqladmin
admin = Admin(app, engine, title="Mentoria Hub Admin")
register_admin(admin)

@app.on_event("startup")
def startup_event():
    """Initialize database with tables and seed data if empty."""
    from .database import SessionLocal

    # Create all tables
    init_db()

    # Seed mock data only if database is completely empty
    db = SessionLocal()
    from .models import StudentProfile
    try:
        if db.query(StudentProfile).count() == 0:
            print("Database empty, seeding mock data...")
            seed_data()
    finally:
        db.close()

    print("✅ Mentoria Hub API is running!")

@app.get("/")
def read_root():
    return {"message": "Welcome to Mentoria Hub API", "docs": "/docs", "admin": "/admin"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
