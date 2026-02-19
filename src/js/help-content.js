export const DOMAIN_HELP_KEYS = {
  e1: 'domain.e1',
  e2: 'domain.e2',
  e3: 'domain.e3',
  e4: 'domain.e4',
  e5: 'domain.e5',
  b1: 'domain.b1',
  b2: 'domain.b2',
  b3: 'domain.b3',
  b4: 'domain.b4',
  b5: 'domain.b5',
  b6: 'domain.b6',
  b7: 'domain.b7',
  b8: 'domain.b8',
  d1: 'domain.d1',
  d2: 'domain.d2',
  d3: 'domain.d3',
  d4: 'domain.d4',
  d5: 'domain.d5',
  d6: 'domain.d6',
  d7: 'domain.d7',
  d8: 'domain.d8',
  d9: 'domain.d9'
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
  'section.padrao_medio': {
    title: 'Padrão Médio Social',
    summary: 'Aplicação parametrizada do padrão médio à avaliação social, conforme Anexo II da Portaria Conjunta MDS/INSS nº 34/2025.',
    bullets: [
      'Só pode ser aplicado após avaliação médica com constatação de impedimento de longo prazo.',
      'Aplica os qualificadores do Anexo II: e1=2, e2=2, e3=2, e4=1, e5=2, d6=3, d7=2, d8=3 e d9=3.',
      'O resultado do padrão médio só pode ser usado para concessão ou manutenção do BPC; nos demais casos, a avaliação social do INSS é obrigatória.',
      'Na calculadora, o botão preenche automaticamente apenas esses domínios e respeita regras de corte etário.'
    ],
    source: 'Portaria Conjunta MDS/INSS nº 34/2025 — art. 13, § 4º, III; § 6º; § 7º; e Anexo II. Implementação no app: getPadraoApplyContext/applyPadraoEntries/handleApplyPadrao em src/js/main.js.',
    legalExcerpt: '“O resultado do padrão médio somente poderá ser utilizado para a concessão ou manutenção do BPC.”'
  },
  'domain.e1': {
    title: 'E1 - Produtos e Tecnologia',
    summary: 'Refere-se a qualquer produto, instrumento, equipamento ou tecnologia, inclusive os adequados para melhorar a funcionalidade.',
    bullets: [
      'Indicadores do domínio: disponibilidade e condições de acesso (despesa, distância geográfica, qualidade e periodicidade).',
      'Inclui recursos para vida diária, mobilidade, comunicação, educação/trabalho e acessibilidade arquitetônica.'
    ],
    source: 'Portaria Conjunta MDS/INSS nº 2/2015 — Anexo I (linhas 331-371) e Anexo II (linhas 1539-1580).',
    legalExcerpt: '“I - PRODUTOS E TECNOLOGIA - e1: referem-se a qualquer produto, instrumento, equipamento ou tecnologia, inclusive os adequados ou especialmente projetados para melhorar a funcionalidade da pessoa...”'
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
      'Ex.: apoio de profissionais/cuidadores e de animais de assistência, como cão-guia (e340/e350/e355/e360).'
    ],
    source: 'Portaria Conjunta MDS/INSS nº 2/2015 — Anexo I (linhas 396-418) e Anexo II (linhas 1606-1630).',
    legalExcerpt: '“III - APOIO E RELACIONAMENTOS - e3: referem-se à disponibilidade das pessoas ou animais domésticos em fornecer apoio físico, emocional, afetivo, proteção (segurança) e cuidados.”'
  },
  'domain.e4': {
    title: 'E4 - Atitudes',
    summary: 'Refere-se às consequências observáveis de costumes, práticas, ideologias, valores e normas de pessoas externas ao avaliado.',
    bullets: [
      'As atitudes influenciam o comportamento individual e a vida social, dos relacionamentos às estruturas políticas, econômicas e legais.',
      'Indicadores do domínio incluem atitudes estigmatizantes, preconceituosas, discriminatórias, de superproteção e/ou negligentes.'
    ],
    source: 'Portaria Conjunta MDS/INSS nº 2/2015 — Anexo I (linhas 421-437) e Anexo II (linhas 1634-1652).',
    legalExcerpt: '“IV - ATITUDES - e4: referem-se às consequências observáveis dos costumes, práticas, ideologias, valores e normas, oriundas de pessoas externas à pessoa cuja situação está sendo avaliada.”'
  },
  'domain.e5': {
    title: 'E5 - Serviços, Sistemas e Políticas',
    summary: 'Refere-se à rede de serviços, sistemas e políticas garantidoras de proteção social.',
    bullets: [
      'Indicador do domínio: ausência de acesso ou acesso insuficiente, inclusive por distância ou inexistência do serviço.',
      'Ex.: políticas de habitação, serviços públicos, transporte, saúde, educação e assistência social.'
    ],
    source: 'Portaria Conjunta MDS/INSS nº 2/2015 — Anexo I (linhas 440-487) e Anexo II (linhas 1656-1706).',
    legalExcerpt: '“V - SERVIÇOS, SISTEMAS E POLÍTICAS - e5: referem-se à rede de serviços, sistemas e políticas garantidoras de proteção social.”'
  },
  'domain.b1': {
    title: 'B1 - Funções Mentais',
    summary: 'Refere-se às funções do cérebro, incluindo funções mentais globais e funções mentais específicas.',
    bullets: [
      'Ex.: funções globais de consciência, orientação, intelectuais e psicossociais.',
      'Ex.: funções específicas de sono, atenção, memória, emoção e pensamento.'
    ],
    source: 'Portaria Conjunta MDS/INSS nº 2/2015 — Anexo I (linhas 764-804) e Anexo II (linhas 2004-2058).',
    legalExcerpt: '“X - FUNÇÕES MENTAIS - b1: referem-se às funções do cérebro, que incluem funções mentais globais, como consciência, energia e impulso, e funções mentais específicas, como memória, linguagem e cálculo.”'
  },
  'domain.b2': {
    title: 'B2 - Funções Sensoriais',
    summary: 'Refere-se às funções sensoriais da visão, da audição, às funções sensoriais adicionais e à dor.',
    bullets: [
      'Inclui percepção visual (luz, tamanho e cor), percepção auditiva (localização, intensidade e qualidade sonora) e funções vestibulares.',
      'Também abrange gustação, olfação, propriocepção, tato, sensibilidade térmica e sensação de dor.'
    ],
    source: 'Portaria Conjunta MDS/INSS nº 2/2015 — Anexo I (linhas 811-858), Anexo II (linhas 2065-2116) e síntese de Funções do Corpo (linhas 2297-2302).',
    legalExcerpt: '“XI – FUNÇÕES SENSORIAIS DA VISÃO – b2: referem-se à percepção de luz, tamanho e cor de um estímulo visual.”'
  },
  'domain.b3': {
    title: 'B3 - Voz e Fala',
    summary: 'Refere-se às funções da voz e da fala.',
    bullets: [
      'Inclui funções da voz (qualidade, disfonia, afonia e outras alterações).',
      'Inclui funções de articulação e de fluência/ritmo da fala.'
    ],
    source: 'Portaria Conjunta MDS/INSS nº 2/2015 — Anexo I (linhas 865-875), Anexo II (linhas 2123-2133) e síntese de Funções do Corpo (linhas 2297-2302).',
    legalExcerpt: '“XIV - FUNÇÕES DA VOZ E DA FALA - b3: referem-se à produção de sons e da fala.”'
  },
  'domain.b4': {
    title: 'B4 - Cardio/Hemato/Imuno/Respiratório',
    summary: 'Refere-se às funções dos sistemas cardiovascular, hematológico, imunológico e respiratório.',
    bullets: [
      'Abrange funções do coração, dos vasos sanguíneos e da pressão sanguínea.',
      'Abrange produção/transporte sanguíneo, imunidade e funções respiratórias.'
    ],
    source: 'Portaria Conjunta MDS/INSS nº 2/2015 — Anexo I (linhas 882-938), Anexo II (linhas 2140-2196) e síntese de Funções do Corpo (linhas 2297-2302).',
    legalExcerpt: '“XV - FUNÇÕES DO SISTEMA CARDIOVASCULAR – b4: referem-se às funções do coração, vasos sanguíneos e pressão sanguínea.”'
  },
  'domain.b5': {
    title: 'B5 - Digestivo/Metabólico-Endócrino',
    summary: 'Refere-se às funções do sistema digestivo e dos sistemas metabólico e endócrino.',
    bullets: [
      'Inclui ingestão, digestão e eliminação de substâncias líquidas e sólidas.',
      'Inclui funções metabólicas gerais e funções das glândulas endócrinas.'
    ],
    source: 'Portaria Conjunta MDS/INSS nº 2/2015 — Anexo I (linhas 946-972), Anexo II (linhas 2203-2233) e síntese de Funções do Corpo (linhas 2297-2302).',
    legalExcerpt: '“XIX – FUNÇÕES DO SISTEMA DIGESTIVO – b5: referem-se à ingestão, digestão e eliminação de substâncias líquidas e sólidas.”'
  },
  'domain.b6': {
    title: 'B6 - Geniturinário e Reprodutivo',
    summary: 'Refere-se às funções geniturinárias e reprodutivas.',
    bullets: [
      'Inclui funções urinárias e reprodutivas, inclusive funções sexuais e de procriação.',
      'A qualificação deve considerar funcionalidade compatível com a faixa etária.'
    ],
    source: 'Portaria Conjunta MDS/INSS nº 2/2015 — Anexo I (linhas 979-989), Anexo II (linhas 2240-2252) e síntese de Funções do Corpo (linhas 2297-2302).',
    legalExcerpt: '“XXI - FUNÇÕES GENITURINÁRIAS E REPRODUTIVAS – b6: referem-se às funções urinárias e reprodutivas, incluindo funções sexuais e de procriação.”'
  },
  'domain.b7': {
    title: 'B7 - Neuromusculoesquelético e Movimento',
    summary: 'Refere-se às funções neuromusculoesqueléticas e relacionadas ao movimento.',
    bullets: [
      'Inclui mobilidade, funções das articulações/ossos, reflexos e funções musculares.',
      'Inclui funções dos movimentos voluntários/involuntários e padrão da marcha.'
    ],
    source: 'Portaria Conjunta MDS/INSS nº 2/2015 — Anexo I (linhas 996-1006), Anexo II (linhas 2258-2272) e síntese de Funções do Corpo (linhas 2297-2302).',
    legalExcerpt: '“XXII – FUNÇÕES NEUROMUSCULOESQUELÉTICAS E RELACIONADAS AO MOVIMENTO – b7: referem-se à mobilidade, funções das articulações, ossos, reflexos e músculos.”'
  },
  'domain.b8': {
    title: 'B8 - Pele e Estruturas Relacionadas',
    summary: 'Refere-se às funções da pele e de seus anexos (pelos, cabelos e unhas).',
    bullets: [
      'Inclui funções protetoras e reparadoras da pele e dos fâneros.',
      'Considera alterações dermatológicas com impacto funcional.'
    ],
    source: 'Portaria Conjunta MDS/INSS nº 2/2015 — Anexo I (linhas 1015-1024) e Anexo II (linhas 2279-2291).',
    legalExcerpt: '“XXIII – FUNÇÕES DA PELE E ESTRUTURAS RELACIONADAS – b8: referem-se a funções da pele e seus anexos (pelos, cabelos e unhas).”'
  },
  'domain.d1': {
    title: 'D1 - Aprendizagem',
    summary: 'Refere-se ao desempenho em aprender, aplicar conhecimento, pensar, resolver problemas e tomar decisões.',
    bullets: [
      'Indicador: limitação no desempenho para aprender e aplicar conhecimento, com ou sem auxílio, em igualdade de condições.',
      'Abrange percepção intencional, leitura, escrita, cálculo, habilidades e tomada de decisão.'
    ],
    source: 'Portaria Conjunta MDS/INSS nº 2/2015 — Anexo I (linhas 1122-1151) e Anexo II (linhas 2386-2432).',
    legalExcerpt: '“XXVI - APRENDIZAGEM E APLICAÇÃO DE CONHECIMENTO - d1: referem-se ao desempenho em aprender, aplicar o conhecimento aprendido, pensar, resolver problemas e tomar decisões.”'
  },
  'domain.d2': {
    title: 'D2 - Tarefas Gerais',
    summary: 'Refere-se aos aspectos gerais da execução de uma ou várias tarefas, organização de rotinas e superação do estresse.',
    bullets: [
      'Indicador: limitação no desempenho para executar tarefa(s), organizar rotinas e superar estresse, com ou sem auxílio.',
      'Abrange rotinas diárias, comandos/tarefas múltiplas e gerenciamento de demandas psicológicas.'
    ],
    source: 'Portaria Conjunta MDS/INSS nº 2/2015 — Anexo I (linhas 1154-1165) e Anexo II (linhas 2435-2451).',
    legalExcerpt: '“XXVII - TAREFAS E DEMANDAS GERAIS - d2: referem-se aos aspectos gerais da execução de uma única tarefa ou de várias tarefas, organização de rotinas e superação do estresse.”'
  },
  'domain.d3': {
    title: 'D3 - Comunicação',
    summary: 'Refere-se à comunicação por linguagem, sinais e símbolos, incluindo recepção/produção de mensagens e manutenção da conversação.',
    bullets: [
      'Indicador: limitação no desempenho para se comunicar (entender e se fazer entender) em igualdade de condições.',
      'Inclui mensagens orais e não verbais, escrita/Braille, LIBRAS, fala e conversação.'
    ],
    source: 'Portaria Conjunta MDS/INSS nº 2/2015 — Anexo I (linhas 1168-1192) e Anexo II (linhas 2454-2483).',
    legalExcerpt: '“XXVIII - COMUNICAÇÃO - d3: refere-se às características gerais e específicas da comunicação, por meio da linguagem, sinais e símbolos...”'
  },
  'domain.d4': {
    title: 'D4 - Mobilidade',
    summary: 'Refere-se ao movimento de mudar o corpo de posição ou lugar, carregar/mover/manipular objetos, andar e deslocar-se.',
    bullets: [
      'Indicador: limitação no desempenho para se mobilizar ou mobilizar objetos, com ou sem auxílio.',
      'Inclui mudança de posição, movimentação na superfície, manipulação de objetos, marcha e deslocamento com dispositivos.'
    ],
    source: 'Portaria Conjunta MDS/INSS nº 2/2015 — Anexo I (linhas 1208-1225) e Anexo II (linhas 2499-2521).',
    legalExcerpt: '“XXIX - MOBILIDADE - d4: refere-se ao movimento de mudar o corpo de posição ou de lugar, carregar, mover ou manipular objetos, ao andar ou deslocar-se.”'
  },
  'domain.d5': {
    title: 'D5 - Cuidado Pessoal',
    summary: 'Refere-se ao cuidado pessoal: lavar-se e secar-se, cuidar do próprio corpo, vestir-se, comer, beber e cuidar da própria saúde.',
    bullets: [
      'Indicador: limitação no desempenho para cuidar de si próprio, em igualdade de condições com as demais pessoas.',
      'Inclui higiene, vestuário, alimentação/hidratação e cuidados com a própria saúde.'
    ],
    source: 'Portaria Conjunta MDS/INSS nº 2/2015 — Anexo I (linhas 1228-1242) e Anexo II (linhas 2524-2541).',
    legalExcerpt: '“XXX - CUIDADO PESSOAL - d5: refere-se ao cuidado pessoal como lavar-se e secar-se, cuidar do próprio corpo e de parte do corpo, vestir-se, comer, beber e cuidar da própria saúde.”'
  },
  'domain.d6': {
    title: 'D6 - Vida Doméstica',
    summary: 'Refere-se à realização de ações e tarefas domésticas e do dia a dia.',
    bullets: [
      'Abrange obter bens/serviços, preparar refeições, administrar tarefas domésticas e cuidar de objetos/casa.',
      'Indicador: limitação no desempenho para administrar e executar tarefas domésticas, com ou sem auxílio.'
    ],
    source: 'Portaria Conjunta MDS/INSS nº 2/2015 — Anexo I (linhas 522-549) e Anexo II (linhas 1742-1772).',
    legalExcerpt: '“VI - VIDA DOMÉSTICA - d6: refere-se à realização de ações e tarefas domésticas e do dia a dia...”'
  },
  'domain.d7': {
    title: 'D7 - Relações Interpessoais',
    summary: 'Refere-se à realização de ações e condutas necessárias para estabelecer interações pessoais.',
    bullets: [
      'Inclui iniciar, manter e terminar relações interpessoais de forma contextual e socialmente estabelecida.',
      'Indicador: limitação no desempenho relacional, com ou sem auxílio, em igualdade de condições.'
    ],
    source: 'Portaria Conjunta MDS/INSS nº 2/2015 — Anexo I (linhas 553-582) e Anexo II (linhas 1778-1816).',
    legalExcerpt: '“VII - RELAÇÕES E INTERAÇÕES INTERPESSOAIS - d7: referem-se à realização de ações e condutas necessárias para estabelecer interações pessoais...”'
  },
  'domain.d8': {
    title: 'D8 - Áreas Principais da Vida',
    summary: 'Refere-se às tarefas e ações necessárias para participar de atividades de educação e transações econômicas.',
    bullets: [
      'No Anexo I, inclui acesso/participação educacional e transações econômicas (d820/d825/d830/d860/d865).',
      'No Anexo II, inclui também participação em brincadeiras e jogos, conforme faixa etária (d880).'
    ],
    source: 'Portaria Conjunta MDS/INSS nº 2/2015 — Anexo I (linhas 586-609) e Anexo II (linhas 1820-1851).',
    legalExcerpt: '“VIII - ÁREAS PRINCIPAIS DA VIDA - d8: referem-se à realização das tarefas e ações necessárias para participar das atividades de educação e transações econômicas.”'
  },
  'domain.d9': {
    title: 'D9 - Vida Comunitária',
    summary: 'Refere-se às ações e tarefas necessárias para participar da vida social organizada fora do âmbito familiar.',
    bullets: [
      'Abrange participação em reuniões comunitárias, cerimônias sociais, associações e grupos sociais.',
      'Também considera participação em atividades recreativas e de lazer.'
    ],
    source: 'Portaria Conjunta MDS/INSS nº 2/2015 — Anexo I (linhas 613-630) e Anexo II (linhas 1857-1871).',
    legalExcerpt: '“IX - VIDA COMUNITÁRIA, SOCIAL E CÍVICA - d9: referem-se às ações e tarefas necessárias para participar da vida social organizada fora do âmbito familiar...”'
  }
};
