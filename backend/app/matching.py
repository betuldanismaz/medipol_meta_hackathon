import os
import logging
import math

# Loglama ayarı
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("matching_algo")

# LLM Kütüphanelerini güvenle import et
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

# Takipçi ve Niş Tanımlamaları (V1 Final)
TIERS = {
    "nano":   (1_000, 10_000),
    "micro":  (10_000, 100_000),
    "mid":    (100_000, 500_000),
    "macro":  (500_000, 1_000_000),
    "mega":   (1_000_000, float("inf"))
}

# Beklenen minimum etkileşim oranları
TIERS_ENGAGEMENT_EXPECTATION = {
    "nano": 0.05,    # %5
    "micro": 0.03,   # %3
    "mid": 0.02,     # %2
    "macro": 0.015,  # %1.5
    "mega": 0.01     # %1
}

# Hedef tier parse helper
TARGET_MAP = {
    "1k-10k": "nano",
    "10k-100k": "micro",
    "100k-500k": "mid",
    "500k-1m": "macro",
    "1m+": "mega",
    "nano": "nano",
    "micro": "micro",
    "mid": "mid",
    "macro": "macro",
    "mega": "mega"
}

def semantic_score(inf: dict, biz: dict) -> int:
    """Semantic similarity hesaplar (max 35 puan)."""
    # Öncelikli olarak mock/api'den gelen semantic_similarity (0-1 arası) varsa kullan
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

    # Fallback: Kural tabanlı niş uyumu
    inf_niche = str(inf.get("niche", "")).strip().lower()
    biz_niche = str(biz.get("niche", "")).strip().lower()
    
    if not inf_niche or not biz_niche:
        return 0
        
    if inf_niche == biz_niche:
        return 35
        
    adjacent = {
        "moda": ["güzellik", "yaşam"],
        "yemek": ["yaşam"],
        "güzellik": ["moda", "yaşam"],
        "spor": ["yaşam", "teknoloji"]
    }
    
    if biz_niche in adjacent.get(inf_niche, []):
        return 15
        
    return 0

def location_score(inf: dict, biz: dict) -> int:
    """Konum uyumunu hesaplar (max 20 puan)."""
    # Girdide distance_km varsa formüle göre hesapla
    try:
        dist = inf.get("distance_km")
        if dist is None:
            dist = biz.get("distance_km")
            
        if dist is not None:
            dist_val = float(dist)
            # 0km -> 20, 10km -> ~7.3, 20km -> ~2.7
            score = math.exp(-dist_val / 10.0) * 20
            return int(score)
    except (ValueError, TypeError):
        pass

    # Fallback: Şehir eşleşmesi
    inf_city = str(inf.get("city", "")).strip().lower()
    biz_city = str(biz.get("city", "")).strip().lower()
    
    if not inf_city or not biz_city:
        return 5  # Dijital işbirliği yapılabilir
        
    if inf_city == biz_city:
        return 20
        
    return 5

def tier_score(inf: dict, biz: dict) -> int:
    """Tier uyumunu hesaplar (max 20 puan)."""
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
            
    if inf_tier == target_tier:
        return 20
        
    tier_order = ["nano", "micro", "mid", "macro", "mega"]
    try:
        inf_idx = tier_order.index(inf_tier)
        target_idx = tier_order.index(target_tier)
        if abs(inf_idx - target_idx) == 1:
            return 8
    except ValueError:
        pass
        
    return 0

def engagement_score(inf: dict) -> int:
    """Etkileşim oranı kalitesini skorlar (max 15 puan)."""
    try:
        rate = float(inf.get("engagement_rate", 0.0))
        followers = int(inf.get("followers", 0))
    except (ValueError, TypeError):
        return 0

    inf_tier = "nano"
    for tier_name, (low, high) in TIERS.items():
        if low <= followers < high:
            inf_tier = tier_name
            break
            
    expected_rate = TIERS_ENGAGEMENT_EXPECTATION.get(inf_tier, 0.03)
    
    # Beklenene kıyasla performans ölçümü
    if rate >= expected_rate * 1.5:
        return 15  # Çok güçlü
    elif rate >= expected_rate:
        return 10  # Beklentiyi karşılıyor
    elif rate >= expected_rate * 0.5:
        return 5   # Ortalama
    else:
        return 2   # Düşük

def activity_score(inf: dict) -> int:
    """Aktiflik (son post) kalitesini skorlar (max 10 puan)."""
    try:
        recency = inf.get("last_post_recency_days")
        if recency is not None:
            days = float(recency)
            if days <= 7: return 10
            elif days <= 14: return 7
            elif days <= 30: return 4
            else: return 0
    except (ValueError, TypeError):
        pass
    
    # Fallback: Eğer elimizde recency_days yoksa varsayılan 5 puan
    return 5

