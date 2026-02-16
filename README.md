# Calculadora Biopsicossocial BPC/LOAS

Aplicação web estática para apoio à análise dos qualificadores da avaliação biopsicossocial do BPC/LOAS, com foco em uso judicial.

## Acesso

- GitHub Pages: <https://deltaporto.github.io/calculadorabpc/>
- Repositório: <https://github.com/Deltaporto/calculadorabpc>

## Funcionalidades principais

- Cálculo dos 3 componentes com visualização imediata:
  - Fatores Ambientais
  - Atividades e Participação
  - Funções do Corpo
- Aplicação da Tabela Conclusiva (Anexo IV) com resultado de deferimento/indeferimento.
- Fluxo etário com UX explícita:
  - padrão em **16 anos ou mais**
  - opção para marcar **idade inferior a 16 anos**
  - entrada de idade em **anos** ou **meses**
  - conversão automática para meses para regra de corte por domínio.
- Regra de pontos de corte para menores de 16 anos:
  - qualificação automática de domínios abaixo do corte etário com bloqueio visual.
- Padrão Médio Social com proteção de preenchimento manual:
  - aplica por padrão apenas em domínios não preenchidos manualmente
  - opção para **sobrescrever domínios preenchidos**
  - pergunta de confirmação apenas quando houver conflito real com preenchimento manual.
- Minuta padronizada para decisão judicial:
  - geração automática de texto fundamentado
  - botão para copiar texto.
- Comparação entre avaliação salva (INSS) e reclassificação judicial.
- Ícones SVG profissionais (sem dependência de CDN).

## Base normativa destacada na interface

- Lei nº 8.742/1993 (art. 20, §§ 2º e 10)
- Portaria Conjunta MDS/INSS nº 2/2015 (Anexo IV)

## Executar localmente

Como é uma página estática, basta abrir o `index.html`.

Opção recomendada (servidor local):

```bash
cd calculadorabpc
python3 -m http.server 8080
```

Depois acesse: <http://localhost:8080>

## Publicação

A publicação ocorre via GitHub Pages. Após atualizar o `index.html` ou `README.md`, aguarde alguns minutos para propagação.

Se não visualizar mudanças imediatamente, faça hard refresh (`Ctrl+F5` / `Cmd+Shift+R`) ou use uma URL com query string (ex.: `?v=2`).
