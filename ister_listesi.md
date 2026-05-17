Proje İsterleri — v1 (Final)
Genel Tanım
İşletmelerle (kafeler, butikler, dükkanlar) iki tür yetenek havuzunu eşleştiren Tinder benzeri konum bazlı mobil uygulama:

Influencer'lar — reklam/içerik işbirliği için
Çalışanlar — istihdam (her türlü iş) için

Eşleşme sonrası iki taraflı agent sistemi belirli aralıklar/koşullar üzerinden müzakere yürütür; agent'lar uzlaşırsa anlaşma özeti insanlara devredilir.
Kullanıcı Rolleri

Influencer (mobil)
Çalışan (mobil) — her türlü iş kategorisi için
İşletme (mobil + dashboard) — iki tip ilan açabilir: "influencer arıyorum" / "çalışan arıyorum"
Admin (dashboard)

MVP İsterleri
Kimlik & Profil

Üç tip kayıt: Influencer / Çalışan / İşletme
Influencer profili: alan, içerik tarzı, sosyal medya linkleri, konum, ücret aralığı
Çalışan profili: form üzerinden — deneyim, pozisyon tercihi, istihdam türü tercihi (tek seferlik / part-time / full-time / sezonluk / proje bazlı), uygunluk saatleri, konum, ücret aralığı
İşletme profili: sektör, konum, ilan tipi seçebilme

İlan Sistemi

İşletme iki tip ilan açabilir:

İşbirliği ilanı (influencer için): kapsam, bütçe, içerik beklentisi
İş ilanı (çalışan için): pozisyon, istihdam türü, saatler, ücret


İlanlar konuma göre filtrelenir

Eşleşme Çekirdeği

Influencer ve Çalışan kendi türündeki ilanları ayrı akışlarda görür
Sağa/sola kaydırma, çift onaylı match
Eşleşme olunca otomatik agent kanalı açılır

Agent Müzakere Sistemi

Her kullanıcı (influencer/çalışan/işletme) kayıt sırasında agent tercih formu doldurur:

Influencer/Çalışan: minimum ücret, max iş yükü, çalışılmaz koşullar, içerik tarzı kısıtları
İşletme: bütçe tavanı, beklenti, dealbreaker'lar


Eşleşme anında agent'lar otomatik konuşmaya başlar
Max 10 tur mesajlaşma
Agent'ların yetkisi: müzakere ve öneri — bağlayıcı karar veremez, anlaşma özeti üretir
10 tur sonunda anlaşılırsa → özet iki tarafa sunulur, manuel onayla anlaşma kesinleşir
10 tur sonunda anlaşılamazsa → insan devreye girer, in-app sohbet açılır
Agent'ın tartışacağı konular: ücret/bütçe, iş kapsamı, takvim, içerik şartları, ek koşullar

Sosyal Medya Mock Data

