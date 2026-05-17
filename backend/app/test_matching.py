import unittest
from app.matching import (
    calculate_score,
    get_allowed_discover_types,
    filter_discoverable_profiles,
    semantic_score,
    location_score,
    tier_score,
    engagement_score,
    activity_score,
    worker_position_score,
    worker_experience_score,
    worker_wage_score
)

class TestMatchingV1Final(unittest.TestCase):
    
    def test_semantic_score_with_similarity(self):
        # 0.9 similarity -> 0.9 * 35 = 31
        inf = {"semantic_similarity": 0.9}
        biz = {}
        score = semantic_score(inf, biz)
        self.assertEqual(score, 31)

    def test_semantic_score_fallback(self):
        inf = {"niche": "moda"}
        biz = {"niche": "moda"}
        self.assertEqual(semantic_score(inf, biz), 35)
        
        biz2 = {"niche": "güzellik"}
        self.assertEqual(semantic_score(inf, biz2), 15)

    def test_location_score_with_distance(self):
        # distance = 0 -> 20
        # distance = 10 -> exp(-1) * 20 = 7.35 -> 7
        inf = {"distance_km": 10.0}
        biz = {}
        self.assertEqual(location_score(inf, biz), 7)
        
        inf2 = {"distance_km": 0.0}
        self.assertEqual(location_score(inf2, biz), 20)

    def test_location_score_fallback(self):
        inf = {"city": "istanbul"}
        biz = {"city": "istanbul"}
        self.assertEqual(location_score(inf, biz), 20)
        
        biz2 = {"city": "ankara"}
        self.assertEqual(location_score(inf, biz2), 5)

    def test_tier_score(self):
        # inf = 50_000 (micro), biz wants micro -> 20
        inf = {"followers": 50000}
        biz = {"target_followers": "micro"}
        self.assertEqual(tier_score(inf, biz), 20)
        
        # inf = 150_000 (mid), biz wants micro -> off by 1 -> 8
        inf2 = {"followers": 150000}
        self.assertEqual(tier_score(inf2, biz), 8)

    def test_engagement_score(self):
        # Nano (5k followers) expects 0.05. 0.08 is > 0.05 * 1.5 -> 15
        inf = {"followers": 5000, "engagement_rate": 0.08}
        self.assertEqual(engagement_score(inf), 15)
        
        # Nano (5k followers) has 0.02. 0.02 < 0.025 (half) -> 2
        inf2 = {"followers": 5000, "engagement_rate": 0.02}
        self.assertEqual(engagement_score(inf2), 2)

    def test_activity_score(self):
        # 5 days -> 10
        self.assertEqual(activity_score({"last_post_recency_days": 5}), 10)
        # 12 days -> 7
        self.assertEqual(activity_score({"last_post_recency_days": 12}), 7)
        # no data -> 5
        self.assertEqual(activity_score({}), 5)

    def test_calculate_score_integration(self):
        inf = {
            "name": "Ahmet",
            "semantic_similarity": 0.8,     # 0.8 * 35 = 28
            "distance_km": 0,               # 20
            "followers": 50000,             # micro
            "engagement_rate": 0.05,        # micro expects 0.03. 0.05 > 0.045 -> 15
            "last_post_recency_days": 2     # 10
        }
        biz = {
            "name": "Cafe",
            "target_followers": "micro"     # micro == micro -> 20
        }
        # Total = 28 + 20 + 20 + 15 + 10 = 93
        # Should be clamped to 92
        result = calculate_score(inf, biz)
        self.assertEqual(result["score"], 92)
        self.assertEqual(result["breakdown"]["semantic_score"], 28)
        self.assertEqual(result["breakdown"]["location_match"], 20)
        self.assertEqual(result["breakdown"]["tier_fit"], 20)
        self.assertEqual(result["breakdown"]["engagement"], 15)
        self.assertEqual(result["breakdown"]["activity"], 10)

    def test_calculate_score_fallback_and_clamping(self):
        inf = {
            "name": "Kötü",
            "semantic_similarity": 0.1,    # 3
            "distance_km": 50,             # exp(-5)*20 = 0
            "followers": 5000,             # nano
            "engagement_rate": 0.001,      # low -> 2
            "last_post_recency_days": 100  # 0
        }
        biz = {
            "target_followers": "mega"     # nano vs mega -> off by 4 -> 0
        }
        # Total = 3 + 0 + 0 + 2 + 0 = 5
        # Should be clamped to 10
        result = calculate_score(inf, biz)
        self.assertEqual(result["score"], 10)

    def test_get_allowed_discover_types(self):
        self.assertCountEqual(get_allowed_discover_types("influencer"), ["business", "collab_listing"])
        self.assertCountEqual(get_allowed_discover_types("employee"), ["business", "job_listing"])
        self.assertCountEqual(get_allowed_discover_types("worker"), ["business", "job_listing"])
        self.assertCountEqual(get_allowed_discover_types("business"), ["influencer", "employee", "worker"])

    def test_filter_discoverable_profiles(self):
        user = {"id": "1", "type": "influencer"}
        profiles = [
            {"id": "1", "type": "influencer"},
            {"id": "2", "type": "collab_listing"},
            {"id": "3", "type": "business"},
            {"id": "4", "type": "worker"},
            {"id": "5", "type": "job_listing"}
        ]
        filtered = filter_discoverable_profiles(user, profiles)
        self.assertEqual(len(filtered), 2)
        types = [p["type"] for p in filtered]
        self.assertIn("collab_listing", types)
        self.assertIn("business", types)

    def test_worker_position_score(self):
        worker = {"type": "worker", "preferred_positions": ["pos_001", "pos_002"]}
        job = {"position_id": "pos_002"}
        self.assertEqual(worker_position_score(worker, job), 35)
        job2 = {"position_id": "pos_009"}
        self.assertEqual(worker_position_score(worker, job2), 10)

    def test_worker_experience_score(self):
        worker = {"type": "worker", "experience_years": 2}
        job = {"required_experience_years": 1}
        self.assertEqual(worker_experience_score(worker, job), 20)
        
        job2 = {"required_experience_years": 4}
        # 2/4 = 0.5 -> 0.5 * 20 = 10
        self.assertEqual(worker_experience_score(worker, job2), 10)

    def test_worker_wage_score(self):
        worker = {"type": "worker", "rate_range": {"min": 100}}
        job = {"wage": {"amount": 120}}
        self.assertEqual(worker_wage_score(worker, job), 15)
        
        job2 = {"wage": {"amount": 90}}
        self.assertEqual(worker_wage_score(worker, job2), 7)
        
        job3 = {"wage": {"amount": 50}}
        self.assertEqual(worker_wage_score(worker, job3), 0)

    def test_worker_calculate_score_integration(self):
        worker = {
            "type": "worker",
            "preferred_positions": ["pos_001"],  # 35
            "distance_km": 0.0,                  # 20
            "experience_years": 3,               # 20
            "rate_range": {"min": 150},          # 15
            "last_active_days": 2                # 10
        }
        job = {
            "position_id": "pos_001",
            "required_experience_years": 2,
            "wage": {"amount": 160}
        }
        # Total = 35 + 20 + 20 + 15 + 10 = 100
        # Clamped to 92
        result = calculate_score(worker, job)
        self.assertEqual(result["score"], 92)
        self.assertEqual(result["breakdown"]["position"], 35)
        self.assertEqual(result["breakdown"]["location_match"], 20)
        self.assertEqual(result["breakdown"]["experience"], 20)
        self.assertEqual(result["breakdown"]["wage"], 15)
        self.assertEqual(result["breakdown"]["activity"], 10)

if __name__ == '__main__':
    unittest.main()
