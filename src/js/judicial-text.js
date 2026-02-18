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
  const qWord = q => ['nenhum', 'leve', 'moderado', 'grave', 'completo'][q];

  const baseIntro = `No controle judicial da prova técnica, parte-se da base administrativa já fixada (Fatores Ambientais em grau ${qWord(b.amb)}, Atividades e Participação em grau ${qWord(b.ativ)} e Funções do Corpo em grau ${qWord(b.corpo)}).`;
  const reconhecimento = `Na fase administrativa, registrou-se: estruturas do corpo mais graves = ${b.corpoReconhecimentoInss.estruturasReconhecidas ? 'sim' : 'não'}; prognóstico desfavorável = ${b.corpoReconhecimentoInss.prognosticoReconhecido ? 'sim' : 'não'}.`;

  const corpoPart = corpoFlow.mode === 'mantido'
    ? `manutenção de Funções do Corpo em grau ${qWord(corpoFlow.q)}`
    : `requalificação de Funções do Corpo para grau ${qWord(corpoFlow.q)}`;

  const ativPart = (m.hasAtivMed && ativMedResolved != null)
    ? ` e requalificação médica de Atividades e Participação para grau ${qWord(ativMedResolved)}`
    : ', mantendo-se inalterados os demais componentes';

  let paragrafo2 = '';
  if (triage.status === 'dispensa') {
    if (triage.route === 'sem_impedimento_lp' || m.impedimentoLP === false) {
      paragrafo2 = 'Em perícia médica judicial, não se reconheceu impedimento de longo prazo, circunstância que, por si, afasta a utilidade de nova avaliação social judicial para reversão do resultado nesta triagem.';
    } else if (triage.route === 'verificacao_administrativa_positiva' || triage.testeA) {
      paragrafo2 = `Em perícia médica judicial, reconheceu-se impedimento de longo prazo e ${corpoPart}${ativPart}. Aplicada essa reclassificação na verificação com manutenção de Fatores Ambientais e Atividades e Participação administrativas, a Tabela Conclusiva (Anexo IV da Portaria Conjunta MDS/INSS nº 2/2015, item ${testeAItem}) passou a resultado positivo, suficiente para o enquadramento sem necessidade de nova intervenção social no caso concreto.`;
    } else if (triage.route === 'corpo_nl_irrelevante') {
      paragrafo2 = `Em perícia médica judicial, reconheceu-se impedimento de longo prazo, porém o resultado judicial de Funções do Corpo permaneceu em grau ${qWord(corpoFlow.q)}. Nessa configuração, a reclassificação de Atividades e Participação não altera o desfecho da Tabela Conclusiva (item ${testeAItem}), razão pela qual a avaliação social judicial é dispensável para esta triagem.`;
    } else {
      paragrafo2 = `Em perícia médica judicial, reconheceu-se impedimento de longo prazo e ${corpoPart}${ativPart}. Na verificação com manutenção de Fatores Ambientais e Atividades e Participação administrativas (item ${testeAItem}), o resultado permaneceu negativo; contudo, na verificação com reclassificação médica de Atividades e Participação (item ${testeBItem}), houve resultado positivo, suficiente para o enquadramento sem necessidade de nova intervenção social no caso concreto.`;
    }
  } else {
    if (m.hasAtivMed && ativMedResolved != null) {
      paragrafo2 = `A perícia médica judicial reconheceu impedimento de longo prazo, mas a reclassificação médica de Funções do Corpo, isoladamente, não produziu resultado positivo na verificação com manutenção de Fatores Ambientais e Atividades e Participação administrativas (item ${testeAItem}). Também não houve resultado positivo na verificação com reclassificação médica de Atividades e Participação (item ${testeBItem}), de modo que a prova médica, por si só, não foi suficiente para alterar o desfecho administrativo.`;
    } else {
      paragrafo2 = `A perícia médica judicial reconheceu impedimento de longo prazo, mas a reclassificação médica de Funções do Corpo, isoladamente, não produziu resultado positivo na verificação com manutenção de Fatores Ambientais e Atividades e Participação administrativas (item ${testeAItem}). Também não houve elementos médicos para reclassificação de Atividades e Participação, de modo que a prova médica, por si só, não foi suficiente para alterar o desfecho administrativo.`;
    }
  }

  const paragrafo3 = triage.status === 'dispensa'
    ? 'Nessas condições, a prova médica judicial mostrou-se bastante para definição do requisito biopsicossocial, de modo que a avaliação social judicial se revela dispensável nesta fase processual.'
    : 'Nesse contexto, permanece necessária a avaliação social judicial, com potencial de requalificação dos componentes de Fatores Ambientais e Atividades e Participação, a fim de permitir cognição probatória completa sobre o requisito biopsicossocial.';

  return [baseIntro, reconhecimento, paragrafo2, paragrafo3].filter(Boolean).join('\n\n');
}
