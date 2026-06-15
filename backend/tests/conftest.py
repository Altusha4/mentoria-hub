"""Pytest configuration and fixtures"""
import os
import sys
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, '/Users/altynayyertay/IdeaProjects/mentoria-hub/backend')

from app.main import app
from app.database import Base, get_db

# Test database
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test_temp.db"

def pytest_configure(config):
    """Initialize test database"""
    if os.path.exists("test_temp.db"):
        os.remove("test_temp.db")

def pytest_unconfigure(config):
    """Clean up test database"""
    if os.path.exists("test_temp.db"):
        os.remove("test_temp.db")

@pytest.fixture(scope="session")
def db_engine():
    """Create test database engine"""
    engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="session")
def SessionLocal(db_engine):
    """Create session factory"""
    return sessionmaker(autocommit=False, autoflush=False, bind=db_engine)

@pytest.fixture
def db(SessionLocal):
    """Get db session for each test"""
    connection = SessionLocal()
    yield connection
    connection.close()

@pytest.fixture
def client(db_engine, SessionLocal):
    """Create test client"""
    def override_get_db():
        connection = SessionLocal()
        try:
            yield connection
        finally:
            connection.close()

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

@pytest.fixture(autouse=True)
def reset_db(db_engine):
    """Reset database before each test"""
    Base.metadata.drop_all(bind=db_engine)
    Base.metadata.create_all(bind=db_engine)
    yield
    Base.metadata.drop_all(bind=db_engine)
    Base.metadata.create_all(bind=db_engine)
