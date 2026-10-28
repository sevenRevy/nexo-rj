import { Icon } from '../../components/ui/Icon';
import { ProjectSummaryPanel } from '../../components/project/ProjectSummaryPanel';
import nexoLogo from '../../assets/nexo.png';

export function SobrePage() {
  return (
    <div className="page-content-wrapper">
      <header className="page-header">
        <span className="page-eyebrow">CONSULTA COM EVIDÊNCIAS</span>
        <h1 className="page-title">Sobre o Projeto NEXO RJ</h1>
        <p className="page-description">
          Uma plataforma inteligente de consulta, auditoria e transparência aplicada ao universo de
          compras e contratações governamentais do Estado do Rio de Janeiro.
        </p>
      </header>

      <div className="about-main-card">
        <div className="about-emblem-row">
          <img
            src={nexoLogo}
            alt="Logo NEXO RJ"
            className="about-nexo-logo"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        <div className="about-text-prose">
          <h2>Objetivo e Proposta de Valor</h2>
          <p>
            O <strong>NEXO RJ</strong> nasceu com o propósito de transformar a forma como servidores
            públicos, auditores de controle externo, pregoeiros, jornalistas de dados e cidadãos
            consultam o acervo de contratações públicas fluminenses. Em vez de navegar por portais
            fragmentados e ler editais extensos manualmente, o usuário pode fazer perguntas em
            linguagem natural e receber respostas fundamentadas, com indicação das fontes usadas.
          </p>

          <h2>Como a consulta funciona</h2>
          <p>
            A pergunta é encaminhada às bases adequadas e combina recuperação semântica,
            busca por palavras-chave e consultas SQL para cálculos verificáveis. A resposta
            apresenta as evidências utilizadas e sinaliza limitações do acervo. Esta edição
            de portfólio reúne a interface e o backend de um projeto de origem colaborativa.
          </p>

          <h2>O acervo consultado</h2>
          <p>
            Os números abaixo vêm do servidor e mostram a versão do acervo que responde às consultas.
            A lista completa de bases está em Fontes oficiais e em Transparência da IA.
          </p>
        </div>

        <ProjectSummaryPanel compact />

        <div className="about-pillars-grid">
          <div className="about-pillar-item">
            <Icon name="shield" size={18} />
            <h3>Evidências Verificáveis</h3>
            <p>Respostas sobre o acervo indicam as fontes utilizadas para permitir conferência.</p>
          </div>
          <div className="about-pillar-item">
            <Icon name="compass" size={18} />
            <h3>Transparência Ativa</h3>
            <p>Facilidade de auditoria e acesso a dados públicos para toda a sociedade civil.</p>
          </div>
          <div className="about-pillar-item">
            <Icon name="cpu" size={18} />
            <h3>Inteligência Segura</h3>
            <p>Mascaramento de dados pessoais e recusa de consultas sobre informações restritas.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
