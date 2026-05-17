import json
import math
import random
from collections import Counter
from datetime import datetime, timedelta
from pathlib import Path


BASE_NOW = datetime(2026, 5, 17, 12, 0, 0)
OUTPUT_DIR = Path("output")


SECTORS = [
    {"id": "sec_001", "name": "Kafe", "parent_category": "Yeme-İçme"},
    {"id": "sec_002", "name": "Spesiyalti Kahve", "parent_category": "Yeme-İçme"},
    {"id": "sec_003", "name": "Brunch / Kahvaltı", "parent_category": "Yeme-İçme"},
    {"id": "sec_004", "name": "Restoran", "parent_category": "Yeme-İçme"},
    {"id": "sec_005", "name": "Fast Food", "parent_category": "Yeme-İçme"},
    {"id": "sec_006", "name": "Pastane / Fırın", "parent_category": "Yeme-İçme"},
    {"id": "sec_007", "name": "Butik", "parent_category": "Moda"},
    {"id": "sec_008", "name": "Hazır Giyim", "parent_category": "Moda"},
    {"id": "sec_009", "name": "Ayakkabı", "parent_category": "Moda"},
    {"id": "sec_010", "name": "Aksesuar", "parent_category": "Moda"},
    {"id": "sec_011", "name": "Kuaför / Berber", "parent_category": "Güzellik"},
    {"id": "sec_012", "name": "Güzellik Salonu", "parent_category": "Güzellik"},
    {"id": "sec_013", "name": "Tırnak Bakım", "parent_category": "Güzellik"},
    {"id": "sec_014", "name": "Kozmetik Mağazası", "parent_category": "Güzellik"},
    {"id": "sec_015", "name": "Fitness / Spor Salonu", "parent_category": "Spor"},
    {"id": "sec_016", "name": "Pilates / Yoga", "parent_category": "Spor"},
    {"id": "sec_017", "name": "Kitabevi", "parent_category": "Kültür"},
    {"id": "sec_018", "name": "Sanat Galerisi", "parent_category": "Kültür"},
    {"id": "sec_019", "name": "Teknoloji Mağazası", "parent_category": "Perakende"},
    {"id": "sec_020", "name": "Ev Dekorasyon", "parent_category": "Perakende"},
    {"id": "sec_021", "name": "Çiçekçi", "parent_category": "Perakende"},
    {"id": "sec_022", "name": "Eczane", "parent_category": "Sağlık"},
    {"id": "sec_023", "name": "Optik", "parent_category": "Sağlık"},
    {"id": "sec_024", "name": "Oyuncakçı", "parent_category": "Perakende"},
    {"id": "sec_025", "name": "Evcil Hayvan Mağazası", "parent_category": "Perakende"},
    {"id": "sec_026", "name": "Kırtasiye", "parent_category": "Perakende"},
    {"id": "sec_027", "name": "Hediyelik", "parent_category": "Perakende"},
    {"id": "sec_028", "name": "Bar / Cocktail", "parent_category": "Yeme-İçme"},
    {"id": "sec_029", "name": "Otel / Pansiyon", "parent_category": "Konaklama"},
    {"id": "sec_030", "name": "Mücevher", "parent_category": "Moda"},
]

CONTENT_CATEGORIES = [
    {"id": "cat_001", "name": "Lifestyle"},
    {"id": "cat_002", "name": "Food & Drink"},
    {"id": "cat_003", "name": "Fashion"},
    {"id": "cat_004", "name": "Beauty"},
    {"id": "cat_005", "name": "Makeup"},
    {"id": "cat_006", "name": "Skincare"},
    {"id": "cat_007", "name": "Tech"},
    {"id": "cat_008", "name": "Travel"},
    {"id": "cat_009", "name": "Fitness"},
    {"id": "cat_010", "name": "Yoga & Wellness"},
    {"id": "cat_011", "name": "Parenting"},
    {"id": "cat_012", "name": "Gaming"},
    {"id": "cat_013", "name": "Education"},
    {"id": "cat_014", "name": "Finance"},
    {"id": "cat_015", "name": "Automotive"},
    {"id": "cat_016", "name": "Photography"},
    {"id": "cat_017", "name": "Art"},
    {"id": "cat_018", "name": "Music"},
    {"id": "cat_019", "name": "Home Decor"},
    {"id": "cat_020", "name": "Gardening"},
    {"id": "cat_021", "name": "Books"},
    {"id": "cat_022", "name": "Pets"},
    {"id": "cat_023", "name": "Sustainable Living"},
    {"id": "cat_024", "name": "Mental Health"},
    {"id": "cat_025", "name": "Comedy / Entertainment"},
]

CONTENT_STYLES = [
    {"id": "sty_001", "name": "Minimalist"},
    {"id": "sty_002", "name": "Renkli / Canlı"},
    {"id": "sty_003", "name": "Vintage"},
    {"id": "sty_004", "name": "Lüks / Premium"},
    {"id": "sty_005", "name": "Casual"},
    {"id": "sty_006", "name": "Profesyonel"},
    {"id": "sty_007", "name": "Eğlenceli / Komik"},
    {"id": "sty_008", "name": "Ciddi / Bilgilendirici"},
    {"id": "sty_009", "name": "Samimi"},
    {"id": "sty_010", "name": "İlham Verici"},
    {"id": "sty_011", "name": "Aesthetic"},
    {"id": "sty_012", "name": "Doğal / Organik"},
    {"id": "sty_013", "name": "Şık / Glamour"},
    {"id": "sty_014", "name": "Sokak Tarzı"},
    {"id": "sty_015", "name": "Sade / Sakin"},
]

JOB_POSITIONS = [
    {"id": "pos_001", "name": "Barista", "typical_sectors": ["sec_001", "sec_002"]},
    {"id": "pos_002", "name": "Garson", "typical_sectors": ["sec_001", "sec_004", "sec_028"]},
    {"id": "pos_003", "name": "Kasiyer", "typical_sectors": ["perakende", "yeme-içme"]},
    {"id": "pos_004", "name": "Mutfak Yardımcısı", "typical_sectors": ["sec_004", "sec_006"]},
    {"id": "pos_005", "name": "Aşçı", "typical_sectors": ["sec_004"]},
    {"id": "pos_006", "name": "Pasta Şefi", "typical_sectors": ["sec_006"]},
    {"id": "pos_007", "name": "Satış Danışmanı", "typical_sectors": ["sec_007", "sec_008", "perakende"]},
    {"id": "pos_008", "name": "Mağaza Yöneticisi", "typical_sectors": ["perakende"]},
    {"id": "pos_009", "name": "Kurye / Moto Kurye", "typical_sectors": ["yeme-içme", "perakende"]},
    {"id": "pos_010", "name": "Temizlik Personeli", "typical_sectors": ["tüm"]},
    {"id": "pos_011", "name": "Güvenlik", "typical_sectors": ["tüm"]},
    {"id": "pos_012", "name": "Depo Elemanı", "typical_sectors": ["perakende"]},
    {"id": "pos_013", "name": "Vale", "typical_sectors": ["sec_004", "sec_029"]},
    {"id": "pos_014", "name": "Paketleme Elemanı", "typical_sectors": ["perakende"]},
    {"id": "pos_015", "name": "Host / Hostes", "typical_sectors": ["sec_004", "sec_029"]},
    {"id": "pos_016", "name": "Resepsiyonist", "typical_sectors": ["sec_029", "sec_012"]},
    {"id": "pos_017", "name": "Kuaför Yardımcısı", "typical_sectors": ["sec_011"]},
    {"id": "pos_018", "name": "Manikürist", "typical_sectors": ["sec_013"]},
    {"id": "pos_019", "name": "Personal Trainer", "typical_sectors": ["sec_015"]},
    {"id": "pos_020", "name": "Pilates Eğitmeni", "typical_sectors": ["sec_016"]},
    {"id": "pos_021", "name": "Yoga Eğitmeni", "typical_sectors": ["sec_016"]},
    {"id": "pos_022", "name": "Bar Tender", "typical_sectors": ["sec_028"]},
    {"id": "pos_023", "name": "Stajyer", "typical_sectors": ["tüm"]},
    {"id": "pos_024", "name": "Promosyon Personeli", "typical_sectors": ["etkinlik"]},
    {"id": "pos_025", "name": "Etkinlik Düzenleme", "typical_sectors": ["etkinlik"]},
]

