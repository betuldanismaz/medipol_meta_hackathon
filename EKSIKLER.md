# Backend ↔ Frontend Gap Analizi — Agent v2 Sonrası

> Tarih: 2026-05-17 · Bu doküman, **mevcut** kodun (`backend/app/*`, `frontend/app/*`) **ister_listesi.md v2** ile karşılaştırılması sonucunda oluşan **eksik listesi**dir. Her madde uygulanabilir bir görev olarak yazıldı.

---

## TL;DR — En kritik eksikler

1. **Mock-data hâlâ aktif**: 5 public sayfa + 5 dashboard sayfası `lib/mock-data.ts`'tan veri okuyor.
2. **Seed script yok**: `output/*.json` (20 inf, 10 biz, 20 collab, 300+ post, 100+ swipe, 40 match, 20 agreement) dosyaları DB'ye yüklenmedi (Python script eksik).
3. **Public profile/listing endpoint'leri**: `/influencers`, `/influencers/{id}`, `/listings/{id}` (public detay), instagram_posts hâlâ yok.
4. **Discovery feed**: Swipe için ranklı kart akışı (XGBoost predictor ile) bağlı değil.
5. **Dashboard stats**: özet sayfa kartları (aktif eşleşme, swipe, başvuru) sabit string.
6. **Taxonomy**: sectors / categories / content_styles için endpoint yok (filtrelerde lazım).
7. **In-app messages**: free fallback chat tamamen mock + local state.
8. **Profile sayfası**: backend'e bağlı değil (sabit "Demo Kullanıcı" gösteriyor).
9. **External ID köprüsü**: seed JSON'lardaki `inf_001`, `biz_001`, `col_001` ID'leri ↔ backend integer PK arasında köprü yok.

---

## A. Frontend sayfa sayfa — neresi mock?

### A1. Public site (SiteShell altında)

| Sayfa | Durum | Backend ihtiyacı |
|---|---|---|
| `app/page.tsx` (Landing) | Hardcoded içerik (zarar yok, ama featured listeleme bağlanmalı) | İsteğe bağlı: `/listings?featured=true` |
| `app/listings/page.tsx` | **MOCK** — `lib/mock-data.ts::listings` (6 sabit kart, `picsum.photos`) | `GET /listings/public` (cover URL, kategori, bütçe formatlı) |
| `app/listings/[id]/page.tsx` | **MOCK** — aynı listings | `GET /listings/{id}/public` (description, requirements, businessType) |
| `app/influencers/page.tsx` | **MOCK** — `lib/mock-data.ts::influencers` (6 sabit) | `GET /influencers/public` (filter: tier, niche, city) |
| `app/influencers/[id]/page.tsx` | **MOCK** — aynı influencers | `GET /influencers/{id}/public` + `GET /influencers/{id}/posts` |
| `app/discover/page.tsx` | **MOCK** — `lib/mock-data.ts::influencers`, swipe sadece local state | `GET /discovery/feed` + mevcut `POST /matches/swipe` |
| `app/pricing/page.tsx` | OK (Agent v2 yapısıyla yazıldı, ürün yapısına bağlı) | — |
| `app/auth/*` | OK | `/auth/register`, `/auth/login` |

### A2. Dashboard (auth-gated)

