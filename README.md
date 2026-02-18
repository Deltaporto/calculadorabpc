# Calculadora Biopsicossocial BPC/LOAS

Aplicação web para apoiar a análise técnica do requisito de deficiência no BPC/LOAS, com base na Portaria Conjunta MDS/INSS nº 2/2015 (Anexo IV), em fluxo compatível com uso judicial.

## 1) Objetivo

Esta calculadora foi desenhada para:
- Simular a avaliação biopsicossocial (Ambiente, Atividades e Funções do Corpo).
- Exibir o resultado na Tabela Conclusiva do Anexo IV.
- Apoiar o juiz no "Controle Judicial" da prova técnica, indicando quando a avaliação social judicial é dispensável ou necessária.
- Gerar texto padronizado, em parágrafos, para fundamentação da decisão.

## 2) Público-alvo

- Magistrados(as) e assessorias em processos de BPC/LOAS.
- Equipes técnicas que precisam revisar a consistência da avaliação administrativa e da perícia judicial.

## 3) Escopo da ferramenta

A aplicação trata especificamente do requisito biopsicossocial da pessoa com deficiência.

Não substitui análise judicial integral do caso concreto e não cobre, por si só, todos os demais requisitos legais do benefício (ex.: renda, CadÚnico, etc.).

## 4) Modos de uso

## 4.1 Simulador

Permite montar cenários com pontuação por domínio (0 a 4) e visualizar automaticamente:
- qualificadores finais N/L/M/G/C;
- célula correspondente na Tabela Conclusiva;
- resultado (deferido/indeferido) com motivo objetivo.

Funcionalidades principais:
- Régua N, L, M, G, C em cada domínio.
- Regra de criança/adolescente (`Idade inferior a 16 anos`) com entrada em anos ou meses.
- Aplicação de Padrão Médio Social.
- Opção de sobrescrever domínios previamente preenchidos ao aplicar o padrão.
- Botão `Levar cenário para Controle Judicial` para iniciar rapidamente a etapa judicial com os qualificadores atuais como rascunho.

## 4.2 Controle Judicial

Fluxo guiado em 4 etapas:

1. Base administrativa (INSS)
- Informar qualificadores finais de Ambiente, Atividades e Funções do Corpo.
- Informar reconhecimentos administrativos em Funções do Corpo:
  - "estruturas do corpo mais limitantes que Funções";
  - "prognóstico desfavorável".
- Fixar a base administrativa.

2. Informações da perícia médica judicial
- Informar impedimento de longo prazo.
- Definir Funções do Corpo judicial:
  - manter qualificador administrativo; ou
  - alterar com motivo técnico (majoração, domínio mais grave, ou rebaixamento por prova superveniente).
- Informar se a perícia médica trouxe elementos para requalificar Atividades.
- Se sim, escolher modo:
  - Simples: informar qualificador final e justificativa médica;
  - Completa (d1-d9): informar domínios para cálculo automático.

3. Triagem probatória
- Teste A: mantém Ambiente e Atividades administrativas e aplica Funções judiciais.
- Teste B: se houver requalificação médica de Atividades, aplica Atividades médicas + Funções judiciais.
- Resultado:
  - `Avaliação social judicial dispensável`; ou
  - `Avaliação social judicial necessária`.

4. Texto para decisão
- Gera minuta em linguagem técnica, em parágrafos.
- Permite gerar, copiar, ou gerar e copiar diretamente.

## 5) Regras de negócio implementadas

## 5.1 Qualificadores

Escala por letra:
- N = Nenhuma
- L = Leve
- M = Moderada
- G = Grave
- C = Completa

Conversão por percentual:
- 0–4% = N
- 5–24% = L
- 25–49% = M
- 50–95% = G
- 96–100% = C

## 5.2 Fórmulas

- Fatores Ambientais: `pct = (soma_e1_a_e5 * 5) - 0.1`
- Atividades e Participação: `pct = (soma_d1_a_d9 * 2.77777777777778) - 0.1`
- Funções do Corpo: qualificador final é o maior valor entre `b1` e `b8` (com regras de majoração quando cabíveis).

## 5.3 Tabela Conclusiva (Anexo IV)

Regras sintéticas aplicadas:
- Se Funções <= L: indeferido.
- Se Atividades <= L: indeferido.
- Se Funções >= G: deferido.
- Se Atividades >= G: deferido.
- Se Funções = M e Atividades = M: depende de Ambiente (exige G ou C).

## 5.4 Regra etária (< 16 anos)

Quando marcada a opção de idade inferior a 16 anos, os domínios de Atividades sujeitos a ponto de corte etário podem ser travados automaticamente em 4 (completa), conforme idade informada em meses/anos.

## 5.5 Padrão Médio Social

Aplicação do padrão em domínios previstos, com as seguintes salvaguardas de UX:
- por padrão, só preenche domínios não preenchidos manualmente;
- há opção explícita para sobrescrever preenchimentos prévios;
- quando houver domínios manuais relevantes, o sistema explica claramente o impacto antes de aplicar.

## 6) Estrutura relevante do projeto

- `apresentacao_BPC/index.html`: aplicação principal (HTML, CSS e JS no mesmo arquivo).
- `apresentacao_BPC/modelos_textos_decisao_bpc.md`: referência dos textos decisórios incorporados no app.
- `apresentacao_BPC/LOGICA_AVALIACAO_BPC.md`: detalhamento técnico das fórmulas e regras.
- `apresentacao_BPC/GUIA_RECLASSIFICACAO_JUDICIAL_BPC.md`: racional de reclassificação judicial.
- `docs/normas/BPC_Portaria_Conjunta_2_2015.txt`: base normativa principal utilizada para o Anexo IV.

## 7) Como executar localmente

Opção recomendada (servidor local via Node):

```bash
npm install
npm run start
```

Acesse:

```text
http://127.0.0.1:8000/index.html
```

Alternativa (Python):

```bash
python3 -m http.server 8000
```

Observação importante: não abra `index.html` diretamente via `file://`, pois os módulos ES do navegador são bloqueados por CORS nesse modo.

## 8) Fluxo recomendado de uso (magistrado)

1. Se quiser explorar hipóteses, use o modo Simulador.
2. Ao chegar em cenário relevante, clique em `Levar cenário para Controle Judicial`.
3. No Controle Judicial, finalize a Etapa 1 e clique em `Fixar base administrativa`.
4. Preencha a Etapa 2 (perícia médica judicial).
5. Leia a triagem automática da Etapa 3.
6. Gere e copie o texto da Etapa 4, revisando antes de inserir na decisão.

## 9) Aviso importante

Esta ferramenta é de apoio técnico e organizacional.

A decisão judicial deve sempre observar:
- o conjunto probatório completo do processo;
- a legislação e a jurisprudência aplicáveis;
- o convencimento motivado do(a) magistrado(a).
