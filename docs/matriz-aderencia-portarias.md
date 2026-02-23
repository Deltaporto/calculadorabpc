# Matriz de Aderência Normativa
Data de referência: 23/02/2026

## Escopo
Este documento mapeia regras normativas da Portaria Conjunta MDS/INSS nº 2/2015 e da Portaria Conjunta MDS/INSS nº 34/2025 para a implementação atual da calculadora.

## Legenda de status
- `aderente`: regra implementada e coberta por teste automatizado.
- `parcial`: regra parcialmente implementada, ou sem cobertura específica do fluxo normativo completo.
- `divergente`: implementação em desacordo com a norma.
- `não testado`: implementação existente sem evidência automatizada.

## Matriz norma → código
| Referência normativa | Regra textual (resumo) | Implementação atual | Evidência automatizada | Status | Observações |
| --- | --- | --- | --- | --- | --- |
| Portaria 2/2015, Anexo III (`docs/normas/portaria-conjunta-2-2015.txt:2797`, `docs/normas/portaria-conjunta-2-2015.txt:2803`, `docs/normas/portaria-conjunta-2-2015.txt:2842`, `docs/normas/portaria-conjunta-2-2015.txt:2847`) | Faixas N-L-M-G-C: 0-4%, 5-24%, 25-49%, 50-95%, 96-100% | `src/js/calculations.js:3` | `tests/formulas.portaria.test.js:90` | aderente | A mesma função é usada para Ambiente e Atividades. |
| Portaria 2/2015, Anexo III (`docs/normas/portaria-conjunta-2-2015.txt:2880`, `docs/normas/portaria-conjunta-2-2015.txt:2882`) | Fórmula Fatores Ambientais: `[(e1+e2+e3+e4+e5) x 5] - 0,1` | `src/js/calculations.js:19`, `src/js/calculations.js:20` | `tests/formulas.portaria.test.js:113` | aderente | Implementação usa função comum `calculateScore`. |
| Portaria 2/2015, Anexo III (`docs/normas/portaria-conjunta-2-2015.txt:2897`, `docs/normas/portaria-conjunta-2-2015.txt:2899`) | Fórmula Atividades e Participação: `[(d1+...+d9) x 2,777...] - 0,1` | `src/js/calculations.js:23`, `src/js/calculations.js:24`, `src/js/calculations.js:63`, `src/js/constants.js:36` | `tests/formulas.portaria.test.js:126`, `tests/formulas.portaria.test.js:144` | aderente | Cobertura inclui somas de borda críticas. |
| Portaria 2/2015, Anexo III (`docs/normas/portaria-conjunta-2-2015.txt:2886`, `docs/normas/portaria-conjunta-2-2015.txt:2888`) | Qualificador final de Funções do Corpo é o maior entre `b1..b8` | `src/js/calculations.js:27`, `src/js/calculations.js:29` | `tests/formulas.portaria.test.js:161` | aderente | Regra do máximo aplicada antes da majoração. |
| Portaria 2/2015, Art. 7º I/II e Anexo III (`docs/normas/portaria-conjunta-2-2015.txt:116`, `docs/normas/portaria-conjunta-2-2015.txt:121`, `docs/normas/portaria-conjunta-2-2015.txt:1056`, `docs/normas/portaria-conjunta-2-2015.txt:1074`, `docs/normas/portaria-conjunta-2-2015.txt:2890`, `docs/normas/portaria-conjunta-2-2015.txt:2893`) | Majoração de Funções do Corpo em +1, não cumulativa, com teto em C | `src/js/calculations.js:31`, `src/js/calculations.js:34` | `tests/formulas.portaria.test.js:161` | aderente | Coberto cenário com dupla condição (`estruturas` + `prognóstico`). |
| Portaria 2/2015, Art. 8º I/II (`docs/normas/portaria-conjunta-2-2015.txt:134`, `docs/normas/portaria-conjunta-2-2015.txt:138`) | Indeferir quando Funções do Corpo for N/L ou Atividades e Participação for N/L | `src/js/calculations.js:38`, `src/js/calculations.js:39` | `tests/tabelaConclusiva.portaria.test.js:109` | aderente | Validado contra a verdade normativa do Anexo IV. |
| Portaria 2/2015, Art. 8º caput e Anexo IV (`docs/normas/portaria-conjunta-2-2015.txt:129`, `docs/normas/portaria-conjunta-2-2015.txt:131`, `docs/normas/portaria-conjunta-2-2015.txt:2961`, `docs/normas/portaria-conjunta-2-2015.txt:3107`, `docs/normas/portaria-conjunta-2-2015.txt:2909`) | Combinação final é confrontada com Tabela Conclusiva (125 linhas) para deferir/indeferir | `src/js/calculations.js:37`, `src/js/main.js:144`, `src/js/ui-render.js:93` | `tests/tabelaConclusiva.portaria.test.js:95`, `tests/tabelaConclusiva.portaria.test.js:109`, `tests/tabelaConclusiva.portaria.test.js:120` | aderente | Inclui validação dos 125 resultados e da numeração de itens. |
| Portaria 2/2015, Art. 7º III e Art. 8º III (`docs/normas/portaria-conjunta-2-2015.txt:123`, `docs/normas/portaria-conjunta-2-2015.txt:127`, `docs/normas/portaria-conjunta-2-2015.txt:140`, `docs/normas/portaria-conjunta-2-2015.txt:141`, `docs/normas/portaria-conjunta-2-2015.txt:1088`, `docs/normas/portaria-conjunta-2-2015.txt:1098`) | Se houver resolução em menos de 2 anos, indeferir | `src/js/main.js:306`, `src/js/ui-render.js:86`, `src/js/ui-render.js:90` | `tests/impedimento_help.spec.js:53` | parcial | Regra está implementada no simulador, mas sem teste unitário dedicado de decisão para esse gate específico. |
| Portaria 2/2015, Anexo III (`docs/normas/portaria-conjunta-2-2015.txt:2788`, `docs/normas/portaria-conjunta-2-2015.txt:2791`, `docs/normas/portaria-conjunta-2-2015.txt:2832`, `docs/normas/portaria-conjunta-2-2015.txt:2836`) | Pontos de corte etários para d1..d9 (6,6,12,6,36,84,12,6,36 meses) | `src/js/constants.js:23`, `src/js/constants.js:31` | `tests/child-rules.portaria.test.js:144` | aderente | Mapeamento completo dos 9 domínios de Atividades e Participação. |
| Portaria 2/2015, Anexo III (`docs/normas/portaria-conjunta-2-2015.txt:2805`, `docs/normas/portaria-conjunta-2-2015.txt:2807`, `docs/normas/portaria-conjunta-2-2015.txt:2863`, `docs/normas/portaria-conjunta-2-2015.txt:2865`) | Criança abaixo do ponto de corte: qualificador automático 4 (Completa) no domínio | `src/js/main.js:370`, `src/js/main.js:375`, `src/js/main.js:1559` | `tests/child-rules.portaria.test.js:161`, `tests/child-rules.portaria.test.js:177` | aderente | Coberto lock/unlock, backup e restauração de estado. |
| Portaria 2/2015, Art. 4º I/II (`docs/normas/portaria-conjunta-2-2015.txt:61`, `docs/normas/portaria-conjunta-2-2015.txt:65`) | Separação de fluxos 16+ e menor de 16 anos | `src/js/main.js:316`, `src/js/main.js:317`, `src/js/constants.js:34` | `tests/child-rules.portaria.test.js:152` | aderente | Controle etário expresso em meses para aplicar regras infantis. |
| Portaria 34/2025, Art. 13 §6º e Anexo II (`docs/normas/portaria-mds-inss-34-2025.txt:365`, `docs/normas/portaria-mds-inss-34-2025.txt:366`, `docs/normas/portaria-mds-inss-34-2025.txt:749`, `docs/normas/portaria-mds-inss-34-2025.txt:763`) | Padrão médio da avaliação social: `e1=2,e2=2,e3=2,e4=1,e5=2,d6=3,d7=2,d8=3,d9=3` | `src/js/main.js:517`, `src/js/main.js:518` | `tests/padrao-medio.portaria.test.js:176` | aderente | Teste extrai os valores direto do texto normativo local. |
| Portaria 34/2025, Art. 13 §4º III e §7º (`docs/normas/portaria-mds-inss-34-2025.txt:354`, `docs/normas/portaria-mds-inss-34-2025.txt:356`, `docs/normas/portaria-mds-inss-34-2025.txt:369`, `docs/normas/portaria-mds-inss-34-2025.txt:371`) | Uso do padrão médio condicionado à avaliação médica com impedimento de longo prazo, e com limitação de uso processual | `src/js/main.js:600`, `src/js/main.js:614` | `tests/padrao-medio.portaria.test.js:181` | parcial | O app aplica o padrão médio como ferramenta de simulação e não impõe integralmente os pré-requisitos processuais da Portaria 34/2025. |

## Ambiguidades e validação jurídica necessária
- O texto convertido em `docs/normas/portaria-mds-inss-34-2025.txt` contém artefato de OCR em `Atitudes (e4` (`docs/normas/portaria-mds-inss-34-2025.txt:758`). Os testes já tratam esse artefato.
- Há aderência matemática das regras, mas a aderência processual integral da Portaria 34/2025 (pré-condições de quando o padrão médio pode ser usado) depende de decisão de produto/jurídico sobre escopo da calculadora.

## Checklist de ações corretivas
- [x] Validar faixas N-L-M-G-C, fórmulas e Tabela Conclusiva (125 combinações) contra a Portaria 2/2015.
- [x] Validar cortes etários e autoqualificação infantil d1..d9.
- [x] Validar valores do padrão médio social (Portaria 34/2025, Anexo II).
- [ ] Definir (jurídico + produto) se o simulador deve bloquear o padrão médio quando ausentes os pré-requisitos processuais do art. 13, §4º, III e §7º da Portaria 34/2025.
- [ ] Realizar segunda revisão formal (jurídico/negócio) para encerramento definitivo da matriz.

## Comandos de validação executados
- `npm test --silent` (103/103 passando em 23/02/2026).
