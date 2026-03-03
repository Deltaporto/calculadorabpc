# Calculadora Biopsicossocial — BPC/LOAS

## Manual de Uso

---

## 1. Objetivo da ferramenta

A Calculadora Biopsicossocial é uma aplicação web de apoio técnico destinada a magistrados(as), assessorias e servidores(as) que atuam em processos de concessão do Benefício de Prestação Continuada (BPC/LOAS) envolvendo o requisito de deficiência.

A ferramenta implementa integralmente as regras da **Portaria Conjunta MDS/INSS nº 2/2015** (Anexo IV — Tabela Conclusiva) e incorpora o **Padrão Médio Social** introduzido pela **Portaria Conjunta MDS/INSS nº 34/2025** (Anexo II). Seu propósito é:

- **Calcular automaticamente** os qualificadores finais de Fatores Ambientais, Atividades e Participação e Funções do Corpo a partir dos domínios individuais, aplicando as fórmulas normativas da CIF (Classificação Internacional de Funcionalidade).
- **Exibir visualmente** o cruzamento na Tabela Conclusiva do Anexo IV, indicando de forma objetiva se a combinação de qualificadores resulta em deferimento ou indeferimento do requisito biopsicossocial.
- **Conduzir o controle judicial** da prova técnica num fluxo guiado de 4 etapas, determinando se a avaliação social judicial é dispensável ou necessária com base exclusivamente na perícia médica e nos dados administrativos.
- **Gerar texto padronizado** para fundamentação da decisão, em linguagem técnica e com referência normativa, pronto para colar na minuta.

**O que a ferramenta não faz:** não substitui a análise judicial integral do caso concreto. Não cobre, por si só, todos os requisitos legais do BPC (renda, inscrição no CadÚnico, etc.). A decisão judicial deve sempre considerar o conjunto probatório completo, a legislação e a jurisprudência aplicáveis, e o convencimento motivado do(a) magistrado(a).

---

## 2. Acesso à base normativa (Portarias em PDF)

A aplicação disponibiliza acesso direto aos textos normativos que fundamentam os cálculos.

### Link no cabeçalho

No topo da página, logo abaixo do título "Calculadora Biopsicossocial", há um link clicável com o texto **"Portaria Conjunta MDS/INSS nº 2/2015"**. Ao clicar nele, o PDF oficial da Portaria 2/2015 é aberto em uma nova aba do navegador. Esse link está sempre visível, independentemente do modo de uso selecionado.

### Link no rodapé

No rodapé da página, na seção "Base normativa", há um segundo link com ícone de documento: **"Portaria Conjunta MDS/INSS nº 2/2015 (PDF)"**. Este link também abre o PDF em nova aba. Ao lado, há uma referência à Portaria MDS/INSS nº 34/2025 e um botão **"Ler versão texto na aplicação"**, que abre uma janela modal com o texto integral da Portaria para consulta rápida sem sair da ferramenta.

### Botões de ajuda contextual (ícone "i")

Ao longo de toda a interface — tanto no Simulador quanto no Controle Judicial — há pequenos botões circulares com a letra **"i"** ao lado de cada componente, domínio ou conceito. Ao clicar em qualquer um deles, abre-se um painel de ajuda contextual contendo:

- Definição do conceito ou domínio.
- Indicadores práticos para qualificação.
- Referência à Portaria (com número de linha e artigo).
- Trecho literal da base legal.
- Botões para ver a base legal completa ou abrir a Portaria dentro da aplicação.

Esses botões de ajuda estão disponíveis para todos os domínios (e1–e5, b1–b8, d1–d9), para os conceitos de Fatores Ambientais, Atividades e Participação, Funções do Corpo, Impedimento de Longo Prazo e Padrão Médio Social.

---

## 3. Estrutura da interface

A aplicação possui três modos de visualização, acessíveis por meio dos botões no cabeçalho da página:

| Modo | Finalidade |
|------|-----------|
| **Controle Judicial** | Fluxo guiado de 4 etapas para controle probatório da prova técnica |
| **Simulador** | Calculadora interativa para montar cenários e visualizar a Tabela Conclusiva |
| **Fluxograma** | Diagrama decisório visual do raciocínio de avaliação biopsicossocial |

Além dos modos, o cabeçalho oferece:

