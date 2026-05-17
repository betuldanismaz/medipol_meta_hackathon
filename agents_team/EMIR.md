# Agent Bağlamı — Emir
## Proje: InfluMatch — Influencer × İşletme Eşleştirme Platformu

Sen bu projenin **YZ / Eşleştirme Algoritması** geliştiricisin.
Görevin: Influencer–işletme uyum skorunu hesaplayan Python modülünü yazmak ve Ömer'in backend'ine entegre edilebilir hale getirmek.

---

## Proje Özeti

**InfluMatch**, influencer'ların ve yerel işletmelerin birbirini Tinder mantığıyla keşfettiği bir platformdur.
- Kullanıcılar profil kartlarını görür, sağ/sol kaydırır
- **Senin modülün:** Her influencer–işletme çifti için 0–100 arası uyum skoru + "neden uyumlu?" açıklaması üretir
- Bu skor, kullanıcıya kartın üzerinde gösterilir ve "neden bu eşleşmeyi öneriyoruz?" sorusunu yanıtlar
- Jüri için en kritik teknik parça budur — "YZ ne yapıyor?" sorusunun cevabı senin modülün

**Stack:**
- Dil: **Python 3.11+**
- Yaklaşım: kural tabanlı skor + (isteğe bağlı) LLM reasoning
- Ömer, senin `matching.py` modülündeki `calculate_score()` fonksiyonunu direkt import eder

---

## Senin Sorumlulukların

### Yapacakların (öncelik sırasıyla)

1. **`calculate_score(influencer, business) → dict`** fonksiyonunu yaz
2. Skoru bileşenlere böl: her bileşen ayrı ağırlıklı, toplam 100
3. İnsan okunabilir `reasons` listesi üret
4. (Opsiyonel, zaman kalırsa) LLM ile reasoning zenginleştir
5. Unit test: en az 3 çift için beklenen skoru doğrula

### Yapmadığın Şeyler (scope dışı)
- API endpoint yazmak (Ömer yapar)
- Veri çekmek / profil oluşturmak (Mehmet + Ömer)
- Frontend (Betül + Emre)

---

## Giriş Verisi Formatı

Fonksiyonun alacağı profil dict'leri (Mehmet'in mock verisinden gelir):

```python
influencer = {
    "id": "inf_1",
    "name": "Ayşe Kaya",
    "type": "influencer",
    "niche": "moda",           # moda | yemek | teknoloji | güzellik | spor | yaşam
    "followers": 28000,
    "city": "İstanbul",
    "engagement_rate": 0.042,  # %4.2
    "past_brands": ["Zara", "Mango"],
    "content_style": "lifestyle"
}

business = {
    "id": "biz_1",
    "name": "Kahve & Stil Cafe",
    "type": "business",
    "niche": "moda",           # işletmenin hedef niş'i
    "city": "İstanbul",
    "target_followers": "10k-50k",  # beklenen influencer büyüklüğü
    "budget_tier": "small",         # small | medium | large
    "past_collaborations": []
}
```

---

## Çıkış Formatı

```python
{
    "score": 78,
    "reasons": [
        "Moda nişi tam örtüşüyor",
        "Takipçi sayısı işletmenin bütçe tieri ile uyumlu",
        "Aynı şehir — lokal etkileşim avantajı"
    ],
    "breakdown": {
        "niche_match": 35,      # max 40
        "follower_fit": 20,     # max 25
        "location_match": 15,   # max 20
        "engagement": 8         # max 15
    }
}
```

---

## Skor Mantığı (Öneri)

### Bileşen 1: Niş Uyumu (40 puan)
```python
def niche_score(inf, biz):
    if inf["niche"] == biz["niche"]:
        return 40
    # Yakın nişler (ör: moda+güzellik)
    adjacent = {
        "moda": ["güzellik", "yaşam"],
        "yemek": ["yaşam"],
        "güzellik": ["moda", "yaşam"],
        "spor": ["yaşam", "teknoloji"]
    }
    if biz["niche"] in adjacent.get(inf["niche"], []):
        return 20
    return 0
```

### Bileşen 2: Takipçi Uyumu (25 puan)
```python
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
    "500k+": "macro"
}

def follower_score(inf, biz):
    followers = inf["followers"]
    target = TARGET_MAP.get(biz["target_followers"], "micro")
    low, high = TIERS[target]
    if low <= followers <= high:
        return 25
    # Kısmi puan: 1 tier sapma
    return 10
```

