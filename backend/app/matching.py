import os
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("matching_algo")

# LLM imports
try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False

TIERS = {
    "nano": (1_000, 10_000),
    "micro": (10_000, 50_000),
    "mid": (50_000, 500_000),
    "macro": (500_000, 1_000_000),
    "mega": (1_000_000, float("inf"))
}

TARGET_MAP = {
    "1k-10k": "nano", "10k-50k": "micro", "50k-500k": "mid",
    "500k-1m": "macro", "1m+": "mega",
    "nano": "nano", "micro": "micro", "mid": "mid",
    "macro": "macro", "mega": "mega"
}

def calculate_v1_score(entity: dict, target: dict) -> dict:
    try:
        e_type = str(entity.get("type", "")).strip().lower()
        t_type = str(target.get("type", "")).strip().lower()
        
        # Eğer işletme eşleşmeyi başlatıyorsa (entity=business), skoru doğru hesaplamak için rolleri yer değiştir.
        if e_type in ["business", "işletme"]:
            candidate = target
            listing = entity
        else:
            candidate = entity
            listing = target
            
        is_worker = str(candidate.get("type", "")).strip().lower() in ["worker", "employee", "çalışan"]
        
        # --- ORTAK BİLEŞENLER ---
        # Konum Uyumu (Max 20 Puan)
        e_city = str(candidate.get("city", "")).strip().lower()
        t_city = str(listing.get("city", "")).strip().lower()
        
        location_match = 5
        if e_city and t_city and e_city == t_city:
            location_match = 20

        # Aktiflik/Zamanellik Skoru (Max 10 Puan)
        activity = 0
        last_active = candidate.get("last_active_at")
        if last_active:
            try:
                active_date = datetime.strptime(str(last_active), "%Y-%m-%d").date()
                today = datetime.now().date()
                delta = (today - active_date).days
                if delta <= 7:
                    activity = 10
                elif delta <= 30:
                    activity = 5
            except ValueError:
                pass

        reasons = []
        breakdown = {"location_match": location_match, "activity": activity}
        
        if is_worker:
            # --- ÇALIŞAN (WORKER) BİLEŞENLERİ ---
            
            # 1. Pozisyon Uyumu (Max 35 Puan)
            preferred = candidate.get("preferred_positions", [])
            if isinstance(preferred, str):
                preferred = [preferred]
            target_pos = listing.get("position_id")
            
            position_match = 35 if (target_pos and target_pos in preferred) else 10
            
            # 2. Deneyim Yılı Uyumu (Max 20 Puan)
            try:
                w_exp = float(candidate.get("experience_years", 0))
                j_req = float(listing.get("required_experience_years", 0))
                if w_exp >= j_req:
                    experience_match = 20
                else:
                    ratio = w_exp / (j_req if j_req > 0 else 1)
                    experience_match = int(20 * ratio)
            except (ValueError, TypeError):
                experience_match = 10
                
            # 3. Maaş Beklentisi Uyumu (Max 15 Puan)
            try:
                w_min = float(candidate.get("rate_range", {}).get("min", 0))
                j_wage = float(listing.get("wage", {}).get("amount", 0))
                
                if w_min == 0 or j_wage == 0:
                    wage_match = 10
                elif j_wage >= w_min:
                    wage_match = 15
                elif j_wage >= w_min * 0.8:
                    wage_match = 7
                else:
                    wage_match = 0
            except (ValueError, TypeError, AttributeError):
                wage_match = 10
                
            total = position_match + location_match + experience_match + wage_match + activity
            final_score = max(10, min(92, total))
            
            if position_match == 35: reasons.append("Pozisyon beklentileri tam uyuşuyor.")
            if location_match == 20: reasons.append("Aynı şehir avantajı var.")
            if experience_match == 20: reasons.append("Aranan tecrübe süresini tam karşılıyor.")
            if wage_match == 15: reasons.append("Ücret beklentisi ile teklif uyumlu.")
            if activity == 10: reasons.append("Aday çok aktif ve güncel.")
            
            breakdown.update({
                "position_match": position_match,
                "experience_match": experience_match,
                "wage_match": wage_match
            })
            
        else:
            # --- INFLUENCER BİLEŞENLERİ ---
            
            # 1. Semantic/Niş Uyumu (Max 35 Puan)
            e_niche = str(candidate.get("niche", "")).strip().lower()
            t_niche = str(listing.get("niche", "")).strip().lower()
            
            semantic_match = 10
            if e_niche and t_niche:
                if e_niche == t_niche:
                    semantic_match = 35
                else:
                    adjacent_pairs = [
                        {"moda", "güzellik"}, {"moda", "yaşam"},
                        {"yemek", "yaşam"}, {"spor", "yaşam"},
                        {"spor", "teknoloji"}
                    ]
                    if {e_niche, t_niche} in adjacent_pairs:
                        semantic_match = 20

            # 2. Takipçi Tier Uyumu (Max 20 Puan)
            try:
                followers = int(candidate.get("followers", 0))
            except (ValueError, TypeError):
                followers = 0
                
            target_str = str(listing.get("target_followers", "micro")).strip().lower().replace(" ", "")
            target_tier = TARGET_MAP.get(target_str, "micro")
            
            e_tier = "nano"
            for t_name, (low, high) in TIERS.items():
                if low <= followers < high:
                    e_tier = t_name
                    break
                    
            tier_fit = 0
            if e_tier == target_tier:
                tier_fit = 20
            else:
                tier_order = ["nano", "micro", "mid", "macro", "mega"]
                try:
                    e_idx = tier_order.index(e_tier)
                    t_idx = tier_order.index(target_tier)
                    if abs(e_idx - t_idx) == 1:
                        tier_fit = 10
                except ValueError:
                    pass

            # 3. Etkileşim Oranı (Max 15 Puan)
            try:
                engagement_val = float(candidate.get("engagement_rate", 0.0))
            except (ValueError, TypeError):
                engagement_val = 0.0
                
            engagement = 0
            if engagement_val >= 0.05:
                engagement = 15
            elif engagement_val >= 0.03:
                engagement = 10
            elif engagement_val >= 0.01:
                engagement = 5
                
            total = semantic_match + location_match + tier_fit + engagement + activity
            final_score = max(10, min(92, total))
            
            if semantic_match == 35:
                reasons.append("Moda nişi tam örtüşüyor." if e_niche == "moda" else "Niş tam örtüşüyor.")
            elif semantic_match == 20:
                reasons.append("Benzer veya tamamlayıcı sektörlerde çalışıyorsunuz.")
                
            if location_match == 20: reasons.append("Aynı şehir avantajı var.")
            if tier_fit == 20: reasons.append("Takipçi kitlesi işletmenin beklentisiyle tam uyumlu.")
            if engagement == 15: reasons.append("Çok güçlü bir etkileşim oranına sahip.")
            if activity == 10: reasons.append("Hesap çok aktif ve güncel.")
            
            breakdown.update({
                "semantic_match": semantic_match,
                "tier_fit": tier_fit,
                "engagement": engagement
            })

        if not reasons:
            reasons.append("Ortalama bir uyum yakalandı.")

        return {
            "score": final_score,
            "reasons": reasons[:3], # En güçlü 3 gerekçe
            "breakdown": breakdown
        }
    except Exception as e:
        logger.error(f"Uyum skoru hesaplanırken beklenmeyen hata: {e}", exc_info=True)
        return {
            "score": 50,
            "reasons": ["Sistem optimizasyonu yapılıyor..."],
            "breakdown": {
                "location_match": 10,
                "activity": 10
            }
        }

def filter_discoverable_profiles(user_role: str, profiles: list) -> list:
    """
    3'lü rol yapısını yöneten keşif filtreleme fonksiyonu.
    """
    role = str(user_role).strip().lower()
    allowed_types = set()
    
    if role == "influencer":
        allowed_types = {"business", "collaboration_listing"}
    elif role in ["worker", "employee", "çalışan"]:
        allowed_types = {"business", "job_listing"}
    elif role in ["business", "işletme"]:
        allowed_types = {"influencer", "worker", "employee"}
        
    filtered = []
    for p in profiles:
        p_type = str(p.get("type", "")).strip().lower()
        if p_type in allowed_types:
            filtered.append(p)
            
    return filtered
