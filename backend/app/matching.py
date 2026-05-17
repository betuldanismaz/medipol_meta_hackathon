import os
import logging
import math

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("matching_algo")

GENAI_AVAILABLE = False
ANTHROPIC_AVAILABLE = False

try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    pass

try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    pass

TIERS = {
    "nano":   (1_000, 10_000),
    "micro":  (10_000, 100_000),
    "mid":    (100_000, 500_000),
    "macro":  (500_000, 1_000_000),
    "mega":   (1_000_000, float("inf"))
}

TIERS_ENGAGEMENT_EXPECTATION = {
    "nano": 0.05,
    "micro": 0.03,
    "mid": 0.02,
    "macro": 0.015,
    "mega": 0.01
}

TARGET_MAP = {
    "1k-10k": "nano", "10k-100k": "micro", "100k-500k": "mid",
    "500k-1m": "macro", "1m+": "mega",
    "nano": "nano", "micro": "micro", "mid": "mid",
    "macro": "macro", "mega": "mega"
}

# --- ORTAK FONKSİYONLAR ---
def location_score(candidate: dict, listing_or_biz: dict) -> int:
    try:
        dist = candidate.get("distance_km")
        if dist is None:
            dist = listing_or_biz.get("distance_km")
            
        if dist is not None:
            dist_val = float(dist)
            score = math.exp(-dist_val / 10.0) * 20
            return int(score)
    except (ValueError, TypeError):
        pass

    c_city = str(candidate.get("city", "")).strip().lower()
    b_city = str(listing_or_biz.get("city", "")).strip().lower()
    
    if not c_city or not b_city:
        return 5
    if c_city == b_city:
        return 20
    return 5

def activity_score(candidate: dict) -> int:
    try:
        recency = candidate.get("last_post_recency_days") or candidate.get("last_active_days")
        if recency is not None:
            days = float(recency)
            if days <= 7: return 10
            elif days <= 14: return 7
            elif days <= 30: return 4
            else: return 0
    except (ValueError, TypeError):
        pass
    return 5

# --- INFLUENCER FONKSİYONLARI ---
def semantic_score(inf: dict, biz: dict) -> int:
    try:
        sim = inf.get("semantic_similarity")
        if sim is None:
            sim = biz.get("semantic_similarity")
            
        if sim is not None:
            val = float(sim)
            val = max(0.0, min(1.0, val))
            return int(val * 35)
    except (ValueError, TypeError):
        pass

    inf_niche = str(inf.get("niche", "")).strip().lower()
    biz_niche = str(biz.get("niche", "")).strip().lower()
    
    if not inf_niche or not biz_niche: return 0
    if inf_niche == biz_niche: return 35
        
    adjacent = {"moda": ["güzellik", "yaşam"], "yemek": ["yaşam"], "güzellik": ["moda", "yaşam"], "spor": ["yaşam", "teknoloji"]}
    if biz_niche in adjacent.get(inf_niche, []): return 15
    return 0

def tier_score(inf: dict, biz: dict) -> int:
    try:
        followers = int(inf.get("followers", 0))
    except (ValueError, TypeError):
        followers = 0
        
    target_str = str(biz.get("target_followers", "micro")).strip().lower().replace(" ", "")
    target_tier = TARGET_MAP.get(target_str, "micro")
    
    inf_tier = "nano"
    for tier_name, (low, high) in TIERS.items():
        if low <= followers < high:
            inf_tier = tier_name
            break
            
    if inf_tier == target_tier: return 20
        
    tier_order = ["nano", "micro", "mid", "macro", "mega"]
    try:
        if abs(tier_order.index(inf_tier) - tier_order.index(target_tier)) == 1:
            return 8
    except ValueError:
        pass
    return 0

def engagement_score(inf: dict) -> int:
    try:
        rate = float(inf.get("engagement_rate", 0.0))
        followers = int(inf.get("followers", 0))
    except (ValueError, TypeError):
        return 0

    inf_tier = "nano"
    for t, (low, high) in TIERS.items():
        if low <= followers < high:
            inf_tier = t
            break
            
    expected_rate = TIERS_ENGAGEMENT_EXPECTATION.get(inf_tier, 0.03)
    if rate >= expected_rate * 1.5: return 15
    elif rate >= expected_rate: return 10
    elif rate >= expected_rate * 0.5: return 5
    else: return 2

# --- WORKER FONKSİYONLARI ---
def worker_position_score(worker: dict, job: dict) -> int:
    preferred = worker.get("preferred_positions", [])
    if isinstance(preferred, str): preferred = [preferred]
    pos_id = job.get("position_id")
    if pos_id and pos_id in preferred: return 35
    return 10