EMPLOYMENT_TYPES = [
    {"id": "emp_001", "name": "Full-time", "description": "Tam zamanlı"},
    {"id": "emp_002", "name": "Part-time", "description": "Yarı zamanlı"},
    {"id": "emp_003", "name": "Tek seferlik", "description": "Tek günlük / olay bazlı"},
    {"id": "emp_004", "name": "Sezonluk", "description": "Yaz / kış sezonu"},
    {"id": "emp_005", "name": "Proje bazlı", "description": "Belirli süreli proje"},
    {"id": "emp_006", "name": "Vardiyalı", "description": "Düzensiz vardiya"},
    {"id": "emp_007", "name": "Stajyer", "description": "Staj"},
]

HASHTAG_GROUPS = {
    "kahve": ["#kahve", "#coffee", "#filtrekahve", "#espresso", "#latte", "#thirdwave", "#spesiyaltikahve", "#barista", "#coffeelover", "#cafe"],
    "yemek": ["#food", "#foodie", "#yemek", "#lezzet", "#delicious", "#instafood", "#foodporn", "#brunch", "#breakfast", "#dinner", "#gastronomy", "#lezzetli"],
    "moda": ["#fashion", "#moda", "#ootd", "#style", "#outfit", "#fashionblogger", "#stylish", "#streetstyle", "#tarz", "#kombins"],
    "guzellik": ["#beauty", "#makeup", "#skincare", "#makyaj", "#cilt", "#guzellik", "#mua", "#beautyblogger", "#ciltbakimi", "#kozmetik"],
    "fitness": ["#fitness", "#workout", "#gym", "#health", "#fit", "#bodybuilding", "#training", "#cardio", "#spor", "#antrenman"],
    "seyahat": ["#travel", "#wanderlust", "#explore", "#seyahat", "#gezi", "#travelphotography", "#vacation", "#kesfet", "#tatil"],
    "teknoloji": ["#tech", "#technology", "#gadget", "#teknoloji", "#inceleme", "#review", "#apple", "#samsung", "#setup"],
    "lifestyle": ["#lifestyle", "#daily", "#morning", "#weekend", "#sundayfunday", "#enjoy", "#happy", "#günlük", "#huzur"],
    "lokasyon_istanbul": ["#istanbul", "#kadikoy", "#besiktas", "#karakoy", "#moda", "#galata", "#bosphorus", "#eminonu", "#nisantasi", "#bebek"],
    "dekorasyon": ["#homedecor", "#evdekorasyon", "#interior", "#decor", "#tasarim", "#minimal", "#dekorasyon"],
    "evcilhayvan": ["#pet", "#kedi", "#köpek", "#cat", "#dog", "#evcilhayvan", "#petsofinstagram"],
}

LOCATIONS = [
    {"id": "loc_001", "name": "Kadıköy", "type": "district", "city": "İstanbul", "lat": 40.9928, "lng": 29.0277},
    {"id": "loc_002", "name": "Beşiktaş", "type": "district", "city": "İstanbul", "lat": 41.0429, "lng": 29.0079},
    {"id": "loc_003", "name": "Şişli", "type": "district", "city": "İstanbul", "lat": 41.0602, "lng": 28.9877},
    {"id": "loc_004", "name": "Beyoğlu", "type": "district", "city": "İstanbul", "lat": 41.0370, "lng": 28.9770},
    {"id": "loc_005", "name": "Üsküdar", "type": "district", "city": "İstanbul", "lat": 41.0234, "lng": 29.0157},
    {"id": "loc_006", "name": "Bakırköy", "type": "district", "city": "İstanbul", "lat": 40.9800, "lng": 28.8770},
    {"id": "loc_007", "name": "Sarıyer", "type": "district", "city": "İstanbul", "lat": 41.1670, "lng": 29.0500},
    {"id": "loc_008", "name": "Fatih", "type": "district", "city": "İstanbul", "lat": 41.0186, "lng": 28.9400},
    {"id": "loc_009", "name": "Ataşehir", "type": "district", "city": "İstanbul", "lat": 40.9833, "lng": 29.1167},
    {"id": "loc_010", "name": "Maltepe", "type": "district", "city": "İstanbul", "lat": 40.9337, "lng": 29.1300},
    {"id": "loc_011", "name": "Kartal", "type": "district", "city": "İstanbul", "lat": 40.8900, "lng": 29.1900},
    {"id": "loc_012", "name": "Pendik", "type": "district", "city": "İstanbul", "lat": 40.8756, "lng": 29.2339},
    {"id": "loc_013", "name": "Karaköy", "type": "neighborhood", "city": "İstanbul", "lat": 41.0220, "lng": 28.9740},
    {"id": "loc_014", "name": "Nişantaşı", "type": "neighborhood", "city": "İstanbul", "lat": 41.0490, "lng": 28.9930},
    {"id": "loc_015", "name": "Cihangir", "type": "neighborhood", "city": "İstanbul", "lat": 41.0320, "lng": 28.9830},
    {"id": "loc_016", "name": "Bebek", "type": "neighborhood", "city": "İstanbul", "lat": 41.0770, "lng": 29.0430},
    {"id": "loc_017", "name": "Moda", "type": "neighborhood", "city": "İstanbul", "lat": 40.9854, "lng": 29.0258},
    {"id": "loc_018", "name": "Bağdat Caddesi", "type": "neighborhood", "city": "İstanbul", "lat": 40.9600, "lng": 29.0900},
    {"id": "loc_019", "name": "Ankara Merkez", "type": "city", "city": "Ankara", "lat": 39.9334, "lng": 32.8597},
    {"id": "loc_020", "name": "İzmir Merkez", "type": "city", "city": "İzmir", "lat": 38.4237, "lng": 27.1428},
    {"id": "loc_021", "name": "Bursa Merkez", "type": "city", "city": "Bursa", "lat": 40.1885, "lng": 29.0610},
    {"id": "loc_022", "name": "Antalya Merkez", "type": "city", "city": "Antalya", "lat": 36.8969, "lng": 30.7133},
]

