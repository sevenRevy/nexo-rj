import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { AnswerMarkdown } from './AnswerMarkdown';
import { ConversationTurnView } from './ConversationTurnView';
import type { ConversationTurn } from '../../types/app';

const markdown = 'Confira o resultado:\n\n'
  + '| Órgão | Valor registrado |\n| --- | ---: |\n'
  + '| BANCO CENTRAL | R$ 672.969.074,40 |\n| OUTRO ÓRGÃO | R$ 0,00 |\n\nFonte: [1]';

describe('Resposta em Markdown', () => {
  it('renderiza tabela GFM sem mostrar os delimitadores como texto', () => {
    render(<AnswerMarkdown answer={markdown} />);
    const table = screen.getByRole('table', { name: 'Resultados calculados' });
    expect(within(table).getAllByRole('row')).toHaveLength(3);
    expect(within(table).getByRole('columnheader', { name: 'Órgão' })).toHaveAttribute('scope', 'col');
    expect(within(table).getByRole('cell', { name: 'R$ 672.969.074,40' })).toHaveClass('is-numeric');
    expect(screen.queryByText('| --- | ---: |')).not.toBeInTheDocument();
    expect(screen.getByText('Fonte: [1]')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Tabela de resultados' })).toHaveAttribute('tabindex', '0');
  });

  it('preserva barras, nomes e HTML escapados como texto de célula', () => {
    render(<AnswerMarkdown answer={'| Objeto |\n| --- |\n| A \\| B &lt;img src=x&gt; \\*literal\\* |'} />);
    expect(screen.getByRole('cell')).toHaveTextContent('A | B <img src=x> *literal*');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('não executa HTML nem carrega imagens e remove protocolos perigosos', () => {
    const { container } = render(<AnswerMarkdown answer={'Texto seguro\n\n<script>alert(1)</script>\n\n<img src="https://evil.test/pixel">\n\n![pixel](https://evil.test/pixel)\n\n[link](javascript:alert%281%29)'} />);
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByText('link')).toHaveAttribute('href', '');
    expect(screen.getByText('Texto seguro')).toBeInTheDocument();
  });

  it('mantém respostas antigas e ausência de dados legíveis, sem inventar tabela', () => {
    render(<AnswerMarkdown answer={'Não foram encontrados registros.\n\nAusência na amostra não comprova inexistência.'} />);
    expect(screen.getByText('Não foram encontrados registros.')).toBeInTheDocument();
    expect(screen.getByText('Ausência na amostra não comprova inexistência.')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('separa o contexto SQL em filtros visíveis sem alterar a tabela ou as ressalvas', () => {
    const header = 'Acervo consultado: 106667 registros. Valores informados, não pagamentos. '
      + 'Filtros: ano=2025, referência=assinatura, somente contratos assinados. Cálculo: estatistica.';
    render(<AnswerMarkdown answer={`${header}\n\n${markdown}`} />);
    const filters = screen.getByRole('list', { name: 'Filtros aplicados' });
    const tags = within(filters).getAllByRole('listitem');
    expect(tags).toHaveLength(3);
    expect(tags[0]).toHaveTextContent('Ano: 2025');
    expect(tags[1]).toHaveTextContent('Referência: Assinatura');
    expect(tags[2]).toHaveTextContent('somente contratos assinados');
    expect(screen.getByText('Acervo consultado: 106667 registros. Valores informados, não pagamentos.')).toBeVisible();
    expect(screen.getByText('Cálculo:').parentElement).toHaveTextContent('Cálculo: Estatística');
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.queryByText(/ano=2025/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /detalhes/i })).not.toBeInTheDocument();
  });

  it('preserva limites, centavos, listas de nomes e filtros desconhecidos', () => {
    render(<AnswerMarkdown answer={'Acervo consultado: amostra. Filtros: ano de 2024 a 2025, valor>=R$ 1.234,56, valor<R$ 9.876,54, órgão em ÓRGÃO A, ÓRGÃO B, modalidade em Pregão, Dispensa, novo_campo=texto, objeto contém papel e caneta. Cálculo: agrupamento.'} />);
    const tags = within(screen.getByRole('list', { name: 'Filtros aplicados' })).getAllByRole('listitem');
    expect(tags).toHaveLength(7);
    expect(tags[0]).toHaveTextContent('Período: 2024 a 2025');
    expect(tags[1]).toHaveTextContent('Valor: ≥ R$ 1.234,56');
    expect(tags[2]).toHaveTextContent('Valor: < R$ 9.876,54');
    expect(tags[3]).toHaveTextContent('Órgão: ÓRGÃO A, ÓRGÃO B');
    expect(tags[4]).toHaveTextContent('Modalidade: Pregão, Dispensa');
    expect(tags[5]).toHaveTextContent('novo campo: texto');
    expect(tags[6]).toHaveTextContent('Objeto contém: papel e caneta');
  });

  it('mantém cabeçalhos incompletos e texto comum intactos', () => {
    const incomplete = 'Acervo consultado: amostra. Filtros: ano=2025.';
    render(<AnswerMarkdown answer={`${incomplete}\n\nFiltros: ano=2024. Cálculo: contagem.\n\nTexto com **ênfase**.`} />);
    expect(screen.getByText(incomplete)).toBeInTheDocument();
    expect(screen.getByText('Filtros: ano=2024. Cálculo: contagem.')).toBeInTheDocument();
    expect(screen.getByText('ênfase').tagName).toBe('STRONG');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('mantém explícitos os casos sem filtros e com cálculo desconhecido', () => {
    render(<AnswerMarkdown answer={'Acervo consultado: amostra. Filtros: nenhum. Cálculo: novo_calculo.'} />);
    expect(screen.getByRole('listitem')).toHaveTextContent('nenhum');
    expect(screen.getByText('Cálculo:').parentElement).toHaveTextContent('Cálculo: novo calculo');
  });

  it('usa a mesma renderização para uma resposta reaberta do histórico', () => {
    const turn: ConversationTurn = {
      response: { query_id: 'q_saved', session_id: 's_saved', query: 'Quais contratos?', answer: `Acervo consultado: amostra. Filtros: ano=2025. Cálculo: ranking.\n\n${markdown}`,
        bases_consultadas: ['estruturada'], confidence_level: 'alta', is_refusal: false, refusal_reason: null,
        sources_used: [{ chunk_id: 'sql:contratacoes:1', base_id: 'contratos_estruturado', source_file: 'base.sqlite' }] },
    };
    render(<ConversationTurnView turn={turn} onRated={() => undefined} onViewTrace={() => undefined} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Fontes utilizadas (1)')).toBeInTheDocument();
    expect(screen.getByText('base.sqlite')).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Filtros aplicados' })).toHaveTextContent('Ano: 2025');
  });
});
