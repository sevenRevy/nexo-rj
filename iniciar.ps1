# Inicia os mesmos tres servicos do ambiente validado, sem instalar ou alterar dados.
# Uso: powershell -ExecutionPolicy Bypass -File .\iniciar.ps1
[CmdletBinding()]
param(
    [ValidateSet("todos", "embeddings", "backend", "frontend")]
    [string]$Servico = "todos"
)

$ErrorActionPreference = "Stop"
$backend = Join-Path $PSScriptRoot "backend"
$frontend = Join-Path $PSScriptRoot "frontend"
$python = Join-Path $backend ".venv\Scripts\python.exe"
$llama = Join-Path $backend ".tools\llama.cpp\llama-server.exe"
$modelo = Join-Path $backend ".models\Qwen3-Embedding-0.6B.Q8_0.gguf"
$portas = @{ embeddings = 18321; backend = 8080; frontend = 5173 }
$servicos = if ($Servico -eq "todos") { @("embeddings", "backend", "frontend") } else { @($Servico) }

foreach ($nome in $servicos) {
    $porta = $portas[$nome]
    if (Get-NetTCPConnection -LocalPort $porta -State Listen -ErrorAction SilentlyContinue) {
        throw "Porta $porta ocupada. Confira o servico existente antes de iniciar outra instancia."
    }
}
$necessarios = switch ($Servico) {
    "todos" { $python; $llama; $modelo; (Join-Path $backend ".env"); (Join-Path $backend "data\normalized\documents.jsonl"); (Join-Path $frontend "node_modules") }
    "embeddings" { $llama; $modelo }
    "backend" { $python; (Join-Path $backend ".env"); (Join-Path $backend "data\normalized\documents.jsonl") }
    "frontend" { Join-Path $frontend "node_modules" }
}
foreach ($caminho in $necessarios) {
    if (-not (Test-Path -LiteralPath $caminho)) {
        throw "Arquivo ou pasta ausente: $caminho. Consulte docs\EXECUCAO_LOCAL.md."
    }
}

if ($Servico -eq "todos") {
    foreach ($nome in $servicos) {
        Start-Process powershell.exe -WorkingDirectory $PSScriptRoot -ArgumentList @(
            "-NoProfile", "-ExecutionPolicy", "Bypass", "-NoExit", "-File", "`"$PSCommandPath`"", "-Servico", $nome
        )
    }
    Write-Host "Frontend: http://localhost:5173"
    Write-Host "Backend:  http://localhost:8080"
    Write-Host "A primeira carga pode levar alguns minutos. Feche as tres janelas para encerrar."
    return
}

$env:PYTHONUTF8 = "1"
switch ($Servico) {
    "embeddings" {
        Set-Location $backend
        & $llama -m $modelo --alias Qwen3-Embedding-0.6B.Q8_0 --embedding --pooling last --host 127.0.0.1 --port 18321 -c 4096 -np 1 -b 16 -ub 2048 -t 2
    }
    "backend" {
        Set-Location $backend
        & $python -m uvicorn app.api:app --host 127.0.0.1 --port 8080
    }
    "frontend" {
        Set-Location $frontend
        & npm.cmd run dev -- --host 127.0.0.1
    }
}
exit $LASTEXITCODE