INFLUENCER_TEMPLATES = [
    {"name": "Elif Aydın", "username": "elifgezgin", "niche": ["cat_008", "cat_001"], "styles": ["sty_009", "sty_012"], "city": "İstanbul", "district": "Kadıköy", "bio": "Keşfedilmemiş sokaklar ve sakin köşeler"},
    {"name": "Kaan Polat", "username": "kaanfit", "niche": ["cat_009", "cat_010"], "styles": ["sty_008", "sty_006"], "city": "Ankara", "district": "Ankara Merkez", "bio": "Doğal beslenme ve outdoor antrenman"},
    {"name": "İrem Koç", "username": "iremscraftlab", "niche": ["cat_019", "cat_001"], "styles": ["sty_001", "sty_011"], "city": "İstanbul", "district": "Beşiktaş", "bio": "El yapımı dekor ve minimalist yaşam"},
    {"name": "Burak Şen", "username": "burakpetworld", "niche": ["cat_022"], "styles": ["sty_007", "sty_009"], "city": "İstanbul", "district": "Üsküdar", "bio": "Patili dostlar ve şehir hayatı"},
    {"name": "Melis Tan", "username": "melisnaturel", "niche": ["cat_006", "cat_004"], "styles": ["sty_012", "sty_015"], "city": "İzmir", "district": "İzmir Merkez", "bio": "Doğal cilt bakım rutinleri"},
    {"name": "Zeynep Karagöz", "username": "zeynepfoodie", "niche": ["cat_002", "cat_001"], "styles": ["sty_011", "sty_009"], "city": "İstanbul", "district": "Kadıköy", "bio": "İstanbul'da brunch avcısı | Reklam: DM"},
    {"name": "Can Demir", "username": "canstreetbites", "niche": ["cat_002", "cat_008"], "styles": ["sty_005", "sty_014"], "city": "İstanbul", "district": "Beyoğlu", "bio": "Sokak lezzetleri ve yeni mekanlar"},
    {"name": "Selin Çelik", "username": "selintechtips", "niche": ["cat_007", "cat_001"], "styles": ["sty_006", "sty_001"], "city": "İstanbul", "district": "Ataşehir", "bio": "Gadget incelemeleri ve üretkenlik ipuçları"},
    {"name": "Arda Kılıç", "username": "ardastreetstyle", "niche": ["cat_003", "cat_001"], "styles": ["sty_014", "sty_005"], "city": "İstanbul", "district": "Şişli", "bio": "Erkek sokak stili ve moda trendleri"},
    {"name": "Defne Şahin", "username": "defneminimal", "niche": ["cat_001", "cat_019"], "styles": ["sty_001", "sty_015"], "city": "Antalya", "district": "Antalya Merkez", "bio": "Minimalist yaşam, sade güzellik"},
    {"name": "Berk Doğan", "username": "berkmixology", "niche": ["cat_002", "cat_001"], "styles": ["sty_004", "sty_013"], "city": "İstanbul", "district": "Beyoğlu", "bio": "Fine dining ve kokteyl kültürü"},
    {"name": "Naz Yılmaz", "username": "nazmakeup", "niche": ["cat_005", "cat_004"], "styles": ["sty_002", "sty_013"], "city": "Bursa", "district": "Bursa Merkez", "bio": "Günlük makyaj ve saç bakımı"},
    {"name": "Ayşe Kaya", "username": "aysekstyle", "niche": ["cat_003", "cat_004"], "styles": ["sty_013", "sty_004"], "city": "İstanbul", "district": "Nişantaşı", "bio": "Moda ve güzellik | PR: hello@ayse.com"},
    {"name": "Murat Özkan", "username": "muratgurme", "niche": ["cat_002", "cat_008"], "styles": ["sty_006", "sty_009"], "city": "İstanbul", "district": "Beşiktaş", "bio": "Gastronomi yazarı ve restoran keşifçisi"},
    {"name": "Pınar Aksu", "username": "pinarwellness", "niche": ["cat_010", "cat_009"], "styles": ["sty_010", "sty_012"], "city": "İstanbul", "district": "Sarıyer", "bio": "Yoga eğitmeni ve wellness içerik üreticisi"},
    {"name": "Emre Tuncer", "username": "emrereviews", "niche": ["cat_007", "cat_012"], "styles": ["sty_008", "sty_005"], "city": "Ankara", "district": "Ankara Merkez", "bio": "Teknoloji ve oyun dünyası"},
    {"name": "Dilan Arslan", "username": "dilanbeauty", "niche": ["cat_004", "cat_006"], "styles": ["sty_011", "sty_004"], "city": "İstanbul", "district": "Kadıköy", "bio": "Dermatolog onaylı cilt bakım protokolleri"},
    {"name": "Yasemin Erdoğan", "username": "yaseminlifestyle", "niche": ["cat_001", "cat_003", "cat_008"], "styles": ["sty_004", "sty_013"], "city": "İstanbul", "district": "Bebek", "bio": "Lifestyle | Moda | Seyahat | İş birliği: mgmt@yasemin.com"},
    {"name": "Ozan Acar", "username": "ozanfitcoach", "niche": ["cat_009", "cat_001"], "styles": ["sty_010", "sty_006"], "city": "İstanbul", "district": "Beşiktaş", "bio": "Online PT | 500K+ kişiye ilham"},
    {"name": "Deniz Soylu", "username": "denizsoylu", "niche": ["cat_001", "cat_003", "cat_008"], "styles": ["sty_004", "sty_002"], "city": "İstanbul", "district": "Nişantaşı", "bio": "1M+ takipçi | Marka elçisi | PR: @mgmt"},
]

TIER_CONFIG = {
    "nano": {"min_f": 1000, "max_f": 10000, "eng_min": 0.04, "eng_max": 0.08, "collab_range": (0, 5), "rate": (500, 2000)},
    "micro": {"min_f": 10000, "max_f": 100000, "eng_min": 0.02, "eng_max": 0.05, "collab_range": (3, 20), "rate": (2000, 8000)},
    "mid": {"min_f": 100000, "max_f": 500000, "eng_min": 0.015, "eng_max": 0.03, "collab_range": (10, 40), "rate": (8000, 25000)},
    "macro": {"min_f": 500000, "max_f": 1000000, "eng_min": 0.01, "eng_max": 0.02, "collab_range": (20, 80), "rate": (25000, 60000)},
    "mega": {"min_f": 1000000, "max_f": 3000000, "eng_min": 0.005, "eng_max": 0.015, "collab_range": (50, 150), "rate": (60000, 200000)},
}

