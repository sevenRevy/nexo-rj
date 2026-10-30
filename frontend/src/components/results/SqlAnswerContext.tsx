const FIELD_LABELS: Record<string, string> = {
  ano: 'Ano', valor: 'Valor', esfera: 'Esfera', mês: 'Mês',
  referência: 'Referência', campo_valor: 'Valor considerado', tipo_registro: 'Tipo de registro',
  municipio: 'Município', uf: 'UF', modalidade: 'Modalidade', fornecedor: 'Fornecedor',
  orgao_nome: 'Órgão', unidade_nome: 'Unidade responsável', categoria: 'Categoria',
  classe: 'Classe', mes_assinatura: 'Mês de assinatura', mes_publicacao: 'Mês de publicação',
  cnpj: 'CNPJ',
};
const VALUE_LABELS: Record<string, string> = {
  assinatura: 'Assinatura', publicacao: 'Publicação', resultado: 'Resultado',
  pca: 'PCA', vigencia: 'Vigência', propostas: 'Propostas',
  valor_contratado: 'Valor contratado', valor_estimado: 'Valor estimado',
  valor_homologado: 'Valor homologado', contrato_assinado: 'Contrato assinado',
};
const CALCULATION_LABELS: Record<string, string> = {
  estatistica: 'Estatística', agrupamento: 'Agrupamento', evolucao: 'Evolução',
  ranking: 'Ranking', comparacao: 'Comparação', contagem: 'Contagem', soma: 'Soma',
};
const OPERATORS: Record<string, string> = { '>=': '≥', '<=': '≤', '>': '>', '<': '<' };

// Split only at filter boundaries, not decimal commas or lists of organization/modalidade names.
const FILTER_BOUNDARY = /, (?=[\p{L}_][\p{L}\p{N}_]*\s*(?:>=|<=|=|>|<)|ano de |modalidade |órgão |unidade responsável |só |objeto contém |somente contratos assinados(?:,|$)|valor (?:contratado|estimado|homologado)(?:,|$))/u;

function FilterTag({ filter }: { filter: string }) {
  const condition = /^([\p{L}_][\p{L}\p{N}_]*)\s*(>=|<=|=|>|<)\s*(.+)$/u.exec(filter);
  if (condition) {
    const [, field, operator, value] = condition;
    const label = FIELD_LABELS[field] ?? field.replaceAll('_', ' ');
    // Translate only enum fields; names and free-text values must remain verbatim.
    const displayValue = ['referência', 'campo_valor', 'tipo_registro'].includes(field)
      ? VALUE_LABELS[value] ?? value : value;
    return <><span className="sql-filter-label">{label}:</span>{' '}<span>{operator === '=' ? '' : `${OPERATORS[operator]} `}{displayValue}</span></>;
  }
  const named = /^(ano de|modalidade em|órgão em|unidade responsável em|objeto contém) (.+)$/u.exec(filter);
  if (named) {
    const labels: Record<string, string> = {
      'ano de': 'Período', 'modalidade em': 'Modalidade', 'órgão em': 'Órgão',
      'unidade responsável em': 'Unidade responsável', 'objeto contém': 'Objeto contém',
    };
    return <><span className="sql-filter-label">{labels[named[1]]}:</span>{' '}<span>{named[2]}</span></>;
  }
  return <span>{filter}</span>;
}

/** Presentation-only support for the deterministic SQL header, including saved answers. */
export function SqlAnswerContext({ text }: { text: string }) {
  const header = /^(Acervo consultado:[\s\S]+) Filtros: ([\s\S]+)\. Cálculo: (\w+)\.$/u.exec(text);
  if (!header) return <p>{text}</p>;
  const [, provenance, filters, calculation] = header;
  return (
    <div className="sql-answer-context">
      <p className="sql-answer-provenance">{provenance}</p>
      <div className="sql-answer-filters" role="group" aria-label="Filtros e cálculo da consulta">
        <span className="sql-answer-filters-title">Filtros aplicados</span>
        <ul className="sql-filter-tags" aria-label="Filtros aplicados">
          {filters.split(FILTER_BOUNDARY).map((filter, index) => (
            <li key={index}><FilterTag filter={filter} /></li>
          ))}
        </ul>
        <p className="sql-answer-calculation"><span>Cálculo:</span>{' '}{CALCULATION_LABELS[calculation] ?? calculation.replaceAll('_', ' ')}</p>
      </div>
    </div>
  );
}
