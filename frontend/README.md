# NEXO RJ — Frontend

React 19 · TypeScript · Vite · CSS próprio.

Parte do [monorepositório NEXO RJ](../README.md). Consome exclusivamente a API FastAPI de `../backend/`; com o backend desligado, a interface mostra erro de conexão, sem respostas simuladas.

## Desenvolvimento

Node.js 22+. Dentro deste diretório:

```bash
npm ci
npm run dev
```

Abra `http://localhost:5173`. `.env.development` aponta para `http://localhost:8080`. Para substituir a URL, crie `.env.development.local` e reinicie o Vite. Variáveis `VITE_*` são públicas: nunca inclua tokens ou senhas.

A instalação do backend, dos modelos Q8 e do corpus está no [guia de execução](../docs/EXECUCAO_LOCAL.md).

## Comandos

| Comando | Função |
| --- | --- |
| `npm test` | Testes da interface e dos scripts de diagnóstico |
| `npm run build` | TypeScript e build de produção em `dist/` |
| `npm run preview` | Servir o build localmente |
| `npm run check:backend` | Verificar API, resumo do corpus e catálogo de contratações |
| `npm run check:query` | Enviar uma consulta real, com gravação de histórico |
| `npm run check:pages` | Validar a URL HTTPS para uma eventual publicação |
| `npm run check:pages-build` | Conferir a URL incorporada ao build público |

O diagnóstico de consulta exige resposta não recusada com fontes, mas não prova sozinho a correção das evidências. Confira as fontes e o trace na interface.

## Estrutura

```text
src/app/          Composição e navegação
src/pages/        Páginas
src/components/   Componentes visuais
src/hooks/        Estado e integração
src/services/     Cliente HTTP e serviços por recurso
src/types/        Contratos TypeScript
src/styles/       Estilos compartilhados
scripts/          Diagnóstico e validação de configuração
```

Fluxo: `página → hook → service → API`. O [contrato oficial](../backend/docs/FRONTEND_API_CONTRACT.md) permanece junto do backend.

Não são versionados bundles de produção nem há deploy automático. Para hospedagem estática futura, configure uma URL HTTPS do backend no build e libere a origem no CORS. Veja as [condições de licenciamento](../docs/CREDITOS.md) antes de publicar.
