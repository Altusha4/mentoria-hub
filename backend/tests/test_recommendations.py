"""ML Recommendations tests"""
import pytest
import sys
sys.path.insert(0, '/Users/altynayyertay/IdeaProjects/mentoria-hub/backend')

from app.ml_service import recommendation_engine

class TestRecommendations:
    """Test ML recommendation engine"""

    def test_engine_loaded(self):
        """Test that ML engine is loaded"""
        assert recommendation_engine.is_ready()
        assert len(recommendation_engine.posts_embeddings) > 0
        assert len(recommendation_engine.interests_embeddings) > 0

    def test_available_interests(self, client):
        """Test available interests endpoint"""
        response = client.get("/api/recommendations/interests")
        assert response.status_code == 200
        data = response.json()
        assert "interests" in data
        assert len(data["interests"]) == 6
        assert "STEM" in data["interests"]
        assert "Business" in data["interests"]

    def test_engine_status(self, client):
        """Test engine status endpoint"""
        response = client.get("/api/recommendations/status")
        assert response.status_code == 200
        data = response.json()
        assert data["ready"] is True
        assert data["total_posts"] > 0
        assert data["total_interests"] == 6

    def test_get_recommendations_stem(self, client):
        """Test getting STEM recommendations"""
        response = client.post(
            "/api/recommendations/get",
            json={"interests": ["STEM"], "top_k": 5}
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 5
        assert len(data) > 0

        # Check structure
        for rec in data:
            assert "post_id" in rec
            assert "title" in rec
            assert "category" in rec
            assert "score" in rec
            assert 0 <= rec["score"] <= 1

    def test_get_recommendations_multiple_interests(self, client):
        """Test recommendations with multiple interests"""
        response = client.post(
            "/api/recommendations/get",
            json={"interests": ["STEM", "Business"], "top_k": 10}
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 10
        assert len(data) > 0

    def test_get_recommendations_empty_interests(self, client):
        """Test that empty interests returns error"""
        response = client.post(
            "/api/recommendations/get",
            json={"interests": [], "top_k": 5}
        )
        assert response.status_code == 400

    def test_get_recommendations_invalid_interest(self, client):
        """Test invalid interest name"""
        response = client.post(
            "/api/recommendations/get",
            json={"interests": ["InvalidInterest"], "top_k": 5}
        )
        assert response.status_code == 400
        assert "Invalid interests" in response.json()["detail"]

    def test_recommendations_sorted_by_score(self, client):
        """Test that recommendations are sorted by relevance score"""
        response = client.post(
            "/api/recommendations/get",
            json={"interests": ["STEM"], "top_k": 10}
        )
        assert response.status_code == 200
        data = response.json()

        # Check sorted by score (descending)
        scores = [rec["score"] for rec in data]
        assert scores == sorted(scores, reverse=True)

    def test_recommendations_no_duplicates(self, client):
        """Test that recommendations have no duplicates"""
        response = client.post(
            "/api/recommendations/get",
            json={"interests": ["STEM", "Finance"], "top_k": 20}
        )
        assert response.status_code == 200
        data = response.json()

        post_ids = [rec["post_id"] for rec in data]
        assert len(post_ids) == len(set(post_ids))  # No duplicates
