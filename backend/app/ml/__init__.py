"""Machine learning inference layer.

Bu modül `untitled24.py` Colab notebook'unda eğitilen XGBoost regressor'ı
backend'e bağlar:

- `predictor.get_predictor()` — singleton model loader, adapter pattern.
- `feature_extractor.extract_features()` — notebook helper'larıyla 1-1 uyumlu.
- `ranking.rank_pairs()` — feature extraction + predict + reasons.

Model artifact'leri `backend/ml_artifacts/<version>/` altında beklenir.
Dosya yoksa FallbackHeuristicAdapter devreye girer, demo bozulmaz.
"""

from app.ml.predictor import (
    FallbackHeuristicAdapter,
    Predictor,
    XGBoostJoblibRegressorAdapter,
    get_predictor,
    reset_predictor_cache,
)

__all__ = [
    "Predictor",
    "XGBoostJoblibRegressorAdapter",
    "FallbackHeuristicAdapter",
    "get_predictor",
    "reset_predictor_cache",
]
