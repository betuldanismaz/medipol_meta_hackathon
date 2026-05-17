# Git Branch Stratejisi & Kurulum Rehberi

## Branch Yapısı

```
main
├── betul/f1-trend-arastirma
├── betul/f8-icerik-oneri
├── omer/f2-hesap-yonetimi
├── omer/f7-algoritma-oyunlastirma
├── emir/f3-dezinformasyon
├── emre/f4-moderasyon
├── emre/f5-troll-bot
└── mehmet/f6-duygu-analizi
```

---

## İlk Kurulum (Repo'yu ilk kez klonlayanlar)

```bash
# Repo'yu klonla
git clone https://github.com/[TAKIM_ADI]/[REPO_ADI].git
cd [REPO_ADI]

# Kendi branch'ini oluştur ve geç
git checkout -b isim/modül-adı

# Örnek:
git checkout -b betul/f1-trend-arastirma
git checkout -b emir/f3-dezinformasyon
```

---

## Kişi Bazlı Branch Komutları

### Betül
```bash
git checkout -b betul/f1-trend-arastirma
# F1 tamamlandığında:
git checkout -b betul/f8-icerik-oneri
```

### Ömer
```bash
git checkout -b omer/f2-hesap-yonetimi
git checkout -b omer/f7-algoritma-oyunlastirma
```

### Emir
```bash
git checkout -b emir/f3-dezinformasyon
```

### Emre
```bash
git checkout -b emre/f4-moderasyon
git checkout -b emre/f5-troll-bot
```

### Mehmet
```bash
git checkout -b mehmet/f6-duygu-analizi
```

---

## Günlük Çalışma Akışı

```bash
# 1. Her sabah main'i çek
git checkout main
git pull origin main

# 2. Kendi branch'ine geç
git checkout betul/f1-trend-arastirma

# 3. Main'deki değişiklikleri kendi branch'ine al
git merge main

# 4. Çalış, dosya ekle/değiştir

# 5. Commit at — modül etiketi kullan!
git add .
git commit -m "[F1] Trend araştırma mock verisi eklendi"

# 6. Branch'ini push et
git push origin betul/f1-trend-arastirma
```

---

## Commit Mesajı Kuralları

```
[MODÜL] Kısa açıklama (max 60 karakter)

Örnekler:
[F1] pytrends mock veri entegrasyonu
[F3] Güvenilirlik skoru algoritması eklendi
[F4] Türkçe kötü kelime seed listesi (230 kelime)
[F5] Bot skor hesaplama fonksiyonu
[GENEL] README güncellendi
[EKIP] Görev takibi güncellendi
```

---

## Main'e Merge (Demo Günü)

```bash
# Kendi branch'ini main'e merge etmeden önce:
# 1. Branch'ini güncelle
git checkout betul/f1-trend-arastirma
git merge main   # çakışma varsa çöz

# 2. Main'e geç ve merge et
git checkout main
git merge betul/f1-trend-arastirma

# 3. Push et
git push origin main
```

> ⚠️ Demo gününden önce hep birlikte merge yapın — çakışmaları birlikte çözün.

---

## Çakışma (Conflict) Durumunda

Aynı dosyayı iki kişi değiştirdiyse Git çakışma işaretler:
```
<<<<<<< HEAD
senin değişikliğin
=======
diğerinin değişikliği
>>>>>>> main
```

Çözüm: İkisini karşılaştır, doğru olanı bırak, işaretleri sil, commit at. Emin değilsen diğer kişiyi çağır, birlikte bakın.

---

## .gitignore (Repo'ya ekleyin)

```
# Python
__pycache__/
*.pyc
.env
venv/
.venv/

# Node
node_modules/
.next/
dist/
build/

# Editör
.vscode/
.idea/
*.DS_Store

# API anahtarları — ASLA commit etme!
.env
.env.local
secrets.json
api_keys.txt
```

> 🔑 API anahtarlarını asla commit etmeyin. `.env` dosyası kullanın ve `.gitignore`'a ekleyin.
