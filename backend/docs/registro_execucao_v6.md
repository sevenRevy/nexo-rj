# Referência histórica — corpus v6 e embeddings Q8

Este resumo preserva decisões técnicas e medições do projeto de origem. Não é um relatório de execução desta edição. As entregas acadêmicas, ZIPs de atas, logs de execuções e snapshots vetoriais antigos não foram importados.

## Recuperação híbrida

A comparação original usou 47 perguntas, incluindo 13 de identificadores. O hit@3 reportado foi 0,64 para RRF e 0,83 para RRF com rerank local. Veja [ABLACAO_RERANK.md](ABLACAO_RERANK.md) para o método e limites. Esses números se referem à v6, não ao snapshot Q8 atual nem a uma nova medição.

## Configuração Q8 local

O checkpoint registrado usa `Qwen3-Embedding-0.6B.Q8_0.gguf`, do repositório oficial `Qwen/Qwen3-Embedding-0.6B-GGUF`, com SHA-256:

```text
e40d4a708d0b324fc133bae547bd64dec79edb885410ef262c1e5c2efb2050b3
```

O script `scripts/download_models.py` verifica esse hash. O servidor local usa pooling `last`, contexto 4.096 e porta 18321. A instrução de consulta e as regras de indexação permanecem no código; dimensão igual sozinha não comprova compatibilidade.

Essa configuração Q8 é o padrão da edição de portfólio. A identificação do snapshot de runtime e o aceite de proveniência histórica permanecem em [runtime_bundle.json](../runtime_bundle.json), sem reescrever hashes antigos.

## Dados e reprodução

A v6 foi uma referência histórica de regressão; os manifests correspondentes foram preservados em `archive/` porque são usados em testes. O corpus completo e os índices não fazem parte desta importação.

Para o runtime atual, siga o [guia de instalação](../../docs/EXECUCAO_LOCAL.md) e o [inventário](../CORPUS_INVENTORY.md). Nenhum resultado histórico substitui `/ready` ou uma nova avaliação com o pacote e os modelos efetivamente configurados.
