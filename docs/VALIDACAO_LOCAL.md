# Validação da instalação local

Esta validação usou os dados e serviços reais da cópia em `nexo-rj`, sem mock de API, corpus ou modelo. Não é uma reexecução de todo o golden set nem uma auditoria de todos os fatos do corpus.

## Pacote instalado

- Snapshot ativo dos originais: `v7-qwen-q8-2026-10-26`, corpus `v7-reparo`, schema SQL 7.
- 144.112 chunks, 144.112 vetores e 106.667 registros em `contratacoes`.
- Os 24 artefatos de runtime foram copiados, não movidos, e tiveram os SHA-256 conferidos contra `backend/runtime_bundle.json`.
- `/ready` retornou HTTP 200 com `ready=true` e o snapshot esperado.

## Mesmos modelos

| Etapa | Modelo verificado |
| --- | --- |
| Embeddings de consulta | `Qwen3-Embedding-0.6B.Q8_0`, 1.024 dimensões |
| Rerank | Mesmos pesos de `cross-encoder/mmarco-mMiniLMv2-L12-H384-v1`, revisão `1427fd652930e4ba29e8149678df786c240d8825` |
| Geração | `xiaomi/mimo-v2.6-flash` via OpenRouter |
| Reserva configurada | `openrouter/free`; não foi necessário acioná-la no caso RAG testado |

O GGUF Q8 mantém o SHA-256 `e40d4a708d0b324fc133bae547bd64dec79edb885410ef262c1e5c2efb2050b3`. O servidor usa a cópia local do llama.cpp Vulkan b10578, pooling `last` e porta 18321. O reranker carregou e executou inferência com acesso ao Hub desabilitado, usando apenas os pesos copiados neste projeto.

## Consultas reais

1. **“Quantos contratos foram assinados em 2025?”**
   - Resposta não recusada, com fonte SQL: **15.644 registros**.
   - Conferência independente com SQLite em modo somente leitura: 15.644 linhas de `tipo_registro='contrato_assinado'` e `ano_assinatura=2025`.
   - Trace completo, SQL determinístico, sem chamada ao LLM; recuperação e rerank corretamente pulados.
   - Aproximadamente 0,70 s na execução da API observada, após aquecimento. Não é benchmark geral.
2. **“O que estabelece a Lei 14.133/2021?”**
   - Resposta não recusada, com **4 fontes**.
   - Busca densa Q8, BM25, RRF, rerank, geração e validação com status `ok`.
   - Trace confirmou geração por `xiaomi/mimo-v2.6-flash`, sem substituição do modelo principal.
   - Aproximadamente 18,55 s nessa execução, após aquecimento.
3. **Histórico e feedback:** consultas recuperadas pela própria sessão e avaliação positiva registrada na cópia local.

## Navegador real

Microsoft Edge headless, sem interceptar ou simular respostas:

- Envio de pergunta pela interface, resposta real, tabela SQL e fonte renderizadas.
- Consulta visível no histórico da própria sessão.
- Catálogo de contratações carregado da API.
- Tela de transparência exibindo 144.112 chunks/vetores ativos.
- Zero exceções JavaScript e zero respostas HTTP de erro nas chamadas da API durante o cenário aprovado.
- Capturas desktop e mobile salvas em `.tmp/runtime/`, fora do Git.

Evidências locais, todas dentro de `.tmp/runtime/`: `api-test-results.json`, `sql-response.json`, `rag-response.json`, `sql-trace.json`, `rag-trace.json`, `browser-test-results.json`, `browser-query.png`, `browser-corpus.png` e `browser-mobile.png`. Esses arquivos foram gerados nesta instalação, não são distribuídos pelo Git.

## Inicialização e encerramento

Os três modos de `iniciar.ps1` (`embeddings`, `backend` e `frontend`) foram executados e seus serviços retornaram HTTP 200. Também foram conferidos a sintaxe PowerShell e o bloqueio de porta ocupada, sem interromper serviços existentes. Os 29 testes direcionados de configuração e seleção de modelos passaram.

As instâncias temporárias dos testes foram encerradas para não deixar processos em segundo plano. Para usar a aplicação, execute `powershell -ExecutionPolicy Bypass -File .\iniciar.ps1` na raiz do projeto. Atualmente, o modo padrão inicia os três serviços em segundo plano, sem abrir janelas; use `iniciar.ps1 -Parar` para encerrá-los. O resultado dos testes de inicialização está em `.tmp/runtime/launcher-test-results.json`.

## Independência e limites

Os processos foram iniciados com diretórios de trabalho em `nexo-rj/backend` e `nexo-rj/frontend`, usando corpus, modelos e configuração privados desta cópia. Os diretórios originais não são necessários para executar. A instalação ainda depende do Python/Node desta máquina e da internet/conta OpenRouter para geração, como o ambiente de origem.

O venv local reutiliza os pacotes Python já instalados no sistema, sem instalar ou atualizar o ambiente dos originais. Um clone em outra máquina precisa instalar suas dependências e receber o pacote de runtime separadamente.

A primeira validação de `/ready` concorrendo com a pré-carga excedeu o prazo HTTP de 180 s. Após o aquecimento, `/ready` retornou 200 e as consultas acima passaram. O corpus é volumoso e a máquina tinha pouca RAM livre; não foi ocultada a demora nem desativado o reranker para obter o resultado.

Os avisos históricos de proveniência do índice continuam visíveis; esta instalação não reescreve metadados nem transforma o aceite operacional em prova de homogeneidade histórica dos vetores.
