from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import StudentProfile
from ..schemas import StudentProfileCreate, StudentProfile as StudentProfileSchema
from ..auth import create_access_token, create_refresh_token, verify_token, hash_password, verify_password
from pydantic import BaseModel
import random

# DiceBear Avatars - free avatar generator
AVATAR_STYLES = ['avataaars', 'personas', 'lorelei', 'fun-emoji']
AVATAR_EMOJIS = ['👤', '😊', '🎓', '🚀', '⭐', '💼', '🎯', '🌟', '💡', '🏆', '🎨', '🧠']

def generate_avatar_emoji() -> str:
    """Generate random emoji avatar"""
    return random.choice(AVATAR_EMOJIS)

router = APIRouter(prefix="/api/auth", tags=["auth"])

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    student_id: int
    name: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

@router.post("/register", response_model=TokenResponse)
def register(student: StudentProfileCreate, response: Response, db: Session = Depends(get_db)):
    print(f"\n🔍 [REGISTER] Email: {student.email}")

    # Check if email already exists
    print(f"🔍 [REGISTER] Checking if email exists in DB...")
    existing = db.query(StudentProfile).filter(StudentProfile.email == student.email).first()

    if existing:
        print(f"❌ [REGISTER] Email {student.email} already exists! ID: {existing.id}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    print(f"✅ [REGISTER] Email {student.email} is free")

    # Create new student with hashed password
    student_dict = student.dict()
    password = student_dict.pop("password")
    print(f"🔐 [REGISTER] Hashing password for {student.email}...")

    # Generate random avatar emoji
    avatar_emoji = generate_avatar_emoji()
    print(f"🎨 [REGISTER] Generated avatar: {avatar_emoji}")

    db_student = StudentProfile(**student_dict, password_hash=hash_password(password), avatar_emoji=avatar_emoji)
    print(f"💾 [REGISTER] Adding student to DB: {student.email}")

    db.add(db_student)
    db.commit()
    db.refresh(db_student)

    print(f"✅ [REGISTER] Student created! ID: {db_student.id}, Email: {db_student.email}")

    # Generate tokens
    access_token = create_access_token(data={"sub": db_student.id})
    refresh_token = create_refresh_token(data={"sub": db_student.id})

    # Set httpOnly cookie with refresh token
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,  # Set to True in production (HTTPS only)
        samesite="lax",
        max_age=7 * 24 * 60 * 60  # 7 days
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "student_id": db_student.id,
        "name": f"{db_student.first_name} {db_student.last_name}"
    }

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, response: Response, db: Session = Depends(get_db)):
    print(f"\n🔍 [LOGIN] Email: {request.email}")

    # Find student by email
    print(f"🔍 [LOGIN] Looking for student in DB...")
    student = db.query(StudentProfile).filter(StudentProfile.email == request.email).first()

    if not student:
        print(f"❌ [LOGIN] Email {request.email} not found in DB")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    print(f"✅ [LOGIN] Found student: ID {student.id}")

    # Verify password
    print(f"🔐 [LOGIN] Verifying password...")
    if not verify_password(request.password, student.password_hash):
        print(f"❌ [LOGIN] Password incorrect for {request.email}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    print(f"✅ [LOGIN] Password correct, generating tokens...")

    # Generate tokens
    access_token = create_access_token(data={"sub": student.id})
    refresh_token = create_refresh_token(data={"sub": student.id})

    # Set httpOnly cookie with refresh token
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,  # Set to True in production (HTTPS only)
        samesite="lax",
        max_age=7 * 24 * 60 * 60  # 7 days
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "student_id": student.id,
        "name": f"{student.first_name} {student.last_name}"
    }

@router.post("/refresh")
def refresh_access_token(request: RefreshTokenRequest, response: Response, db: Session = Depends(get_db)):
    # Verify refresh token
    student_id = verify_token(request.refresh_token)

    # Check student exists
    student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Student not found")

    # Generate new access token
    new_access_token = create_access_token(data={"sub": student.id})

    return {
        "access_token": new_access_token,
        "student_id": student.id,
        "name": f"{student.first_name} {student.last_name}"
    }

@router.post("/logout")
def logout(response: Response):
    # Clear refresh token cookie
    response.delete_cookie("refresh_token")
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=StudentProfileSchema)
def get_current_user(token: str, db: Session = Depends(get_db)):
    student_id = verify_token(token)
    student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return student
