export type Influencer = {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  city: string;
  niches: string[];
  followers: number;
  engagement: number;
  aiLevel: "Mikro" | "Orta" | "Üst";
  rating: number;
  bio: string;
  recentWork: string[];
};

export type Listing = {
  id: string;
  business: string;
  businessType: string;
  city: string;
  district: string;
  cover: string;
  category: string;
  budget: string;
  description: string;
  requirements: string[];
  postedAt: string;
};

export type Match = {
  id: string;
  influencerId: string;
  listingId: string;
  status: "pending" | "matched" | "completed";
  lastMessage?: string;
  at: string;
};

const av = (seed: string) => `https://i.pravatar.cc/300?u=${seed}`;
const ph = (seed: string) => `https://picsum.photos/seed/${seed}/800/600`;

export const influencers: Influencer[] = [
  { id: "i1", name: "Zeynep Aydın", handle: "@zeynepa", avatar: av("zeynep"), city: "İstanbul", niches: ["Kafe", "Yaşam Tarzı"], followers: 48200, engagement: 6.2, aiLevel: "Mikro", rating: 4.7, bio: "Şehir kafelerini keşfediyor, küçük işletmeleri büyük gösteriyorum.", recentWork: ["Moda Kahve", "Pera Roastery"] },
  { id: "i2", name: "Emre Kılıç", handle: "@emrek", avatar: av("emre"), city: "Ankara", niches: ["Yemek", "Vlog"], followers: 121000, engagement: 4.8, aiLevel: "Orta", rating: 4.5, bio: "Yerel lezzetler ve hikayeleri.", recentWork: ["Çankaya Bistro", "Hamamönü Mantı"] },
  { id: "i3", name: "Naz Demir", handle: "@nazd", avatar: av("naz"), city: "İzmir", niches: ["Moda", "Butik"], followers: 312000, engagement: 5.1, aiLevel: "Üst", rating: 4.9, bio: "Bağımsız moda ve butik markaları.", recentWork: ["Alsancak Atölye", "Karşıyaka Vintage"] },
  { id: "i4", name: "Burak Şen", handle: "@buraks", avatar: av("burak"), city: "İstanbul", niches: ["Spor", "Kafe"], followers: 22400, engagement: 8.1, aiLevel: "Mikro", rating: 4.6, bio: "Antrenman sonrası kahve duraklarım.", recentWork: ["Run Club Coffee"] },
  { id: "i5", name: "Selin Uçar", handle: "@selinu", avatar: av("selin"), city: "Antalya", niches: ["Seyahat", "Kafe"], followers: 89000, engagement: 5.7, aiLevel: "Orta", rating: 4.8, bio: "Sahil kasabalarında küçük mekanlar.", recentWork: ["Kaş Deniz Cafe", "Olympos Treehouse"] },
  { id: "i6", name: "Mert Çelik", handle: "@mertc", avatar: av("mert"), city: "İstanbul", niches: ["Teknoloji", "Yaşam Tarzı"], followers: 540000, engagement: 3.9, aiLevel: "Üst", rating: 4.7, bio: "Gündelik teknoloji ve mekan incelemeleri.", recentWork: ["Levent Tech Hub", "Karaköy Cowork"] },
];

export const listings: Listing[] = [
  { id: "l1", business: "Moda Kahve", businessType: "Kafe", city: "İstanbul", district: "Moda", cover: ph("kafe1"), category: "Kafe", budget: "₺2.000 – ₺5.000", description: "Hafta sonu yeni menümüz için reels içerik üretici arıyoruz.", requirements: ["10k+ takipçi", "Yiyecek-içecek nişi", "İstanbul"], postedAt: "2 gün önce" },
  { id: "l2", business: "Alsancak Atölye", businessType: "Butik", city: "İzmir", district: "Alsancak", cover: ph("butik1"), category: "Moda", budget: "Ürün + ₺1.500", description: "Yaz koleksiyonu için 3 post + 5 story.", requirements: ["Moda nişi", "İzmir", "5k+ takipçi"], postedAt: "5 saat önce" },
  { id: "l3", business: "Karaköy Cowork", businessType: "Cowork", city: "İstanbul", district: "Karaköy", cover: ph("cowork1"), category: "Yaşam Tarzı", budget: "₺3.500", description: "Uzaktan çalışan profili için bir günlük deneyim içeriği.", requirements: ["Lifestyle/Tech", "20k+ takipçi"], postedAt: "1 gün önce" },
  { id: "l4", business: "Kaş Deniz Cafe", businessType: "Kafe", city: "Antalya", district: "Kaş", cover: ph("kafe2"), category: "Seyahat", budget: "Konaklama + ₺2.000", description: "Sezon açılışı için seyahat içerik üretici.", requirements: ["Seyahat nişi", "30k+ takipçi"], postedAt: "3 gün önce" },
  { id: "l5", business: "Çankaya Bistro", businessType: "Restoran", city: "Ankara", district: "Çankaya", cover: ph("bistro1"), category: "Yemek", budget: "₺4.000", description: "Yeni şef menüsü tanıtımı.", requirements: ["Yemek nişi", "Ankara"], postedAt: "1 hafta önce" },
  { id: "l6", business: "Levent Tech Hub", businessType: "Cowork", city: "İstanbul", district: "Levent", cover: ph("cowork2"), category: "Teknoloji", budget: "₺6.000", description: "B2B etkinlik tanıtımı.", requirements: ["Tech/Business", "50k+"], postedAt: "4 gün önce" },
];

export const matches: Match[] = [
  { id: "m1", influencerId: "i1", listingId: "l1", status: "matched", lastMessage: "Cumartesi 14:00 uygun mu?", at: "2 saat önce" },
  { id: "m2", influencerId: "i3", listingId: "l2", status: "matched", lastMessage: "Brief'i gönderebilir misiniz?", at: "dün" },
  { id: "m3", influencerId: "i5", listingId: "l4", status: "pending", at: "3 gün önce" },
  { id: "m4", influencerId: "i6", listingId: "l3", status: "completed", lastMessage: "Teşekkürler, harika işti!", at: "1 hafta önce" },
];

export const analytics = [
  { month: "Oca", views: 12000, engagement: 4.2 },
  { month: "Şub", views: 18500, engagement: 5.1 },
  { month: "Mar", views: 24300, engagement: 5.8 },
  { month: "Nis", views: 31200, engagement: 6.3 },
  { month: "May", views: 28900, engagement: 5.9 },
  { month: "Haz", views: 42100, engagement: 7.1 },
];
