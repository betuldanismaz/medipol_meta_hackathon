# 🚀 Hackathon Projesi — Sosyal Medya YZ Ekosistemi

## Ekip
| İsim | Sorumluluk Alanı |
|------|-----------------|
| Betül | Trend Araştırma (F1) + İçerik Öneri Sistemi (F8) |
| Ömer | Hesap Yönetimi (F2) + Algoritma Manipülasyon (F7) |
| Emir | Dezenformasyon & Deep Search (F3) |
| Emre | Otomatik Moderasyon (F4) + Troll/Bot Tespiti (F5) |
| Mehmet | Duygu Analizi & Filtre (F6) |

## Proje Kapsamı
8 modüllü, birbirine entegre bir sosyal medya YZ ekosistemi:

1. **F1** — İçerik üreticileri için trend & konu araştırması (medya formatında sunum)
2. **F2** — İçerik üreticisinin kendi hesabını yönetmesi
3. **F3** — Dezenformasyon ve siber zorbalık için deep search + özet sistemi
4. **F4** — Kötü kelimeleri pozitif dile dönüştüren otomatik moderasyon
5. **F5** — Troll ve botları izole eden sunucu yönlendirme sistemi
6. **F6** — Duygu analizi ile zararlı akımları tespit ve filtre
7. **F7** — Algoritma manipülasyonu & oyunlaştırma (platform = tuval)
8. **F8** — Yorum/etkileşim analizi ile kişiselleştirilmiş içerik önerisi

## Repo Yapısı
```
/arastirma/     → Her modül için araştırma notları, kaynaklar, kısıtlar
/agents/        → Her modül için agent sistem promptları
/prompts/       → Geliştirme sürecinde kullanılan meta-promptlar
/ekip/          → Kişi bazlı görev takibi
```

## Kapsam Dışı (Scope Out)
> Bu liste halüsinasyon engellemek için kritiktir. Aşağıdakiler bu projede **yapılmaz**:
- Gerçek zamanlı platform API erişimi (Twitter/X, Instagram, TikTok resmi API'leri kapsam dışı — mock data kullanılır)
- Kullanıcı kimlik doğrulama altyapısı (OAuth, 2FA vb.)
- Mobil uygulama geliştirme
- Reklam/monetizasyon modülleri
- Veri tabanı altyapısı kurulumu (demo için in-memory/mock)
- Yasal uyumluluk danışmanlığı (GDPR, KVKK implementasyonu)

## Teknoloji Seçimleri
- **LLM:** Claude API (claude-sonnet-4-20250514)
- **Embedding:** sentence-transformers veya OpenAI embeddings (araştırılacak)
- **Backend:** Python / FastAPI
- **Frontend:** React + Tailwind
- **Demo Verisi:** Sentetik + kamuya açık veri setleri

## Geliştirme Kuralları
1. Her modülün kendi `/arastirma/` klasörü var — koda başlamadan önce okunmalı
2. Agent promptları `/agents/` klasöründe — doğrudan kopyalanıp kullanılır
3. Kapsam dışı liste değiştirilmek istenirse tüm ekip onayı gerekir
4. Her commit mesajı `[F1]`, `[F3]` gibi modül etiketi içermeli