BUSINESS_TEMPLATES = [
    {"name": "Coffee Roastery Kadıköy", "sector": "sec_002", "district": "Kadıköy", "styles": ["sty_001", "sty_011"], "size": "küçük", "desc": "El yapımı filtre kahve ve özel demlemeler", "target_cats": ["cat_002", "cat_001"]},
    {"name": "Yeşil Tabak", "sector": "sec_004", "district": "Beşiktaş", "styles": ["sty_012", "sty_009"], "size": "küçük", "desc": "Vegan ve organik restoran", "target_cats": ["cat_002", "cat_023"]},
    {"name": "Urban Threads", "sector": "sec_007", "district": "Nişantaşı", "styles": ["sty_014", "sty_005"], "size": "orta", "desc": "Erkek sokak giyim butik markası", "target_cats": ["cat_003", "cat_001"]},
    {"name": "Glow Cilt Bakım", "sector": "sec_012", "district": "Şişli", "styles": ["sty_001", "sty_006"], "size": "orta", "desc": "Klinik cilt bakım merkezi ve ürün satışı", "target_cats": ["cat_006", "cat_004"]},
    {"name": "FitZone Studio", "sector": "sec_015", "district": "Beşiktaş", "styles": ["sty_010", "sty_006"], "size": "küçük", "desc": "Fonksiyonel antrenman ve CrossFit merkezi", "target_cats": ["cat_009", "cat_010"]},
    {"name": "Botanik Kafe", "sector": "sec_001", "district": "Cihangir", "styles": ["sty_012", "sty_015"], "size": "küçük", "desc": "Doğal malzeme, bitki çayları, huzurlu ortam", "target_cats": ["cat_001", "cat_002"]},
    {"name": "Teknosan", "sector": "sec_019", "district": "Ataşehir", "styles": ["sty_006", "sty_001"], "size": "orta", "desc": "Aksesuarlar ve gadget mağazası", "target_cats": ["cat_007"]},
    {"name": "Kahve & Stil", "sector": "sec_001", "district": "Karaköy", "styles": ["sty_011", "sty_013"], "size": "küçük", "desc": "Moda odaklı konsept kafe", "target_cats": ["cat_003", "cat_002"]},
    {"name": "Patili Dünya", "sector": "sec_025", "district": "Kadıköy", "styles": ["sty_007", "sty_009"], "size": "küçük", "desc": "Doğal mama ve evcil hayvan aksesuarları", "target_cats": ["cat_022", "cat_001"]},
    {"name": "Çevik Mutfak", "sector": "sec_004", "district": "Kadıköy", "styles": ["sty_005", "sty_002"], "size": "küçük", "desc": "Fast-casual, yerel malzeme odaklı restoran", "target_cats": ["cat_002"]},
]

CAPTION_TEMPLATES = {
    "cat_001": ["Günaydın, bugün sakin ve üretken bir gün olacak", "{location}'da keyifli bir öğleden sonra", "Hafta sonu huzuru: kitap, kahve, sessizlik", "Yeni haftaya motivasyonla başlıyoruz"],
    "cat_002": ["Pazar sabahları için en sevdiğim brunch mekanlarından biri {location}", "{location}'da yeni keşfettiğim mekanın kahvesi harika", "Yeni menüyü denedim ve söyleyecek çok şeyim var", "Arkadaşlarla brunch mutluluk formülü"],
    "cat_003": ["Bugünün kombini: minimal ama etkili", "Sokak stili ama şık, ikisi bir arada olabilir", "Gardırobumda 5 temel parça", "{location}'da sokak modası gözlemi"],
    "cat_004": ["Sabah rutinimde olmazsa olmazım SPF", "Akşam bakım rutinim: 5 adımda parlak cilt", "Bu ürünleri 3 aydır test ediyorum", "Sade güzellik rutinim yayında"],
    "cat_005": ["Günlük makyaj rutinim: 5 dakikada doğal görünüm", "Bu fondöten tam aradığım kapama gücüne sahip", "Dudak renkleri karşılaştırması"],
    "cat_006": ["Cilt tipi testi: sen hangi gruptasın?", "Niacinamide ve Vitamin C karşılaştırması", "3 adımlı sabah rutini: temizle, nemlendir, koru"],
    "cat_007": ["Yeni setup tamamlandı", "Bu kulaklığı 2 haftadır kullanıyorum, dürüst inceleme geliyor", "Üretkenlik araçlarım: günde 3 saat kazanıyorum"],
    "cat_008": ["{location} keşif günlüğü: bilmediğiniz 3 mekan", "Bu şehirde kaybolmak en güzel aktivite", "Seyahat çantamda olmazsa olmazlarım"],
    "cat_009": ["Bugünkü antrenman: üst vücut", "Doğru form her şeyden önemli", "Sabah koşusu {location} sahilinde"],
    "cat_010": ["Sabah meditasyonu: 10 dakikada zihin temizliği", "Wellness günlüğüm: nefes, hareket, farkındalık", "Bu poz esnekliğinizi test eder"],
    "cat_012": ["Yeni oyun incelemesi: beklentilerin altında mı?", "Setup turum güncellenmiş hali"],
    "cat_019": ["Minimal salon düzenim: az parça, çok etki", "Bu rafı kendin yap", "Küçük alanlar için 5 depolama çözümü"],
    "cat_022": ["Patili dostum bugün ekstra sevimli", "Yeni mama denemesi: sonuçlar story'de", "Park günü, {location}'da patili piknik"],
    "cat_023": ["Sürdürülebilir seçimler küçük adımlarla başlıyor", "Bugün daha az atıkla alışveriş denemesi yaptım"],
}

COLLAB_LISTING_TEMPLATES = [
    "Yeni menümüz için 1 Reel içerik aranıyor",
    "Bahar koleksiyonu tanıtımı - 3 post + story serisi",
    "Mağaza açılışı için sosyal medya desteği",
    "Ürün inceleme videosu (1 Reel)",
    "Hafta sonu etkinliğimize influencer davet",
    "Yeni ürünümüzü test edecek içerik üreticisi",
    "Instagram story serisi - mekan tanıtımı",
    "Sezonluk kampanya yüzü aranıyor",
    "Organik marka elçisi - uzun vadeli işbirliği",
    "Açılış günü canlı yayın desteği",
]

INFLUENCER_DEALBREAKERS = [
    "Alkol markası reklamı yapmam",
    "Haftada 2'den fazla post istemeyin",
    "Gece çekim yapamam",
    "Rakip marka ile aynı dönemde çalışmam",
    "Ücretsiz ürün karşılığı çalışmam",
    "Siyasi içerik üretmem",
    "Script zorlaması istemem, doğal olmalı",
    "Reels dışında içerik üretmem",
]

BUSINESS_DEALBREAKERS = [
    "Rakip markayı aynı dönemde tanıtmasın",
    "Negatif tonlu içerik istemiyoruz",
    "Minimum 10K takipçi bekliyoruz",
    "İçerik onayı zorunlu",
    "Stüdyoda çekim zorunlu",
    "7 gün içinde teslim şart",
    "Kendi logomuzun görünmesi zorunlu",
]