### Bileşen 3: Konum Uyumu (20 puan)
```python
def location_score(inf, biz):
    if inf["city"] == biz["city"]:
        return 20
    return 5  # farklı şehir ama online işbirliği mümkün
```

### Bileşen 4: Engagement Rate (15 puan)
```python
def engagement_score(inf):
    rate = inf.get("engagement_rate", 0)
    if rate >= 0.06:   return 15   # %6+
    if rate >= 0.03:   return 10   # %3-6
    if rate >= 0.01:   return 5    # %1-3
    return 2
```

---

## Ana Fonksiyon

```python
# matching.py

def calculate_score(influencer: dict, business: dict) -> dict:
    n = niche_score(influencer, business)
    f = follower_score(influencer, business)
    l = location_score(influencer, business)
    e = engagement_score(influencer)
    total = n + f + l + e

    reasons = []
    if n == 40:
        reasons.append(f"{influencer['niche'].title()} nişi tam örtüşüyor")
    elif n > 0:
        reasons.append("Yakın niş kategorisi — potansiyel uyum var")
    else:
        reasons.append("Niş uyumu zayıf — riski var")

    if f == 25:
        reasons.append("Takipçi kitlesi işletmenin beklentisiyle tam uyumlu")
    else:
        reasons.append("Takipçi sayısı hedefin biraz dışında")

    if l == 20:
        reasons.append("Aynı şehir — lokal etkileşim avantajı")

    if e >= 10:
        reasons.append(f"Güçlü etkileşim oranı (%{influencer.get('engagement_rate',0)*100:.1f})")

    return {
        "score": total,
        "reasons": reasons,
        "breakdown": {
            "niche_match": n,
            "follower_fit": f,
            "location_match": l,
            "engagement": e
        }
    }
```

---

## Opsiyonel: LLM Reasoning (zaman kalırsa)

Eğer saat 2'den önce kural tabanlı sistem çalışıyorsa, reasoning'i LLM ile zenginleştir:

```python
import anthropic

def enrich_reasons_with_llm(influencer, business, score, reasons):
    client = anthropic.Anthropic()
    prompt = f"""
Sen bir influencer pazarlama uzmanısın.
Influencer: {influencer['name']}, niş: {influencer['niche']}, {influencer['followers']} takipçi
İşletme: {business['name']}, niş: {business['niche']}
Uyum skoru: {score}/100
Temel sebepler: {', '.join(reasons)}

Bu eşleşme için kısa, ikna edici 2 cümlelik bir açıklama yaz. Türkçe.
"""
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=150,
        messages=[{"role": "user", "content": prompt}]
    )
    return response.content[0].text
```

**Not:** LLM sadece "reasoning" metnini zenginleştirir, skoru değiştirmez. Jüriye "skor kural tabanlı, açıklama LLM destekli" diyebilirsiniz — bu hibrit yaklaşım teknik olarak dürüsttür.

---

## Ömer ile Senkronizasyon

Ömer şu import'u bekliyor:
```python
from matching import calculate_score
```

`matching.py` dosyasını `backend/` klasörüne koy. Saat 1:30'a kadar en azından çalışan bir versiyonu Ömer'e ilet. Eksik field varsa `dict.get("alan", default)` ile default değer kullan — KeyError fırlatma.

---

## Öncelik Sırası (4 saat)

| Saat | Görev |
|------|-------|
| 0:00–0:30 | Skor bileşenlerini kağıda yaz, ağırlıkları belirle |
| 0:30–1:30 | `matching.py` yaz — tüm 4 bileşen çalışıyor |
| 1:30–1:45 | 3 farklı çift ile manuel test — sonuçlar mantıklı mı? |
| 1:45–2:00 | Ömer'e teslim, entegrasyon testi |
| 2:00–3:00 | (Zaman kalırsa) LLM reasoning ekle |
| 3:00–4:00 | Demo için "YZ ne yapıyor?" açıklamasını ezberle |

---

## Kritik Notlar

- **Jüri sorusu:** "YZ burada gerçekten ne yapıyor?" — cevabın: 4 boyutlu ağırlıklı skor sistemi + insan okunabilir gerekçe üretimi. LLM varsa onu da söyle.
- **Skor 0 veya 100 çıkmasın** — gerçekçi görünmüyor. Minimum ~10, maksimum ~92 olsun.
- **Hata yok:** `calculate_score` hiçbir zaman exception fırlatmamalı — try/except ile wrap et, hata durumunda `{"score": 50, "reasons": ["Analiz tamamlanamadı"]}` dön.