- **Modo escuro:** alternância de tema visual para leitura confortável em ambientes com pouca luz.
- **Idade inferior a 16 anos:** ativação do regime etário especial para crianças e adolescentes, com campo para informar a idade em anos ou meses.

---

## 4. Modo Simulador

O Simulador é a calculadora propriamente dita. Permite atribuir qualificadores individuais a cada domínio da CIF e visualizar instantaneamente o resultado na Tabela Conclusiva. É especialmente útil para explorar hipóteses, verificar cenários alternativos ou conferir os dados de uma avaliação administrativa já realizada.

### 4.1. Visão geral da tela

A calculadora é organizada em três painéis, cada um correspondendo a um componente da avaliação biopsicossocial:

**Painel Fatores Ambientais (azul)** — Avaliação Social — 5 domínios:
- e1 — Produtos e Tecnologia
- e2 — Condições de Habitabilidade
- e3 — Apoio e Relacionamentos
- e4 — Atitudes
- e5 — Serviços, Sistemas e Políticas

**Painel Atividades e Participação (roxo)** — Avaliação Mista — 9 domínios:
- d1 — Aprendizagem *(Perito Médico)*
- d2 — Tarefas Gerais *(Perito Médico)*
- d3 — Comunicação *(Perito Médico)*
- d4 — Mobilidade *(Perito Médico)*
- d5 — Cuidado Pessoal *(Perito Médico)*
- d6 — Vida Doméstica *(Assistente Social)*
- d7 — Relações Interpessoais *(Assistente Social)*
- d8 — Áreas Principais da Vida *(Assistente Social)*
- d9 — Vida Comunitária *(Assistente Social)*

**Painel Funções do Corpo (vermelho)** — Avaliação Médica — 8 domínios:
- b1 — Funções Mentais
- b2 — Funções Sensoriais
- b3 — Voz e Fala
- b4 — Cardiovascular / Hematológico / Imunológico / Respiratório
- b5 — Digestivo / Metabólico-Endócrino
- b6 — Geniturinário e Reprodutivo
- b7 — Neuromusculoesquelético e Movimento
- b8 — Pele e Estruturas Relacionadas

### 4.2. Como preencher os domínios

Cada domínio apresenta uma fileira de 5 botões numerados de **0** a **4**, correspondendo à escala de qualificadores da CIF:

| Valor | Letra | Qualificador | Faixa percentual |
|-------|-------|-------------|-------------------|
| 0 | N | Nenhuma | 0–4% |
| 1 | L | Leve | 5–24% |
| 2 | M | Moderada | 25–49% |
| 3 | G | Grave | 50–95% |
| 4 | C | Completa | 96–100% |

Clique no botão correspondente ao valor atribuído pela avaliação. O botão selecionado ficará destacado. Para cada painel, o sistema calcula automaticamente:

- **Fatores Ambientais:** fórmula `pct = (soma_e1_a_e5 × 5) − 0,1` → qualificador N/L/M/G/C, exibido com barra de progresso e rótulo descritivo (ex.: "Barreira Moderada").
- **Atividades e Participação:** fórmula `pct = (soma_d1_a_d9 × 2,778) − 0,1` → qualificador N/L/M/G/C, com barra de progresso.
- **Funções do Corpo:** o qualificador final é o **maior valor** entre b1 e b8. Se ativadas as opções de majoração (descritas abaixo), o sistema pode elevar o qualificador em um nível.

### 4.3. Opções de majoração (Funções do Corpo)

Abaixo dos domínios b1–b8, há dois interruptores:

- **Prognóstico desfavorável:** quando ativado, aplica majoração de +1 ao qualificador final de Funções do Corpo.
- **Estrutura do Corpo > Função:** quando ativado, aplica majoração de +1, caso as alterações em Estruturas do Corpo configurem maiores limitações do que as observadas em Funções do Corpo.

A majoração não é cumulativa: se ambas estiverem ativadas, o qualificador ainda sobe apenas um nível.

### 4.4. Barra de ferramentas

A barra de ferramentas acima dos painéis oferece:

