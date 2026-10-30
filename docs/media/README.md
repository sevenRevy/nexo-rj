# Recortes da demonstração

Clipes extraídos da apresentação individual de João Pedro Félix Reis, com consultas reais gravadas no NEXO RJ. O trabalho tem origem coletiva; veja os [créditos do projeto](../CREDITOS.md).

| Arquivo-base | Trecho na apresentação | Duração | O que mostra |
| --- | --- | --- | --- |
| `consulta-sql` | 00:45–01:00 | 15 s | Pergunta, contagem de contratos, filtros e avisos sobre o acervo. |
| `busca-documental` | 02:40–02:59,5 | 19,5 s | Andamento aproximado da busca, resposta normativa e fontes. |
| `caminho-pergunta` | 03:02–03:19,5 | 17,5 s | Registro de execução, detalhes e rankings da recuperação. |
| `seguranca` | 03:55,5–04:15 | 19,5 s | Recusas a pedidos de dados bancários e credenciais. |

Cada arquivo-base possui duas versões:

- **GIF:** prévia animada de 960 × 540, 8 fps, em repetição, com paleta de até 128 cores. Renderiza diretamente como imagem no README.
- **MP4:** H.264, 1280 × 720, 30 fps, sem áudio e com `faststart`. Permite reprodução com controles em um player compatível; o comportamento do link depende do visualizador do repositório.

Os recortes mantêm a velocidade da apresentação e retiram suas bordas, títulos externos e legendas de narração para destacar a interface. A trilha e a voz não estão incluídas. As pausas de leitura já presentes na montagem foram preservadas; os tempos não representam a latência real do sistema.

A [apresentação completa](../../nexo-rj-apresentacao.mp4) fica na raiz do repositório: cinco minutos, narração em português e logos institucionais. A interface, os rótulos e os resultados refletem o snapshot da gravação; não são dados atualizados em tempo real nem um censo das contratações do Estado.

O vídeo completo foi otimizado de 73,77 para **21,17 MiB**, abaixo do [limite de 25 MiB para upload pelo navegador do GitHub](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github). A codificação usa H.264, `preset=slow`, `crf=26`, 1920 × 1080, 30 fps e `faststart`. Os 300 segundos e os 9.000 quadros foram mantidos; todos os pacotes de áudio AAC e seus tempos são idênticos aos da versão anterior, preservando o tratamento e o volume reduzido. Foram conferidos a decodificação integral, a similaridade de imagem por amostragem e quadros de abertura, interface e encerramento. Os [créditos da música](../CREDITOS.md#trilha-sonora-da-apresentação) devem acompanhar a publicação.

Os arquivos foram gerados com o FFmpeg, sem iniciar os serviços da aplicação. Para todos os MP4s, foram conferidas duração, resolução, taxa de quadros, ausência de áudio e decodificação integral. Todos os quadros dos GIFs também foram decodificados, com duração e repetição verificadas.
