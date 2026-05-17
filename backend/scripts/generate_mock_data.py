import json
import random
import os

# Create data directory
os.makedirs('backend/data', exist_ok=True)

# 1. Influencers (20)
influencers = []
tiers = ['nano', 'micro', 'mid', 'macro', 'mega']
categories = ['cat_001', 'cat_002', 'cat_003', 'cat_004']
for i in range(1, 21):
    tier = random.choice(tiers)
    followers = random.randint(1000, 1500000)
    inf = {
        "id": f"inf_{i:03d}",
        "name": f"Influencer {i}",
        "tier": tier,
        "followers": followers,
        "engagement_rate": random.uniform(0.01, 0.1),
        "content_categories": [random.choice(categories)],
        "city": random.choice(["İstanbul", "Ankara", "İzmir"]),
        "niche": random.choice(["moda", "yemek", "yaşam", "güzellik"])
    }
    influencers.append(inf)

with open('backend/data/influencers.json', 'w', encoding='utf-8') as f:
    json.dump(influencers, f, indent=2, ensure_ascii=False)

# 2. Businesses (10)
businesses = []
for i in range(1, 11):
    biz = {
        "id": f"biz_{i:03d}",
        "name": f"İşletme {i}",
        "city": random.choice(["İstanbul", "Ankara", "İzmir"]),
        "niche": random.choice(["moda", "yemek", "yaşam", "güzellik"]),
        "target_followers": random.choice(["micro", "mid", "macro"])
    }
    businesses.append(biz)

with open('backend/data/businesses.json', 'w', encoding='utf-8') as f:
    json.dump(businesses, f, indent=2, ensure_ascii=False)

# 3. Collab Listings (20)
listings = []
for i in range(1, 21):
    biz = random.choice(businesses)
    lst = {
        "listing_id": f"col_{i:03d}",
        "business_id": biz["id"],
        "title": f"{biz['name']} İşbirliği",
        "budget_min": random.randint(1000, 5000),
        "budget_max": random.randint(5000, 20000)
    }
    listings.append(lst)

with open('backend/data/collab_listings.json', 'w', encoding='utf-8') as f:
    json.dump(listings, f, indent=2, ensure_ascii=False)

# 4. Instagram Posts (300-500)
posts = []
for i in range(1, 401): # ~400
    inf = random.choice(influencers)
    post = {
        "post_id": f"post_{i:04d}",
        "influencer_id": inf["id"],
        "likes": int(inf["followers"] * inf["engagement_rate"]),
        "category": inf["content_categories"][0]
    }
    posts.append(post)

with open('backend/data/posts.json', 'w', encoding='utf-8') as f:
    json.dump(posts, f, indent=2, ensure_ascii=False)

# 5. Swipes (100-200)
swipes = []
for i in range(1, 151): # ~150
    inf = random.choice(influencers)
    lst = random.choice(listings)
    swipes.append({
        "swipe_id": f"swp_{i:03d}",
        "influencer_id": inf["id"],
        "listing_id": lst["listing_id"],
        "direction": random.choice(["right", "left"])
    })

with open('backend/data/swipes.json', 'w', encoding='utf-8') as f:
    json.dump(swipes, f, indent=2, ensure_ascii=False)

# 6. Matches (40)
matches = []
for i in range(1, 41):
    inf = random.choice(influencers)
    lst = random.choice(listings)
    matches.append({
        "match_id": f"mch_{i:03d}",
        "influencer_id": inf["id"],
        "listing_id": lst["listing_id"]
    })

with open('backend/data/matches.json', 'w', encoding='utf-8') as f:
    json.dump(matches, f, indent=2, ensure_ascii=False)

# 7. Agreements (20)
agreements = []
for i in range(1, 21):
    match = random.choice(matches)
    agreements.append({
        "agreement_id": f"agr_{i:03d}",
        "match_id": match["match_id"],
        "final_budget": random.randint(2000, 15000)
    })

with open('backend/data/agreements.json', 'w', encoding='utf-8') as f:
    json.dump(agreements, f, indent=2, ensure_ascii=False)

# 8. Training Pairs (1000)
training_pairs = []
for i in range(1, 1001):
    inf = random.choice(influencers)
    biz = random.choice(businesses)
    
    # Calculate dummy features
    semantic_score = random.uniform(0, 1)
    location_score = 1 if inf["city"] == biz["city"] else 0
    tier_match = 1 if inf["tier"] == biz["target_followers"] else 0
    
    # Synthetic label (0, 1, 2)
    label = 0
    total = semantic_score * 35 + location_score * 20 + tier_match * 20
    if total > 50: label = 2
    elif total > 30: label = 1
    
    pair = {
        "pair_id": f"pair_{i:04d}",
        "influencer_id": inf["id"],
        "business_id": biz["id"],
        "features": {
            "semantic_match": semantic_score,
            "location_match": location_score,
            "tier_match": tier_match,
            "engagement_rate": inf["engagement_rate"]
        },
        "label": label
    }
    training_pairs.append(pair)

with open('backend/data/training_pairs.json', 'w', encoding='utf-8') as f:
    json.dump(training_pairs, f, indent=2, ensure_ascii=False)

print("Tüm veriler başarıyla backend/data altına oluşturuldu!")
