# Proje İsterleri — v1 (Final) Görev Takip Listesi

Kullanıcının ilettiği spesifikasyonlara dayalı olarak **Emir'in (YZ / Eşleştirme Algoritması)** tamamlaması gereken adımlar:

## 1. AI Mimarisi — Retrieval (Filtreleme)
- [x] Kullanıcının yetkisine göre filtreleme fonksiyonunu (`filter_discoverable_profiles`) yaz.
- [x] Influencer -> İşletme / Collab Listing filtre kuralını uygula.
- [x] Çalışan -> İşletme / Job Listing filtre kuralını uygula.
- [x] İşletme -> Influencer / Çalışan filtre kuralını uygula.

## 2. Ranking Aşaması (Skorlama) - Influencer ↔ İşletme (İşbirliği)
- [x] `TIERS` ve `TIERS_ENGAGEMENT_EXPECTATION` (Nano, Micro, Mid, vb.) tablosunu koda entegre et.
- [x] **Semantic similarity (0.35 Puan):** `semantic_score` fonksiyonunu embedding veya fallback tabanlı yaz.
- [x] **Konum yakınlığı (0.20 Puan):** `location_score` fonksiyonunu `exp(-distance/10)` veya fallback tabanlı yaz.
- [x] **Tier uyumu (0.20 Puan):** `tier_score` fonksiyonunu yaz.
- [x] **Etkileşim oranı (0.15 Puan):** `engagement_score` fonksiyonunu tier hedeflerine göre dinamik olarak yaz.
- [x] **Aktiflik (0.10 Puan):** `activity_score` fonksiyonunu yaz.
- [x] Influencer için LLM destekli dinamik `reasons` listesini üret.

## 3. Ranking Aşaması (Skorlama) - Çalışan ↔ İşletme (İş İlanı)
- [x] Çalışanlar (Worker) için 5 faktörlü eşleştirme algoritmasını `calculate_worker_score` adıyla oluştur.
- [x] **Semantic/Beceri Uyumu (0.35):** Çalışan yetenekleri (`skills`) ile ilan uyuşmazlığını hesapla.
- [x] **Konum Mesafe (0.20):** Aynı `exp(-distance/10)` algoritmasını çalışan için de kullan.
- [x] **Deneyim Uyumu (0.20):** Çalışanın `experience_years` değeri ilanın `required_experience_years` değerini karşılıyor mu?
- [x] **Ücret/Maaş Uyumu (0.15):** Çalışan beklentisi `rate_range.min` <= ilan `wage.amount` kontrolü.
- [x] **Mesai/Tür Uyumu (0.10):** `employment_type_id` ile `preferred_employment_types` eşleşmesi.
- [x] Çalışan skorlaması için insan okunabilir dinamik `reasons` listesi oluştur.

## 4. Ana Kontrolcü ve Testler
- [x] `calculate_score(user, target)` fonksiyonunu, kullanıcının rolüne (`influencer` veya `worker`) göre ilgili skorlayıcıya yönlendirecek şekilde refactor et.
- [x] Çalışan eşleştirme algoritması için unit testleri (`test_matching.py`) yaz.
- [x] Tüm testleri (%100 PASS) çalıştır.

## 5. Dokümantasyon
- [x] `EMIR.md` dosyasını bu V1 planına tamamen uyumlu olacak şekilde yeniden düzenle ve güncelle.
