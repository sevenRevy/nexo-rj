"""Confere os artefatos externos do snapshot Q8, sem modificar o corpus.

Uso: python scripts/bootstrap_check.py
"""
from __future__ import annotations

import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ))

import config
from src.snapshot import readiness


def main() -> int:
    endpoint, _, modelo = config.embedding_endpoint()
    print("== Configuração resolvida ==")
    print(f"  LLM_PROVIDER_MODE  = {config.LLM_PROVIDER_MODE}")
    print(f"  EMBEDDING_PROVIDER = {config.EMBEDDING_PROVIDER}")
    print(f"  embeddings         = {endpoint} ({modelo})")
    print(f"  rerank             = {config.RERANK_PROVIDER}/{config.RERANK_MODEL}")
    if not (RAIZ / ".env").exists():
        print("  [AVISO] copie .env.example para .env e configure sua chave de geração.")
    if config.LLM_PROVIDER_MODE == "openrouter" and not config.OPENROUTER_API_KEY:
        print("  [AVISO] OPENROUTER_API_KEY ausente; geração não está configurada.")
    if not (RAIZ / "eval" / "golden_set.jsonl").is_file():
        print("  [FALTA] eval/golden_set.jsonl", file=sys.stderr)
        return 1
    status = readiness()
    if not status.get("ready"):
        print(f"  [FALTA] bundle de runtime: {status.get('reason')}", file=sys.stderr)
        print("  Extraia o pacote Q8 dentro de backend/; veja ../docs/EXECUCAO_LOCAL.md.")
        return 1
    print(f"  [OK] bundle íntegro: {status['snapshot_id']}")
    print("A integridade dos dados não testa a disponibilidade do LLM nem do llama-server.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