CATEGORY_TO_HASHTAG_GROUP = {
    "cat_001": "lifestyle",
    "cat_002": "yemek",
    "cat_003": "moda",
    "cat_004": "guzellik",
    "cat_005": "guzellik",
    "cat_006": "guzellik",
    "cat_007": "teknoloji",
    "cat_008": "seyahat",
    "cat_009": "fitness",
    "cat_010": "fitness",
    "cat_012": "teknoloji",
    "cat_019": "dekorasyon",
    "cat_022": "evcilhayvan",
    "cat_023": "lifestyle",
}

CATEGORY_INTERESTS = {
    "cat_001": "lifestyle",
    "cat_002": "yemek",
    "cat_003": "moda",
    "cat_004": "güzellik",
    "cat_005": "makyaj",
    "cat_006": "cilt bakımı",
    "cat_007": "teknoloji",
    "cat_008": "seyahat",
    "cat_009": "fitness",
    "cat_010": "wellness",
    "cat_012": "oyun",
    "cat_019": "dekorasyon",
    "cat_022": "evcil hayvan",
    "cat_023": "sürdürülebilirlik",
}


def iso(dt):
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")


def get_tier_for_index(index):
    if index < 5:
        return "nano"
    if index < 12:
        return "micro"
    if index < 17:
        return "mid"
    if index < 19:
        return "macro"
    return "mega"


def find_location(name, city=None):
    for location in LOCATIONS:
        if location["name"] == name:
            return location
    for location in LOCATIONS:
        if city and location["city"] == city:
            return location
    return LOCATIONS[0]


def normalize_distribution(values):
    rounded = {key: round(value, 2) for key, value in values.items()}
    keys = list(rounded)
    diff = round(1.0 - sum(rounded.values()), 2)
    rounded[keys[-1]] = round(max(0.0, rounded[keys[-1]] + diff), 2)
    return rounded


def random_distribution(keys, min_each=0.05):
    weights = [random.uniform(min_each, 1.0) for _ in keys]
    total = sum(weights)
    return normalize_distribution({key: weight / total for key, weight in zip(keys, weights)})


def generate_influencer(template, index):
    tier = get_tier_for_index(index)
    config = TIER_CONFIG[tier]
    followers = random.randint(config["min_f"], config["max_f"])
    engagement = round(random.uniform(config["eng_min"], config["eng_max"]), 4)
    loc = find_location(template["district"], template["city"])
    female = random.uniform(0.4, 0.75)
    other = random.uniform(0.01, 0.03)
    istanbul_share = random.uniform(0.35, 0.65)
    ankara_share = random.uniform(0.05, 0.15)
    izmir_share = random.uniform(0.03, 0.10)

    return {
        "id": f"inf_{index + 1:03d}",
        "display_name": template["name"],
        "username": f"@{template['username']}",
        "bio": template["bio"],
        "tier": tier,
        "follower_count": followers,
        "following_count": random.randint(max(20, int(followers * 0.01)), max(30, int(followers * 0.05))),
        "post_count": random.randint(80, 600),
        "account_created_at": iso(BASE_NOW - timedelta(days=random.randint(365, 2000))),
        "verified": tier in ("macro", "mega"),
        "location": {
            "city": template["city"],
            "district": template["district"],
            "lat": round(loc["lat"] + random.uniform(-0.01, 0.01), 6),
            "lng": round(loc["lng"] + random.uniform(-0.01, 0.01), 6),
        },
        "content_categories": template["niche"],
        "content_styles": template["styles"],
        "primary_language": "tr",
        "audience_demographics": {
            "age_distribution": random_distribution(["18-24", "25-34", "35-44", "45+"]),
            "gender_distribution": normalize_distribution({"female": female, "male": 1.0 - female - other, "other": other}),
            "location_distribution": normalize_distribution({
                "İstanbul": istanbul_share,
                "Ankara": ankara_share,
                "İzmir": izmir_share,
                "diğer": 1.0 - istanbul_share - ankara_share - izmir_share,
            }),
            "income_distribution": random_distribution(["bütçe", "orta", "premium"]),
            "interest_tags": [CATEGORY_INTERESTS.get(cat, "lifestyle") for cat in template["niche"]],
        },
        "rate_range": {"min": config["rate"][0], "max": config["rate"][1], "currency": "TRY"},
        "engagement_rate": engagement,
        "agent_preferences_id": f"agp_inf_{index + 1:03d}",
        "verification_status": "verified_bio_code" if tier in ("macro", "mega") else "pending",
        "profile_completion": round(random.uniform(0.75, 0.98), 2),
        "past_collaboration_count": random.randint(*config["collab_range"]),
        "last_active_at": iso(BASE_NOW - timedelta(days=random.randint(0, 14), hours=random.randint(0, 23))),
    }


def generate_business(template, index):
    loc = find_location(template["district"], "İstanbul")
    return {
        "id": f"biz_{index + 1:03d}",
        "name": template["name"],
        "sector_id": template["sector"],
        "subcategory": SECTORS[int(template["sector"].split("_")[1]) - 1]["name"].lower(),
        "description": template["desc"],
        "location": {
            "city": "İstanbul",
            "district": template["district"],
            "neighborhood": template["district"],
            "lat": round(loc["lat"] + random.uniform(-0.005, 0.005), 6),
            "lng": round(loc["lng"] + random.uniform(-0.005, 0.005), 6),
            "address": f"{template['district']} Cad. No: {random.randint(3, 98)}",
        },
        "brand_style": template["styles"],
        "brand_voice": random.choice(["samimi", "profesyonel", "premium", "enerjik"]),
        "size": template["size"],
        "business_age_months": random.randint(6, 72),
        "target_audience": {
            "age_buckets": random.sample(["18-24", "25-34", "35-44"], k=random.randint(1, 2)),
            "gender_preference": "all",
            "income_groups": random.sample(["bütçe", "orta", "premium"], k=2),
            "interest_tags": [CATEGORY_INTERESTS.get(cat, "lifestyle") for cat in template["target_cats"]],
        },
        "verified": random.random() > 0.3,
        "profile_completion": round(random.uniform(0.70, 0.95), 2),
        "past_collaboration_count": random.randint(0, 15),
        "past_collaboration_categories": template["target_cats"],
        "agent_preferences_id": f"agp_biz_{index + 1:03d}",
        "created_at": iso(BASE_NOW - timedelta(days=random.randint(30, 500))),
    }


