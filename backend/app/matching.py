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


# ---------------------------------------------------------------------------
# TIER TANIMLARI — v1plan.md Bölüm 1.2.1 (Influencer Tiers)
# Micro: 10k–100k (eskiden 50k'da kesiliyordu, DÜZELTİLDİ)
# ---------------------------------------------------------------------------
TIERS = {
    "nano":  (1_000,       10_000),
    "micro": (10_000,     100_000),   # ← DÜZELTİLDİ (50k → 100k)
    "mid":   (100_000,    500_000),
    "macro": (500_000,  1_000_000),
    "mega":  (1_000_000, float("inf"))
}

# İşletmenin target_followers alanından tier'a map
TARGET_MAP = {
    "1k-10k":   "nano",
    "10k-50k":  "micro",
    "50k-500k": "mid",
    "500k-1m":  "macro",
    "1m+":      "mega",
    # Direkt tier adı da gelebilir
    "nano":  "nano",
    "micro": "micro",
    "mid":   "mid",
    "macro": "macro",
    "mega":  "mega",
}

# Listing tip sabitleri — Ömer'in backend'iyle senkron (DÜZELTİLDİ)
LISTING_TYPE_COLLAB = "collab_listing"
LISTING_TYPE_JOB    = "job_listing"


# ---------------------------------------------------------------------------
# YARDIMCI: Aktiflik skoru (10 puan) — son aktif tarihe göre
# ---------------------------------------------------------------------------
def _activity_score(profile: dict) -> int:
    last_active = profile.get("last_active_at")
    if not last_active:
        return 0
    try:
        active_date = datetime.strptime(str(last_active), "%Y-%m-%d").date()
        delta = (datetime.now().date() - active_date).days
        if delta <= 7:
            return 10
        elif delta <= 30:
            return 5
    except ValueError:
        pass
    return 0