def enrich_reasons_with_llm(influencer: dict, business: dict, score: int, reasons: list) -> str:
    """
    Uyum skorunu ve temel gerekçeleri alarak, LLM aracılığıyla 
    2 cümlelik ikna edici ve profesyonel bir Türkçe açıklama üretir.
    """
    prompt = (
        f"Sen bir influencer pazarlama uzmanısın.\n"
        f"Influencer: {influencer.get('name', 'İsimsiz')}, Niş: {influencer.get('niche', 'Bilinmiyor')}, {influencer.get('followers', 0):,} takipçi\n"
        f"İşletme/İlan: {business.get('name', 'İşletme/İlan')}, Niş: {business.get('niche', 'Bilinmiyor')}\n"
        f"Hesaplanan Uyum Skoru: {score}/100\n"
        f"Temel Sebepler: {', '.join(reasons)}\n\n"
        f"Lütfen bu eşleşme için kısa, profesyonel, samimi ve ikna edici 2 cümlelik bir açıklama yaz. Türkçe olsun. "
        f"Başka hiçbir şey ekleme, doğrudan açıklamayı yaz."
    )
    
    gemini_key = os.getenv("GEMINI_API_KEY")
    if GENAI_AVAILABLE and gemini_key:
        try:
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(prompt)
            if response and response.text:
                return response.text.strip()
        except Exception as ex:
            logger.warning(f"Gemini API ile zenginleştirme başarısız oldu: {ex}")
            
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    if ANTHROPIC_AVAILABLE and anthropic_key:
        try:
            client = anthropic.Anthropic(api_key=anthropic_key)
            response = client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=150,
                messages=[{"role": "user", "content": prompt}]
            )
            if response and response.content:
                return response.content[0].text.strip()
        except Exception as ex:
            logger.warning(f"Claude API ile zenginleştirme başarısız oldu: {ex}")
            
    return None

def calculate_score(influencer: dict, business: dict) -> dict:
    """
    V1 Final Uyum skoru hesaplayıcı. 5 Faktör: Semantic(35) + Location(20) + Tier(20) + Engagement(15) + Activity(10)
    """
    try:
        inf_name = str(influencer.get("name", "İsimsiz")).strip()
        biz_name = str(business.get("name", "İşletme")).strip()
        
        s = semantic_score(influencer, business)
        l = location_score(influencer, business)
        t = tier_score(influencer, business)
        e = engagement_score(influencer)
        a = activity_score(influencer)
        
        total = s + l + t + e + a
        final_score = max(10, min(92, total))
        
        reasons = []
        if s >= 30: reasons.append("İçerikleriniz ve ilan detayları anlamsal olarak mükemmel örtüşüyor.")
        elif s >= 15: reasons.append("Kategorileriniz birbirini güzel destekliyor.")
        else: reasons.append("İçerik uyumu düşük olsa da diğer metrikler üzerinden potansiyel barındırıyor.")

        if l >= 15: reasons.append("Birbirinize lokasyon olarak çok yakınsınız.")
        elif l >= 5: reasons.append("Lokasyon farklılığı online veya kargo işbirlikleriyle aşılabilir.")
        else: reasons.append("Mesafe uzaklığı dikkate alınmalı.")

        if t == 20: reasons.append("Takipçi tier'ı hedef kitle beklentisiyle tam uyumlu.")
        elif t == 8: reasons.append("Hedef tier beklentisine yakın bir profili var.")

        if e >= 10: reasons.append("Kendi ölçeğine göre güçlü bir etkileşim oranına sahip.")
        elif e <= 2: reasons.append("Etkileşim oranı biraz daha yüksek olabilirdi.")

        if a == 10: reasons.append("Hesap çok aktif, yakın zamanda paylaşım yapmış.")
        
        clean_inf = {"name": inf_name, "niche": str(influencer.get("niche", "")), "followers": influencer.get("followers", 0)}
        clean_biz = {"name": biz_name, "niche": str(business.get("niche", ""))}
        llm_reasoning = enrich_reasons_with_llm(clean_inf, clean_biz, final_score, reasons)
        
        result = {
            "score": final_score,
            "reasons": reasons,
            "breakdown": {
                "semantic_score": s,
                "location_match": l,
                "tier_fit": t,
                "engagement": e,
                "activity": a
            }
        }
        
        if llm_reasoning:
            result["llm_explanation"] = llm_reasoning
            result["reasons"].insert(0, llm_reasoning)
            
        return result
        
    except Exception as err:
        logger.error(f"Uyum skoru hesaplanırken beklenmedik hata: {err}", exc_info=True)
        return {
            "score": 50,
            "reasons": ["Eşleştirme analizi beklenmedik bir durum nedeniyle tamamlanamadı, standart uyum skorlandı."],
            "breakdown": {
                "semantic_score": 15,
                "location_match": 10,
                "tier_fit": 10,
                "engagement": 10,
                "activity": 5
            }
        }

def get_allowed_discover_types(user_type: str) -> list[str]:
    """
    Kullanıcı rolüne göre karşısına çıkabilecek hedef profil tiplerini döner.
    V1 Spesifikasyonuna göre:
    - influencer -> collab_listing, business
    - employee / çalışan -> job_listing, business
    - business -> influencer, employee (worker)
    """
    user_type = str(user_type).strip().lower()
    if user_type == "influencer":
        return ["collab_listing", "business"]
    elif user_type in ["employee", "worker", "çalışan"]:
        return ["job_listing", "business"]
    elif user_type in ["business", "işletme"]:
        return ["influencer", "worker", "employee"]
    return []

def filter_discoverable_profiles(user_profile: dict, all_profiles: list[dict]) -> list[dict]:
    """Kullanıcının kendi profil bilgisine göre keşif havuzundaki profilleri filtreler."""
    if not user_profile: return []
    user_id = user_profile.get("id")
    user_type = str(user_profile.get("type", "")).strip().lower()
    allowed_types = get_allowed_discover_types(user_type)
    
    filtered = []
    for profile in all_profiles:
        if profile.get("id") == user_id:
            continue
        p_type = str(profile.get("type", "")).strip().lower()
        if p_type in allowed_types:
            filtered.append(profile)
    return filtered
