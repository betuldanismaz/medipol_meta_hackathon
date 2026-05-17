"""Model loading + inference adapter pattern.

Eğitilmiş XGBoost regressor (`untitled24.py` çıktısı) backend'e bu modülden
sokulur. Adapter pattern sayesinde ileride farklı format (classifier, ONNX)
gelirse aynı `Predictor` interface'ine uyacak yeni bir adapter eklenir.

Akış:
    get_predictor() → en son `ml_artifacts/v*/` dizinini bul → adapter seç →
    @lru_cache ile singleton tut.

Model bulunamazsa `FallbackHeuristicAdapter` devreye girer — demo bozulmaz.
"""
from __future__ import annotations

import json
import logging
from abc import ABC, abstractmethod
from functools import lru_cache
from pathlib import Path

import numpy as np

logger = logging.getLogger("app.ml.predictor")

ARTIFACTS_ROOT_ENV = "ML_ARTIFACTS_ROOT"
DEFAULT_ARTIFACTS_ROOT = Path(__file__).resolve().parents[2] / "ml_artifacts"


class Predictor(ABC):
    """Tüm model adapter'larının uyduğu interface."""

    adapter_name: str = "Predictor"
    feature_names: list[str] = []
    model_version: str = "unknown"
    score_range: tuple[float, float] = (0.0, 100.0)

    @abstractmethod
    def predict_score(self, X: np.ndarray) -> np.ndarray:
        """Shape (n_samples,) — her zaman [0, 100] arasında skor."""

    def is_loaded(self) -> bool:  # noqa: D401
        """Gerçek model dosyası yüklendi mi (fallback değil)?"""
        return True


class XGBoostJoblibRegressorAdapter(Predictor):
    """`xgboost_match_score_regressor.joblib` + `metadata.json` sarmalayıcı.

    Notebook XGBRegressor (`reg:squarederror`) eğitiyor, `predict()` doğrudan
    0-100 arası bir skor döner. `predict_proba` yok.
    """

    adapter_name = "XGBoostJoblibRegressorAdapter"

    def __init__(self, artifact_dir: Path) -> None:
        import joblib  # lazy import — paket henüz install edilmemişse mock'ta sorun çıkmasın

        meta_path = artifact_dir / "metadata.json"
        if not meta_path.exists():
            raise FileNotFoundError(f"metadata.json bulunamadı: {meta_path}")
        meta = json.loads(meta_path.read_text(encoding="utf-8"))

        model_file = meta.get("model_file", "xgboost_match_score_regressor.joblib")
        model_path = artifact_dir / model_file
        if not model_path.exists():
            raise FileNotFoundError(f"Model dosyası yok: {model_path}")

        self._model = joblib.load(model_path)
        self.feature_names = list(meta["feature_names"])
        self.model_version = meta.get("model_version", artifact_dir.name)
        self.score_range = tuple(meta.get("score_range", [0.0, 100.0]))  # type: ignore[assignment]
        self._artifact_dir = artifact_dir

        # Sanity: model.feature_names_in_ ile metadata uyuşuyor mu?
        model_features = getattr(self._model, "feature_names_in_", None)
        if model_features is not None:
            model_list = list(map(str, model_features))
            if model_list != self.feature_names:
                logger.warning(
                    "metadata.feature_names ile model.feature_names_in_ farklı. "
                    "metadata kullanılacak (sıra dökümante edilmiş)."
                )

        logger.info(
            "[predictor] loaded %s | version=%s | features=%d",
            self.adapter_name, self.model_version, len(self.feature_names),
        )

    def predict_score(self, X: np.ndarray) -> np.ndarray:
        if X.ndim == 1:
            X = X.reshape(1, -1)
        raw = self._model.predict(X)
        # Notebook regression target 0-100 → genelde 0-100 arası çıkar ama
        # clip et: out-of-range tahminler edge'de olabilir.
        low, high = self.score_range
        return np.clip(raw.astype(float), low, high)


class FallbackHeuristicAdapter(Predictor):
    """Model dosyası yokken devreye girer — basit kural tabanlı skor.

    Frontend bozulmasın diye 0-100 arasında bir skor üretir. Hesaplama:
    sector_content_match × 30 + location_score × 25 + budget_tier_match × 20 +
    audience_interest_overlap × 15 + natural_affinity_score × 10
    """

    adapter_name = "FallbackHeuristicAdapter"
    model_version = "fallback_v1"
    feature_names = [
        "sector_content_match",
        "location_score",
        "budget_tier_match",
        "audience_interest_overlap",
        "natural_affinity_score",
    ]

    def is_loaded(self) -> bool:
        return False

    def predict_score(self, X: np.ndarray) -> np.ndarray:
        if X.ndim == 1:
            X = X.reshape(1, -1)
        # Beklenen kolonlar yoksa sıfır → minimum 10 skor (en kötü kart bile gösterilebilsin)
        weights = np.array([30.0, 25.0, 20.0, 15.0, 10.0])
        if X.shape[1] != len(weights):
            # Bilinmeyen shape — orta-düşük bir skor döndür
            return np.full(X.shape[0], 35.0)
        scores = X @ weights
        return np.clip(scores, 10.0, 95.0)


def _resolve_artifacts_root() -> Path:
    import os

    override = os.environ.get(ARTIFACTS_ROOT_ENV)
    return Path(override) if override else DEFAULT_ARTIFACTS_ROOT


def _find_latest_version_dir(root: Path) -> Path | None:
    if not root.exists():
        return None
    candidates = [d for d in root.iterdir() if d.is_dir() and (d / "metadata.json").exists()]
    if not candidates:
        return None
    # En son modified olanı seç — `v1`, `v2`, `v10` sıralamasında lexicographic
    # sürpriz olmasın diye mtime kullanıyoruz.
    return max(candidates, key=lambda d: d.stat().st_mtime)


@lru_cache(maxsize=1)
def get_predictor() -> Predictor:
    """Singleton predictor accessor. İlk çağrıda lazy load eder."""
    root = _resolve_artifacts_root()
    latest = _find_latest_version_dir(root)
    if latest is None:
        logger.warning(
            "[predictor] ml_artifacts/ altında model bulunamadı (%s). "
            "FallbackHeuristicAdapter devrede.",
            root,
        )
        return FallbackHeuristicAdapter()

    try:
        return XGBoostJoblibRegressorAdapter(latest)
    except Exception as exc:  # noqa: BLE001
        logger.exception("[predictor] model yüklenemedi (%s): %s", latest, exc)
        return FallbackHeuristicAdapter()


def reset_predictor_cache() -> None:
    """Test/hot-reload için. `get_predictor.cache_clear()` short-hand."""
    get_predictor.cache_clear()
