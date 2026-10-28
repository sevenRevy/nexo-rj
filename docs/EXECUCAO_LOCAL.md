# Execução local

Execute os comandos a partir da raiz do monorepositório, salvo indicação contrária. Backend e frontend são dois processos, mas pertencem ao mesmo repositório.

## Ambiente local já preparado

Nesta máquina, `nexo-rj` já tem a cópia completa do snapshot ativo dos originais, `v7-qwen-q8-2026-10-26`, sem mover arquivos nem reconstruir índices. Dados, pesos e credenciais continuam **fora do Git**, mas estão presentes no disco local deste projeto.

Foram preparados:

- 24 artefatos de runtime (5,36 GiB), com hashes conferidos contra `runtime_bundle.json`;
- Qwen3-Embedding-0.6B.Q8_0 em `backend/.models/`;
- os mesmos pesos do reranker `cross-encoder/mmarco-mMiniLMv2-L12-H384-v1`, copiados do cache local;
- llama.cpp Vulkan b10578 em `backend/.tools/llama.cpp/`, com suas DLLs;
- `.env` privado com a seleção original: `xiaomi/mimo-v2.6-flash`, reserva `openrouter/free` e embeddings Q8 locais;
- `.venv` local com acesso aos pacotes Python já instalados nesta máquina (`--system-site-packages`), sem dependência do ambiente virtual dos repositórios originais;
- dependências npm em `frontend/node_modules/`.

Para iniciar após encerrar as instâncias existentes:

```powershell
powershell -ExecutionPolicy Bypass -File .\iniciar.ps1
```

O comando abre três janelas: embeddings, backend e frontend. Acesse `http://localhost:5173`. Feche as três janelas para encerrar. Uma porta ocupada é recusada, para não reutilizar ou interromper silenciosamente uma instância de outro projeto. A primeira carga e a primeira validação de `/ready` podem levar alguns minutos neste corpus, especialmente com pouca RAM disponível.

O caminho privado `RERANK_MODEL` aponta para os pesos copiados dentro deste projeto; ajuste-o no `.env` se mover a pasta. Não é necessário manter as pastas antigas para executar. A geração continua dependendo de internet e do provedor OpenRouter, como no ambiente original.

As seções seguintes explicam a preparação de **uma nova máquina ou clone**, que não recebe os artefatos ignorados pelo Git. Para um ambiente Python totalmente isolado em outra máquina, use um venv normal e instale `requirements-lock.txt`.

## 1. Dependências

- Python **3.14**, versão do CI; a compatibilidade com outras versões deve ser testada antes de adotá-las.
- Node.js **22+** e npm.
- `llama-server` do llama.cpp (a configuração original usa b10578 ou posterior), disponível no PATH.
- Tesseract com idioma `por` somente para reconstruir PDFs escaneados; não é necessário apenas para consultar o snapshot pronto.

Windows / PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python -m pip install -r requirements-lock.txt
Copy-Item .env.example .env
```

Linux/macOS, dentro de `backend/`:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-lock.txt
cp .env.example .env
```

Os scripts `scripts/setup.ps1` e `scripts/setup.sh` também preparam o ambiente. Eles verificam o corpus ao final e retornam erro se o pacote externo ainda não foi instalado.

## 2. Corpus Q8

O Git contém código, testes, configurações e metadados; **não contém** o corpus completo, SQLite de runtime, FAISS nem os pesos.

O [inventário](../backend/CORPUS_INVENTORY.md) preserva a referência do pacote Q8 disponibilizada pelo projeto original. O link externo não foi republicado nem sua disponibilidade é garantida por este repositório.

Extraia o pacote **dentro de `backend/`**, de modo que existam:

```text
backend/runtime_bundle.json
backend/data/normalized/documents.jsonl
backend/data/structured/base_estruturada.sqlite
backend/data/config/orgaos_corpus.json
backend/index/manifest.json
backend/index/<base>/...
```

O snapshot esperado é `v7-qwen-q8-2026-10-26`. Preserve os arquivos e hashes do pacote: não gere outro manifesto apenas para contornar uma falha de validação. `SNAPSHOT_MANIFEST=runtime_bundle.json` já é o padrão.

Para aproveitar dados já existentes nas pastas originais, **copie**, nunca mova ou crie vínculos de escrita para elas. Não copie logs ou `data/app_state/`. A configuração privada foi copiada para esta instalação local por autorização do proprietário; nunca versione o `.env` nem o distribua com o código. Um clone novo não baixa automaticamente os vários GB do corpus.

## 3. Embeddings Q8 locais

Dentro de `backend/`, faça o download explícito dos pesos:

```powershell
.\.venv\Scripts\python scripts/download_models.py --only gguf
```