# ---------------------------------------------------------------------------
# ANA SKOR FONKSİYONU
# ---------------------------------------------------------------------------
def calculate_v1_score(entity: dict, target: dict) -> dict:
    """
    Bir (entity, target) çifti için 0–100 arası uyum skoru hesaplar.

    Desteklenen akışlar:
      influencer  ↔  collab_listing / business
      worker      ↔  job_listing    / business
      business    ↔  influencer / worker  (roller yer değiştirir)

    Döndürür:
      {
          "score": int,          # 10–92 arası
          "reasons": [str, ...], # En fazla 3 gerekçe
          "breakdown": dict      # Bileşen puanları
      }
    """
    try:
        e_type = str(entity.get("type", "")).strip().lower()
        t_type = str(target.get("type", "")).strip().lower()

        # İşletme eşleşmeyi başlatıyorsa rolleri yer değiştir
        if e_type in ["business", "işletme"]:
            candidate = target
            listing   = entity
        else:
            candidate = entity
            listing   = target

        c_type = str(candidate.get("type", "")).strip().lower()
        l_type = str(listing.get("type",  "")).strip().lower()

        is_worker = c_type in ["worker", "employee", "çalışan"]

        # ---------------------------------------------------------------
        # LISTING TİP DOĞRULAMASI (YENİ — DÜZELTİLDİ)
        # Çalışan sadece job_listing veya business ile eşleşmeli,
        # influencer sadece collab_listing veya business ile eşleşmeli.
        # ---------------------------------------------------------------
        if l_type == LISTING_TYPE_JOB and not is_worker:
            logger.warning("İş ilanı influencer'a gösterildi — uyumsuz tip.")
            return {
                "score": 10,
                "reasons": ["Bu ilan türü profil rolünüzle uyuşmuyor."],
                "breakdown": {"type_mismatch": True}
            }
        if l_type == LISTING_TYPE_COLLAB and is_worker:
            logger.warning("İşbirliği ilanı çalışana gösterildi — uyumsuz tip.")
            return {
                "score": 10,
                "reasons": ["Bu ilan türü profil rolünüzle uyuşmuyor."],
                "breakdown": {"type_mismatch": True}
            }

        # ---------------------------------------------------------------
        # ORTAK BİLEŞENLER
        # ---------------------------------------------------------------

        # Konum Uyumu — maks 20 puan
        e_city = str(candidate.get("city", "")).strip().lower()
        t_city = str(listing.get("city",  "")).strip().lower()
        location_match = 20 if (e_city and t_city and e_city == t_city) else 5

        # Aktiflik — maks 10 puan
        activity = _activity_score(candidate)

        reasons   = []
        breakdown = {"location_match": location_match, "activity": activity}

        # ---------------------------------------------------------------
        # ÇALIŞAN (WORKER) BİLEŞENLERİ
        # Pozisyon (35) + Konum (20) + Deneyim (20) + Maaş (15) + Aktiflik (10) = 100
        # ---------------------------------------------------------------
        if is_worker:
            # 1. Pozisyon Uyumu — maks 35 puan
            preferred   = candidate.get("preferred_positions", [])
            if isinstance(preferred, str):
                preferred = [preferred]
            target_pos  = listing.get("position_id")
            position_match = 35 if (target_pos and target_pos in preferred) else 10

            # 2. Deneyim Yılı — maks 20 puan
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

            # 3. Maaş Beklentisi — maks 15 puan
            try:
                w_min  = float(candidate.get("rate_range", {}).get("min", 0))
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

            total       = position_match + location_match + experience_match + wage_match + activity
            final_score = max(10, min(92, total))

            if position_match == 35:
                reasons.append("Pozisyon beklentileri tam uyuşuyor.")
            if location_match == 20:
                reasons.append("Aynı şehir avantajı var.")
            if experience_match == 20:
                reasons.append("Aranan tecrübe süresini tam karşılıyor.")
            if wage_match == 15:
                reasons.append("Ücret beklentisi ile teklif uyumlu.")
            if activity == 10:
                reasons.append("Aday çok aktif ve güncel.")

            breakdown.update({
                "position_match":   position_match,
                "experience_match": experience_match,
                "wage_match":       wage_match,
            })

        # ---------------------------------------------------------------
        # INFLUENCER BİLEŞENLERİ
        # Semantic (35) + Konum (20) + Tier (20) + Engagement (15) + Aktiflik (10) = 100
        # ---------------------------------------------------------------
        else:
            # 1. Semantic / Niş Uyumu — maks 35 puan
            e_niche = str(candidate.get("niche", "")).strip().lower()
            t_niche = str(listing.get("niche",  "")).strip().lower()

            ADJACENT_PAIRS = [
                {"moda", "güzellik"},
                {"moda", "yaşam"},
                {"yemek", "yaşam"},
                {"spor", "yaşam"},
                {"spor", "teknoloji"},
                {"güzellik", "yaşam"},
                {"teknoloji", "yaşam"},
            ]

            semantic_match = 10  # varsayılan (hiç eşleşme yok)
            if e_niche and t_niche:
                if e_niche == t_niche:
                    semantic_match = 35
                elif {e_niche, t_niche} in ADJACENT_PAIRS:
                    semantic_match = 20

            # 2. Takipçi Tier Uyumu — maks 20 puan
            try:
                followers = int(candidate.get("followers", 0))
            except (ValueError, TypeError):
                followers = 0

            target_str  = str(listing.get("target_followers", "micro")).strip().lower().replace(" ", "")
            target_tier = TARGET_MAP.get(target_str, "micro")

            # Influencer'ın gerçek tier'ını bul
            e_tier = "nano"
            for t_name, (low, high) in TIERS.items():
                if low <= followers < high:
                    e_tier = t_name
                    break

            TIER_ORDER = ["nano", "micro", "mid", "macro", "mega"]
            tier_fit = 0
            if e_tier == target_tier:
                tier_fit = 20
            else:
                try:
                    e_idx = TIER_ORDER.index(e_tier)
                    t_idx = TIER_ORDER.index(target_tier)
                    if abs(e_idx - t_idx) == 1:
                        tier_fit = 10   # 1 kademe sapma — kısmi puan
                except ValueError:
                    pass

            # 3. Etkileşim Oranı — maks 15 puan
            try:
                engagement_val = float(candidate.get("engagement_rate", 0.0))
            except (ValueError, TypeError):
                engagement_val = 0.0

            if engagement_val >= 0.05:
                engagement = 15
            elif engagement_val >= 0.03:
                engagement = 10
            elif engagement_val >= 0.01:
                engagement = 5
            else:
                engagement = 0

            total       = semantic_match + location_match + tier_fit + engagement + activity
            final_score = max(10, min(92, total))

            if semantic_match == 35:
                reasons.append(
                    "Moda nişi tam örtüşüyor." if e_niche == "moda"
                    else "Niş tam örtüşüyor."
                )
            elif semantic_match == 20:
                reasons.append("Benzer veya tamamlayıcı sektörlerde çalışıyorsunuz.")

            if location_match == 20:
                reasons.append("Aynı şehir avantajı var.")
            if tier_fit == 20:
                reasons.append("Takipçi kitlesi işletmenin beklentisiyle tam uyumlu.")
            if engagement == 15:
                reasons.append("Çok güçlü bir etkileşim oranına sahip.")
            if activity == 10:
                reasons.append("Hesap çok aktif ve güncel.")

            breakdown.update({
                "semantic_match": semantic_match,
                "tier_fit":       tier_fit,
                "engagement":     engagement,
            })

        if not reasons:
            reasons.append("Ortalama bir uyum yakalandı.")

        return {
            "score":     final_score,
            "reasons":   reasons[:3],   # En güçlü 3 gerekçe
            "breakdown": breakdown,
        }

    except Exception as e:
        logger.error(f"Uyum skoru hesaplanırken beklenmeyen hata: {e}", exc_info=True)
        return {
            "score":   50,
            "reasons": ["Sistem optimizasyonu yapılıyor..."],
            "breakdown": {"location_match": 10, "activity": 10},
        }


