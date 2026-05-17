import unittest
import sys
import os

# app modülünün import edilebilmesi için path ayarla
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.matching import calculate_score, niche_score, follower_score, location_score, engagement_score, get_allowed_discover_types, filter_discoverable_profiles

class TestMatchingAlgorithm(unittest.TestCase):

    def setUp(self):
        # 1. Senaryo: Mükemmel Uyum (Ideal Match)
        self.inf_ideal = {
            "id": "inf_1",
            "name": "Ayşe Kaya",
            "niche": "moda",
            "followers": 28000,
            "city": "İstanbul",
            "engagement_rate": 0.042  # %4.2 (güçlü)
        }
        self.biz_ideal = {
            "id": "biz_1",
            "name": "Kahve & Stil Cafe",
            "niche": "moda",
            "city": "İstanbul",
            "target_followers": "10k-50k"
        }

        # 2. Senaryo: Kısmi Uyum (Partial Match)
        self.inf_partial = {
            "id": "inf_2",
            "name": "Buse Tekin",
            "niche": "moda",
            "followers": 5000,        # nano tier
            "city": "İzmir",
            "engagement_rate": 0.015  # %1.5 (ortalama)
        }
        self.biz_partial = {
            "id": "biz_2",
            "name": "Güzellik Merkezi",
            "niche": "güzellik",       # komşu niş
            "city": "İstanbul",        # farklı şehir
            "target_followers": "10k-50k"  # micro tier (1 tier sapma: nano vs micro)
        }

        # 3. Senaryo: Düşük Uyum / Uyumsuz (Low/No Match)
        self.inf_low = {
            "id": "inf_3",
            "name": "Can Aksoy",
            "niche": "yemek",
            "followers": 800000,      # macro tier
            "city": "Ankara",
            "engagement_rate": 0.005  # %0.5 (düşük)
        }
        self.biz_low = {
            "id": "biz_3",
            "name": "Performans Gym",
            "niche": "spor",           # tamamen farklı
            "city": "İstanbul",        # farklı şehir
            "target_followers": "1k-10k"  # nano tier (3 tier sapma: macro vs nano)
        }

    def test_niche_score(self):
        # Tam eşleşme: 40 puan
        self.assertEqual(niche_score(self.inf_ideal, self.biz_ideal), 40)
        # Komşu/Yakın niş eşleşmesi: 20 puan
        self.assertEqual(niche_score(self.inf_partial, self.biz_partial), 20)
        # Tamamen alakasız nişler: 0 puan
        self.assertEqual(niche_score(self.inf_low, self.biz_low), 0)

    def test_follower_score(self):
        # Tam eşleşme (micro vs micro): 25 puan
        self.assertEqual(follower_score(self.inf_ideal, self.biz_ideal), 25)
        # 1 tier sapma (nano vs micro): 10 puan
        self.assertEqual(follower_score(self.inf_partial, self.biz_partial), 10)
        # Büyük sapma (macro vs nano): 0 puan
        self.assertEqual(follower_score(self.inf_low, self.biz_low), 0)

    def test_location_score(self):
        # Aynı şehir: 20 puan
        self.assertEqual(location_score(self.inf_ideal, self.biz_ideal), 20)
        # Farklı şehir: 5 puan
        self.assertEqual(location_score(self.inf_partial, self.biz_partial), 5)

    def test_engagement_score(self):
        # %4.2 -> 10 puan
        self.assertEqual(engagement_score(self.inf_ideal), 10)
        # %1.5 -> 5 puan
        self.assertEqual(engagement_score(self.inf_partial), 5)
        # %0.5 -> 2 puan
        self.assertEqual(engagement_score(self.inf_low), 2)

    def test_calculate_score_ideal(self):
        # Toplam: 40 + 25 + 20 + 10 = 95 -> clamped to 92
        result = calculate_score(self.inf_ideal, self.biz_ideal)
        self.assertEqual(result["score"], 92)
        self.assertEqual(result["breakdown"]["niche_match"], 40)
        self.assertEqual(result["breakdown"]["follower_fit"], 25)
        self.assertEqual(result["breakdown"]["location_match"], 20)
        self.assertEqual(result["breakdown"]["engagement"], 10)
        # Gerekçelerin eklendiğini kontrol et
        self.assertTrue(len(result["reasons"]) >= 4)
        self.assertTrue(any("tam olarak örtüşüyor" in r for r in result["reasons"]))
        self.assertTrue(any("tam uyumlu" in r for r in result["reasons"]))

    def test_calculate_score_partial(self):
        # Toplam: 20 + 10 + 5 + 5 = 40
        result = calculate_score(self.inf_partial, self.biz_partial)
        self.assertEqual(result["score"], 40)
        self.assertEqual(result["breakdown"]["niche_match"], 20)
        self.assertEqual(result["breakdown"]["follower_fit"], 10)
        self.assertEqual(result["breakdown"]["location_match"], 5)
        self.assertEqual(result["breakdown"]["engagement"], 5)

    def test_calculate_score_low(self):
        # Toplam: 0 + 0 + 5 + 2 = 7 -> clamped to 10 (minimum limit)
        result = calculate_score(self.inf_low, self.biz_low)
        self.assertEqual(result["score"], 10)
        self.assertEqual(result["breakdown"]["niche_match"], 0)
        self.assertEqual(result["breakdown"]["follower_fit"], 0)
        self.assertEqual(result["breakdown"]["location_match"], 5)
        self.assertEqual(result["breakdown"]["engagement"], 2)

    def test_error_tolerance(self):
        # Boş / Eksik veri durumunda çökmemeli ve makul bir skor üretmeli
        empty_inf = {}
        empty_biz = {}
        result = calculate_score(empty_inf, empty_biz)
        self.assertIsInstance(result, dict)
        self.assertTrue(10 <= result["score"] <= 92)
        self.assertIn("score", result)
        self.assertIn("reasons", result)
        self.assertIn("breakdown", result)

        # Hatalı veri tipleri
        corrupted_inf = {"followers": "çok fazla", "engagement_rate": "belirsiz"}
        result = calculate_score(corrupted_inf, empty_biz)
        self.assertTrue(10 <= result["score"] <= 92)

    def test_discovery_filtering(self):
        # 1. get_allowed_discover_types testleri
        self.assertEqual(get_allowed_discover_types("influencer"), ["business"])
        self.assertEqual(get_allowed_discover_types("employee"), ["business"])
        self.assertEqual(get_allowed_discover_types("çalışan"), ["business"])
        self.assertEqual(get_allowed_discover_types("business"), ["influencer"])
        self.assertEqual(get_allowed_discover_types("işletme"), ["influencer"])
        self.assertEqual(get_allowed_discover_types("unknown"), [])

        # 2. filter_discoverable_profiles testleri
        profiles_pool = [
            {"id": "inf_1", "type": "influencer", "name": "Ayşe"},
            {"id": "inf_2", "type": "influencer", "name": "Fatma"},
            {"id": "biz_1", "type": "business", "name": "Kafe A"},
            {"id": "biz_2", "type": "business", "name": "Butik B"},
            {"id": "emp_1", "type": "employee", "name": "Ahmet"}
        ]

        # Influencer sadece business görmeli (kendisi hariç)
        inf_user = {"id": "inf_1", "type": "influencer"}
        filtered_for_inf = filter_discoverable_profiles(inf_user, profiles_pool)
        self.assertEqual(len(filtered_for_inf), 2)
        self.assertTrue(all(p["type"] == "business" for p in filtered_for_inf))

        # Employee sadece business görmeli (kendisi hariç)
        emp_user = {"id": "emp_1", "type": "employee"}
        filtered_for_emp = filter_discoverable_profiles(emp_user, profiles_pool)
        self.assertEqual(len(filtered_for_emp), 2)
        self.assertTrue(all(p["type"] == "business" for p in filtered_for_emp))

        # Business sadece influencer görmeli (kendisi hariç)
        biz_user = {"id": "biz_1", "type": "business"}
        filtered_for_biz = filter_discoverable_profiles(biz_user, profiles_pool)
        self.assertEqual(len(filtered_for_biz), 2)
        self.assertTrue(all(p["type"] == "influencer" for p in filtered_for_biz))


if __name__ == "__main__":
    unittest.main()
