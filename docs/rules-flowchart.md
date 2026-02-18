# Fluxogramas de Regras de Negócio — Calculadora BPC

Este documento detalha visualmente as regras de negócio implementadas na aplicação, baseadas na Portaria Conjunta MDS/INSS nº 2/2015 e na lógica de controle judicial desenvolvida.

## 1. Fluxo de Cálculo Administrativo (Simulador)

Este fluxo representa a lógica padrão da Tabela Conclusiva (Anexo IV), onde os qualificadores finais são derivados da soma ou máximo dos domínios avaliados.

```mermaid
flowchart TD
    subgraph Inputs
    Amb[Fatores Ambientais<br/>(e1-e5)]
    Ativ[Atividades e Part.<br/>(d1-d9)]
    Corpo[Funções do Corpo<br/>(b1-b8)]
    end

    subgraph Calculations
    Amb -->|Soma x 5%| Q_Amb[Qualificador Amb<br/>(0-4)]
    Ativ -->|Soma x 2.77%| Q_Ativ[Qualificador Ativ<br/>(0-4)]
    Corpo -->|Máximo| Max_Corpo[Máximo Corpo]
    
    Max_Corpo --> CheckMaj{Majoração?}
    CheckMaj -- Sim --> Maj[+1 (max 4)]
    CheckMaj -- Não --> Q_Corpo[Qualificador Corpo<br/>(0-4)]
    Maj --> Q_Corpo
    end

    subgraph TabelaConclusiva ["Tabela Conclusiva (Anexo IV)"]
    Q_Corpo --> CheckBlock{Corpo <= 1<br/>OU<br/>Ativ <= 1 ?}
    Q_Ativ --> CheckBlock
    
    CheckBlock -- Sim --> Indeferido[INDEFERIDO]
    CheckBlock -- Não --> CheckDefer{Corpo >= 3<br/>OU<br/>Ativ >= 3<br/>OU<br/>Amb >= 3 ?}
    
    CheckDefer -- Sim --> Deferido[DEFERIDO]
    CheckDefer -- Não --> Indeferido
    end

    classDef input fill:#e1f5fe,stroke:#01579b
    classDef calc fill:#fff9c4,stroke:#fbc02d
    classDef decision fill:#e8f5e9,stroke:#2e7d32
    classDef result fill:#f3e5f5,stroke:#7b1fa2

    class Amb,Ativ,Corpo input
    class Q_Amb,Q_Ativ,Max_Corpo,Q_Corpo calc
    class CheckBlock,CheckDefer decision
    class Deferido,Indeferido result
```

## 2. Fluxo de Controle Judicial (Triagem)

Este fluxo descreve a lógica de triagem para definir se a perícia médica judicial é suficiente para o julgamento ou se a avaliação social judicial é necessária.

```mermaid
flowchart TD
    Start((Início)) --> BaseAdmin[1. Fixar Base Administrativa<br/>(Amb, Ativ, Corpo)]
    BaseAdmin --> MedInfo[2. Informações Médicas Judiciais]
    
    MedInfo --> Impedimento{Impedimento<br/>Longo Prazo?}
    Impedimento -- Não --> DispensaLP[DISPENSA Avaliação Social<br/>(Suficiência da prova médica)]
    
    Impedimento -- Sim --> DefCorpo[Definir Corpo Judicial]
     
    subgraph CorpoJudLogic [Lógica Funções do Corpo]
    DefCorpo --> KeepCorp{Manter Admin?}
    KeepCorp -- Sim --> Q_Corpo_Jud[= Corpo Admin]
    KeepCorp -- Não --> ChangeReason{Motivo?}
    ChangeReason -- Estrutura/Prog --> Q_Corpo_Jud_Calc[Corpo Admin + 1]
    ChangeReason -- Domínio Max --> Q_Corpo_Jud_Max[Máximo b1-b8]
    ChangeReason -- Reclassificação --> Q_Corpo_Jud_Man[Manual]
    Q_Corpo_Jud_Calc --> Q_Corpo_Jud
    Q_Corpo_Jud_Max --> Q_Corpo_Jud
    Q_Corpo_Jud_Man --> Q_Corpo_Jud
    end
    
    Q_Corpo_Jud --> TesteA{Teste A:<br/>Tabela Conclusiva<br/>(Amb Admin + Ativ Admin + Corpo Jud)}
    
    TesteA -- DEFERIDO --> DispensaA[DISPENSA Avaliação Social<br/>(Deferido por prova médica)]
    
    TesteA -- INDEFERIDO --> CheckIrrelevancia{Corpo Jud <= 1?}
    CheckIrrelevancia -- Sim --> DispensaB[DISPENSA Avaliação Social<br/>(Impossível deferir independente de Ativ/Amb)]
    
    CheckIrrelevancia -- Não --> CheckAtivMed{Perito requalificou<br/>Atividades?}
    
    CheckAtivMed -- Sim --> TesteB{Teste B:<br/>Tabela Conclusiva<br/>(Amb Admin + Ativ Méd + Corpo Jud)}
    TesteB -- DEFERIDO --> DispensaC[DISPENSA Avaliação Social<br/>(Deferido com reclass. de Atividades)]
    TesteB -- INDEFERIDO --> SocialNec[AVALIAÇÃO SOCIAL<br/>NECESSÁRIA]
    
    CheckAtivMed -- Não --> SocialNec

    classDef start fill:#e1f5fe,stroke:#01579b
    classDef steps fill:#fff3e0,stroke:#e65100
    classDef logic fill:#f3e5f5,stroke:#4a148c
    classDef end_dispensa fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    classDef end_social fill:#ffebee,stroke:#c62828,stroke-width:2px

    class Start,BaseAdmin,MedInfo start
    class Impedimento,KeepCorp,ChangeReason,TesteA,CheckIrrelevancia,CheckAtivMed,TesteB logic
    class DispensaLP,DispensaA,DispensaB,DispensaC end_dispensa
    class SocialNec end_social
```

## Legenda

*   **Amb / Fatores Ambientais**: Qualificador derivado da avaliação social.
*   **Ativ / Atividades e Participação**: Qualificador derivado da combinação de avaliações (médica e social).
*   **Corpo / Funções do Corpo**: Qualificador derivado da avaliação médica.
*   **Majoração**: Regra que eleva a nota de Funções do Corpo caso haja prognóstico de piora ou alterações estruturais mais graves que as funcionais.
