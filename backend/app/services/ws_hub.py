"""WebSocket fan-out hub for live negotiation streaming."""

from __future__ import annotations

import asyncio
from collections import defaultdict
from typing import Any

from fastapi import WebSocket


class NegotiationHub:
    def __init__(self) -> None:
        self._connections: dict[int, set[WebSocket]] = defaultdict(set)
        self._lock = asyncio.Lock()

    async def connect(self, negotiation_id: int, websocket: WebSocket) -> None:
        await websocket.accept()
        async with self._lock:
            self._connections[negotiation_id].add(websocket)

    async def disconnect(self, negotiation_id: int, websocket: WebSocket) -> None:
        async with self._lock:
            self._connections[negotiation_id].discard(websocket)
            if not self._connections[negotiation_id]:
                del self._connections[negotiation_id]

    async def broadcast(self, negotiation_id: int, event: dict[str, Any]) -> None:
        async with self._lock:
            targets = list(self._connections.get(negotiation_id, []))
        if not targets:
            return
        await asyncio.gather(
            *[self._safe_send(ws, event) for ws in targets],
            return_exceptions=True,
        )

    @staticmethod
    async def _safe_send(ws: WebSocket, event: dict[str, Any]) -> None:
        try:
            await ws.send_json(event)
        except Exception:  # noqa: BLE001
            # Karşı uç kopmuşsa sessizce yut; disconnect handler temizler.
            return


hub = NegotiationHub()
