import { Q_FULL } from './constants.js';

export function buildJudicialControlText({
  adminBase,
  triage,
  med,
  corpoFlow,
  ativMedResolved,
  getItemNumber
}) {
  if (!adminBase) {
    return 'Fixe a base administrativa para habilitar a minuta do Controle Judicial.';
  }
  if (!triage.ready) {
    return 'Complete a etapa da perícia médica judicial para concluir a triagem probatória.';
  }

  const b = adminBase;
  const m = med;
  const testeAItem = m.impedimentoLP ? getItemNumber(b.amb, b.ativ, corpoFlow.q) : null;
  const testeBItem = m.impedimentoLP && m.hasAtivMed && ativMedResolved != null ? getItemNumber(b.amb, ativMedResolved, corpoFlow.q) : null;
  const qAmb = q => Q_FULL.amb[q]?.toLowerCase();
  const qCorpo = q => Q_FULL.corpo[q]?.toLowerCase();
  const qAtiv = q => Q_FULL.ativ[q]?.toLowerCase();

  const baseIntro = `No controle judicial da prova técnica, a base administrativa está fixada com Fatores Ambientais com ${qAmb(b.amb)}, Atividades e Participação com ${qAtiv(b.ativ)} e Funções do Corpo com ${qCorpo(b.corpo)}.`;

  const est = b.corpoReconhecimentoInss.estruturasReconhecidas;
  const prog = b.corpoReconhecimentoInss.prognosticoReconhecido;
  let reconhecimento;
  if (est && prog) {
    reconhecimento = 'Na avaliação administrativa, foram reconhecidas alterações em Estruturas do Corpo que configuram maiores limitações do que as observadas em Funções do Corpo, bem como prognóstico desfavorável.';
  } else if (est && !prog) {
    reconhecimento = 'Na avaliação administrativa, foram reconhecidas alterações em Estruturas do Corpo que configuram maiores limitações do que as observadas em Funções do Corpo, sem registro de prognóstico desfavorável.';
  } else if (!est && prog) {
    reconhecimento = 'Na avaliação administrativa, não foram reconhecidas alterações em Estruturas do Corpo que configurassem maiores limitações do que as observadas em Funções do Corpo, porém houve registro de prognóstico desfavorável.';
  } else {
    reconhecimento = 'Na avaliação administrativa, não foram reconhecidas alterações em Estruturas do Corpo que configurassem maiores limitações do que as observadas em Funções do Corpo, nem prognóstico desfavorável.';
  }

  const corpoPart = corpoFlow.mode === 'mantido'
    ? `manutenção de Funções do Corpo com ${qCorpo(corpoFlow.q)}`
    : `requalificação de Funções do Corpo para ${qCorpo(corpoFlow.q)}`;

  const ativPart = (m.hasAtivMed && ativMedResolved != null)
    ? ` e requalificação médica de Atividades e Participação para ${qAtiv(ativMedResolved)}`
    : ', mantendo-se inalterados os demais componentes';

  let paragrafo2 = '';
  if (triage.status === 'dispensa') {
    if (triage.route === 'sem_impedimento_lp' || m.impedimentoLP === false) {
      paragrafo2 = 'A perícia médica judicial não reconheceu impedimento de longo prazo, o que torna dispensável a renovação da avaliação social em juízo.';
    } else if (triage.route === 'verificacao_administrativa_positiva' || triage.testeA) {
      paragrafo2 = `A perícia médica judicial reconheceu impedimento de longo prazo, com ${corpoPart}${ativPart}. Aplicada essa reclassificação na verificação com manutenção de Fatores Ambientais e Atividades e Participação administrativas, a Tabela Conclusiva (Anexo IV da Portaria Conjunta MDS/INSS nº 2/2015, item ${testeAItem}) passou a resultado positivo, suficiente para o enquadramento sem necessidade de nova avaliação social no caso.`;
    } else if (triage.route === 'corpo_nl_irrelevante') {
      paragrafo2 = `A perícia médica judicial reconheceu impedimento de longo prazo, porém Funções do Corpo permaneceu com ${qCorpo(corpoFlow.q)}. Nessa configuração, a reclassificação de Atividades e Participação não altera o desfecho da Tabela Conclusiva (item ${testeAItem}), tornando dispensável a renovação da avaliação social em juízo.`;
    } else {
      paragrafo2 = `A perícia médica judicial reconheceu impedimento de longo prazo, com ${corpoPart}${ativPart}. Na verificação com manutenção de Fatores Ambientais e Atividades e Participação administrativas (item ${testeAItem}), o resultado permaneceu negativo; contudo, na verificação com reclassificação médica de Atividades e Participação (item ${testeBItem}), houve resultado positivo, suficiente para o enquadramento sem necessidade de nova avaliação social no caso.`;
    }
  } else {
    if (m.hasAtivMed && ativMedResolved != null) {
      paragrafo2 = `A perícia médica judicial reconheceu impedimento de longo prazo, mas a reclassificação de Funções do Corpo, isoladamente, não produziu resultado positivo na verificação com manutenção de Fatores Ambientais e Atividades e Participação administrativas (item ${testeAItem}). Também não houve resultado positivo na verificação com reclassificação médica de Atividades e Participação (item ${testeBItem}), de modo que a prova médica, por si só, não foi suficiente para alterar o desfecho administrativo.`;
    } else {
      paragrafo2 = `A perícia médica judicial reconheceu impedimento de longo prazo, mas a reclassificação de Funções do Corpo, isoladamente, não produziu resultado positivo na verificação com manutenção de Fatores Ambientais e Atividades e Participação administrativas (item ${testeAItem}). Também não houve elementos médicos para reclassificação de Atividades e Participação, de modo que a prova médica, por si só, não foi suficiente para alterar o desfecho administrativo.`;
    }
  }

  const dispensaRef = triage.route === 'sem_impedimento_lp'
    ? 'À luz do motivo-base acima (ausência de impedimento de longo prazo),'
    : 'À luz do motivo-base acima,';

  const paragrafo3 = triage.status === 'dispensa'
    ? `${dispensaRef} a prova médica judicial é suficiente para definição do requisito biopsicossocial, dispensando a renovação da avaliação social em juízo.`
    : 'Nesse contexto, a renovação da avaliação social em juízo é necessária para possibilitar a requalificação de Fatores Ambientais e Atividades e Participação e permitir cognição probatória completa sobre o requisito biopsicossocial.';

  return [baseIntro, reconhecimento, paragrafo2, paragrafo3].filter(Boolean).join('\n\n');
}
