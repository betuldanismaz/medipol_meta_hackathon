"""ML servis durumu endpoint'i.

`/ml/health` predictor'ın yüklenip yüklenmediğini, hangi adapter'ın aktif olduğunu
ve örnek bir inference süresi raporlar. Demo öncesi warm-up için de kullanılır:
ilk çağrı predictor'ı lazy-load eder, sonraki çağrılar singleton'a çarpar.
"""
from __future__ import annotations

import time

import numpy as np
from fastapi import APIRouter

from app.ml.predictor import get_predictor
from app.schemas import MLHealth

router = APIRouter(prefix="/ml", tags=["ml"])


@router.get("/health", response_model=MLHealth)
def ml_health() -> MLHealth:
    predictor = get_predictor()
    feature_count = len(predictor.feature_names)

    # Örnek inference: sıfır vektörü, sadece adaptör performansı için
    sample_ms: float | None = None
    if feature_count:
        X = np.zeros((1, feature_count))
        t0 = time.perf_counter()
        try:
            predictor.predict_score(X)
            sample_ms = (time.perf_counter() - t0) * 1000
        except Exception:  # noqa: BLE001
            sample_ms = None

    return MLHealth(
        model_loaded=predictor.is_loaded(),
        adapter=predictor.adapter_name,
        model_version=predictor.model_version,
        feature_count=feature_count,
        sample_inference_ms=sample_ms,
    )