def generate_posts_for_influencer(influencer):
    posts = []
    num_posts = random.randint(15, 25)
    categories = influencer["content_categories"]
    recent_slots = [1, 4]

    for index in range(num_posts):
        category = categories[0] if random.random() < 0.7 or len(categories) == 1 else random.choice(categories[1:])
        templates = CAPTION_TEMPLATES.get(category, CAPTION_TEMPLATES["cat_001"])
        caption = random.choice(templates).replace("{location}", influencer["location"]["district"])
        days_ago = recent_slots[index] if index < len(recent_slots) else random.randint(8, 180)
        posted_at = BASE_NOW - timedelta(days=days_ago, hours=random.randint(1, 16), minutes=random.randint(0, 59))
        post_type = random.choices(["post", "reel", "story_archived"], weights=[0.6, 0.3, 0.1])[0]
        likes = int(influencer["follower_count"] * influencer["engagement_rate"] * random.uniform(0.7, 1.3))
        if post_type == "reel":
            likes = int(likes * random.uniform(1.2, 2.0))
        hashtags = random.sample(
            HASHTAG_GROUPS.get(CATEGORY_TO_HASHTAG_GROUP.get(category, "lifestyle"), HASHTAG_GROUPS["lifestyle"]),
            k=random.randint(3, 7),
        )
        if influencer["location"]["city"] == "İstanbul":
            hashtags.extend(random.sample(HASHTAG_GROUPS["lokasyon_istanbul"], k=random.randint(1, 3)))

        mentioned_brands = []
        if random.random() < 0.15:
            mentioned_brands = [f"@{random.choice(['cafekadikoy', 'urbanstyleco', 'fitzonestudio', 'botanikkafe', 'glowskincare'])}"]

        location_tag = None
        if random.random() < 0.6:
            loc = find_location(influencer["location"]["district"], influencer["location"]["city"])
            location_tag = {"name": loc["name"], "lat": round(loc["lat"] + random.uniform(-0.01, 0.01), 6), "lng": round(loc["lng"] + random.uniform(-0.01, 0.01), 6)}

        posts.append({
            "post_id": "",
            "influencer_id": influencer["id"],
            "type": post_type,
            "caption": caption,
            "hashtags": sorted(set(hashtags)),
            "mentioned_brands": mentioned_brands,
            "location_tag": location_tag,
            "posted_at": iso(posted_at),
            "metrics": {
                "likes": max(1, likes),
                "comments": max(0, int(likes * random.uniform(0.03, 0.08))),
                "shares": max(0, int(likes * random.uniform(0.01, 0.04))),
                "saves": max(0, int(likes * random.uniform(0.05, 0.15))),
                "reach": max(likes, int(likes * random.uniform(2.5, 5.0))),
            },
            "content_category": category,
            "content_style": random.choice(influencer["content_styles"]),
            "media_count": random.randint(1, 5) if post_type == "post" else 1,
            "media_type": "video" if post_type == "reel" else "image",
        })
    return posts


def generate_collab_listing(business, index):
    budget_base = {"küçük": (1000, 5000), "orta": (3000, 15000), "zincir": (10000, 50000)}
    b_range = budget_base[business["size"]]
    b_min = random.randint(b_range[0], b_range[0] + 2000)
    b_max = random.randint(b_min + 1000, b_range[1])
    if b_max <= 5000:
        preferred_tiers = ["nano", "micro"]
    elif b_max <= 15000:
        preferred_tiers = ["micro", "mid"]
    elif b_max <= 40000:
        preferred_tiers = ["mid", "macro"]
    else:
        preferred_tiers = ["macro", "mega"]

    return {
        "listing_id": f"col_{index + 1:03d}",
        "business_id": business["id"],
        "type": "collaboration",
        "title": random.choice(COLLAB_LISTING_TEMPLATES),
        "description": f"{business['name']} için içerik üretecek influencer arıyoruz. {business['description']}.",
        "budget": {"min": b_min, "max": b_max, "currency": "TRY"},
        "deliverables": random.choice([["1 reel", "3 story"], ["2 post", "1 reel"], ["1 reel"], ["3 post", "5 story"]]),
        "preferred_tiers": preferred_tiers,
        "target_categories": business["past_collaboration_categories"],
        "preferred_audience": {"age_buckets": business["target_audience"]["age_buckets"], "locations": ["İstanbul"]},
        "preferred_styles": business["brand_style"],
        "deadline": iso(BASE_NOW + timedelta(days=random.randint(14, 60))),
        "status": random.choices(["active", "closed", "expired"], weights=[0.75, 0.15, 0.10])[0],
        "created_at": iso(BASE_NOW - timedelta(days=random.randint(1, 30))),
    }


def generate_agent_prefs_influencer(influencer):
    rate = influencer["rate_range"]
    return {
        "id": influencer["agent_preferences_id"],
        "user_id": influencer["id"],
        "role": "influencer",
        "preferences": {
            "min_acceptable_budget": rate["min"],
            "ideal_budget": int((rate["min"] + rate["max"]) / 2),
            "dealbreakers": random.sample(INFLUENCER_DEALBREAKERS, k=random.randint(2, 4)),
            "preferred_deliverables": random.sample(["reel", "story", "post", "canlı yayın"], k=2),
            "max_revisions": random.randint(1, 3),
            "payment_terms": random.choice(["post öncesi %50", "tamamı peşin", "teslimde ödeme"]),
            "communication_tone": random.choice(["samimi", "profesyonel", "rahat"]),
            "deadline_flexibility": random.choice(["esnek", "esnek değil", "görüşülebilir"]),
            "exclusive_collab_acceptable": random.choice([True, False]),
            "exclusivity_max_days": random.choice([0, 14, 30]),
            "non_negotiable_items": ["payment_terms"],
            "negotiable_items": ["budget", "deliverables", "deadline"],
        },
    }


def generate_agent_prefs_business(business):
    return {
        "id": business["agent_preferences_id"],
        "user_id": business["id"],
        "role": "business",
        "preferences": {
            "max_budget": random.randint(3000, 20000),
            "ideal_budget": random.randint(2000, 10000),
            "dealbreakers": random.sample(BUSINESS_DEALBREAKERS, k=random.randint(2, 3)),
            "required_deliverables": random.choice([["1 reel"], ["2 post"], ["1 reel", "3 story"]]),
            "optional_deliverables": random.choice([["3 story"], ["1 post"], ["1 canlı yayın"]]),
            "exclusivity_required": random.choice([True, False]),
            "exclusivity_days": random.choice([0, 14, 30, 60]),
            "communication_tone": random.choice(["samimi", "profesyonel"]),
            "non_negotiable_items": ["required_deliverables"],
            "negotiable_items": ["budget", "timeline", "optional_deliverables"],
        },
    }


def is_compatible(influencer, listing):
    return (
        any(cat in influencer["content_categories"] for cat in listing["target_categories"])
        and influencer["tier"] in listing["preferred_tiers"]
    )