Seed data olarak elle hazırlanmış, Instagram'dan çekilmiş gibi yapılandırılmış mock veri
Her influencer için: post içerikleri, caption'lar, hashtag'ler, konum etiketleri, etkileşim metrikleri (takipçi, like, yorum, izlenme)
DB'ye seed script ile yüklenir
Format gerçek Instagram API yapısına yakın olmalı (sonradan gerçek API'ye geçiş kolay olsun)

Teknik Yığın (Kesinleşmiş)

Mobil: React Native + Expo
Backend: Python + FastAPI
Veritabanı: PostgreSQL + PostGIS (konum sorguları) + pgvector (semantic search)
Dashboard: Next.js
Geliştirme ortamı: Docker
Versiyon kontrolü: Branch tabanlı, kişi başı feature branch


AI Mimarisi — Retrieval + Ranking Yaklaşımı
İki aşamalı klasik yaklaşımı öneriyorum. Bu mimari pgvector + PostGIS ile FastAPI üzerinde temiz çalışır.
1. Profil Embedding Pipeline
Her profili bir vektöre dönüştürürüz:

Influencer vektörü: bio + içerik kategorisi + son N post caption'ı + hashtag'ler + konum geçmişi → embedding
Çalışan vektörü: deneyim + pozisyon + tercih + beceriler → embedding
İlan vektörü: ilan başlığı + açıklama + aranan özellikler → embedding

Model seçimi:

Güncellenmiş Bölüm — Agent (Müzakere LLM)

Model: OpenAI API — gpt-5-nano

Avantaj: maliyeti çok düşük, hızlı yanıt veriyor, Türkçe başarısı yeterli
Müzakere gibi yapılandırılmış, kısa turlu görevler için uygun (yaratıcı uzun metin değil, kural tabanlı pazarlık)


Her agent için system prompt içeriği:

Kullanıcının tercih formu (sınırlar, dealbreaker'lar, ücret aralığı)
Müzakere edebileceği parametreler
"Max 10 tur, mevcut tur: X" sayacı


Conversation loop: FastAPI tarafında async, A'nın agent'ı ↔ B'nin agent'ı
Output: OpenAI'nin response_format: json_schema özelliğiyle structured anlaşma özeti veya no_agreement: true
Maliyet kontrolü: gpt-5-nano ucuz olduğu için MVP'de sıkı limit gerekmiyor, ama yine de kullanıcı başı aylık tur limiti güvenlik açısından konabilir

Vektörler pgvector ile PostgreSQL'de tutulur.
2. Retrieval Aşaması (Aday Üretme — Hızlı Filtre)
Bir kullanıcı akışı açtığında, ilgili top 100-200 ilan çekilir:
Hard Filter (kesin filtreler):
  - PostGIS: ST_DWithin(konum, X km içinde)
  - Kategori uyumu
  - İstihdam türü tercihi (çalışan için)
  - Aktif ilanlar

Soft Filter:
  - pgvector cosine similarity (profil ↔ ilan vektörü)
  - Threshold üstündekiler alınır
3. Ranking Aşaması (Skorlama — Sıralama)
Top 100 aday için çok faktörlü skor hesaplanır:
FaktörAğırlık (başlangıç)KaynakSemantic similarity0.35Embedding cosineKonum yakınlığı0.20PostGIS distanceTier uyumu0.20Kural tabanlı sınıflandırmaEtkileşim oranı0.15Mock Instagram dataAktiflik (son post)0.10Mock Instagram data
Başlangıç: Bu ağırlıklarla linear combination — basit, açıklanabilir.
v2: Kullanıcı davranışı (kaydırma, eşleşme, başarılı anlaşma) toplandıkça LightGBM ile öğrenmeli ranking'e geçilir.
4. Influencer Tier Sınıflandırması
Kural tabanlı, mock data üzerinden hesaplanır:
TierTakipçiEtkileşim OranıNano1K–10K%5+Micro10K–100K%3+Mid100K–500K%2+Macro500K–1M%1.5+Mega1M+%1+
İşletmeler tier bazlı filtreleyebilir veya sistem önerebilir.
5. Agent (Müzakere LLM)

Model önerisi: Claude API (Türkçe başarısı yüksek, structured output verir) veya OpenAI GPT
Her agent için system prompt:

Kullanıcının tercih formu (sınırlar, dealbreaker'lar)
Müzakere edebileceği parametreler
"Max 10 tur, mevcut tur sayısı: X"


Conversation loop: A'nın agent'ı → B'nin agent'ı → A → B ... (FastAPI'de async loop)
Output: structured JSON anlaşma özeti veya no_agreement: true
Maliyet kontrolü: Her ay kullanıcı başı tur limiti konabilir

Toplam AI Akışı
Kullanıcı akış açar
  → Retrieval (PostGIS + pgvector) → top 200 ilan
  → Ranking (skorlama) → top 50 ilan
  → Kullanıcıya kaydırma kartları olarak sunulur
  → Match olursa
  → Agent müzakere döngüsü başlar (max 10 tur)
  → Sonuç: anlaşma özeti VEYA insana devir

v2'ye Bırakılanlar (Backlog)

Karşılıklı puanlama/değerlendirme
Etki istatistikleri ("bu influencer'la satış %X arttı")
Çeviri katmanı + niyet analizi (yurt dışı işbirlikleri)
Seyahat bazlı öneri
Marka duygu eşleştirmesi
Anlaşma/sözleşme dijital imza
Push notification altyapısı
In-app sohbet (agent'lar uzlaşamayınca devreye giriyor — bu MVP'de basit chat olabilir)
Portfolyo sekmesi
Şikayet/itiraz mekanizması
Ödeme entegrasyonu
Komisyon/iş modeli

Kararlaştırılmış Diğer Konular

Coğrafi kapsam (MVP): İstanbul başlangıçlı, Türkiye'ye genişler
Dil: Türkçe öncelikli, İngilizce yapısal olarak destekli (i18n hazırlığı)
Influencer doğrulama: Instagram bio'ya kod yazdırma yöntemi (basit, ücretsiz)
İşletme doğrulama: MVP'de manuel admin onayı yeterli
Ödeme: Platform dışı, MVP'de iki taraf kendi aralarında halleder
Konum servisi: Mapbox (ücretsiz limit yüksek) veya OpenStreetMap
Deployment: Docker compose ile başlanır, demo aşaması için yeterli