---

## 🏆 Tamamlanan Geliştirmeler (Emir'in Başarı Raporu)

Tüm hedeflerimizi **%100 başarı ve endüstri standardı kalitede** tamamladık! İşte hayata geçirdiğimiz çözümler:

### 1. Uyum Algoritması (`backend/app/matching.py`)
- **4 Boyutlu Matematiksel Model:** Niş Uyumu (40p), Takipçi Tier Uyumu (25p), Konum Uyumu (20p) ve Etkileşim Oranı (15p) bazlı ağırlıklı skorlama modeli eksiksiz kuruldu.
- **Dinamik Gerekçelendirme:** Her eşleşme için arka planda anlık Türkçe gerekçeler (`reasons`) üreten sistem geliştirildi.
- **Clamping (10-92):** Skorun jüriye yapay durmaması adına minimum 10, maksimum 92 arasında dengelenmesi sağlandı.
- **Hata Toleransı ve Tip Güvenliği:** KeyError ve TypeError durumları için kapsamlı koruma kalkanları yazıldı, bozuk verilerde dahi sistem çökmesi engellendi.

### 2. Gelişmiş Keşif Filtrelemesi (3'lü Rol Yapısı)
- Sisteme **Çalışan (employee)** rolü entegre edildi.
- Keşif havuzu için `get_allowed_discover_types` ve `filter_discoverable_profiles` fonksiyonları yazılarak:
  - Influencer ve Çalışan'ın karşısına sadece İşletmelerin çıkması,
  - İşletmelerin karşısına ise sadece Influencer'ların çıkması sağlandı.

### 3. Hibrit YZ (LLM) Katmanı
- Gemini (Gemini-1.5-flash) ve Claude API destekli akıcı Türkçe 2 cümlelik akıllı gerekçe üretimi entegre edildi. Ortam değişkenlerinde anahtar varsa otomatik tetiklenir, yoksa kural tabanlı sistemle devam eder.

### 4. Otomatik Test Paketi (`backend/app/test_matching.py`)
- Toplam **9 farklı unit test** ile tüm algoritmik mantık ve filtreleme kuralları doğrulandı. 
- Testler local ve remote `main` branch'inde **%100 başarıyla (Green PASS)** geçmektedir.


---

## 🚀 Yeni V1 Plan Görevleri (Data & AI Model Eğitim Verisi)

v1plan.md dosyasında tanımlanan AI Model Eğitim Verisi ve V1 Eşleştirme güncellemeleri kapsamında Emir'in yapması gereken ek görevler (Hiçbir eski veri silinmemiştir):

### 1. V1 Final Eşleştirme Algoritması (Tamamlandı)
- [x] **5 Bileşenli Ranking Sistemi:** Semantic (35p), Konum (20p), Tier Uyumu (20p), Etkileşim (15p) ve Aktiflik (10p) skorlamasını `matching.py` modülüne entegre et.
- [x] **Yeni Tier Sınırları:** Nano, Micro, Mid, Macro, Mega sınırlarını ve beklenen etkileşim oranlarını güncelle.
- [x] **Yeni Keşif Akışı:** Influencer (işbirliği ilanı + işletme), Çalışan (iş ilanı + işletme), İşletme (influencer + çalışan) görecek şekilde filtreleri kodla.
- [x] **V1 Unit Testleri:** Yukarıdaki 5 bileşeni ve yeni akışı test eden en az 11 adet unit test yaz.

### 2. AI Model Eğitim Verisi (Eğer Mock Data İşlemine Girilecekse)
*(Not: Emir AI/ML sorumlusu olduğu için, veri ekibi mock data'ları ürettikten sonra veya Emir bizzat üretiyorsa bu adımlar yürütülecektir.)*
- [x] **Feature Extraction Pipeline:** 1000 adet (influencer, collab_listing) eğitim çifti (training pair) için 16 farklı numerik ve kategorik feature çıkar.
- [x] **Synthetic Labeling:** Çıkarılan çiftlere 3-sınıflı (0=kötü, 1=orta, 2=iyi) sentetik etiket üret.
- [x] **Data Splitting & Training:** Train (%70), Validation (%15) ve Test (%15) split'lerini oluşturarak LightGBM/XGBoost eğitim ortamını (veya en azından veri şemasını) hazırla.
