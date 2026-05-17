"""OpenAI gpt-5-nano agent wrapper.

Yapılandırılmış müzakere agent'ı. JSON schema ile structured output döndürür;
``OPENAI_API_KEY`` yoksa veya API çağrısı başarısız olursa deterministik bir
fallback agent devreye girer (demo/test akışını bloklamamak için).
"""

from __future__ import annotations

import json
import logging
import random
from dataclasses import dataclass

from app.config import settings
from app.models import AgentStyle, MessageRole, User, UserRole

logger = logging.getLogger(__name__)

AGENT_OUTPUT_SCHEMA: dict = {
    "name": "AgentTurn",
    "schema": {
        "type": "object",
        "additionalProperties": False,
        "properties": {
            "message": {"type": "string"},
            "reasoning": {"type": "string"},
            "proposed_terms": {
                "type": "object",
                "additionalProperties": False,
                "properties": {
                    "price": {"type": ["number", "null"]},
                    "currency": {"type": "string"},
                    "duration_days": {"type": ["integer", "null"]},
                    "scope": {"type": ["string", "null"]},
                    "extra_conditions": {
                        "type": "array",
                        "items": {"type": "string"},
                    },
                },
                "required": ["price", "currency", "duration_days", "scope", "extra_conditions"],
            },
            "status": {"type": "string", "enum": ["continue", "agree", "reject"]},
        },
        "required": ["message", "reasoning", "proposed_terms", "status"],
    },
    "strict": True,
}


STYLE_INSTRUCTIONS: dict[AgentStyle, str] = {
    AgentStyle.AGGRESSIVE: (
        "Müzakere stilin SERT. Karşı tarafa baskı uygula, ilk teklifin avantajlı olsun, "
        "kolay taviz verme. Kullanıcının dealbreaker'larından asla sapma."
    ),
    AgentStyle.BALANCED: (
        "Müzakere stilin DENGELİ. Hem nazik hem net ol; karşılıklı kazan-kazan çözümleri ara. "
        "Dealbreaker'lar mutlak, dışındaki maddelerde makul esneklik göster."
    ),
    AgentStyle.FLEXIBLE: (
        "Müzakere stilin ESNEK. Karşı tarafın ihtiyaçlarına öncelik ver, makul taviz vermeye yatkın ol, "
        "ama dealbreaker'lardan asla taviz verme."
    ),
    AgentStyle.QUICK_CLOSER: (
        "Müzakere stilin HIZLI KAPATICI. Erken turda makul bir orta nokta öner, az turda anlaşmayı bitir. "
        "Dealbreaker dışındaki maddelerde detaylara takılma."
    ),
}


@dataclass
class AgentContext:
    user: User
    counterpart_role: UserRole
    listing_summary: str
    last_proposed_terms: dict | None
    counterpart_last_message: str | None
    counterpart_last_terms: dict | None
    current_round: int
    max_rounds: int
    memory_summaries: list[str]
    user_guidance: str | None = None


def _persona_for(user: User) -> tuple[str, AgentStyle]:
    persona = user.agent_persona or {}
    name = persona.get("name") or f"{user.display_name} Agent"
    style_raw = persona.get("style") or AgentStyle.BALANCED.value
    try:
        style = AgentStyle(style_raw)
    except ValueError:
        style = AgentStyle.BALANCED
    return name, style


def _dealbreakers_text(user: User) -> str:
    db_record = user.dealbreakers
    if not db_record:
        return "- (kayıtlı dealbreaker yok)"
    lines: list[str] = []
    if db_record.min_price is not None:
        lines.append(f"- Minimum ücret: {db_record.min_price:.0f} TRY (asla altına inme).")
    if db_record.max_price is not None:
        lines.append(f"- Maximum ücret (bütçe tavanı): {db_record.max_price:.0f} TRY.")
    if db_record.max_hours_per_week is not None:
        lines.append(f"- Haftalık maksimum {db_record.max_hours_per_week} saat.")
    if db_record.forbidden_days:
        lines.append(f"- Çalışılmayacak günler: {', '.join(db_record.forbidden_days)}.")
    if db_record.required_days:
        lines.append(f"- Zorunlu uygunluk günleri: {', '.join(db_record.required_days)}.")
    if db_record.forbidden_categories:
        lines.append(f"- Yasak kategori/markalar: {', '.join(db_record.forbidden_categories)}.")
    if db_record.require_in_person:
        lines.append("- Yüz yüze çalışma şart.")
    if db_record.free_notes:
        lines.append(f"- Serbest notlar (dealbreaker olarak uy): {db_record.free_notes.strip()}.")
    return "\n".join(lines) if lines else "- (kayıtlı dealbreaker yok)"