def generate_swipes(influencers, listings):
    active_listings = [listing for listing in listings if listing["status"] == "active"]
    swipes = []
    seen = set()
    swipe_id = 0

    for influencer in influencers:
        chosen = random.sample(active_listings, k=min(random.randint(5, 10), len(active_listings)))
        for listing in chosen:
            seen.add((influencer["id"], listing["listing_id"]))
            compatible = is_compatible(influencer, listing)
            swipe_id += 1
            swipes.append({
                "id": f"swp_{swipe_id:05d}",
                "user_id": influencer["id"],
                "listing_id": listing["listing_id"],
                "direction": "right" if random.random() < (0.75 if compatible else 0.20) else "left",
                "swiped_at": iso(BASE_NOW - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23), minutes=random.randint(0, 59))),
            })

    target_swipes = 150
    all_pairs = [(inf, listing) for inf in influencers for listing in active_listings if (inf["id"], listing["listing_id"]) not in seen]
    random.shuffle(all_pairs)
    while len(swipes) < target_swipes and all_pairs:
        influencer, listing = all_pairs.pop()
        compatible = is_compatible(influencer, listing)
        swipe_id += 1
        swipes.append({
            "id": f"swp_{swipe_id:05d}",
            "user_id": influencer["id"],
            "listing_id": listing["listing_id"],
            "direction": "right" if random.random() < (0.75 if compatible else 0.20) else "left",
            "swiped_at": iso(BASE_NOW - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23), minutes=random.randint(0, 59))),
        })
    return swipes


def generate_matches_and_agreements(influencers, businesses, listings, swipes):
    influencer_by_id = {inf["id"]: inf for inf in influencers}
    business_by_id = {biz["id"]: biz for biz in businesses}
    listing_by_id = {listing["listing_id"]: listing for listing in listings}
    right_swipes = [swipe for swipe in swipes if swipe["direction"] == "right"]

    def approval_score(swipe):
        inf = influencer_by_id[swipe["user_id"]]
        listing = listing_by_id[swipe["listing_id"]]
        return 0.60 if is_compatible(inf, listing) else 0.15

    eligible = [swipe for swipe in right_swipes if random.random() < approval_score(swipe)]
    if len(eligible) < 40:
        remaining = [swipe for swipe in right_swipes if swipe not in eligible]
        remaining.sort(key=approval_score, reverse=True)
        eligible.extend(remaining[: 40 - len(eligible)])
    eligible = eligible[:40]

    matches = []
    for index, swipe in enumerate(eligible, start=1):
        listing = listing_by_id[swipe["listing_id"]]
        business = business_by_id[listing["business_id"]]
        matched_at = datetime.strptime(swipe["swiped_at"], "%Y-%m-%dT%H:%M:%SZ") + timedelta(hours=random.randint(1, 48))
        matches.append({
            "match_id": f"mch_{index:03d}",
            "influencer_id": swipe["user_id"],
            "business_id": business["id"],
            "listing_id": listing["listing_id"],
            "matched_at": iso(matched_at),
            "status": random.choice(["completed", "agent_negotiating", "waiting_business"]),
        })

    match_scores = []
    for match in matches:
        inf = influencer_by_id[match["influencer_id"]]
        listing = listing_by_id[match["listing_id"]]
        match_scores.append((0.70 if is_compatible(inf, listing) else 0.25, match))
    match_scores.sort(key=lambda item: item[0], reverse=True)

    agreements = []
    for index, (_, match) in enumerate(match_scores[:20], start=1):
        listing = listing_by_id[match["listing_id"]]
        agreed_at = datetime.strptime(match["matched_at"], "%Y-%m-%dT%H:%M:%SZ") + timedelta(hours=random.randint(1, 24))
        agreements.append({
            "agreement_id": f"agr_{index:03d}",
            "match_id": match["match_id"],
            "status": random.choices(["completed", "in_progress", "cancelled"], weights=[0.7, 0.2, 0.1])[0],
            "final_budget": random.randint(listing["budget"]["min"], listing["budget"]["max"]),
            "final_deliverables": listing["deliverables"],
            "agent_negotiation_turns": random.randint(3, 10),
            "agreed_at": iso(agreed_at),
            "completed_at": iso(agreed_at + timedelta(days=random.randint(7, 21))),
        })

    return matches, agreements


def calculate_pair_features(influencer, business, listing):
    sector_match = 1.0 if any(cat in influencer["content_categories"] for cat in listing["target_categories"]) else random.uniform(0.1, 0.4)
    dist_km = math.sqrt(
        (influencer["location"]["lat"] - business["location"]["lat"]) ** 2
        + (influencer["location"]["lng"] - business["location"]["lng"]) ** 2
    ) * 111
    location_score = math.exp(-dist_km / 10)
    budget_mid = (listing["budget"]["min"] + listing["budget"]["max"]) / 2
    rate_mid = (influencer["rate_range"]["min"] + influencer["rate_range"]["max"]) / 2
    if listing["budget"]["min"] <= rate_mid <= listing["budget"]["max"]:
        budget_match = 1.0
    elif rate_mid <= listing["budget"]["max"] * 1.25:
        budget_match = 0.5
    else:
        budget_match = 0.3
    inf_styles = set(influencer["content_styles"])
    listing_styles = set(listing["preferred_styles"])
    style_match = len(inf_styles & listing_styles) / max(len(inf_styles | listing_styles), 1)
    audience_locations = influencer["audience_demographics"]["location_distribution"]
    audience_location_match = audience_locations.get(business["location"]["city"], audience_locations.get("diğer", 0.0))
    age_overlap = sum(
        influencer["audience_demographics"]["age_distribution"].get(age, 0.0)
        for age in business["target_audience"]["age_buckets"]
    )
    inf_interests = set(influencer["audience_demographics"]["interest_tags"])
    biz_interests = set(business["target_audience"]["interest_tags"])
    interest_overlap = len(inf_interests & biz_interests) / max(len(inf_interests | biz_interests), 1)
    engagement_norm = min(influencer["engagement_rate"] / 0.08, 1.0)
    tier_pref = 1.0 if influencer["tier"] in listing["preferred_tiers"] else 0.0

    return {
        "follower_count_log": round(math.log10(influencer["follower_count"]), 3),
        "following_ratio": round(influencer["following_count"] / influencer["follower_count"], 4),
        "engagement_rate": influencer["engagement_rate"],
        "comment_like_ratio": round(random.uniform(0.03, 0.08), 3),
        "account_age_days": (BASE_NOW - datetime.strptime(influencer["account_created_at"], "%Y-%m-%dT%H:%M:%SZ")).days,
        "post_frequency_weekly": round(random.uniform(2.5, 6.5), 2),
        "last_post_recency_days": random.randint(0, 7),
        "influencer_tier_numeric": {"nano": 1, "micro": 2, "mid": 3, "macro": 4, "mega": 5}[influencer["tier"]],
        "profile_completion": influencer["profile_completion"],
        "verified": 1 if influencer["verified"] else 0,
        "past_collaboration_count": influencer["past_collaboration_count"],
        "reel_post_ratio": round(random.uniform(0.20, 0.45), 2),
        "business_age_months": business["business_age_months"],
        "business_size_numeric": {"küçük": 1, "orta": 2, "zincir": 3}[business["size"]],
        "listing_budget_min": listing["budget"]["min"],
        "listing_budget_max": listing["budget"]["max"],
        "listing_budget_mid": int(budget_mid),
        "business_verified": 1 if business["verified"] else 0,
        "business_past_collab_count": business["past_collaboration_count"],
        "deliverable_count": len(listing["deliverables"]),
        "sector_content_match": round(sector_match, 3),
        "location_distance_km": round(dist_km, 1),
        "location_score": round(location_score, 3),
        "audience_location_match": round(audience_location_match, 2),
        "audience_age_overlap": round(min(age_overlap, 1.0), 2),
        "audience_gender_match": round(random.uniform(0.65, 0.95), 2),
        "audience_income_match": round(random.uniform(0.45, 0.90), 2),
        "audience_interest_overlap": round(interest_overlap, 2),
        "budget_tier_match": budget_match,
        "natural_affinity_score": round(random.uniform(0.2, 0.9) if sector_match > 0.8 else random.uniform(0.0, 0.35), 2),
        "style_match": round(style_match, 2),
        "language_match": 1,
        "past_category_experience": round(sector_match * random.uniform(0.4, 1.0), 2),
        "hashtag_overlap": round(random.uniform(0.15, 0.65) if sector_match > 0.8 else random.uniform(0.0, 0.25), 2),
        "profile_embedding_similarity": round(random.uniform(0.55, 0.92) if sector_match > 0.8 else random.uniform(0.2, 0.6), 2),
        "tier_preference_match": tier_pref,
        "engagement_rate_normalized": round(engagement_norm, 3),
    }