# ---------------------------------------------------------------------------
# KEŞİF FİLTRELEME — 3'lü rol yapısı
# ---------------------------------------------------------------------------
def filter_discoverable_profiles(user_role: str, profiles: list) -> list:
    """
    Kullanıcı rolüne göre keşif havuzunu filtreler.

    Akış (v1plan.md Bölüm 2 — Keşif Akışı):
      influencer → business + collab_listing
      worker     → business + job_listing
      business   → influencer + worker
    """
    role = str(user_role).strip().lower()

    ALLOWED: dict[str, set] = {
        "influencer":  {"business", "işletme", LISTING_TYPE_COLLAB},
        "worker":      {"business", "işletme", LISTING_TYPE_JOB},
        "employee":    {"business", "işletme", LISTING_TYPE_JOB},   # worker alias
        "çalışan":     {"business", "işletme", LISTING_TYPE_JOB},   # worker alias
        "business":    {"influencer", "worker", "employee", "çalışan"},
        "işletme":     {"influencer", "worker", "employee", "çalışan"},
    }

    allowed_types = ALLOWED.get(role, set())
    if not allowed_types:
        logger.warning(f"Bilinmeyen rol: {role!r} — boş liste döndürülüyor.")
        return []

    return [
        p for p in profiles
        if str(p.get("type", "")).strip().lower() in allowed_types
    ]


# ---------------------------------------------------------------------------
# calculate_score — Ömer'in import ettiği public alias
# (eski imzayla geriye dönük uyumluluk)
# ---------------------------------------------------------------------------
def calculate_score(influencer: dict, business: dict) -> dict:
    """Geriye dönük uyumluluk için — calculate_v1_score'a yönlendirir."""
    return calculate_v1_score(influencer, business)