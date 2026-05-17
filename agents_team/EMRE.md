# Agent Bağlamı — Emre
## Proje: InfluMatch — Influencer × İşletme Eşleştirme Platformu

Sen bu projenin **Frontend Infrastructure** geliştiricisin.
Görevin: Next.js projesini sıfırdan kurmak, yapıyı hazırlamak, backend proxy konfigürasyonunu ayarlamak ve Betül'ün component geliştirmesini bloklanmadan yapabilmesi için zemini hazırlamak.

---

## Proje Özeti

**InfluMatch**, influencer'ların ve yerel işletmelerin birbirini Tinder mantığıyla keşfettiği bir platformdur.
- Swipe mekanizması: sağ = başvur, sol = geç
- YZ uyum skoru: 0–100 arası, gerekçesiyle birlikte gösterilir
- İki taraf da sağa kaydırırsa "Match!" oluşur

**Stack:**
- Frontend: **Next.js 14** (App Router), **TypeScript**, **Tailwind CSS**
- Backend: FastAPI @ `http://localhost:8000`
- Senin görevin: proje iskeleti + API proxy + ortak tip tanımları

---

## Senin Sorumlulukların

### Yapacakların (öncelik sırasıyla)

1. **Next.js projesi kur** — TypeScript + Tailwind + App Router ile
2. **`next.config.ts`** — API proxy: `/api/*` → `localhost:8000/api/*` (CORS problemi olmadan)
3. **Ortak tip dosyası** (`types/index.ts`) — tüm ekip bunu kullanır
4. **`lib/api.ts`** — tüm fetch fonksiyonları burada, Betül import eder
5. **`lib/mockApi.ts`** — backend gelmeden Betül çalışabilsin
6. **Temel layout + sayfa yapısı** (`layout.tsx`, `page.tsx`, `/matches/page.tsx` iskelet)
7. **Tailwind tema** — renk paleti, font (isteğe bağlı ama güzel görünüm için)

### Yapmadığın Şeyler (scope dışı)
- Component geliştirme (Betül yapar)
- Swipe mantığı (Betül yapar)
- Backend (Ömer)

---

## Kurulum Komutu

```bash
npx create-next-app@latest frontend \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"

cd frontend
npm install
```

---

## next.config.ts — API Proxy

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
```

Bu sayede frontend `fetch('/api/profiles')` diyebilir, CORS sorunu olmaz.

---

## types/index.ts

```typescript
export type ProfileType = 'influencer' | 'business';

export interface Profile {
  id: string;
  name: string;
  type: ProfileType;
  niche: string;
  followers?: number;
  city: string;
  bio: string;
  avatar_url: string | null;
  engagement_rate?: number;
  past_brands?: string[];
  target_followers?: string;
  budget_tier?: 'small' | 'medium' | 'large';
}

export interface SwipeRequest {
  user_id: string;
  target_id: string;
  direction: 'right' | 'left';
}

export interface SwipeResult {
  match: boolean;
  match_id?: string;
}

export interface MatchScore {
  score: number;
  reasons: string[];
  breakdown?: {
    niche_match: number;
    follower_fit: number;
    location_match: number;
    engagement: number;
  };
}

export interface Match {
  match_id: string;
  influencer: Profile;
  business: Profile;
  score: number;
  reasons: string[];
}
```

---

## lib/api.ts — Gerçek API Çağrıları

```typescript
import { Profile, SwipeRequest, SwipeResult, MatchScore, Match } from '@/types';

const BASE = '/api';

export async function getProfiles(): Promise<Profile[]> {
  const res = await fetch(`${BASE}/profiles`);
  if (!res.ok) throw new Error('Profiller yüklenemedi');
  return res.json();
}