- **Aplicar padrão médio:** preenche automaticamente os domínios previstos pelo padrão médio social da Portaria 34/2025 (Anexo II): e1=2, e2=2, e3=2, e4=1, e5=2, d6=3, d7=2, d8=3 e d9=3. Se já houver domínios preenchidos manualmente, o sistema exibe uma janela de confirmação com duas opções: *Preservar preenchidos* (preenche apenas os domínios ainda vazios) ou *Sobrescrever preenchidos* (substitui todos pelos valores do padrão).
- **Limpar tudo:** redefine todos os domínios para 0 e desativa as opções auxiliares, retornando a calculadora ao estado inicial.
- **Impedimento < 2 anos:** interruptor que sinaliza que o impedimento tem duração inferior a 2 anos. Quando ativado, o resultado final automaticamente indica indeferimento, independentemente dos qualificadores, conforme art. 20, §§ 2º e 10, da Lei 8.742/93.

### 4.5. Resultado da Avaliação

Abaixo dos painéis, a seção "Resultado da Avaliação" exibe:

1. **Qualificadores finais consolidados:** três cartões lado a lado mostrando o qualificador final (letra e nome) de Fatores Ambientais, Atividades e Participação e Funções do Corpo.

2. **Tabela Conclusiva (Anexo IV):** uma matriz 5×5 com os qualificadores de Atividades e Participação no eixo horizontal e Funções do Corpo no eixo vertical. Cada célula indica "Sim" (deferido, em verde) ou "Não" (indeferido, em vermelho). A célula correspondente à combinação atual fica destacada. Acima da matriz, há abas (N, L, M, G, C) que permitem visualizar a Tabela para diferentes níveis de Fatores Ambientais — o sistema seleciona automaticamente a aba correspondente ao qualificador atual, mas o usuário pode clicar em outra aba para explorar cenários hipotéticos.

   Uma nota prática sob a tabela explica: *"Fatores Ambientais costuma ser decisivo sobretudo no cenário M×M (Funções do Corpo e Atividades em Moderada). Fora desse ponto, moradia modesta porém funcional não implica, por si só, indeferimento."* Um realce discreto marca o ponto M×M quando a variação de Fatores Ambientais pode alterar o resultado.

3. **Card de decisão:** exibe o resultado final (DEFERIDO ou INDEFERIDO), com ícone visual, o motivo objetivo da decisão e a referência ao item correspondente na Tabela Conclusiva.

### 4.6. Regime etário (crianças menores de 16 anos)

Quando a opção "Idade inferior a 16 anos" é ativada no cabeçalho, surge um campo para informar a idade (em anos ou meses). O sistema aplica automaticamente os pontos de corte etários definidos na Portaria para os domínios de Atividades e Participação. Se a criança estiver abaixo do ponto de corte de um domínio específico, esse domínio é automaticamente fixado no qualificador 4 (Completa), indicando que a atividade ainda não é esperada para aquela faixa etária.

Os pontos de corte são:
- d1 (Aprendizagem): 6 meses
- d2 (Tarefas Gerais): 6 meses
- d3 (Comunicação): 12 meses
- d4 (Mobilidade): 6 meses
- d5 (Cuidado Pessoal): 36 meses
- d6 (Vida Doméstica): 84 meses (7 anos)
- d7 (Relações Interpessoais): 12 meses
- d8 (Áreas Principais da Vida): 6 meses
- d9 (Vida Comunitária): 36 meses

### 4.7. Transição para o Controle Judicial

Abaixo da seção de resultado, o botão **"Levar cenário para Controle Judicial"** transfere os qualificadores finais calculados pelo Simulador como rascunho para a Etapa 1 do Controle Judicial, permitindo iniciar rapidamente o fluxo probatório com os dados da simulação em curso.

---

## 5. Modo Controle Judicial

O Controle Judicial é o núcleo da ferramenta para uso em gabinete. Trata-se de um fluxo guiado em **4 etapas sequenciais** que organiza o raciocínio probatório para decidir se a perícia médica judicial, por si só, é suficiente para definir o requisito biopsicossocial ou se é necessário determinar avaliação social judicial.

Cada etapa possui:
- Um **número de passo** e título descritivo.
- Um **indicador de estado** (Pendente, Bloqueada, Concluída).
- Um **painel de orientação** que informa a pendência atual ou confirma a conclusão, atualizado em tempo real conforme os campos são preenchidos.
- Uma **nota "O que fazer"** explicando de forma direta o que se espera do operador naquela etapa.

