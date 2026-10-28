# NEXO RJ — Backend

API FastAPI e pipeline Adaptive RAG sobre contratações públicas do RJ.

Este diretório é parte do monorepositório NEXO RJ. Consulte o [README principal](../README.md), o [guia de execução](../docs/EXECUCAO_LOCAL.md) e os [créditos/licenciamento](../docs/CREDITOS.md).

## Configuração padrão

- Embeddings: **Qwen3-Embedding-0.6B.Q8_0**, via llama.cpp em `http://127.0.0.1:18321/v1`.
- Geração: `xiaomi/mimo-v2.6-flash` via OpenRouter, com `openrouter/free` como reserva, mantendo a seleção local original. Chave somente em `.env`.
- Rerank: cross-encoder local.
- SQL: SQLite local; Postgres é opcional por `DATABASE_URL`.
- Corpus: pacote externo identificado por `runtime_bundle.json`, extraído **neste diretório**.

Copie `.env.example` para `.env`. Não troque o encoder Q8 por outro modelo sem reindexar ou validar compatibilidade.

## Comandos

Com o ambiente Python instalado e ativado, dentro de `backend/`:

```bash
python scripts/bootstrap_check.py
python -m uvicorn app.api:app --host 127.0.0.1 --port 8080
python -m pytest tests/ -m "not llm" -q
```

`bootstrap_check.py` valida o bundle, não a disponibilidade dos modelos. `/health` confirma a API; `/ready` exige os dados corretos. Uma consulta real depende do Q8 e do provedor de geração configurados.

## Referências

- [Arquitetura](ARQUITETURA.md)
- [Inventário](CORPUS_INVENTORY.md)
- [Contrato HTTP](docs/FRONTEND_API_CONTRACT.md)
- [CLI](docs/CLI.md)
- [Observabilidade](docs/OBSERVABILIDADE.md)
- [Conjunto de personas](PERSONAS.md)
- [Documentação técnica e medições históricas](docs/README.md)

O aviso MIT original permanece em [LICENSE](LICENSE).