O script verifica SHA-256 e salva `backend/.models/Qwen3-Embedding-0.6B.Q8_0.gguf`. Ele imprime o comando do servidor. Em outro terminal, ainda dentro de `backend/`:

```bash
llama-server -m .models/Qwen3-Embedding-0.6B.Q8_0.gguf --embedding --pooling last --host 127.0.0.1 --port 18321 -c 4096 -np 1 -b 16 -ub 2048 -t 2
```

A configuração padrão é:

```dotenv
EMBEDDING_PROVIDER=ollama
EMBEDDING_MODEL=Qwen3-Embedding-0.6B.Q8_0
OLLAMA_LOCAL_URL=http://127.0.0.1:18321/v1
OLLAMA_LOCAL_EMBEDDING_MODEL=Qwen3-Embedding-0.6B.Q8_0
```

`ollama` é o nome do preset OpenAI-compatible local e pode apontar para llama.cpp. Não precisa executar o aplicativo Ollama para esse preset funcionar.

Não faça fallback para outro encoder: vetores com dimensão igual não são necessariamente compatíveis. Falha do Q8 pode degradar para busca lexical, mas não autoriza misturar modelos no índice.

## 4. Geração e rerank

Em uma instalação nova, configure sua própria `OPENROUTER_API_KEY` em `backend/.env`. O padrão mantém a seleção do ambiente original: `LLM_PROVIDER_MODE=openrouter`, `OPENROUTER_MODEL=xiaomi/mimo-v2.6-flash` e `OPENROUTER_MODEL_FALLBACK=openrouter/free`. O modelo principal pode consumir créditos do provedor; a reserva gratuita está sujeita a disponibilidade e limites. O modelo opcional de geração no preset legado permanece `qcwind/qwen3-8b-instruct-Q4-K-M`; ele não é o encoder Q8 de consulta.

Alternativamente, `LLM_PROVIDER_MODE=auto` tenta o endpoint definido em `OLLAMA_URL`, com `GENERATION_MODEL`, e usa OpenRouter como reserva. Esses parâmetros de **geração** não trocam os embeddings Q8. O servidor de embeddings da porta 18321 não é um modelo de chat.

O reranker padrão é local e seus pesos podem ser baixados na primeira execução ou antecipadamente:

```powershell
.\.venv\Scripts\python scripts/download_models.py --only reranker
```

`RERANK_ENABLED=false` desliga essa etapa sem alterar o corpus.

## 5. Iniciar e verificar

Dentro de `backend/`:

```powershell
.\.venv\Scripts\python scripts/bootstrap_check.py
.\.venv\Scripts\python -m uvicorn app.api:app --host 127.0.0.1 --port 8080
```

No Linux/macOS, use `.venv/bin/python` no lugar de `.\.venv\Scripts\python`.

- `GET http://localhost:8080/health`: confirma o processo HTTP.
- `GET http://localhost:8080/ready`: verifica integridade do corpus, SQL, índices e catálogo. Pode retornar 503 com artefatos ausentes ou divergentes.
- Nenhuma dessas verificações comprova que a geração e o servidor Q8 estão respondendo.

Em outro terminal, dentro de `frontend/`:

```bash
npm ci
npm run check:backend
npm run dev
```

Abra `http://localhost:5173`. A URL local está em `.env.development`; para outra URL, crie `.env.development.local` com `VITE_API_BASE_URL` e reinicie o Vite. Não coloque chaves em variáveis `VITE_*`.

`check:backend` confere `/health`, o resumo do corpus e um registro do catálogo de contratações; não substitui a verificação de hashes de `/ready`. `check:query` também envia uma pergunta real e exige resposta não recusada com fontes. Para validar ponta a ponta, confira as evidências e o trace na interface. Esse diagnóstico grava uma consulta no histórico.

## 6. Testes e build

```bash
# backend/, ambiente Python ativado
python -m pytest tests/ -m "not llm" -q

# frontend/
npm test
npm run build
```

Os testes offline usam fixtures e não exigem instalar o corpus completo ou baixar modelos. Os relatórios técnicos herdados descrevem execuções anteriores, não resultados automaticamente reproduzidos nesta edição.

## 7. Publicação futura

Não há deploy automático nem remote pré-configurado. Antes de publicar:

1. Esclareça o licenciamento do frontend em [CREDITOS.md](CREDITOS.md).
2. Hospede o backend separadamente e configure HTTPS e a origem exata em `CORS_ALLOW_ORIGINS`.
3. Faça o build do frontend com `VITE_API_BASE_URL` pública; GitHub Pages não executa Python nem modelos.
4. Envie uma branch de revisão, nunca um push direto na `main`.