Uma **barra de progresso** no topo da seção mostra visualmente o avanço pelas 4 etapas (ex.: "Etapa 2 de 4 · Perícia médica — 50%").

### 5.1. Etapa 1 — Fixar avaliação administrativa (INSS)

**Objetivo:** registrar os qualificadores finais da avaliação biopsicossocial realizada na esfera administrativa (INSS), bem como os reconhecimentos prévios relativos a Funções do Corpo.

**Campos a preencher:**

1. **Fatores Ambientais (final):** selecione o qualificador final atribuído pelo INSS (N, L, M, G ou C).
2. **Atividades e Participação (final):** selecione o qualificador final atribuído pelo INSS.
3. **Funções do Corpo (final):** selecione o qualificador final atribuído pelo INSS.
4. **Reconhecimentos administrativos do INSS (Funções do Corpo):**
   - *"INSS reconheceu alterações em Estruturas do Corpo que configurem maiores limitações ou restrições ao avaliado do que as alterações observadas em Funções do Corpo?"* — Responda Sim ou Não.
   - *"INSS reconheceu prognóstico desfavorável?"* — Responda Sim ou Não.

   Essas respostas controlam quais motivos de requalificação estarão disponíveis na Etapa 2. Se o INSS já reconheceu estruturas mais limitantes, por exemplo, esse motivo ficará bloqueado para reclassificação judicial (pois o reconhecimento já está na base).

   Se houver dúvida sobre como responder, clique em **"Não sabe como responder? Ver explicação"** para expandir um guia detalhado com exemplos e base legal.

**Atalho opcional:** se o Simulador já estiver preenchido com os dados da avaliação administrativa, clique em **"Preencher automaticamente com a Calculadora"** para importar os qualificadores calculados como rascunho.

**Para concluir a etapa:** clique em **"Fixar base administrativa"**. A base fica travada e a Etapa 2 é desbloqueada. Se precisar alterar a base depois, é possível refixá-la.

### 5.2. Etapa 2 — Informações da perícia médica judicial

**Objetivo:** registrar os achados relevantes da perícia médica judicial, decidindo sobre impedimento de longo prazo, Funções do Corpo judiciais e, quando pertinente, Atividades e Participação.

**Campos a preencher (nesta ordem):**

1. **Impedimento de longo prazo:** Sim ou Não. Se "Não", a triagem será concluída imediatamente na Etapa 3 com dispensa da avaliação social (ausente o pressuposto do impedimento, a análise biopsicossocial fica prejudicada).

2. **Funções do Corpo (judicial):** duas opções:
   - **Manter qualificador administrativo:** o qualificador fixado na Etapa 1 é preservado.
   - **Alterar na fase judicial:** permite requalificar Funções do Corpo com base em motivo técnico fechado. Ao selecionar esta opção, deve-se escolher um dos seguintes motivos:

   | Motivo | Efeito |
   |--------|--------|
   | *Estruturas do corpo mais graves (não reconhecidas pelo INSS)* | Majoração de +1 sobre o qualificador administrativo |
   | *Prognóstico desfavorável (não reconhecido pelo INSS)* | Majoração de +1 sobre o qualificador administrativo |
   | *Domínio administrativo b1–b8 mais grave* | Informa-se a pontuação por domínio (b1–b8) e o sistema aplica o domínio mais grave |
   | *Rebaixamento por prova superveniente* | Seleção manual do qualificador judicial, com confirmação quando houver redução |

   Os dois primeiros motivos ficam bloqueados se o INSS já reconheceu o respectivo fator na Etapa 1 (o sistema exibe mensagem explicativa).

   No motivo "Rebaixamento", se o qualificador judicial ficar inferior ao administrativo, o sistema exige confirmação explícita antes de prosseguir.

3. **Perícia médica trouxe elementos para requalificar Atividades e Participação?** — Este campo é exibido apenas quando a reclassificação pode ser decisiva para o desfecho. Se o sistema já detecta que, com os dados atuais, a reclassificação é irrelevante (por exemplo, Funções do Corpo ficaram em N ou L, ou o Teste A já é positivo), a pergunta é suprimida com nota explicativa.

   Se "Sim", escolha o modo de requalificação:
   - **Simples:** informe diretamente o qualificador final de Atividades e Participação e uma justificativa médica obrigatória.
   - **Completa (d1–d9):** preencha cada um dos 9 domínios (d1 a d9) e o sistema calcula automaticamente o qualificador final pela fórmula normativa. Cada domínio possui botão de ajuda contextual (ícone "i") com a definição do conceito e a base legal.

