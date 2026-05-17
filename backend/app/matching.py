import os
import logging

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


# Takipçi ve Niş Tanımlamaları
TIERS = {
    "nano":   (1_000, 10_000),
    "micro":  (10_000, 50_000),
    "mid":    (50_000, 500_000),
    "macro":  (500_000, float("inf"))
}

TARGET_MAP = {
    "1k-10k": "nano",
    "10k-50k": "micro",
    "50k-500k": "mid",
    "500k+": "macro",
    "nano": "nano",
    "micro": "micro",
    "mid": "mid",
    "macro": "macro"
}


def niche_score(inf: dict, biz: dict) -> int:
    """Niş uyumunu hesaplar (max 40 puan)."""
    inf_niche = inf.get("niche", "").strip().lower()
    biz_niche = biz.get("niche", "").strip().lower()
    
    if not inf_niche or not biz_niche:
        return 0
        
    if inf_niche == biz_niche:
        return 40
        
    # Yakın nişlerin uyumu (ör: moda + güzellik sinerjisi)
    adjacent = {
        "moda": ["güzellik", "yaşam"],
        "yemek": ["yaşam"],
        "güzellik": ["moda", "yaşam"],
        "spor": ["yaşam", "teknoloji"]
    }
    
    if biz_niche in adjacent.get(inf_niche, []):
        return 20
        
    return 0


def follower_score(inf: dict, biz: dict) -> int:
    """Takipçi sayısı ve işletme hedefinin uyumunu hesaplar (max 25 puan)."""
    # Takipçi sayısını sayısal değere güvenle dönüştür
    try:
        followers = int(inf.get("followers", 0))
    except (ValueError, TypeError):
        followers = 0
        
    # default micro
    target_str = str(biz.get("target_followers", "10k-50k")).strip().lower().replace(" ", "")
    target_tier = TARGET_MAP.get(target_str, "micro")
    
    # Influencer'ın hangi tier'da olduğunu bul
    inf_tier = "nano"
    for tier_name, (low, high) in TIERS.items():
        if low <= followers <= high:
            inf_tier = tier_name
            break
            
    if inf_tier == target_tier:
        return 25
        
    # Kısmi puan: 1 tier sapma varsa 10 puan
    tier_order = ["nano", "micro", "mid", "macro"]
    try:
        inf_idx = tier_order.index(inf_tier)
        target_idx = tier_order.index(target_tier)
        if abs(inf_idx - target_idx) == 1:
            return 10
    except ValueError:
        pass
        
    return 0


def location_score(inf: dict, biz: dict) -> int:
    """Konum uyumunu hesaplar (max 20 puan)."""
    inf_city = inf.get("city", "").strip().lower()
    biz_city = biz.get("city", "").strip().lower()
    
    if not inf_city or not biz_city:
        return 5  # Eksik bilgi varsa dijital işbirliği yapılabilir
        
    if inf_city == biz_city:
        return 20
        
    return 5  # Farklı şehirler ama online işbirliği mümkün


def engagement_score(inf: dict) -> int:
    """Etkileşim oranı kalitesini skorlar (max 15 puan)."""
    # Etkileşim oranını float değere güvenle dönüştür
    try:
        rate = float(inf.get("engagement_rate", 0.0))
    except (ValueError, TypeError):
        rate = 0.0
        
    if rate >= 0.06:
        return 15   # %6+ çok güçlü
    if rate >= 0.03:
        return 10   # %3-6 güçlü
    if rate >= 0.01:
        return 5    # %1-3 ortalama
    return 2        # %1 altı düşük


