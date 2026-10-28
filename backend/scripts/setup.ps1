# Bootstrap do backend RAG em uma máquina nova (Windows).
# Cria o .venv, instala o lock de dependências, copia .env.example -> .env
# quando faltar, e confere os artefatos externos do snapshot Q8.
# Uso: powershell -ExecutionPolicy Bypass -File scripts\setup.ps1
$ErrorActionPreference = "Stop"
Set-Location (Split-Path -Parent $PSScriptRoot)

if (-not (Test-Path .venv)) {
    Write-Host "== Criando .venv =="
    py -3.14 -m venv .venv 2>$null
    if ($LASTEXITCODE -ne 0) { python -m venv .venv }
}
& .\.venv\Scripts\python -m pip install --upgrade pip | Out-Null
& .\.venv\Scripts\pip install -r requirements-lock.txt

if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "== .env criado: embeddings Q8 locais; configure sua chave OpenRouter =="
}

& .\.venv\Scripts\python scripts\bootstrap_check.py
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "`nPronto. Suba o backend com:"
Write-Host "  .\.venv\Scripts\python -m uvicorn app.api:app --host 127.0.0.1 --port 8080"