O painel de orientação da Etapa 2 indica em tempo real qual campo está pendente. A etapa só se conclui quando todos os campos obrigatórios estiverem preenchidos.

### 5.3. Etapa 3 — Triagem probatória

**Objetivo:** apresentar automaticamente o resultado da triagem, indicando se a avaliação social judicial é dispensável ou necessária.

Esta etapa é calculada pelo sistema — não exige preenchimento manual. Assim que as Etapas 1 e 2 estiverem completas, a triagem é processada automaticamente.

**Testes realizados:**

- **Teste A (verificação administrativa):** cruza os qualificadores administrativos de Fatores Ambientais e Atividades e Participação com o qualificador judicial de Funções do Corpo na Tabela Conclusiva. Se o resultado for positivo, a avaliação social é dispensável.

- **Teste B (verificação com reclassificação médica de Atividades):** quando houver requalificação médica de Atividades e Participação (Etapa 2), cruza o qualificador médico com Funções do Corpo judiciais, mantendo Fatores Ambientais administrativos. Se positivo, a avaliação social é dispensável.

**Resultados possíveis:**

| Resultado | Significado |
|-----------|-------------|
| **Avaliação social judicial dispensável** | A prova técnica médica já é suficiente para definir o requisito biopsicossocial. Não é necessário determinar avaliação social em juízo. |
| **Avaliação social judicial necessária** | A prova médica isolada não produziu resultado positivo nas verificações disponíveis. Recomenda-se determinar avaliação social judicial, que pode reclassificar Fatores Ambientais e os domínios sociais de Atividades (d6–d9). |

A triagem exibe a razão objetiva do resultado e, abaixo, uma **trilha de auditoria** (trace) que detalha passo a passo o raciocínio: como Funções do Corpo foi resolvido, se houve reclassificação de Atividades, qual o resultado de cada teste e por quê.

### 5.4. Etapa 4 — Texto para decisão

**Objetivo:** gerar texto padronizado, em linguagem técnica e com referências normativas, para fundamentar a decisão judicial sobre o requisito biopsicossocial.

O texto gerado automaticamente contém:
- Resumo da base administrativa (qualificadores e reconhecimentos do INSS).
- Achados da perícia médica judicial (impedimento, Funções do Corpo, Atividades).
- Resultado da verificação na Tabela Conclusiva (item do Anexo IV referenciado).
- Conclusão motivada (dispensabilidade ou necessidade da avaliação social judicial).

**Ações disponíveis:**

| Botão | Função |
|-------|--------|
| **Gerar texto** | Gera a minuta no campo de texto da etapa |
| **Gerar e copiar texto da decisão** | Gera a minuta e copia automaticamente para a área de transferência |
| **Somente copiar** | Copia o texto já gerado, sem regerar |
| **Limpar controle judicial** | Reinicia todas as 4 etapas do controle, mediante confirmação |

O texto é exibido em um campo de leitura. Revise-o antes de inserir na decisão, adaptando-o conforme necessário ao caso concreto.

---

## 6. Modo Fluxograma

O Fluxograma apresenta visualmente a lógica decisória da avaliação biopsicossocial em 6 etapas conceituais. Serve como referência rápida para entender o encadeamento de verificações que a ferramenta automatiza.

### Navegação

- **Visão geral:** exibe o diagrama completo em formato SVG. Há um link para abrir a imagem ampliada em nova aba.
- **Etapas 1 a 6:** botões de navegação permitem focar em uma etapa específica, com descrição textual e ramificações possíveis (Sim/Não, deferido/indeferido).

No celular, a navegação por etapas é o modo padrão; no desktop, a visão geral completa é exibida por padrão.

**As 6 etapas do fluxograma:**

