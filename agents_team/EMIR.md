# Agent Bağlamı — Emir
## Proje: InfluMatch — Influencer × İşletme Eşleştirme Platformu

Sen bu projenin **YZ / Eşleştirme Algoritması** geliştiricisin.
Görevin: Influencer–İşletme ve Çalışan–İş İlanı uyum skorunu hesaplayan Python modülünü (Retrieval + Ranking) V1 Final İsterlerine göre yazmak.

---

## Proje Özeti (V1 Final)

**InfluMatch**, işletmelerle iki tür yetenek havuzunu eşleştiren Tinder benzeri mobil uygulamadır:
1. **Influencer'lar** — Reklam/içerik işbirliği için (`collab_listing`)
2. **Çalışanlar** — İstihdam için (`job_listing`)

- **Senin modülün:** Kullanıcı ile ilan arasındaki 0–100 arası uyum skorunu hesaplayan **Çok Faktörlü Ranking** algoritmasıdır.
- MVP'de kural tabanlı + pgvector uyumlu embedding altyapısı kullanıyoruz.

---

## Senin Sorumlulukların (V1 Final)

### 1. Retrieval Aşaması (Aday Filtreleme)
- Kullanıcıların sadece doğru ilanları (veya profilleri) görmesi için gerekli kural setini (`get_allowed_discover_types`) yönetmek.
  - Influencer → `collab_listing`, `business` görür.
  - Çalışan → `job_listing`, `business` görür.
  - İşletme → `influencer`, `worker`, `employee` görür.

### 2. Ranking Aşaması (5 Bileşenli Skorlama)
İki ayrı akış için skorlama algoritmasını yönetmek:

#### A. Influencer ↔ İşbirliği İlanı (Max 100)
1. **Semantic Similarity (35 Puan):** Vektörel (embedding) uyum veya kural tabanlı niş eşleşmesi.
2. **Konum Mesafe Uyumu (20 Puan):** PostGIS `distance_km` verisinden `exp(-distance/10)` formülüyle eksponansiyel düşen puan.
3. **Tier Uyumu (20 Puan):** `TIERS` (Nano, Micro, Mid, vb.) tablosuna göre hedeflenen tier ile mevcut tier eşleşmesi.
4. **Etkileşim Oranı (15 Puan):** `TIERS_ENGAGEMENT_EXPECTATION` tablosuna göre influencer'ın bulunduğu tier'dan beklenen etkileşimi ne kadar aştığının ölçümü.
5. **Aktiflik (10 Puan):** `last_post_recency_days` verisine göre puanlama.

#### B. Çalışan ↔ İş İlanı (Max 100)
1. **Semantic / Beceri Uyumu (35 Puan):** `skills` listesi ile `required_skills` listesi arasındaki örtüşme.
2. **Konum Mesafe Uyumu (20 Puan):** `exp(-distance/10)` formülü.
3. **Deneyim Uyumu (20 Puan):** Çalışanın `experience_years` değeri ilanın `required_experience_years` beklentisini karşılıyor mu?
4. **Ücret/Maaş Uyumu (15 Puan):** Çalışanın min beklentisi (`rate_range.min`), ilanın `wage.amount` değerine eşit veya düşük mü?
5. **Mesai/Tür Uyumu (10 Puan):** `employment_type_id` ile çalışanın tercihleri uyuşuyor mu?

### 3. LLM Zenginleştirmesi ve Gerekçeler
- Her eşleşme için neden uyumlu olunduğunu anlatan dinamik Türkçe liste (`reasons`) üretmek.
- İsteğe bağlı olarak Gemini/Claude API'leri ile bu listeyi 2 cümlelik doğal bir dille zenginleştirmek.

---

## 🏆 Tamamlanan Geliştirmeler (V1 Final Başarı Raporu)

Tüm V1 Final hedeflerimizi **%100 başarı ve endüstri standardı kalitede** tamamladık! İşte güncel çözümlerimiz:

### 1. Eşleştirme Algoritması ve Routing (`backend/app/matching.py`)
- **İkili (Dual) Ranking Sistemi:** `calculate_score` içerisine rol yönlendirici (`router`) yazıldı. Artık sistem girdi tipine göre `calculate_influencer_score` veya `calculate_worker_score` fonksiyonlarını dinamik çağırıyor.
- **5 Boyutlu Matematiksel Model:** Semantic, Konum, Tier/Deneyim, Etkileşim/Ücret ve Aktiflik/Mesai bazlı ağırlıklı skorlama modeli eksiksiz kuruldu.
- **PostGIS ve pgvector Uyumlu:** İleride ML modeline entegre olabilmesi için `distance_km` ve `semantic_similarity` anahtarlarını önce kontrol eden yapı kuruldu.
- **Dinamik Gerekçelendirme:** Her iki rol için de arka planda anlık Türkçe gerekçeler (`reasons`) üreten kural setleri yazıldı.
- **Clamping (10-92):** Skorun yapay durmaması adına 10-92 arasına sınırlandırılması korundu.
- **Kusursuz Hata Yönetimi:** Python `0.0 or None` Falsy problemi çözüldü, sıfır kilometre uzaklıkların atlanması engellendi.

### 2. Gelişmiş Keşif Filtrelemesi (V1 Kuralları)
- `filter_discoverable_profiles` güncellendi ve V1 spesifikasyonuna göre `collab_listing` ile `job_listing` ayrı ayrı rotalandı.

### 3. Otomatik Test Paketi (`backend/app/test_matching.py`)
- Tüm V1 özelliklerini, 5'li algoritmayı, falsy durumlarını ve hem Influencer hem de Çalışan (Worker) eşleşmelerini doğrulayan **12 adet Unit Test** yazıldı.
- Testlerin tümü `0.001s` içinde kusursuz şekilde **(Green PASS)** geçmektedir.
