export const Q_LABELS = ['N', 'L', 'M', 'G', 'C'];
export const Q_NAMES = ['Nenhuma', 'Leve', 'Moderada', 'Grave', 'Completa'];

export const Q_FULL = {
  amb: ['Nenhuma Barreira', 'Barreira Leve', 'Barreira Moderada', 'Barreira Grave', 'Barreira Completa'],
  corpo: ['Nenhuma Alteração', 'Alteração Leve', 'Alteração Moderada', 'Alteração Grave', 'Alteração Completa'],
  ativ: ['Nenhuma Dificuldade', 'Dificuldade Leve', 'Dificuldade Moderada', 'Dificuldade Grave', 'Dificuldade Completa']
};

export const DOM_AMB = [
  { id: 'e1', name: 'Produtos e Tecnologia' }, { id: 'e2', name: 'Condições de Habitabilidade' },
  { id: 'e3', name: 'Apoio e Relacionamentos' }, { id: 'e4', name: 'Atitudes' },
  { id: 'e5', name: 'Serviços, Sistemas e Políticas' }
];

export const DOM_CORPO = [
  { id: 'b1', name: 'Funções Mentais' }, { id: 'b2', name: 'Visão' }, { id: 'b3', name: 'Audição' },
  { id: 'b4', name: 'Dor e Sensações' }, { id: 'b5', name: 'Voz e Fala' },
  { id: 'b6', name: 'Cardiovascular / Respiratório' }, { id: 'b7', name: 'Digestivo / Metabólico' },
  { id: 'b8', name: 'Neuromusculoesquelético' }
];

export const DOM_ATIV_M = [
  { id: 'd1', name: 'Aprendizagem', cut: 6 }, { id: 'd2', name: 'Tarefas Gerais', cut: 6 },
  { id: 'd3', name: 'Comunicação', cut: 12 }, { id: 'd4', name: 'Mobilidade', cut: 6 },
  { id: 'd5', name: 'Cuidado Pessoal', cut: 36 }
];

export const DOM_ATIV_S = [
  { id: 'd6', name: 'Vida Doméstica', cut: 84 }, { id: 'd7', name: 'Relações Interpessoais', cut: 12 },
  { id: 'd8', name: 'Áreas Principais da Vida', cut: 6 }, { id: 'd9', name: 'Vida Comunitária', cut: 36 }
];

export const CHILD_AGE_LIMIT_MONTHS = 192;

export const JC_ATIV_RECLASS_DOMAINS = [...DOM_ATIV_M, ...DOM_ATIV_S].map(d => d.id);
export const JC_CORPO_RECLASS_DOMAINS = DOM_CORPO.map(d => d.id);

export const JC_CORPO_REASON_LABELS = {
  estruturas: 'Estruturas do corpo mais graves (não reconhecidas pelo INSS)',
  prognostico: 'Prognóstico desfavorável (não reconhecido pelo INSS)',
  dominio_max: 'Domínio administrativo b1–b8 mais grave',
  rebaixamento: 'Rebaixamento por prova superveniente'
};