1. **Impedimento de longo prazo (> 2 anos)?** — Se não, indeferido imediato.
2. **Qualificador de Funções do Corpo** — Se N ou L, indeferido (Regra 2). Se M ou superior, prosseguir.
3. **Qualificador de Atividades e Participação** — Se N ou L, indeferido (Regra 1). Se M ou superior, prosseguir.
4. **Cruzamento na Tabela Conclusiva** — Combinações G/C deferidas diretamente. Combinação M-M vai para exceção ambiental.
5. **Exceção Moderada-Moderada (M-M)** — Quando ambos estão em M, o desfecho depende dos Fatores Ambientais.
6. **Fatores Ambientais (e1–e5)** — Se G ou C, deferido. Se inferior a G, indeferido.

---

## 7. Regras de negócio implementadas

Esta seção detalha as regras normativas que a ferramenta automatiza, para que o operador possa verificar a conformidade dos cálculos.

### 7.1. Escala de qualificadores (CIF)

| Letra | Nome | Faixa percentual |
|-------|------|-------------------|
| N | Nenhuma | 0–4% |
| L | Leve | 5–24% |
| M | Moderada | 25–49% |
| G | Grave | 50–95% |
| C | Completa | 96–100% |

A denominação descritiva varia por componente:
- Fatores Ambientais: Nenhuma Barreira, Barreira Leve, Barreira Moderada, Barreira Grave, Barreira Completa.
- Atividades e Participação: Nenhuma Dificuldade, Dificuldade Leve, Dificuldade Moderada, Dificuldade Grave, Dificuldade Completa.
- Funções do Corpo: Nenhuma Alteração, Alteração Leve, Alteração Moderada, Alteração Grave, Alteração Completa.

### 7.2. Fórmulas de cálculo

**Fatores Ambientais:**
```
percentual = (soma de e1 a e5) × 5 − 0,1
```

**Atividades e Participação:**
```
percentual = (soma de d1 a d9) × 2,777777777777780 − 0,1
```

**Funções do Corpo:**
```
qualificador final = maior valor entre b1 e b8
```
Com majoração opcional de +1 nível (não cumulativa) por:
- Prognóstico desfavorável; ou
- Alterações em Estruturas do Corpo mais limitantes que Funções do Corpo.

### 7.3. Tabela Conclusiva (Anexo IV, Portaria 2/2015)

A Tabela Conclusiva cruza os três componentes para determinar o resultado. As regras sintéticas são:

1. Se Funções do Corpo ≤ L (Nenhuma ou Leve): **indeferido**, independentemente dos demais.
2. Se Atividades e Participação ≤ L: **indeferido**, independentemente dos demais.
3. Se Funções do Corpo ≥ G (Grave ou Completa): **deferido**.
4. Se Atividades e Participação ≥ G: **deferido**.
5. Se Funções do Corpo = M **e** Atividades e Participação = M: **deferido somente se Fatores Ambientais ≥ G** (Grave ou Completa).

### 7.4. Padrão Médio Social (Portaria 34/2025)

A Portaria MDS/INSS nº 34/2025 instituiu o padrão médio social, com valores fixos para os domínios sociais:

| Domínio | Valor |
|---------|-------|
| e1 — Produtos e Tecnologia | 2 (Moderada) |
| e2 — Condições de Habitabilidade | 2 (Moderada) |
| e3 — Apoio e Relacionamentos | 2 (Moderada) |
| e4 — Atitudes | 1 (Leve) |
| e5 — Serviços, Sistemas e Políticas | 2 (Moderada) |
| d6 — Vida Doméstica | 3 (Grave) |
| d7 — Relações Interpessoais | 2 (Moderada) |
| d8 — Áreas Principais da Vida | 3 (Grave) |
| d9 — Vida Comunitária | 3 (Grave) |

Conforme art. 13, §§ 6º e 7º, o resultado do padrão médio somente pode ser utilizado para concessão ou manutenção do BPC; nos demais casos, a avaliação social do INSS é obrigatória.

### 7.5. Regime etário (crianças e adolescentes menores de 16 anos)

Para crianças abaixo do ponto de corte etário de cada domínio de Atividades e Participação, a ferramenta fixa automaticamente o qualificador em 4 (Completa). Os pontos de corte (em meses) estão definidos na Portaria e implementados conforme a tabela da seção 4.6 deste manual.

---

## 8. Fluxo recomendado de uso

### Cenário 1: Análise rápida de cenário (Simulador)

