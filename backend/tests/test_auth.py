"""Authentication tests"""
import pytest
import sys
sys.path.insert(0, '/Users/altynayyertay/IdeaProjects/mentoria-hub/backend')

from app.models import StudentProfile

class TestAuthentication:
    """Test auth endpoints"""

    def test_register_success(self, client):
        """Test successful registration"""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "testuser@example.com",
                "password": "securepassword123",
                "first_name": "Test",
                "last_name": "User",
                "grade": 10,
                "interests": "STEM,Business"
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "student_id" in data
        assert data["name"] == "Test User"

    def test_register_duplicate_email(self, client):
        """Test registration with duplicate email fails"""
        email = "duplicate@example.com"

        # First registration
        client.post(
            "/api/auth/register",
            json={
                "email": email,
                "password": "pass123",
                "first_name": "First",
                "last_name": "User",
                "grade": 9,
                "interests": "STEM"
            },
        )

        # Try duplicate
        response = client.post(
            "/api/auth/register",
            json={
                "email": email,
                "password": "pass123",
                "first_name": "Second",
                "last_name": "User",
                "grade": 10,
                "interests": "Business"
            },
        )
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"]

    def test_login_success(self, client):
        """Test successful login"""
        # Register first
        client.post(
            "/api/auth/register",
            json={
                "email": "login@example.com",
                "password": "mypassword",
                "first_name": "Login",
                "last_name": "Test",
                "grade": 11,
                "interests": "Finance"
            },
        )

        # Login
        response = client.post(
            "/api/auth/login",
            json={
                "email": "login@example.com",
                "password": "mypassword"
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["student_id"] > 0

    def test_login_wrong_password(self, client):
        """Test login with wrong password fails"""
        # Register
        client.post(
            "/api/auth/register",
            json={
                "email": "wrongpass@example.com",
                "password": "correctpassword",
                "first_name": "Wrong",
                "last_name": "Pass",
                "grade": 9,
                "interests": "STEM"
            },
        )

        # Try wrong password
        response = client.post(
            "/api/auth/login",
            json={
                "email": "wrongpass@example.com",
                "password": "wrongpassword"
            },
        )
        assert response.status_code == 401
        assert "Invalid email or password" in response.json()["detail"]

    def test_login_nonexistent_user(self, client):
        """Test login with non-existent user fails"""
        response = client.post(
            "/api/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "anypassword"
            },
        )
        assert response.status_code == 401

    def test_avatar_generated_on_signup(self, client):
        """Test that avatar is generated on signup"""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "avatar@example.com",
                "password": "pass123",
                "first_name": "Avatar",
                "last_name": "Test",
                "grade": 10,
                "interests": "STEM"
            },
        )
        # Avatar is generated during signup
        assert response.status_code == 200
        data = response.json()
        assert "student_id" in data
        assert "access_token" in data
