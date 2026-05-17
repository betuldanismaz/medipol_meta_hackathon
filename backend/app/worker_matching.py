import math

def worker_position_score(worker: dict, job: dict) -> int:
    """Pozisyon eşleşmesi (max 35)"""
    preferred = worker.get("preferred_positions", [])
    if not isinstance(preferred, list):
        preferred = [preferred]
    
    pos_id = job.get("position_id")
    if pos_id and pos_id in preferred:
        return 35
    return 10  # Başka pozisyona da açık olabilir

def worker_experience_score(worker: dict, job: dict) -> int:
    """Deneyim eşleşmesi (max 20)"""
    try:
        w_exp = float(worker.get("experience_years", 0))
        j_req = float(job.get("required_experience_years", 0))
        if w_exp >= j_req:
            return 20
        # Deneyimi eksik ama yine de şansı var
        ratio = w_exp / (j_req if j_req > 0 else 1)
        return int(20 * ratio)
    except (ValueError, TypeError):
        return 10

def worker_wage_score(worker: dict, job: dict) -> int:
    """Ücret eşleşmesi (max 20)"""
    try:
        w_min = float(worker.get("rate_range", {}).get("min", 0))
        j_wage = float(job.get("wage", {}).get("amount", 0))
        
        if w_min == 0 or j_wage == 0:
            return 10
            
        if j_wage >= w_min:
            return 20
        
        # Bütçe biraz düşükse puan azalır
        if j_wage >= w_min * 0.8:
            return 10
            
        return 0
    except (ValueError, TypeError, AttributeError):
        return 10

def calculate_worker_score(worker: dict, job: dict, biz: dict) -> dict:
    from app.matching import location_score, enrich_reasons_with_llm
    
    s1 = worker_position_score(worker, job)
    s2 = location_score(worker, biz)  # Max 20
    s3 = worker_experience_score(worker, job)
    s4 = worker_wage_score(worker, job)
    s5 = 5  # default activity
    
    total = s1 + s2 + s3 + s4 + s5
    final_score = max(10, min(92, total))
    
    reasons = []
    if s1 == 35: reasons.append("Pozisyon beklentileri tam uyuşuyor.")
    if s2 >= 15: reasons.append("İşyerine oldukça yakınsınız.")
    if s3 == 20: reasons.append("Aranan tecrübe süresini karşılıyor.")
    if s4 == 20: reasons.append("Ücret beklentisi ile teklif uyumlu.")
    
    return {
        "score": final_score,
        "reasons": reasons,
        "breakdown": {
            "position": s1,
            "location": s2,
            "experience": s3,
            "wage": s4,
            "activity": s5
        }
    }