def enrich_reasons_with_llm(influencer: dict, business: dict, score: int, reasons: list) -> str:
    """
    Uyum skorunu ve temel gerekçeleri alarak, LLM aracılığıyla 
    2 cümlelik ikna edici ve profesyonel bir Türkçe açıklama üretir.
    (API anahtarı bulunamazsa veya kütüphane eksikse None döner)
    """
    prompt = (
        f"Sen bir influencer pazarlama uzmanısın.\n"
        f"Influencer: {influencer.get('name', 'İsimsiz')}, Niş: {influencer.get('niche', 'Bilinmiyor')}, {influencer.get('followers', 0):,} takipçi\n"
        f"İşletme: {business.get('name', 'İşletme')}, Niş: {business.get('niche', 'Bilinmiyor')}\n"
        f"Hesaplanan Uyum Skoru: {score}/100\n"
        f"Temel Sebepler: {', '.join(reasons)}\n\n"
        f"Lütfen bu eşleşme için kısa, profesyonel, samimi ve ikna edici 2 cümlelik bir açıklama yaz. Türkçe olsun. "
        f"Başka hiçbir şey ekleme, doğrudan açıklamayı yaz."
    )
    
    # 1. Öncelik: Gemini API (google-generativeai)
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
            
    # 2. Öncelik: Anthropic API
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
    Influencer ve Yerel İşletme arasındaki uyum skorunu ve gerekçelerini hesaplar.
    Hiçbir şekilde Exception fırlatmaz, hata durumunda güvenli default değerler döner.
    """
    try:
        # Verileri güvenli yerel değişkenlere ayıkla ve dönüştür
        inf_name = str(influencer.get("name", "İsimsiz")).strip()
        biz_name = str(business.get("name", "İşletme")).strip()
        
        inf_niche = str(influencer.get("niche", "")).strip()
        biz_niche = str(business.get("niche", "")).strip()
        
        inf_city = str(influencer.get("city", "")).strip()
        biz_city = str(business.get("city", "")).strip()
        
        try:
            inf_followers = int(influencer.get("followers", 0))
        except (ValueError, TypeError):
            inf_followers = 0
            
        try:
            inf_rate = float(influencer.get("engagement_rate", 0.0))
        except (ValueError, TypeError):
            inf_rate = 0.0
            
        target_followers_str = str(business.get("target_followers", "10k-50k")).strip()

        # Her bir bileşenin skorunu hesapla
        n = niche_score(influencer, business)
        f = follower_score(influencer, business)
        l = location_score(influencer, business)
        e = engagement_score(influencer)
        
        # Toplam skoru hesapla (Maksimum 100)
        total = n + f + l + e
        
        # Jüriye gerçekçi görünmesi adına skoru 10 ile 92 arasında dengeliyoruz (clamp)
        final_score = max(10, min(92, total))
        
        # Dinamik Türkçe Gerekçeler Üret
        reasons = []
        
        # 1. Niş Gerekçesi
        if n == 40:
            reasons.append(f"{inf_niche.title()} nişleriniz tam olarak örtüşüyor.")
        elif n == 20:
            reasons.append(f"{inf_niche.title()} ve {biz_niche.title()} nişleri birbirini mükemmel tamamlıyor.")
        else:
            reasons.append("Niş uyumu zayıf görünüyor, ancak yaratıcı bir kampanya ile fark yaratılabilir.")
            
        # 2. Takipçi Gerekçesi
        if f == 25:
            reasons.append(f"Takipçi kitlesi ({inf_followers:,}), işletmenin {target_followers_str} hedefi ile tam uyumlu.")
        elif f == 10:
            reasons.append("Takipçi sayısı hedefin biraz dışında olsa da, iyi bir erişim ve kitle potansiyeli sunuyor.")
        else:
            reasons.append(f"Takipçi hacmi ({inf_followers:,}) ile işletme hedefleri arasında fark var.")
            
        # 3. Konum Gerekçesi
        if l == 20:
            reasons.append(f"Aynı şehirdesiniz ({inf_city.title()})! Yerel işbirlikleri ve fiziksel ziyaretler için harika bir avantaj.")
        else:
            reasons.append(f"Farklı şehirler ({inf_city.title() if inf_city else 'Belirtilmemiş'} - {biz_city.title() if biz_city else 'Belirtilmemiş'}) olmasına rağmen, dijital veya online kargo gönderimiyle işbirliği yapılabilir.")
            
        # 4. Etkileşim Gerekçesi
        engagement_rate_pct = inf_rate * 100
        if e == 15:
            reasons.append(f"Fevkalade yüksek etkileşim oranı (%{engagement_rate_pct:.1f})! Takipçileri paylaşımlarına çok aktif katılıyor.")
        elif e == 10:
            reasons.append(f"Güçlü etkileşim oranı (%{engagement_rate_pct:.1f}) ile kitlesiyle bağları son derece kuvvetli.")
        elif e == 5:
            reasons.append(f"Ortalama bir etkileşim oranına (%{engagement_rate_pct:.1f}) sahip.")
        else:
            reasons.append(f"Etkileşim oranı (%{engagement_rate_pct:.1f}) standartların biraz altında.")
            
        # Eğer API anahtarı tanımlıysa LLM ile detaylı ikna edici açıklama üret
        # Parametreleri temizlenmiş kopyalarla besle
        clean_inf = {"name": inf_name, "niche": inf_niche, "followers": inf_followers}
        clean_biz = {"name": biz_name, "niche": biz_niche}
        llm_reasoning = enrich_reasons_with_llm(clean_inf, clean_biz, final_score, reasons)
        
        result = {
            "score": final_score,
            "reasons": reasons,
            "breakdown": {
                "niche_match": n,
                "follower_fit": f,
                "location_match": l,
                "engagement": e
            }
        }
        
        # Eğer LLM'den açıklama geldiyse sonuca ekle veya gerekçe listesinin başına koy
        if llm_reasoning:
            result["llm_explanation"] = llm_reasoning
            # Gerekçelerin en başına daha akıcı olan bu açıklamayı da ekleyebiliriz
            result["reasons"].insert(0, llm_reasoning)
            
        return result
        
    except Exception as err:
        logger.error(f"Uyum skoru hesaplanırken beklenmedik hata: {err}", exc_info=True)
        # Hata durumunda sistemin çökmesini kesinlikle engelleyen fallback
        return {
            "score": 50,
            "reasons": ["Eşleştirme analizi beklenmedik bir durum nedeniyle tamamlanamadı, standart uyum skorlandı."],
            "breakdown": {
                "niche_match": 20,
                "follower_fit": 15,
                "location_match": 10,
                "engagement": 5
            }
        }


def get_allowed_discover_types(user_type: str) -> list[str]:
    """
    Kullanıcı rolüne göre karşısına çıkabilecek hedef profil tiplerini döner.
    Geliştirilen kurallar:
    - influencer -> sadece business
    - employee / çalışan -> sadece business
    - business -> sadece influencer
    """
    user_type = str(user_type).strip().lower()
    if user_type == "influencer":
        return ["business"]
    elif user_type in ["employee", "çalışan"]:
        return ["business"]
    elif user_type in ["business", "işletme"]:
        return ["influencer"]
    return []


def filter_discoverable_profiles(user_profile: dict, all_profiles: list[dict]) -> list[dict]:
    """
    Kullanıcının kendi profil bilgisine göre keşif havuzundaki profilleri filtreler.
    Kullanıcının kendisini havuzdan eler ve yalnızca görmeye izni olduğu profil tiplerini tutar.
    """
    if not user_profile:
        return []
        
    user_id = user_profile.get("id")
    user_type = str(user_profile.get("type", "")).strip().lower()
    
    allowed_types = get_allowed_discover_types(user_type)
    
    filtered = []
    for profile in all_profiles:
        # Kendi profilini filtrele
        if profile.get("id") == user_id:
            continue
            
        # Sadece izin verilen profil tiplerini ekle
        p_type = str(profile.get("type", "")).strip().lower()
        if p_type in allowed_types:
            filtered.append(profile)
            
    return filtered
