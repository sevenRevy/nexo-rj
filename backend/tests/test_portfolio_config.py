"""Defaults independentes de arquivos .env e serviços externos."""
from pathlib import Path
import runpy

import dotenv


def test_defaults_use_local_q8_without_institutional_endpoint(monkeypatch):
    names = (
        "EMBEDDING_PROVIDER", "EMBEDDING_MODEL", "OLLAMA_LOCAL_URL",
        "OLLAMA_LOCAL_EMBEDDING_MODEL", "OLLAMA_LOCAL_API_KEY", "OLLAMA_URL",
        "OLLAMA_API_KEY", "LLM_PROVIDER_MODE", "SNAPSHOT_MANIFEST",
        "OPENROUTER_MODEL", "OPENROUTER_MODEL_FALLBACK", "GENERATION_MODEL",
    )
    for name in names:
        monkeypatch.delenv(name, raising=False)
    monkeypatch.setattr(dotenv, "load_dotenv", lambda *args, **kwargs: None)
    values = runpy.run_path(str(Path(__file__).resolve().parents[1] / "config.py"))

    assert values["EMBEDDING_PROVIDER"] == "ollama"
    assert values["EMBEDDING_MODEL"] == "Qwen3-Embedding-0.6B.Q8_0"
    assert values["embedding_endpoint"]() == (
        "http://127.0.0.1:18321/v1", "ollama", "Qwen3-Embedding-0.6B.Q8_0",
    )
    assert values["OLLAMA_URL"] == "http://localhost:11434/v1"
    assert values["LLM_PROVIDER_MODE"] == "openrouter"
    assert values["OPENROUTER_MODEL"] == "xiaomi/mimo-v2.6-flash"
    assert values["OPENROUTER_MODEL_FALLBACK"] == "openrouter/free"
    assert values["GENERATION_MODEL"] == "qcwind/qwen3-8b-instruct-Q4-K-M"
    assert values["SNAPSHOT_MANIFEST"] == "runtime_bundle.json"


def test_index_and_direct_build_use_local_q8_without_encoder_fallback(monkeypatch):
    from types import SimpleNamespace
    import openai
    import config
    from src import create_embeddings, direct_build, index

    monkeypatch.setattr(config, "EMBEDDING_PROVIDER", "ollama")
    monkeypatch.setattr(config, "OLLAMA_LOCAL_URL", "http://127.0.0.1:18321/v1")
    monkeypatch.setattr(config, "OLLAMA_LOCAL_EMBEDDING_MODEL", "Qwen3-Embedding-0.6B.Q8_0")
    selected = []

    def client(**options):
        selected.append(options["base_url"])
        return SimpleNamespace(embeddings=SimpleNamespace())

    monkeypatch.setattr(openai, "OpenAI", client)
    index._default_embed_fn("Qwen3-Embedding-0.6B.Q8_0")
    assert selected == ["http://127.0.0.1:18321/v1"]

    def configured(provider, endpoint, api_key, model):
        selected.append((provider, endpoint, model))
        def unavailable(texts):
            raise ConnectionError("Q8 offline")
        return unavailable

    monkeypatch.setattr(create_embeddings, "_configured_embed_batch", configured)
    monkeypatch.setattr(config, "PAUSA_ENTRE_LOTES_EMBEDDING", 0)
    statistics, fallbacks = {}, []
    embed, model = direct_build._embed_padrao_do_modo_direto(statistics, fallbacks)
    import pytest
    with pytest.raises(ConnectionError, match="Q8 offline"):
        embed(["consulta"])
    assert model == "Qwen3-Embedding-0.6B.Q8_0"
    assert selected[1:] == [("ollama", "http://127.0.0.1:18321/v1", model)]
    assert not fallbacks


def test_embedding_provider_can_still_be_configured(monkeypatch):
    monkeypatch.setattr(dotenv, "load_dotenv", lambda *args, **kwargs: None)
    monkeypatch.setenv("EMBEDDING_PROVIDER", "custom")
    monkeypatch.setenv("CUSTOM_API_URL", "http://encoder.test/v1")
    monkeypatch.setenv("CUSTOM_API_KEY", "test-only")
    monkeypatch.setenv("CUSTOM_EMBEDDING_MODEL", "compatible-encoder")
    values = runpy.run_path(str(Path(__file__).resolve().parents[1] / "config.py"))
    assert values["embedding_endpoint"]() == (
        "http://encoder.test/v1", "test-only", "compatible-encoder",
    )