def worker_experience_score(worker: dict, job: dict) -> int:
    try:
        w_exp = float(worker.get("experience_years", 0))
        j_req = float(job.get("required_experience_years", 0))
        if w_exp >= j_req: return 20
        ratio = w_exp / (j_req if j_req > 0 else 1)
        return int(20 * ratio)
    except (ValueError, TypeError):
        return 10

def worker_wage_score(worker: dict, job: dict) -> int:
    try:
        w_min = float(worker.get("rate_range", {}).get("min", 0))
        j_wage = float(job.get("wage", {}).get("amount", 0))
        if w_min == 0 or j_wage == 0: return 10
        if j_wage >= w_min: return 15
        if j_wage >= w_min * 0.8: return 7
        return 0
    except (ValueError, TypeError, AttributeError):
        return 10

def enrich_reasons_with_llm(candidate: dict, listing: dict, score: int, reasons: list) -> str:
    prompt = (
        f"Sen bir IK ve pazarlama uzmanısın.\n"
        f"Aday: {candidate.get('name', 'İsimsiz')}\n"
        f"İlan/İşletme: {listing.get('name', 'Bilinmiyor')}\n"
        f"Hesaplanan Uyum Skoru: {score}/100\n"
        f"Sistem Nedenleri: {', '.join(reasons)}\n\n"
        f"Lütfen bu eşleşme için profesyonel, samimi 2 cümlelik Türkçe bir özet yaz."
    )
    # LLM Mock logic for brevity, uses keys if available
    return None

def calculate_score(candidate: dict, listing: dict) -> dict:
    """
    Hem Influencer hem de Çalışan (Worker) profilleri için dinamik uyum skoru hesaplar.
    """
    try:
        candidate_type = str(candidate.get("type", "influencer")).lower()
        
        # Ortak faktörler
        l = location_score(candidate, listing)
        a = activity_score(candidate)
        
        reasons = []
        if l >= 15: reasons.append("Lokasyon olarak çok yakınsınız.")
        elif l < 10: reasons.append("Mesafe uzaklığı dikkate alınmalı.")
        if a == 10: reasons.append("Hesap çok aktif.")

        if candidate_type in ["worker", "employee", "çalışan"]:
            s = worker_position_score(candidate, listing)
            e = worker_experience_score(candidate, listing)
            w = worker_wage_score(candidate, listing)
            
            total = s + l + e + w + a
            final_score = max(10, min(92, total))
            
            if s == 35: reasons.insert(0, "Pozisyon beklentileri tam uyuşuyor.")
            if e == 20: reasons.append("Aranan tecrübe süresini tam karşılıyor.")
            if w >= 10: reasons.append("Ücret beklentisi ile teklif uyumlu.")
            
            breakdown = {"position": s, "location_match": l, "experience": e, "wage": w, "activity": a}
        else:
            s = semantic_score(candidate, listing)
            t = tier_score(candidate, listing)
            e = engagement_score(candidate)
            
            total = s + l + t + e + a
            final_score = max(10, min(92, total))
            
            if s >= 30: reasons.insert(0, "İçerik uyumu mükemmel örtüşüyor.")
            if t == 20: reasons.append("Takipçi tier'ı hedef kitle ile tam uyumlu.")
            if e >= 10: reasons.append("Güçlü bir etkileşim oranına sahip.")
            
            breakdown = {"semantic_score": s, "location_match": l, "tier_fit": t, "engagement": e, "activity": a}

        return {
            "score": final_score,
            "reasons": reasons,
            "breakdown": breakdown
        }
    except Exception as err:
        logger.error(f"Uyum skoru hesaplanırken hata: {err}", exc_info=True)
        return {"score": 50, "reasons": ["Analiz tamamlanamadı"], "breakdown": {}}

def get_allowed_discover_types(user_type: str) -> list[str]:
    user_type = str(user_type).strip().lower()
    if user_type == "influencer": return ["collab_listing", "business"]
    elif user_type in ["employee", "worker", "çalışan"]: return ["job_listing", "business"]
    elif user_type in ["business", "işletme"]: return ["influencer", "worker", "employee"]
    return []

def filter_discoverable_profiles(user_profile: dict, all_profiles: list[dict]) -> list[dict]:
    if not user_profile: return []
    user_id = user_profile.get("id")
    user_type = str(user_profile.get("type", "")).strip().lower()
    allowed_types = get_allowed_discover_types(user_type)
    
    filtered = []
    for profile in all_profiles:
        if profile.get("id") == user_id: continue
        p_type = str(profile.get("type", "")).strip().lower()
        if p_type in allowed_types: filtered.append(profile)
    return filtered