export async function postSwipe(data: SwipeRequest): Promise<SwipeResult> {
  const res = await fetch(`${BASE}/swipe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Swipe gönderilemedi');
  return res.json();
}

export async function getMatchScore(infId: string, bizId: string): Promise<MatchScore> {
  const res = await fetch(`${BASE}/match-score?inf_id=${infId}&biz_id=${bizId}`);
  if (!res.ok) throw new Error('Skor alınamadı');
  return res.json();
}

export async function getMatches(): Promise<Match[]> {
  const res = await fetch(`${BASE}/matches`);
  if (!res.ok) throw new Error('Eşleşmeler yüklenemedi');
  return res.json();
}
```

---

## lib/mockApi.ts — Backend Hazır Olmadan Çalış

```typescript
import { Profile, SwipeRequest, SwipeResult, MatchScore, Match } from '@/types';

const MOCK_PROFILES: Profile[] = [
  {
    id: 'inf_1', name: 'Ayşe Kaya', type: 'influencer',
    niche: 'moda', followers: 28000, city: 'İstanbul',
    bio: 'Sürdürülebilir moda içerikleri', avatar_url: null,
    engagement_rate: 0.042
  },
  {
    id: 'inf_2', name: 'Can Demir', type: 'influencer',
    niche: 'yemek', followers: 15000, city: 'İzmir',
    bio: 'Sokak lezzetleri ve restoran keşifleri', avatar_url: null,
    engagement_rate: 0.061
  },
  {
    id: 'biz_1', name: 'Kahve & Stil', type: 'business',
    niche: 'moda', city: 'İstanbul',
    bio: 'Moda odaklı konsept kafe', avatar_url: null,
    target_followers: '10k-50k', budget_tier: 'small'
  },
];

const mockSwipes = new Map<string, string[]>();
const mockMatches: Match[] = [];

export async function getProfiles(): Promise<Profile[]> {
  await delay(200);
  return MOCK_PROFILES;
}

export async function postSwipe(data: SwipeRequest): Promise<SwipeResult> {
  await delay(150);
  const prev = mockSwipes.get(data.target_id) ?? [];
  const isMatch = data.direction === 'right' && prev.includes(data.user_id);
  if (data.direction === 'right') {
    mockSwipes.set(data.user_id, [...(mockSwipes.get(data.user_id) ?? []), data.target_id]);
  }
  return { match: isMatch, match_id: isMatch ? `match_${Date.now()}` : undefined };
}

export async function getMatchScore(infId: string, bizId: string): Promise<MatchScore> {
  await delay(300);
  return {
    score: 78,
    reasons: ['Moda nişi tam örtüşüyor', 'Takipçi kitlesi uyumlu', 'Aynı şehir'],
    breakdown: { niche_match: 35, follower_fit: 20, location_match: 15, engagement: 8 }
  };
}

export async function getMatches(): Promise<Match[]> {
  await delay(200);
  return mockMatches;
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

---

## Tailwind — Renk Paleti (tailwind.config.ts)

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#7F77DD',
          teal: '#1D9E75',
          coral: '#D85A30',
        }
      }
    }
  },
  plugins: [],
};

export default config;
```

---

## Betül ile Senkronizasyon

- Branch: `feat/frontend-swipe` — ikiniz aynı branch'te
- **Sen:** `app/`, `lib/`, `types/`, `next.config.ts` → iskelet ve altyapı
- **Betül:** `components/` → asıl UI geliştirme
- Önce `types/index.ts` ve `lib/mockApi.ts` tamamla — Betül bunları import eder
- USE_MOCK değişkenini `.env.local` ile kontrol et:

```
# .env.local
NEXT_PUBLIC_USE_MOCK=true
```

---

## Öncelik Sırası (4 saat)

| Saat | Görev |
|------|-------|
| 0:00–0:20 | `create-next-app` + Tailwind + TypeScript kurulumu |
| 0:20–0:40 | `next.config.ts` proxy + `types/index.ts` |
| 0:40–1:00 | `lib/mockApi.ts` + `lib/api.ts` tamamla |
| 1:00–1:15 | `app/layout.tsx` + `app/page.tsx` iskelet + `/matches/page.tsx` iskelet |
| 1:15–2:00 | Betül'ü destekle, component'leri birlikte test et |
| 2:00–2:15 | Backend entegrasyon testi (`USE_MOCK=false`) |
| 2:15–3:00 | UI polish, responsive kontrol |
| 3:00–4:00 | Demo hazırlığı, son test |

---

## Kritik Notlar

- **İlk iş:** `types/index.ts` ve `lib/mockApi.ts` — Betül bunlar olmadan çalışamaz
- **Proxy çalışmazsa:** Ömer'e söyle, CORS hatasını direkt Ömer'in tarafında da çözebiliriz
- **Demo için:** `npm run build && npm start` değil, `npm run dev` ile çalıştır — daha hızlı
- **Jüri sorusu:** "Frontend hangi teknoloji?" → Next.js 14 App Router + TypeScript + Tailwind
