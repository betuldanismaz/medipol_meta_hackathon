# Proje İsterleri — v2 (Agent v2 + Premium)

## Genel Tanım

İşletmelerle (kafeler, butikler, dükkanlar) iki tür yetenek havuzunu eşleştiren Tinder benzeri konum bazlı mobil uygulama:

- **Influencer'lar** — reklam/içerik işbirliği için
- **Çalışanlar** — istihdam (her türlü iş) için

Eşleşme sonrası **kişiselleştirilmiş agent'lar kullanıcı yerine müzakere yürütür**. Her kullanıcının kendine ait, kişilik/stil/dealbreaker'larıyla yapılandırılmış bir agent'ı vardır. Agent'lar uzlaşırsa yapılandırılmış anlaşma özeti kullanıcılara onay için sunulur; uzlaşamazlarsa ya ekstra tur satın alınır ya da insan chat'e devredilir.

**Agent kullanımı premium özelliktir** — free kullanıcılar match olur ama agent açamaz.

> **Sprint notu (2026-05-17):** Agent müzakere döngüsü (gpt-5-nano) ve worker (çalışan) akışı **bu sprintte implement edilmiyor**. Altyapı (Predictor, retrieval, ranking) kurulduktan sonra ayrı bir sprintte eklenecek. Bu doküman agent v2'nin **hedef tasarımıdır**; bu sprintte sadece veri modeli alanları (tier, agent_persona, dealbreakers) ve UI iskeleti hazırlanabilir.

---

## Kullanıcı Rolleri

| Rol | Platform | Tier |
|---|---|---|
| Influencer | Mobil | Free / Premium |
| Çalışan | Mobil | Free / Premium |
| İşletme | Mobil + Dashboard | Free / Premium |
| Admin | Dashboard | — |

İşletme iki tip ilan açabilir: "influencer arıyorum" / "çalışan arıyorum".

---

## MVP İsterleri

### Kimlik & Profil

Üç tip kayıt: **Influencer / Çalışan / İşletme**.

- **Influencer profili**: alan, içerik tarzı, sosyal medya linkleri, konum, ücret aralığı
- **Çalışan profili**: deneyim, pozisyon tercihi, istihdam türü (tek seferlik / part-time / full-time / sezonluk / proje bazlı), uygunluk saatleri, konum, ücret aralığı
- **İşletme profili**: sektör, konum, ilan tipi seçebilme

**Yeni:** Onboarding'in son adımında **agent persona kurma**:

- Agent ismi (örn. "Ali Hocam")
- Avatar seçimi (preset set)
- **Müzakere stili** (4 preset): `Sert pazarlıkçı` / `Dengeli` / `Esnek/uyumlu` / `Hızlı kapatıcı`
- **Dealbreaker formu** (aşağıda detaylı)

Premium olmayan kullanıcılar persona kurabilir ama agent'ı aktive edemez (paywall).

### İlan Sistemi

İşletme iki tip ilan açabilir:

- **İşbirliği ilanı** (influencer için): kapsam, bütçe, içerik beklentisi
- **İş ilanı** (çalışan için): pozisyon, istihdam türü, saatler, ücret

İlanlar konuma göre filtrelenir.

### Eşleşme Çekirdeği

