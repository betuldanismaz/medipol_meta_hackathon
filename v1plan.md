# Seed Data & AI Model Eğitim Verisi Spesifikasyonu

> *Doküman Amacı: Bu doküman projede üretilecek tüm **seed data'ları ve AI modellerinin **eğitim verisi* spesifikasyonunu tanımlar.

---

## İçindekiler

1. [Üretilecek Seed Datalar](#1-üretilecek-seed-datalar)
   - 1.1 Taksonomi / Referans Verileri
   - 1.2 Entity Verileri (Influencer / İşletme / Çalışan)
   - 1.3 Activity Verileri (Instagram Postları, İlanlar)
   - 1.4 Agent Tercih Formları
   - 1.5 Davranışsal Mock Veriler
2. [AI Model Eğitim Verisi](#2-ai-model-eğitim-verisi)
   - 2.1 Eğitilecek Model
   - 2.2 Feature Spesifikasyonu
   - 2.3 Etiketleme (Synthetic Labeling)
   - 2.4 Eğitim Veri Şeması
   - 2.5 Eğitim Pipeline
3. [Eğitim Gerektirmeyen AI Bileşenleri](#3-eğitim-gerektirmeyen-ai-bileşenleri)
4. [Üretim Sırası ve Hacim Özeti](#4-üretim-sırası-ve-hacim-özeti)

---

## 1. Üretilecek Seed Datalar

### - [x] 1.1 Taksonomi / Referans Verileri
- [x] 1.1.1 sectors — Sektörler
- [x] 1.1.2 content_categories — İçerik Kategorileri
- [x] 1.1.3 content_styles — İçerik Stil Etiketleri
- [x] 1.1.4 job_positions — İş Pozisyonları
- [x] 1.1.5 employment_types — İstihdam Türleri
- [x] 1.1.6 hashtags — Hashtag Havuzu
- [x] 1.1.7 locations — Şehir / İlçe / Semt
- [x] 1.1.8 audience_demographics_tags — Hedef Kitle Etiketleri

### - [x] 1.2 Entity Verileri
- [x] 1.2.1 influencer_profiles — Influencer Profilleri (80 adet)
- [x] 1.2.2 business_profiles — İşletme Profilleri (50 adet)
- [x] 1.2.3 worker_profiles — Çalışan Profilleri (60 adet)

### - [x] 1.3 Activity Verileri
- [x] 1.3.1 instagram_posts — Mock Instagram Postları (2400 adet)
- [x] 1.3.2 collab_listings — İşbirliği İlanları (80 adet)
- [x] 1.3.3 job_listings — İş İlanları (70 adet)

### - [x] 1.4 Agent Tercih Formları
- [x] 1.4.1 agent_preferences (Influencer örneği)
- [x] 1.4.2 agent_preferences (İşletme örneği)
- [x] 1.4.3 agent_preferences (Çalışan örneği)

### - [x] 1.5 Davranışsal Mock Veriler
- [x] 1.5.1 swipes — Kaydırma Eylemleri (800 adet)
- [x] 1.5.2 matches — Eşleşmeler (150 adet)
- [x] 1.5.3 agreements — Anlaşmalar (80 adet)

## 2. AI Model Eğitim Verisi
- [x] 2.2 Feature Spesifikasyonu Hesaplaması
- [x] 2.3 Etiketleme (Synthetic Labeling) Kodu
- [x] 2.4 Eğitim Veri Şeması (5000 Pair Üretimi)
- [x] 2.5 Eğitim Pipeline Script'i

## 3. Eğitim Gerektirmeyen AI Bileşenleri
- [x] 3.1 Embedding Pipeline Entegrasyonu
- [x] 3.2 Tier Sınıflandırma
- [x] 3.3 Doğal Afinite Skoru
- [x] 3.4 Agent (LLM, OpenAI gpt-5-nano) Prompt Şablonları
