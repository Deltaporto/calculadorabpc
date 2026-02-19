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

  const baseIntro = `No controle judicial da prova técnica, nos termos da Portaria Conjunta MDS/INSS nº 2/2015, a avaliação administrativa registra Fatores Ambientais com ${qAmb(b.amb)}, Atividades e Participação com ${qAtiv(b.ativ)} e Funções do Corpo com ${qCorpo(b.corpo)}.`;

  const est = b.corpoReconhecimentoInss.estruturasReconhecidas;
  const prog = b.corpoReconhecimentoInss.prognosticoReconhecido;
  let reconhecimentoPhrase = '';
  if (est && prog) {
    reconhecimentoPhrase = 'O INSS havia reconhecido tanto as alterações em Estruturas do Corpo quanto o prognóstico desfavorável. ';
  } else if (est && !prog) {
    reconhecimentoPhrase = 'O INSS havia reconhecido alterações em Estruturas do Corpo, mas não prognóstico desfavorável. ';
  } else if (!est && prog) {
    reconhecimentoPhrase = 'O INSS havia reconhecido prognóstico desfavorável, mas não alterações em Estruturas do Corpo. ';
  }

  const corpoPart = corpoFlow.mode === 'mantido'
    ? `manteve Funções do Corpo com ${qCorpo(corpoFlow.q)}`
    : `requalificou Funções do Corpo para ${qCorpo(corpoFlow.q)}`;

  const ativPart = (m.hasAtivMed && ativMedResolved != null)
    ? ` e requalificou Atividades e Participação para ${qAtiv(ativMedResolved)}`
    : '';

  const paragraphs = [baseIntro];

  if (triage.status === 'dispensa') {
    if (triage.route === 'sem_impedimento_lp' || m.impedimentoLP === false) {
      paragraphs.push(
        'A perícia médica judicial não reconheceu o impedimento de longo prazo. ' +
        'Ausente esse pressuposto, a avaliação social não precisa ser renovada em juízo — ' +
        'a prova técnica é suficiente para a definição do requisito biopsicossocial.'
      );
    } else if (triage.route === 'verificacao_administrativa_positiva' || triage.testeA) {
      paragraphs.push(
        (`A perícia médica judicial reconheceu o impedimento de longo prazo e ${corpoPart}${ativPart}. ${reconhecimentoPhrase}`).trimEnd()
      );
      paragraphs.push(
        `Verificada a Tabela Conclusiva (item ${testeAItem} do Anexo IV da referida Portaria) ` +
        `com os dados da perícia médica e os demais qualificadores administrativos preservados, ` +
        `o resultado foi positivo. A prova técnica é, portanto, suficiente para o enquadramento ` +
        `no requisito biopsicossocial, dispensando a renovação da avaliação social em juízo.`
      );
    } else if (triage.route === 'corpo_nl_irrelevante') {
      paragraphs.push(
        (`A perícia médica judicial reconheceu o impedimento de longo prazo; Funções do Corpo, contudo, permaneceram com ${qCorpo(corpoFlow.q)}. ${reconhecimentoPhrase}`).trimEnd()
      );
      paragraphs.push(
        `Com esse nível funcional, incide a hipótese de indeferimento do art. 8º, I, ` +
        `da referida Portaria, independentemente do qualificador de Atividades e Participação, ` +
        `tornando dispensável a renovação da avaliação social em juízo.`
      );
    } else {
      // default dispensa: Teste B positivo
      paragraphs.push(
        (`A perícia médica judicial reconheceu o impedimento de longo prazo, ${corpoPart} e requalificou Atividades e Participação para ${qAtiv(ativMedResolved)}. ${reconhecimentoPhrase}`).trimEnd()
      );
      paragraphs.push(
        `Na Tabela Conclusiva, a verificação com os qualificadores administrativos de ` +
        `Atividades e Participação (item ${testeAItem}) apresentou resultado negativo; ` +
        `a verificação que incorpora a reclassificação médica de Atividades (item ${testeBItem}), ` +
        `porém, obteve resultado positivo. A prova técnica é, portanto, suficiente ` +
        `para o enquadramento no requisito biopsicossocial, dispensando a renovação da ` +
        `avaliação social em juízo.`
      );
    }
  } else {
    // necessaria
    if (m.hasAtivMed && ativMedResolved != null) {
      paragraphs.push(
        `A perícia médica judicial reconheceu o impedimento de longo prazo, ` +
        `${corpoPart} e requalificou Atividades e Participação para ${qAtiv(ativMedResolved)}. ` +
        `${reconhecimentoPhrase}` +
        `Verificada a Tabela Conclusiva, o resultado permaneceu negativo tanto com os ` +
        `qualificadores administrativos (item ${testeAItem}) quanto com a reclassificação ` +
        `médica de Atividades e Participação (item ${testeBItem}). A prova técnica, por si só, ` +
        `não foi suficiente para o enquadramento no requisito biopsicossocial; a renovação ` +
        `da avaliação social em juízo é necessária para completar a instrução probatória.`
      );
    } else {
      paragraphs.push(
        `A perícia médica judicial reconheceu o impedimento de longo prazo e ` +
        `${corpoPart}, sem trazer elementos para reclassificação de Atividades e Participação. ` +
        `${reconhecimentoPhrase}` +
        `Verificada a Tabela Conclusiva (item ${testeAItem}), o resultado permaneceu negativo, ` +
        `e a prova técnica, por si só, não foi suficiente para o enquadramento no requisito ` +
        `biopsicossocial; a renovação da avaliação social em juízo é necessária para completar ` +
        `a instrução probatória.`
      );
    }
  }

  return paragraphs.join('\n\n');
}
