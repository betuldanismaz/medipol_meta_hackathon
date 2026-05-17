import unittest
from datetime import datetime, timedelta
from app.matching import calculate_v1_score, filter_discoverable_profiles

class TestInfluMatchV1Final(unittest.TestCase):
    def setUp(self):
        self.today_str = datetime.now().strftime("%Y-%m-%d")
        self.old_str = (datetime.now() - timedelta(days=15)).strftime("%Y-%m-%d")

    def test_semantic_match_exact(self):
        e = {"niche": "moda"}
        t = {"niche": "moda"}
        res = calculate_v1_score(e, t)
        self.assertEqual(res["breakdown"]["semantic_match"], 35)

    def test_semantic_match_adjacent(self):
        e = {"niche": "moda"}
        t = {"niche": "güzellik"}
        res = calculate_v1_score(e, t)
        self.assertEqual(res["breakdown"]["semantic_match"], 20)

    def test_location_match(self):
        e = {"city": "istanbul"}
        t = {"city": "istanbul"}
        res = calculate_v1_score(e, t)
        self.assertEqual(res["breakdown"]["location_match"], 20)
        
        t2 = {"city": "ankara"}
        res2 = calculate_v1_score(e, t2)
        self.assertEqual(res2["breakdown"]["location_match"], 5)

    def test_tier_fit_exact(self):
        e = {"followers": 25000} # micro
        t = {"target_followers": "micro"}
        res = calculate_v1_score(e, t)
        self.assertEqual(res["breakdown"]["tier_fit"], 20)

    def test_tier_fit_adjacent(self):
        e = {"followers": 25000} # micro
        t = {"target_followers": "mid"}
        res = calculate_v1_score(e, t)
        self.assertEqual(res["breakdown"]["tier_fit"], 10)

    def test_engagement_rate(self):
        e = {"engagement_rate": 0.06} # >= 5%
        t = {}
        res = calculate_v1_score(e, t)
        self.assertEqual(res["breakdown"]["engagement"], 15)

    def test_activity_score(self):
        e = {"last_active_at": self.today_str}
        t = {}
        res = calculate_v1_score(e, t)
        self.assertEqual(res["breakdown"]["activity"], 10)
        
        e2 = {"last_active_at": self.old_str}
        res2 = calculate_v1_score(e2, t)
        self.assertEqual(res2["breakdown"]["activity"], 5)

    def test_clamping_and_total(self):
        e = {
            "niche": "moda", "city": "istanbul", 
            "followers": 25000, "engagement_rate": 0.06,
            "last_active_at": self.today_str
        }
        t = {"niche": "moda", "city": "istanbul", "target_followers": "micro"}
        res = calculate_v1_score(e, t)
        # 35 + 20 + 20 + 15 + 10 = 100 -> clamped to 92
        self.assertEqual(res["score"], 92)

    def test_error_fallback(self):
        # Pass a completely invalid object that might throw errors internally if not guarded
        class BadObject:
            def get(self, *args):
                raise TypeError("Kötü Obje")
        
        res = calculate_v1_score(BadObject(), {})
        self.assertEqual(res["score"], 50)
        self.assertIn("Sistem optimizasyonu yapılıyor...", res["reasons"])

    def test_filter_discoverable_influencer(self):
        profiles = [
            {"type": "business"}, {"type": "collaboration_listing"},
            {"type": "influencer"}, {"type": "job_listing"}
        ]
        res = filter_discoverable_profiles("influencer", profiles)
        self.assertEqual(len(res), 2)
        types = [p["type"] for p in res]
        self.assertIn("business", types)
        self.assertIn("collaboration_listing", types)

    def test_filter_discoverable_business(self):
        profiles = [
            {"type": "business"}, {"type": "worker"},
            {"type": "influencer"}, {"type": "job_listing"}
        ]
        res = filter_discoverable_profiles("business", profiles)
        self.assertEqual(len(res), 2)
        types = [p["type"] for p in res]
        self.assertIn("influencer", types)
        self.assertIn("worker", types)

    def test_worker_position_score(self):
        worker = {"type": "worker", "preferred_positions": ["pos_001", "pos_002"]}
        job = {"position_id": "pos_002"}
        res = calculate_v1_score(worker, job)
        self.assertEqual(res["breakdown"]["position_match"], 35)

    def test_worker_experience_score(self):
        worker = {"type": "worker", "experience_years": 2}
        job = {"required_experience_years": 1}
        res = calculate_v1_score(worker, job)
        self.assertEqual(res["breakdown"]["experience_match"], 20)

    def test_worker_wage_score(self):
        worker = {"type": "worker", "rate_range": {"min": 100}}
        job = {"wage": {"amount": 120}}
        res = calculate_v1_score(worker, job)
        self.assertEqual(res["breakdown"]["wage_match"], 15)

    def test_worker_integration(self):
        worker = {
            "type": "worker",
            "preferred_positions": ["pos_001"],  # 35
            "city": "istanbul",                  # 20
            "experience_years": 3,               # 20
            "rate_range": {"min": 150},          # 15
            "last_active_at": self.today_str     # 10
        }
        job = {
            "position_id": "pos_001",
            "city": "istanbul",
            "required_experience_years": 2,
            "wage": {"amount": 160}
        }
        res = calculate_v1_score(worker, job)
        self.assertEqual(res["score"], 92) # Clamped
        self.assertEqual(res["breakdown"]["position_match"], 35)

if __name__ == '__main__':
    unittest.main()