| Sayfa | Durum | Backend ihtiyacı |
|---|---|---|
| `app/dashboard/page.tsx` | Hardcoded "12 / 84 / 5 / 4.8 ⭐" + Backend health card | `GET /users/me/stats` (active_matches, weekly_swipes, pending_apps, avg_rating) |
| `app/dashboard/matches/page.tsx` | **MOCK** — `lib/mock-data.ts::matches` (4 sabit) | mevcut `GET /matches` (genişletilmiş: counterpart_display_name, listing_title, son aktivite) |
| `app/dashboard/messages/page.tsx` | **MOCK** — sabit 3 mesaj, local state, swap-friendly chat değil | `GET /messages/{conversation_id}`, `POST /messages` (free fallback in-app chat) |
| `app/dashboard/analytics/page.tsx` | **MOCK** — `lib/mock-data.ts::analytics` (6 ay sabit) | `GET /analytics/me` (aylık görüntülenme, etkileşim) — sadece İşletme |
| `app/dashboard/profile/page.tsx` | **MOCK** — "Demo Kullanıcı" defaultValue, submit'te toast | `GET /users/me` (varolan) + `PATCH /users/me` (varolan, ama kullanılmıyor) |
| `app/dashboard/negotiations/*` | OK (Agent v2) | — |
| `app/dashboard/billing/page.tsx` | OK (mock checkout backend'e bağlı) | — |

### A3. Matchfluence legacy demo

`app/matchfluence/page.tsx` + `components/matchfluence/*` — hackathon başlangıcındaki eski demo. **Bilerek dokunulmayacak** (sunum için yedek), ama dashboard nav'ından gizlenebilir. Şu an link de yok zaten.

---

## B. Backend — eksik endpoint'ler

| Endpoint | Aciliyet | Açıklama |
|---|---|---|
| `GET /discovery/feed?role=` | **Yüksek** | Kullanıcı rolüne göre swipeable kart akışı; XGBoost predictor (varsa) veya kural tabanlı (`app/matching.py`) ile ranklenmiş ilk N öneri. |
| `GET /listings/public?city=&category=&tier=` | **Yüksek** | Authsuz public listeleme (landing/listings sayfası) |
| `GET /listings/{id}/public` | **Yüksek** | Public detay (apply-button "üye olarak başvur" ile auth flow'a yönlendirir) |
| `GET /influencers/public?tier=&city=&niche=` | **Yüksek** | Public influencer listeleme |
| `GET /influencers/{id}/public` | **Yüksek** | Detay + son post sayısı |
| `GET /influencers/{id}/posts?limit=` | Orta | Instagram post seed verisini servis et |
| `GET /workers/public?...` | Orta | Çalışan listeleme (homepage'de v2'de) |
| `GET /users/me/stats` | **Yüksek** | Dashboard özet kartları için |
| `GET /analytics/me` | Orta | İşletme analytics sayfası için (aylık metrik) |
| `GET /taxonomy` | **Yüksek** | sectors + categories + content_styles + positions (filtre dropdownleri için) |
| `GET /messages/conversations` + `GET /messages/{match_id}` + `POST /messages` | Orta | Free fallback in-app chat (basit text) |
| `POST /admin/seed` veya CLI script | **Yüksek** | output/*.json → DB |

---

## C. Veri modeli — eksik alanlar

Backend modellerinde eklenmesi gereken alanlar (output JSON şeması ile uyumlu):

| Tablo | Eklenecek alan | Sebep |
|---|---|---|
| `users` | `external_id: str unique nullable` | Seed JSON'lardaki `inf_001`/`biz_001` ile eşleştirme |
| `users` | `username: str` | `@elifgezgin` gibi handle |
| `users` | `avatar_url: str nullable` | UI listelerinde görsel |
| `users` (influencer profile JSON içinde): `follower_count`, `engagement_rate`, `content_categories`, `content_styles`, `tier` | influencer kartları için |
| `users` (worker profile JSON): `preferred_positions`, `experience_years`, `rate_range` | worker_matching.py için |
| `users` (business profile JSON): `sector_id`, `subcategory`, `brand_style` | İşletme listeleri için |
| `listings` | `external_id: str unique nullable` | Seed eşleşmesi |
| `listings` | `cover_url: str nullable` | Public kart resmi |
| `listings` (extras JSON) | `deliverables`, `preferred_tiers`, `target_categories` | Seed JSON ile birebir |
| **Yeni tablo** `instagram_posts` | id, influencer_id (FK users), type, caption, hashtags JSON, mentioned_brands JSON, posted_at, metrics JSON, location_tag | output/instagram_posts.json |
| **Yeni tablo** `taxonomy_terms` | id, kind (sector/category/style/position), code, label, parent_code | output/taxonomy.json |
| **Yeni tablo** `messages` | id, match_id, sender_id, content, created_at | In-app chat |

---

## D. Diğer eksikler

- **Token-aware fetch SSR**: `lib/api.ts::getToken()` sadece `window` varken çalışır, server component'ler authed istek atamaz. → SSR sayfaları client'a indirgenmeli ya da cookie tabanlı auth.
- **Logout linki**: dashboard sidebar'da `/` linki var ama `clearAuth()` çağırmıyor.
- **Premium guard frontend**: dashboard/negotiations sayfaları zaten premium kontrol yapıyor, ama discover/swipe sonrası ortaya çıkan paywall modal'ı bağlı değil (swipe `paywall: true` döndürüyor, frontend yakalamıyor).
- **WS reconnect**: `useNegotiationStream` kopunca otomatik reconnect yok (acil değil).
- **Profile picture**: avatar yükleme yok, seed JSON'larda da yok — `dicebear` / `pravatar` fallback yeter.
- **Listing oluşturma UI'ı**: businessler için ilan oluşturma sayfası yok (`POST /listings` var ama UI yok).

---

## E. Uygulama planı (sırasıyla)

1. **Backend veri modeli güncellemesi** — `external_id`, `username`, `avatar_url`, `InstagramPost`, `TaxonomyTerm`, `Message` ekle. **Yıkıcı değil**: nullable alanlar.
2. **Seed script** — `backend/scripts/seed_from_output.py`. JSON'ları okuyup DB'ye yazar. Idempotent (external_id ile upsert).
3. **Public read endpoint'leri** — listings/public, influencers/public, taxonomy, posts (read-only, auth gerektirmez).
4. **Discovery feed** — `/discovery/feed`. Kural tabanlı (`matching.py`) skoru + rastgele jitter.
5. **Dashboard stats + messages + analytics** — `GET /users/me/stats`, `GET/POST /messages`, `GET /analytics/me`.
6. **Frontend — public sayfaları gerçek API'ye bağla** — listings, influencers, discover, listing/[id], influencer/[id]. Server component'lerden client component'lere geçişler.
7. **Frontend — dashboard sayfaları gerçek API'ye bağla** — page, matches, messages, analytics, profile.
8. **Logout + paywall modal'ı bağlama** — sidebar logout, discover sonrası paywall.
9. **Verify** — `python -m py_compile` + `tsc --noEmit`.

> v2 backlog'da kalan (bu raporda DA ele alınmayan): listing oluşturma UI, listing düzenleme, push notification, gerçek Stripe, RLHF agent learning, in-app chat zenginleştirme, etc.
