const WEIGHTS = {
  nicheMatch: 30,
  locationMatch: 20,
  engagementScore: 20,
  audienceMatch: 15,
  budgetFit: 10,
  experienceScore: 5,
}

const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value))

const normalize = (value = '') =>
  String(value)
    .toLocaleLowerCase('tr-TR')
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const includesAny = (source, candidates) => {
  const normalizedSource = normalize(Array.isArray(source) ? source.join(' ') : source)
  return candidates.some((candidate) => normalizedSource.includes(normalize(candidate)))
}

const getOverlapRatio = (a = [], b = []) => {
  if (!a.length || !b.length) return 0
  const normalizedA = a.map(normalize)
  const normalizedB = b.map(normalize)
  const hits = normalizedA.filter((item) =>
    normalizedB.some((target) => item.includes(target) || target.includes(item)),
  )
  return hits.length / Math.max(normalizedB.length, 1)
}

const scoreEngagement = (engagementRate) => {
  // Mikro-influencer MVP mantığı: sağlıklı etkileşim, sadece takipçi sayısından daha değerlidir.
  if (engagementRate >= 7) return 100
  if (engagementRate >= 5) return 85
  if (engagementRate >= 3.5) return 68
  if (engagementRate >= 2) return 45
  return 24
}

const scoreBudget = (price, budget) => {
  if (!budget || budget <= 0) return 50
  if (price <= budget * 0.75) return 100
  if (price <= budget) return 88
  if (price <= budget * 1.2) return 60
  if (price <= budget * 1.5) return 35
  return 15
}

const scoreExperience = (pastCampaigns = []) => clamp(pastCampaigns.length * 25, 20, 100)

const scoreLocation = (influencerLocation, campaignLocation) => {
  const inf = normalize(influencerLocation)
  const camp = normalize(campaignLocation)

  if (!inf || !camp) return 40
  if (inf === camp || inf.includes(camp) || camp.includes(inf)) return 100

  const infParts = inf.split(' ')
  const campParts = camp.split(' ')
  const shared = infParts.filter((part) => campParts.includes(part))
  if (shared.includes('istanbul')) return 76
  if (shared.length > 0) return 60
  return 20
}

const scoreAudience = (influencerAudience = [], targetAudience = '') => {
  const targetTokens = normalize(targetAudience).split(' ').filter(Boolean)
  const relevantTokens = targetTokens.filter((token) => token.length > 2)
  if (!relevantTokens.length) return 45
  const hits = relevantTokens.filter((token) => includesAny(influencerAudience, [token]))
  return clamp((hits.length / Math.min(relevantTokens.length, 8)) * 100, 15, 100)
}

const scoreNiche = (influencerNiches = [], preferredNiches = [], sector = '') => {
  const preferred = preferredNiches.length ? preferredNiches : normalize(sector).split(' ')
  return clamp(getOverlapRatio(influencerNiches, preferred) * 100, 12, 100)
}

const weighted = (raw, weight) => Math.round((raw / 100) * weight)

export function calculateMatch(influencer, campaign) {
  const rawScores = {
    nicheMatch: scoreNiche(influencer.niches, campaign.preferredNiches, campaign.sector),
    locationMatch: scoreLocation(influencer.location, campaign.location),
    engagementScore: scoreEngagement(influencer.engagementRate),
    audienceMatch: scoreAudience(influencer.audience, campaign.targetAudience),
    budgetFit: scoreBudget(influencer.price, Number(campaign.budget)),
    experienceScore: scoreExperience(influencer.pastCampaigns),
  }

  const scoreBreakdown = Object.entries(rawScores).reduce((acc, [key, raw]) => {
    acc[key] = {
      raw: Math.round(raw),
      weight: WEIGHTS[key],
      weighted: weighted(raw, WEIGHTS[key]),
    }
    return acc
  }, {})

  const totalScore = clamp(
    Object.values(scoreBreakdown).reduce((sum, item) => sum + item.weighted, 0),
    0,
    100,
  )

  const commonNiches = influencer.niches.filter((niche) =>
    campaign.preferredNiches.some((preferred) =>
      normalize(niche).includes(normalize(preferred)) || normalize(preferred).includes(normalize(niche)),
    ),
  )

  const nicheText = commonNiches.length ? commonNiches.join(', ') : influencer.niches.slice(0, 2).join(', ')
  const engagementText =
    influencer.engagementRate >= 5
      ? 'etkileşim oranı sağlıklı'
      : 'takipçi sayısı yüksek olsa da etkileşim oranı sınırlı'
  const budgetText =
    influencer.price <= Number(campaign.budget)
      ? 'bütçe aralığına uygundur'
      : 'bütçeyi zorlayabilir'

  const explanation = `Bu influencer, ${campaign.businessName || 'işletmeniz'} için ${
    totalScore >= 75 ? 'güçlü' : totalScore >= 55 ? 'değerlendirilebilir' : 'daha zayıf'
  } bir adaydır çünkü ${nicheText} uyumu öne çıkıyor, lokasyon skoru ${Math.round(
    rawScores.locationMatch,
  )}/100, ${engagementText} ve ${budgetText}. Sistem sadece takipçi sayısına değil; niş, lokasyon, etkileşim, kitle ve bütçe uyumuna birlikte bakar.`

  return {
    ...influencer,
    totalScore,
    scoreBreakdown,
    explanation,
  }
}

export function rankInfluencers(influencers, campaign) {
  return influencers
    .map((influencer) => calculateMatch(influencer, campaign))
    .sort((a, b) => b.totalScore - a.totalScore)
}

export const scoreLabels = {
  nicheMatch: 'Niş uyumu',
  locationMatch: 'Lokasyon uyumu',
  engagementScore: 'Etkileşim sağlığı',
  audienceMatch: 'Hedef kitle uyumu',
  budgetFit: 'Bütçe uygunluğu',
  experienceScore: 'Kampanya deneyimi',
}

export const scoreFormula = WEIGHTS