1. Selecione o modo **Simulador** no cabeçalho.
2. Preencha os domínios de cada componente conforme a avaliação que deseja verificar.
3. Observe o resultado na Tabela Conclusiva e no card de decisão.
4. Se necessário, ative o **Padrão Médio** para preencher os domínios sociais.
5. Para crianças, ative **"Idade inferior a 16 anos"** e informe a idade.

### Cenário 2: Controle judicial completo (uso recomendado em gabinete)

1. Selecione o modo **Controle Judicial** (é o modo padrão ao abrir a aplicação).
2. **Etapa 1:** Preencha os qualificadores finais administrativos e os reconhecimentos do INSS. Clique em **"Fixar base administrativa"**.
3. **Etapa 2:** Informe se há impedimento de longo prazo. Decida sobre Funções do Corpo (manter ou alterar). Se pertinente, informe requalificação de Atividades.
4. **Etapa 3:** Leia o resultado da triagem automática. Verifique a trilha de raciocínio para conferir a lógica aplicada.
5. **Etapa 4:** Clique em **"Gerar e copiar texto da decisão"**. Revise o texto e cole na minuta.

### Cenário 3: Do Simulador ao Controle Judicial

1. Monte o cenário no **Simulador** com os dados da avaliação administrativa.
2. Clique em **"Levar cenário para Controle Judicial"**. Os qualificadores são importados como rascunho na Etapa 1.
3. Complete os reconhecimentos do INSS e fixe a base.
4. Prossiga com as Etapas 2 a 4 do Controle Judicial.

### Cenário 4: Consulta normativa rápida

1. Clique no link **"Portaria Conjunta MDS/INSS nº 2/2015"** no cabeçalho para abrir o PDF.
2. Ou clique em **"Ler versão texto na aplicação"** no rodapé para consultar o texto integral sem sair da página.
3. Use os botões de ajuda contextual (**"i"**) ao lado de qualquer domínio para ver a definição, indicadores e base legal específica.

---

## 9. Comparação INSS × Reclassificação Judicial

Quando o Simulador é utilizado após fixar uma base administrativa no Controle Judicial, a ferramenta exibe automaticamente uma seção de **Comparação** mostrando lado a lado:

- Os qualificadores e o resultado da avaliação administrativa (INSS).
- Os qualificadores e o resultado da reclassificação judicial em curso no Simulador.
- Um indicador das mudanças entre as duas avaliações.

O botão **"Limpar comparação"** remove essa visualização.

---

## 10. Recursos adicionais

### Modo escuro
Ative a alternância **"Modo escuro"** no cabeçalho para melhor leitura em ambientes com pouca luminosidade. A preferência é mantida durante a sessão.

### Navegação por teclado
A ferramenta suporta navegação completa por teclado. Os botões de qualificadores podem ser percorridos com as setas direcionais, e todos os campos interativos são acessíveis via Tab. Os leitores de tela são suportados com rótulos ARIA descritivos.

### Botão "Voltar ao topo"
Ao rolar a página para baixo, um botão flutuante **"Voltar ao topo"** aparece no canto inferior, permitindo retornar rapidamente ao início.

---

## 11. Como executar localmente

A ferramenta funciona integralmente no navegador, mas requer um servidor HTTP local (não é possível abrir o arquivo `index.html` diretamente via `file://` devido a restrições de CORS dos módulos ES).

### Opção recomendada (Node.js)

```bash
npm install
npm run start
```

Acesse: `http://127.0.0.1:8000/index.html`

Para usar uma porta diferente:

```bash
PORT=9000 npm run start
```

### Alternativa (Python)

```bash
python3 -m http.server 8000
```

Acesse: `http://127.0.0.1:8000/index.html`

---

## 12. Aviso importante

Esta ferramenta é de apoio técnico e organizacional. A decisão judicial deve sempre observar:

- O conjunto probatório completo do processo.
- A legislação e a jurisprudência aplicáveis.
- O convencimento motivado do(a) magistrado(a).

A aplicação automatiza exclusivamente o requisito biopsicossocial da pessoa com deficiência, nos termos das Portarias Conjuntas MDS/INSS nº 2/2015 e nº 34/2025. Não substitui, em nenhuma hipótese, o juízo sobre os demais requisitos legais do BPC/LOAS.