def build_system_prompt(ctx: AgentContext) -> str:
    name, style = _persona_for(ctx.user)
    style_instr = STYLE_INSTRUCTIONS[style]
    persona_block = (
        f"Sen '{name}' isimli bir müzakere agent'ısın. "
        f"{ctx.user.display_name} adlı kullanıcının yerine konuşuyorsun ({ctx.user.role.value})."
    )

    memory_block = "\n".join(f"- {m}" for m in ctx.memory_summaries) if ctx.memory_summaries else "- (henüz geçmiş yok)"

    guidance_block = (
        f"\n\nKULLANICI ARA TALİMATI (öncelikli uy):\n{ctx.user_guidance.strip()}"
        if ctx.user_guidance
        else ""
    )

    return f"""{persona_block}

{style_instr}

KARŞI TARAF ROLÜ: {ctx.counterpart_role.value}
İLAN ÖZETİ: {ctx.listing_summary}

DEALBREAKER'LAR (mutlaktır, asla geçilemez):
{_dealbreakers_text(ctx.user)}

GEÇMİŞ MÜZAKERE ÖZETLERİ (semantic memory):
{memory_block}

KURALLAR:
- Türkçe konuş, kısa ve doğal yaz (en fazla 3 cümle).
- Her turda mutlaka bir 'proposed_terms' öner; ilerleme yoksa bile mevcut teklifini tekrarla.
- 'reasoning' alanı kullanıcıya görünür düşünce balonudur; neden bu teklifi yaptığını 1-2 cümle özetle.
- Anlaşırsan status='agree', kabul edilemez ise status='reject', devam ediyorsa 'continue'.
- Maksimum {ctx.max_rounds} tur, şu an tur: {ctx.current_round}.{guidance_block}

ÇIKTI: yalnızca AgentTurn JSON şemasına uyan bir nesne."""


def build_user_prompt(ctx: AgentContext) -> str:
    counterpart_msg = ctx.counterpart_last_message or "(henüz karşıdan mesaj yok)"
    counterpart_terms = (
        json.dumps(ctx.counterpart_last_terms, ensure_ascii=False)
        if ctx.counterpart_last_terms
        else "yok"
    )
    own_terms = (
        json.dumps(ctx.last_proposed_terms, ensure_ascii=False)
        if ctx.last_proposed_terms
        else "henüz teklif vermedin"
    )
    return (
        f"Karşı taraf agent'ının son mesajı: {counterpart_msg}\n"
        f"Karşı tarafın son önerdiği şartlar: {counterpart_terms}\n"
        f"Senin son önerdiğin şartlar: {own_terms}\n"
        f"Tur: {ctx.current_round}/{ctx.max_rounds}\n\n"
        f"Bir sonraki turunu üret."
    )


def _fallback_turn(ctx: AgentContext) -> dict:
    rng = random.Random(ctx.user.id * 1000 + ctx.current_round)
    db = ctx.user.dealbreakers
    base_price = ctx.last_proposed_terms.get("price") if ctx.last_proposed_terms else None
    counterpart_price = (ctx.counterpart_last_terms or {}).get("price") if ctx.counterpart_last_terms else None
    if base_price is None:
        if ctx.user.role == UserRole.BUSINESS:
            base_price = float(db.max_price if db and db.max_price else 5000) * 0.7
        else:
            base_price = float(db.min_price if db and db.min_price else 3000) * 1.3
    if counterpart_price is not None:
        delta = (counterpart_price - base_price) / 4
        base_price = round(base_price + delta + rng.uniform(-100, 100), -1)
    else:
        base_price = round(base_price + rng.uniform(-200, 200), -1)

    status = "continue"
    if ctx.current_round >= ctx.max_rounds:
        status = "agree" if counterpart_price else "reject"
    elif counterpart_price and abs(counterpart_price - base_price) < 250:
        status = "agree"

    message = (
        f"Teklifim: {int(base_price)} TRY. "
        + ("Anlaşıyoruz." if status == "agree" else "Bu rakamla devam edelim mi?")
    )
    reasoning = (
        "Dealbreaker'lar içinde, ortalama bir teklif ürettim (fallback agent, OpenAI bağlantısı yok)."
    )
    return {
        "message": message,
        "reasoning": reasoning,
        "proposed_terms": {
            "price": base_price,
            "currency": "TRY",
            "duration_days": (ctx.last_proposed_terms or {}).get("duration_days") or 7,
            "scope": (ctx.last_proposed_terms or {}).get("scope") or "1 reel + 2 story",
            "extra_conditions": [],
        },
        "status": status,
    }


def run_agent_turn(ctx: AgentContext) -> dict:
    """Bir agent turu çalıştırır ve dict döndürür (AgentTurn şemasında)."""
    if not settings.openai_api_key:
        logger.info("OPENAI_API_KEY yok, fallback agent kullanılıyor.")
        return _fallback_turn(ctx)

    try:
        from openai import OpenAI

        client = OpenAI(api_key=settings.openai_api_key)
        completion = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": build_system_prompt(ctx)},
                {"role": "user", "content": build_user_prompt(ctx)},
            ],
            response_format={"type": "json_schema", "json_schema": AGENT_OUTPUT_SCHEMA},
            temperature=0.4,
        )
        raw = completion.choices[0].message.content or "{}"
        data = json.loads(raw)
        # Sanity-fill: schema strict olduğu için bu nadir, ama güvenlik için.
        data.setdefault("status", "continue")
        return data
    except Exception:  # noqa: BLE001
        logger.exception("OpenAI agent çağrısı başarısız, fallback'e geçiliyor.")
        return _fallback_turn(ctx)


def summarize_for_memory(negotiation, agreement, perspective_user: User) -> str:
    """Anlaşma sonrası kullanıcının kendi semantic memory'sine yazılacak kısa özet."""
    counterpart = "İşletme" if perspective_user.role != UserRole.BUSINESS else "Aday"
    terms = (agreement.final_terms if agreement else negotiation.last_proposed_terms) or {}
    price = terms.get("price")
    scope = terms.get("scope")
    if agreement and agreement.status.value == "confirmed":
        return f"{counterpart} ile anlaşma: {int(price) if price else '—'} TRY, kapsam: {scope or '—'}."
    return f"{counterpart} ile {negotiation.current_round} tur sonunda anlaşma sağlanamadı."
