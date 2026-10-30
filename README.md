# NEXO RJ

Consulta inteligente sobre contratações públicas do Estado do Rio de Janeiro, com **Adaptive RAG**, recuperação híbrida e respostas acompanhadas de fontes.

Esta edição de portfólio, mantida por João Pedro Félix Reis, reúne backend e frontend em um único repositório. O código tem origem colaborativa: veja [créditos, origem e licenciamento](docs/CREDITOS.md).

## O que o sistema faz

- Encaminha a pergunta para evidências normativas, estruturadas, conversacionais ou agregadas.
- Combina embeddings **Qwen3-Embedding-0.6B.Q8_0**, BM25, fusão RRF e rerank local.
- Usa SQL parametrizado e cálculos determinísticos para contagens, totais e rankings — o LLM não escreve SQL nem recalcula os valores.
- Exibe fontes, limitações do acervo e o caminho de processamento da consulta.
- Mantém histórico e feedback por sessão, mascara dados pessoais e filtra conteúdo restrito.
- Oferece exploração de contratações, documentos, órgãos e fontes oficiais.

Não é uma ferramenta de parecer jurídico nem substitui a conferência dos dados no PNCP. O suplemento de conversas é **sintético** e não comprova fatos reais.

## Arquitetura

```mermaid
flowchart LR
    UI[React + TypeScript] --> API[FastAPI]
    API --> R[Roteamento adaptativo]
    R --> SQL[SQL parametrizado]
    R --> H[Q8 + BM25 + RRF + rerank]
    SQL --> A[Resposta com evidências]
    H --> G[Geração e validação]
    G --> A
```

```text
backend/     Python, FastAPI, pipeline, coleta, avaliações e testes
frontend/    React 19, TypeScript, Vite e testes da interface
docs/        Instalação, créditos e documentação do monorepositório
.github/     CI de testes e build, sem publicação automática
```

Detalhes: [arquitetura](backend/ARQUITETURA.md), [contrato HTTP](backend/docs/FRONTEND_API_CONTRACT.md) e [observabilidade](backend/docs/OBSERVABILIDADE.md).

## Execução local

**Nesta máquina, o ambiente completo já está preparado**, com corpus, modelos e configuração privada copiados dos originais. Para iniciar após encerrar as instâncias existentes:

```powershell
powershell -ExecutionPolicy Bypass -File .\iniciar.ps1
```

Os três serviços iniciam em segundo plano, sem abrir janelas; os logs ficam em `.tmp/runtime/`. Para encerrar, execute `powershell -ExecutionPolicy Bypass -File .\iniciar.ps1 -Parar`.

Abra `http://localhost:5173`. A instalação local foi verificada com consultas reais e navegador: [resultados da validação](docs/VALIDACAO_LOCAL.md). O [guia local](docs/EXECUCAO_LOCAL.md) distingue os arquivos já instalados no disco dos artefatos que não são distribuídos pelo Git.

Para preparar **outra máquina ou um novo clone**:

Pré-requisitos: **Python 3.14** (versão usada no CI), **Node.js 22+**, pacote de dados Q8 e `llama-server` do llama.cpp. Os pesos, índices e banco não estão no Git.

1. Siga o [guia de instalação](docs/EXECUCAO_LOCAL.md) para instalar o corpus em `backend/` e subir os embeddings Q8 em `http://127.0.0.1:18321/v1`.
2. Copie `backend/.env.example` para `backend/.env` e configure sua própria `OPENROUTER_API_KEY` e modelo de geração. Não há dependência obrigatória do endpoint da turma.
3. Inicie o backend:

   ```powershell
   cd backend
   python -m venv .venv
   .\.venv\Scripts\python -m pip install -r requirements-lock.txt
   .\.venv\Scripts\python -m uvicorn app.api:app --host 127.0.0.1 --port 8080
   ```

4. Em outro terminal:

   ```bash
   cd frontend
   npm ci
   npm run dev
   ```

Abra `http://localhost:5173`. O frontend usa o backend real: não há respostas simuladas se ele estiver desligado. `/health` confirma somente a API; `/ready` valida o pacote de dados, não a disponibilidade dos modelos.

**Padrão Q8:** tanto a consulta quanto a geração de embeddings usam o encoder Q8 local por padrão. Não troque por Q4 ou outro modelo sem reindexar ou comprovar compatibilidade de checkpoint, instrução e pooling.

## Verificações

```bash
# Dentro de backend/, com o ambiente Python ativado:
python -m pytest tests/ -m "not llm" -q

# Dentro de frontend/:
npm test
npm run build
npm run check:backend
```

`npm run check:query` executa uma consulta real e grava histórico; exige corpus e modelos configurados. Testes offline não atestam a disponibilidade dos serviços externos.

## Dados, segurança e publicação

- [Inventário do corpus](backend/CORPUS_INVENTORY.md) e `backend/runtime_bundle.json` identificam o snapshot esperado e seus hashes.
- Pacote de runtime, modelos, `.env`, logs e histórico permanecem fora do Git. Há configurações de corpus, inventários históricos e amostras sintéticas para reprodução e testes.
- Chaves pertencem apenas ao backend; variáveis `VITE_*` são públicas no navegador.
- Para outra origem do frontend, configure `CORS_ALLOW_ORIGINS`; nenhuma origem de um projeto anterior é liberada por padrão.
- Não há workflow de deploy. Publicação e criação do remoto exigem configuração explícita.

O aviso MIT do backend foi preservado em [backend/LICENSE](backend/LICENSE). O frontend de origem não apresenta licença própria; esta edição não presume autorização de relicenciamento. Veja [CREDITOS.md](docs/CREDITOS.md) antes de publicar.