def compute_match_score(features):
    score = (
        0.25 * features["sector_content_match"]
        + 0.15 * features["location_score"]
        + 0.10 * features["audience_location_match"]
        + 0.08 * features["audience_age_overlap"]
        + 0.08 * features["audience_interest_overlap"]
        + 0.10 * features["budget_tier_match"]
        + 0.10 * features["natural_affinity_score"]
        + 0.05 * features["engagement_rate_normalized"]
        + 0.04 * features["tier_preference_match"]
        + 0.03 * features["style_match"]
        + 0.02 * random.uniform(0.2, 1.0)
    )
    return max(0.0, min(1.0, score + random.gauss(0, 0.05)))


def generate_training_pairs(influencers, businesses, listings, num_pairs=1000):
    active_listings = [listing for listing in listings if listing["status"] == "active"]
    business_by_id = {business["id"]: business for business in businesses}
    pairs = []
    scored_pairs = []
    for index in range(1, num_pairs + 1):
        influencer = random.choice(influencers)
        listing = random.choice(active_listings)
        business = business_by_id[listing["business_id"]]
        features = calculate_pair_features(influencer, business, listing)
        pair = {
            "pair_id": f"pair_{index:05d}",
            "influencer_id": influencer["id"],
            "listing_id": listing["listing_id"],
            "features": features,
            "label": None,
            "split": random.choices(["train", "validation", "test"], weights=[0.70, 0.15, 0.15])[0],
        }
        pairs.append(pair)
        scored_pairs.append((compute_match_score(features), pair))

    scored_pairs.sort(key=lambda item: item[0], reverse=True)
    good_count = round(num_pairs * 0.27)
    medium_count = round(num_pairs * 0.43)
    for rank, (_, pair) in enumerate(scored_pairs):
        if rank < good_count:
            pair["label"] = 2
        elif rank < good_count + medium_count:
            pair["label"] = 1
        else:
            pair["label"] = 0
    return pairs


def save(filename, data):
    path = OUTPUT_DIR / filename
    with path.open("w", encoding="utf-8") as file:
        json.dump(data, file, ensure_ascii=False, indent=2)
        file.write("\n")
    print(f"saved {filename} ({len(data) if isinstance(data, list) else 'dict'})")


def validate(influencers, businesses, posts, listings, swipes, matches, agreements, pairs):
    influencer_ids = {inf["id"] for inf in influencers}
    business_ids = {biz["id"] for biz in businesses}
    listing_ids = {listing["listing_id"] for listing in listings}
    match_ids = {match["match_id"] for match in matches}
    assert len(influencers) == 20
    assert len(businesses) == 10
    assert 300 <= len(posts) <= 500
    assert len(listings) == 20
    assert 100 <= len(swipes) <= 200
    assert len(matches) == 40
    assert len(agreements) == 20
    assert len(pairs) == 1000
    assert all(post["influencer_id"] in influencer_ids for post in posts)
    assert all(listing["business_id"] in business_ids for listing in listings)
    assert all(swipe["user_id"] in influencer_ids and swipe["listing_id"] in listing_ids for swipe in swipes)
    assert all(match["influencer_id"] in influencer_ids and match["business_id"] in business_ids and match["listing_id"] in listing_ids for match in matches)
    assert all(agreement["match_id"] in match_ids for agreement in agreements)
    assert all(pair["influencer_id"] in influencer_ids and pair["listing_id"] in listing_ids for pair in pairs)


def main():
    random.seed(42)
    OUTPUT_DIR.mkdir(exist_ok=True)

    taxonomy = {
        "sectors": SECTORS,
        "content_categories": CONTENT_CATEGORIES,
        "content_styles": CONTENT_STYLES,
        "job_positions": JOB_POSITIONS,
        "employment_types": EMPLOYMENT_TYPES,
        "hashtag_groups": HASHTAG_GROUPS,
        "locations": LOCATIONS,
    }
    influencers = [generate_influencer(template, index) for index, template in enumerate(INFLUENCER_TEMPLATES)]
    businesses = [generate_business(template, index) for index, template in enumerate(BUSINESS_TEMPLATES)]
    posts = [post for influencer in influencers for post in generate_posts_for_influencer(influencer)]
    for index, post in enumerate(posts, start=1):
        post["post_id"] = f"post_{index:05d}"

    listings = [generate_collab_listing(businesses[index % len(businesses)], index) for index in range(20)]
    if sum(1 for listing in listings if listing["status"] == "active") < 12:
        for listing in listings[:12]:
            listing["status"] = "active"

    agent_preferences = [generate_agent_prefs_influencer(influencer) for influencer in influencers]
    agent_preferences.extend(generate_agent_prefs_business(business) for business in businesses)
    swipes = generate_swipes(influencers, listings)
    matches, agreements = generate_matches_and_agreements(influencers, businesses, listings, swipes)
    pairs = generate_training_pairs(influencers, businesses, listings)

    validate(influencers, businesses, posts, listings, swipes, matches, agreements, pairs)

    save("taxonomy.json", taxonomy)
    save("influencer_profiles.json", influencers)
    save("business_profiles.json", businesses)
    save("instagram_posts.json", posts)
    save("collab_listings.json", listings)
    save("agent_preferences.json", agent_preferences)
    save("swipes.json", swipes)
    save("matches.json", matches)
    save("agreements.json", agreements)
    save("training_pairs.json", pairs)

    print("")
    print(f"Influencers:  {len(influencers)}")
    print(f"Businesses:   {len(businesses)}")
    print(f"Posts:        {len(posts)}")
    print(f"Listings:     {len(listings)}")
    print(f"Agent Prefs:  {len(agent_preferences)}")
    print(f"Swipes:       {len(swipes)}")
    print(f"Matches:      {len(matches)}")
    print(f"Agreements:   {len(agreements)}")
    print(f"Training:     {len(pairs)}")
    print(f"Labels:       {dict(Counter(pair['label'] for pair in pairs))}")


if __name__ == "__main__":
    main()