- Influencer ve Çalışan kendi türündeki ilanları **ayrı akışlarda** görür
- Sağa/sola kaydırma, çift onaylı match
- **Eşleşme olunca**:
  - İki taraf da Premium → otomatik agent kanalı açılır (sonraki sprintte aktif)
  - Bir taraf veya iki tarafı free → in-app chat fallback (basit text, v2'de zenginleştirilecek)

---

## Agent Müzakere Sistemi (v2 — hedef tasarım, sonraki sprint)

### Erişim & Tier

- **Agent yalnızca Premium kullanıcılar için**
- İki taraf da Premium ise agent ↔ agent müzakere
- Bir taraf free ise → in-app chat (agent yok)
- Premium kullanıcı eşzamanlı **sınırsız müzakere** yürütebilir

### Agent Konfigürasyonu

Her kullanıcının agent'ı **kayıt sırasında yapılandırılır** ve şu girdileri alır:

**1. Structured Tercih Formu**
- Influencer/Çalışan: minimum ücret, max iş yükü, uygunluk saatleri, konum kısıtları, içerik tarzı kısıtları
- İşletme: bütçe tavanı, kapsam beklentisi, zaman çerçevesi, kalite/tier hedefi

**2. Structured Dealbreaker Alanları**
- Numeric: kesin min ücret, kesin max saat
- Select: zorunlu/yasak günler, lokasyon kısıtı
- Boolean: ürün fotosu çekmek, hafta sonu çalışmak, vs.

**3. Free-form Ekstra Notlar (dealbreaker hybrid)**
- Serbest metin alanı — "asla pazar günü çalışmıyorum", "ürün fotosu çekmem", "sigara markasıyla işbirliği yapmam"
- Agent bu notlara **mutlaka uyar** (system prompt'ta dealbreaker olarak işaretlenir)

**4. Persona**
- İsim + avatar + 4 preset stilden biri (Sert / Dengeli / Uyumlu / Hızlı kapatıcı)
- Stil, system prompt'taki ton ve agresiflik parametrelerini ayarlar

**5. Semantic Memory (otomatik)**
- Tamamlanmış müzakerelerin **text summary'si** `profile_memory` tablosuna yazılır
- Yeni müzakerede son N özet system prompt'a eklenir
- Format: kısa bullet ("Son 3 işbirliği: ortalama 8500₺, hafta sonu çalışmadı")
- MVP'de simple recency-based retrieval (embedding yok — proje genelinde embedding kaldırıldı); pgvector tabanlı relevance retrieval v2'ye bırakıldı

### Müzakere Akışı

- **Model**: OpenAI API — `gpt-5-nano`
  - Avantaj: düşük maliyet, hızlı yanıt, Türkçe başarısı yeterli, structured output desteği
  - Müzakere gibi yapılandırılmış kısa turlu görevler için uygun

- **Dil**: Türkçe (MVP). i18n yapısı v2'ye hazır.

- **Tur limiti**:
  - Default: **10 tur**
  - Premium kullanıcı her iki tarafta da **+5 tur paketi (29₺)** satın alabilir

- **Conversation loop**: FastAPI tarafında async, A'nın agent'ı ↔ B'nin agent'ı

- **Output (her tur, JSON schema)**:
  ```json
  {
    "message": "Agent'ın karşı tarafa gönderdiği mesaj (Türkçe)",
    "reasoning": "Neden bu teklifi yaptım — kullanıcıya görünür düşünce balonu",
    "proposed_terms": {
      "price": 8500,
      "duration_days": 7,
      "scope": "2 reel + 3 story",
      "extra_conditions": ["hafta içi çekim"]
    },
    "status": "continue" | "agree" | "reject"
  }
  ```

- **Agent yetkisi**: müzakere ve öneri — bağlayıcı karar veremez, anlaşma özeti üretir

### Transparency & Kontrol UX

- **Real-time WebSocket**: kullanıcı agent'ların mesajlaşmasını canlı görür
- **Düşünce balonu**: her agent mesajının altında 🧠 açılabilir panel — "Neden böyle teklif ettim?"
- **Müdahale et butonu**: kullanıcı istediği anda
  - Agent yerine kendi mesajını yazabilir
  - Agent'a "şu yönde ilerle" talimatı verebilir
  - Müzakereyi durdurabilir
- **Tur sayacı** her zaman görünür (örn. `Tur 4/10`)
- **Agent Inbox**: paralel devam eden müzakereler listesi (multi-match)

### Anlaşma Sonu Akışı

**Anlaşıldı (status: agree iki taraflı)** → yapılandırılmış **özet kartı**:

| Alan | Değer |
|---|---|
| Ücret | 8500₺ |
| Süre | 7 gün |
| Kapsam | 2 reel + 3 story |
| Ek şartlar | hafta içi çekim |

**3 buton**:
- ✅ **Kabul ediyorum** → anlaşma `confirmed` statusüne geçer, iki tarafa bildirim
- 🔄 **Bir kez daha pazarlık** → agent ekstra 1-2 tur ile özeti tıraşlar
- ❌ **Reddet** → anlaşma `rejected`, in-app chat açılır

**Anlaşılamadı (10. tur sonu)**:
- Premium kullanıcıya inline CTA: **"+5 tur — 29₺"**
- Tarafların biri reddederse veya free fallback: **in-app chat**'e geç, agent özeti not olarak gelir

### Müzakere Konuları

Agent'ın müzakere edebileceği parametreler:
- Ücret / bütçe
- İş kapsamı
- Takvim / süre
- İçerik şartları (post sayısı, format)
- Lokasyon
- Ek koşullar (özel istekler, kısıtlar)

### Multi-match Davranışı

- Tüm müzakereler **paralel thread** olarak çalışır
- Her thread bağımsız: agent'lar birbirinden haberdar değil (v2'de competitive negotiation)
- Kullanıcı **Agent Inbox**'tan tüm aktif müzakereleri yönetir

---

## Fiyatlandırma & Premium

### Tier Yapısı

| Rol | Free | Premium |
|---|---|---|
| **Influencer / Çalışan** | Match olur, agent yok → in-app chat (basit) | **149₺/ay** — agent erişimi, sınırsız concurrent, semantic memory |
| **İşletme** | Match olur, agent yok → in-app chat | **499₺/ay** — agent + dashboard analytics + agent agresiflik ayarı + çoklu ilan yönetimi |

### Ekstra Paketler

- **+5 tur paketi**: 29₺ (10 tur biten Premium kullanıcı için)

### Ödeme (MVP)

- **Mock ödeme**: Stripe görünümlü UI, backend'de `is_premium` flag toggle
- Gerçek Stripe / iyzico entegrasyonu v2'de
- Mock checkout: settings → Premium sekmesi, ayrıca contextual paywall (free user agent açmaya çalışınca modal)

### Maliyet Kontrolü

- `gpt-5-nano` ucuz; yine de premium başına aylık tur limiti tanımlanır (örn. aylık 50 müzakere için baseline, ekstra paket ile aşılabilir)
- Token kullanımı `billing_events` tablosunda loglanır

---

## Sosyal Medya Mock Data

Seed data olarak elle hazırlanmış, Instagram'dan çekilmiş gibi yapılandırılmış mock veri:

- Her influencer için: post içerikleri, caption'lar, hashtag'ler, konum etiketleri, etkileşim metrikleri (takipçi, like, yorum, izlenme)
- DB'ye seed script ile yüklenir
- Format gerçek Instagram API yapısına yakın (sonradan API'ye geçiş kolay olsun)

**Veri hacmi kararı (2026-05-17):** `data_özellikleri.md`'deki tam hacim (80/50/60) yerine hackathon için **azaltılmış v1.5** kullanılır: 20 influencer, 10 işletme, 20 collab listing, 300-500 instagram post, 100-200 swipe, 40 match, 20 agreement, 1000 training pair. Tam hacim post-hackathon çalışması olarak referans tutulur.

---

## Teknik Yığın (Kesinleşmiş)

- **Mobil**: React Native + Expo
- **Backend**: Python + FastAPI (async, **WebSocket** native desteği — agent müzakere streaming için, sonraki sprint)
- **Veritabanı**: PostgreSQL + PostGIS (konum)
  - **pgvector kaldırıldı**: ranking modeli embedding kullanmıyor, agent semantic memory bu sprintte text-only. pgvector v2'ye bırakıldı.
- **Dashboard**: Next.js
- **Ranking modeli**: XGBoost (`XGBClassifier`, 3-class) — `untitled24.py` Colab notebook'unda eğitilmiş, joblib serialize. Çıktı: `xgboost_match_ranker.joblib` + `xgboost_match_ranker_metadata.json`. Adapter pattern (`backend/app/ml/predictor.py`); model yoksa kural tabanlı fallback (`matching.py`).
- **Agent LLM** (sonraki sprint): OpenAI API — `gpt-5-nano` (structured output, JSON schema)
- **Geliştirme ortamı**: Docker
- **Versiyon kontrolü**: Branch tabanlı, kişi başı feature branch

---

## AI Mimarisi — Retrieval + Ranking Yaklaşımı

İki aşamalı klasik yaklaşım. PostGIS + XGBoost ile FastAPI üzerinde temiz çalışır.

### 1. Profil Feature Pipeline

**Güncelleme (2026-05-17):** Embedding katmanı **kaldırılmıştır**. Eğitilen ranking modeli (XGBoost, `untitled24.py` Colab notebook'u) embedding kullanmıyor; tüm pair feature'ları kural tabanlı: jaccard (sektör/kategori), haversine (konum), exp decay (aktiflik), `mentioned_brands` string match. Profil ve ilan metinleri embedding'e çevrilmez; "semantic similarity" yerine sektör/kategori jaccard'ı kullanılır. `data_özellikleri.md` §3.1 (Embedding Pipeline) bu sprint için gözardı edilir. Agent semantic memory veya gelişmiş retrieval için pgvector sonraki sprintte yeniden değerlendirilir.

### 2. Retrieval Aşaması (Aday Üretme — Hızlı Filtre)

Bir kullanıcı akışı açtığında, ilgili top 100-200 ilan çekilir:

**Hard Filter**:
- PostGIS: `ST_DWithin(konum, X km içinde)`
- Kategori uyumu
- İstihdam türü tercihi (çalışan için)
- Aktif ilanlar

**Soft Filter**:
- Kural tabanlı feature'lar (jaccard, kategori match) → threshold üstündekiler ranker'a gider

### 3. Ranking Aşaması (Skorlama)

Top 100 aday için çok faktörlü skor:

| Faktör | Ağırlık (başlangıç fikri) | Kaynak |
|---|---|---|
| Sektör/kategori jaccard | 0.35 | Kural tabanlı |
| Konum yakınlığı | 0.20 | PostGIS haversine |
| Tier uyumu | 0.20 | Kural tabanlı sınıflandırma |
| Etkileşim oranı | 0.15 | Mock Instagram data |
| Aktiflik (son post, exp decay) | 0.10 | Mock Instagram data |

**Güncelleme (2026-05-17, hackathon scope kararı):** v1 linear combination aşaması **atlanmıştır**. Hackathon kapsamında doğrudan **XGBoost** ranking modeli kullanılır (`untitled24.py` Colab notebook'unda eğitilmiş, `XGBClassifier`, 3-class: kötü/orta/iyi match, joblib serialize). Çıktı dosyaları: `xgboost_match_ranker.joblib` + `xgboost_match_ranker_metadata.json` (feature_cols listesi metadata'da). Yukarıdaki linear ağırlıklar artık modelin başlangıç fikrini temsil eder, runtime'da kullanılmaz. Model adapter pattern ile sarılır (`backend/app/ml/predictor.py`); model dosyası yoksa kural tabanlı fallback (`matching.py`) devreye girer ve frontend bozulmaz.

**Not (LightGBM yerine XGBoost):** `data_özellikleri.md` §2.1 LightGBM önermişti. Eğitim notebook'u XGBoost'a karar verdi — backend adapter buna uygun yazılır. Adapter pattern sayesinde sonra LightGBM modeli gelirse de eklenebilir.

**Bu sprint kapsam dışı:** Agent müzakere döngüsü (gpt-5-nano) ve worker (çalışan) akışı bu sprintte implement edilmiyor — altyapı (Predictor, retrieval, ranking) kurulduktan sonra ayrı bir sprintte eklenecek.

### 4. Influencer Tier Sınıflandırması

Kural tabanlı, mock data üzerinden hesaplanır:

| Tier | Takipçi | Etkileşim Oranı |
|---|---|---|
| Nano | 1K–10K | %5+ |
| Micro | 10K–100K | %3+ |
| Mid | 100K–500K | %2+ |
| Macro | 500K–1M | %1.5+ |
| Mega | 1M+ | %1+ |

İşletmeler tier bazlı filtreleyebilir veya sistem önerebilir.

---

## Toplam AI Akışı

```
Kullanıcı akış açar
  → Retrieval (PostGIS + kural tabanlı filtre) → top 200 ilan
  → Ranking (XGBoost, fallback: kural tabanlı) → top 50 ilan
  → Kullanıcıya kaydırma kartları
  → Match olursa
    ↳ İki taraf Premium → Agent müzakere döngüsü (max 10 tur + opsiyonel ekstra)   [sonraki sprint]
    ↳ Free taraf varsa → in-app chat
  → Sonuç: anlaşma özeti (yapılandırılmış kart) VEYA insana devir
```

---

## Backend Endpoint'leri (Agent v2 — sonraki sprint)

| Endpoint | Açıklama |
|---|---|
| `POST /negotiations/{match_id}/start` | Match'ten müzakere başlat (iki taraf da premium ise) |
| `WS /negotiations/{id}/stream` | Real-time mesaj akışı, tur tur |
| `POST /negotiations/{id}/intervene` | Kullanıcı manuel mesaj veya yön talimatı gönderir |
| `POST /negotiations/{id}/finalize` | `accept` / `renegotiate` / `reject` |
| `POST /negotiations/{id}/extend` | +5 tur paketi satın al (29₺ mock) |
| `POST /billing/mock/upgrade` | Mock premium aktivasyonu (rol + plan) |
| `GET /negotiations/inbox` | Kullanıcının aktif müzakereleri |

---

## Veri Modeli (Yeni / Güncellenen Tablolar)

| Tablo | Önemli Alanlar | Sprint |
|---|---|---|
| `users` | + `tier` (free/premium), + `agent_persona` JSON (name, avatar, style) | **bu sprint** |
| `dealbreakers` | user_id, structured fields (min_price, max_hours, forbidden_days...), `free_notes` text | **bu sprint** |
| `negotiations` | match_id, status, current_round, max_rounds, started_at | sonraki sprint |
| `negotiation_messages` | negotiation_id, role (agent_a/agent_b/user), content, reasoning, proposed_terms JSON, round | sonraki sprint |
| `agreements` | negotiation_id, final_terms JSON, status (confirmed/rejected/renegotiating) | sonraki sprint |
| `profile_memory` | user_id, summary text (embedding YOK — text-only MVP) | sonraki sprint |
| `billing_events` | user_id, type (subscription/extension), amount, status (mock için 'mock_paid') | **bu sprint** (mock toggle) |

Bu sprintte: `users.tier`, `users.agent_persona`, `dealbreakers`, `billing_events` alanları eklenir + mock paywall UI. Müzakere tabloları sonraki sprintte.

---

## Kararlaştırılmış Diğer Konular

- **Coğrafi kapsam** (MVP): İstanbul başlangıçlı, Türkiye'ye genişler
- **Dil**: Türkçe öncelikli, İngilizce yapısal olarak destekli (i18n hazırlığı)
- **Influencer doğrulama**: Instagram bio'ya kod yazdırma yöntemi (basit, ücretsiz)
- **İşletme doğrulama**: MVP'de manuel admin onayı
- **Konum servisi**: Mapbox (ücretsiz limit yüksek) veya OpenStreetMap
- **Deployment**: Docker compose ile başlanır, demo aşaması için yeterli

---

## v2 Backlog

- Karşılıklı puanlama/değerlendirme
- Etki istatistikleri ("bu influencer'la satış %X arttı")
- Çeviri katmanı + niyet analizi (yurt dışı işbirlikleri)
- Seyahat bazlı öneri
- Marka duygu eşleştirmesi
- Anlaşma/sözleşme dijital imza
- Push notification altyapısı
- Zenginleştirilmiş in-app chat (free kullanıcı + agent fallback senaryoları)
- Portfolyo sekmesi
- Şikayet/itiraz mekanizması
- **Gerçek ödeme entegrasyonu** (Stripe / iyzico) — MVP'de mock
- **Competitive negotiation** — agent'lar diğer eş zamanlı tekliflerden haberdar olarak pazarlık yapar
- **Full character creator** — slider'lar / detaylı persona / free-form agent prompt (prompt injection güvenliği ile)
- **Otomatik kabul opt-in** — kullanıcı min şartlarını karşılayan teklifi otomatik onaylar
- **Multi-language agent** — kullanıcı dili bazlı + çeviri katmanı
- **pgvector + embedding tabanlı semantic memory** — agent geçmiş müzakerelerden ilgili kısımları context'e çeker
- **Agent learning** (XGBoost ranking + agent davranış RLHF) — kullanıcı davranışına göre kendini iyileştirir
- Komisyon/iş modeli (transaction fee)
