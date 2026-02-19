export const DOMAIN_HELP_KEYS = {
  e2: 'domain.e2',
  e3: 'domain.e3',
  e5: 'domain.e5',
  d8: 'domain.d8',
  b1: 'domain.b1'
};

export const SIM_HELP_CONTENT = {
  'section.ambiente': {
    title: 'Fatores Ambientais',
    summary: 'São fatores externos ao indivíduo que podem influenciar o desempenho em Atividades e Participação e nas Funções e Estruturas do Corpo.',
    bullets: [
      'Na avaliação, considerar barreiras do ambiente físico, social e de atitudes, além dos fatores pessoais.',
      'Barreira é o qualificador que descreve os obstáculos vivenciados, inclusive frequência e extensão.',
      'Ambiente social e ambiente físico devem ser analisados com foco em acessibilidade, vulnerabilidade e risco.'
    ],
    source: 'Portaria Conjunta MDS/INSS nº 2/2015 — Conceitos e Critérios (linhas 2793-2803) e Anexos I/II (linhas 316-325 e 1524-1533).',
    legalExcerpt: '“Os Fatores ambientais são externos ao indivíduo e podem ter influência sobre seu desempenho na execução de Atividades e Participação Social, assim como nas Funções e Estruturas do Corpo.”'
  },
  'section.atividades': {
    title: 'Atividades e Participação',
    summary: 'Expressa o grau de dificuldade para realização de atividades e participação social.',
    bullets: [
      'No instrumento social, são considerados d6 a d9; no médico-pericial, d1 a d5.',
      'A qualificação considera as dificuldades para o exercício de atividades e participação social em igualdade de condições.',
      'O qualificador final resulta da média dos 9 domínios: [(d1...d9) x 2,777777777777780] - 0,1.',
      'Para criança abaixo do ponto de corte etário do domínio, aplica-se automaticamente qualificador 4.'
    ],
    source: 'Portaria Conjunta MDS/INSS nº 2/2015 — Conceitos e Critérios (linhas 2787-2807, 2831-2837 e 2897-2901).',
    legalExcerpt: '“O qualificador final de Atividades e Participação corresponde à média dos 9 qualificadores, sendo assim calculada: [(d1+d2+d3+d4+d5+d6+d7+d8+d9) x 2,777777777777780] - 0,1.”'
  },
  'section.corpo': {
    title: 'Funções do Corpo',
    summary: 'Reflete as alterações constatadas no componente Funções do Corpo.',
    bullets: [
      'O qualificador final usa o maior valor entre b1 e b8.',
      'Pode haver majoração em um nível, de forma não cumulativa, por prognóstico desfavorável ou por alterações em Estruturas do Corpo mais limitantes.',
      'Os qualificadores seguem os mesmos cortes CIF: N (0-4%), L (5-24%), M (25-49%), G (50-95%), C (96-100%).'
    ],
    source: 'Portaria Conjunta MDS/INSS nº 2/2015 — Conceitos e Critérios (linhas 2838-2853 e 2886-2893).',
    legalExcerpt: '“O qualificador final de Funções do Corpo corresponde ao maior qualificador atribuído aos domínios b1 a b8.”'
  },
  'domain.e2': {
    title: 'E2 - Condições de Habitabilidade',
    summary: 'Refere-se ao ambiente natural/físico e às mudanças ambientais que podem atuar como barreira.',
    bullets: [
      'Ex.: barreiras climáticas e ambientais como tempestades, poluição ou violência (e210/e225/e230/e235).',
      'Ex.: condições de habitabilidade e material da residência (e298/e299).'
    ],
    source: 'Portaria Conjunta MDS/INSS nº 2/2015 — Anexo I (linhas 374-390) e Anexo II (linhas 1584-1600).',
    legalExcerpt: '“II - CONDIÇÕES DE HABITABILIDADE E MUDANÇAS AMBIENTAIS - e2: Referem-se ao ambiente natural ou físico e aos componentes deste ambiente que foram modificados pelas pessoas, bem como às características das populações humanas desse ambiente.”'
  },
  'domain.e3': {
    title: 'E3 - Apoio e Relacionamentos',
    summary: 'Refere-se à disponibilidade de pessoas ou animais domésticos para fornecer apoio e cuidados.',
    bullets: [
      'Ex.: apoio físico, emocional, afetivo, proteção e cuidados de família/comunidade (e310/e315/e320/e325).',
      'Ex.: apoio de profissionais/cuidadores e até animais de assistência, como cão-guia (e340/e350/e355/e360).'
    ],
    source: 'Portaria Conjunta MDS/INSS nº 2/2015 — Anexo I (linhas 396-418) e Anexo II (linhas 1606-1630).',
    legalExcerpt: '“III - APOIO E RELACIONAMENTOS - e3: referem-se à disponibilidade das pessoas ou animais domésticos em fornecer apoio físico, emocional, afetivo, proteção (segurança) e cuidados.”'
  },
  'domain.e5': {
    title: 'E5 - Serviços, Sistemas e Políticas',
    summary: 'Refere-se à rede de serviços, sistemas e políticas garantidoras de proteção social.',
    bullets: [
      'Indicador do domínio: ausência de acesso ou acesso insuficiente, inclusive por distância/inexistência do serviço.',
      'Ex.: serviços e políticas de habitação, serviços públicos, transporte, saúde, educação e assistência social (e525/e530/e540/e580/e585/e598).'
    ],
    source: 'Portaria Conjunta MDS/INSS nº 2/2015 — Anexo I (linhas 440-487) e Anexo II (linhas 1656-1706).',
    legalExcerpt: '“V - SERVIÇOS, SISTEMAS E POLÍTICAS - e5: referem-se à rede de serviços, sistemas e políticas garantidoras de proteção social.”'
  },
  'domain.d8': {
    title: 'D8 - Áreas Principais da Vida',
    summary: 'Refere-se às tarefas e ações necessárias para participar de atividades de educação e transações econômicas.',
    bullets: [
      'Ex.: interação adequada com alunos, professores e funcionários em ambiente educacional (d820/d825/d830).',
      'Ex.: transações econômicas básicas e complexas (d860/d865).',
      'No instrumento de menor de 16 anos, também inclui participação em brincadeiras e jogos (d880).'
    ],
    source: 'Portaria Conjunta MDS/INSS nº 2/2015 — Anexo I (linhas 586-609) e Anexo II (linhas 1820-1851).',
    legalExcerpt: '“VIII - ÁREAS PRINCIPAIS DA VIDA - d8: referem-se à realização das tarefas e ações necessárias para participar das atividades de educação e transações econômicas.”'
  },
  'domain.b1': {
    title: 'B1 - Funções Mentais',
    summary: 'Refere-se às funções do cérebro, incluindo funções mentais globais e funções mentais específicas.',
    bullets: [
      'Ex.: funções globais de consciência, orientação, intelectuais e psicossociais (b110/b114/b117/b122).',
      'Ex.: funções específicas de sono, atenção, memória, emoção e pensamento (b134/b140/b144/b152/b160).'
    ],
    source: 'Portaria Conjunta MDS/INSS nº 2/2015 — Anexo I (linhas 764-804) e Anexo II (linhas 2004-2058).',
    legalExcerpt: '“X - FUNÇÕES MENTAIS - b1: referem-se às funções do cérebro, que incluem funções mentais globais, como consciência, energia e impulso, e funções mentais específicas, como memória, linguagem e cálculo.”'
  }
};
