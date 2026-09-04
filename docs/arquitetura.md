# Arquitetura

Este documento apresenta um mapa prático do script principal.

A ideia aqui não é explicar o projeto em nível abstrato, mas ajudar a localizar rapidamente os grandes blocos do arquivo, entender o papel de cada parte e saber onde fazer manutenção com menor risco.

O arquivo principal é:

```text
src/analisador-fluxo-sei.user.js
```

Em versões grandes, o script pode chegar a milhares de linhas. Por isso, o mais importante não é decorar tudo, mas entender a divisão em blocos.

---

## Visão geral do fluxo do script

Em termos práticos, o script costuma fazer este caminho:

```text
1. Identifica a página e o contexto atual do SEI
2. Lê DOM, iframes e tabelas visíveis
3. Busca páginas auxiliares do próprio SEI
4. Extrai dados do processo, histórico e árvore documental
5. Normaliza textos, unidades, datas e tempos
6. Aplica regras de classificação e sinalização
7. Monta linhas de relatório
8. Exibe interface local
9. Exporta CSV/XLSX
```

---

## Mapa mental da arquitetura

Uma forma útil de imaginar o script é esta:

```text
CONFIGURAÇÃO
    ↓
UTILITÁRIOS
    ↓
COLETA DE DADOS
    ├─ DOM principal
    ├─ iframes
    ├─ histórico
    └─ árvore / peças
    ↓
NORMALIZAÇÃO
    ↓
MOTOR DE REGRAS
    ↓
MONTAGEM DO RELATÓRIO
    ↓
INTERFACE / BOTÕES / EXPORTAÇÃO
```

---

## Blocos principais do código

## 1) Cabeçalho e metadados do userscript

É a parte do `// ==UserScript==`.

Exemplo:

```javascript
// ==UserScript==
// @name         Analisador de Fluxo SEI
// @namespace    ...
// @version      ...
// @match        ...
// @grant        ...
// ==/UserScript==
```

### Função desse bloco

- dizer ao Tampermonkey onde e como o script roda;
- controlar nome, versão e páginas compatíveis;
- definir permissões.

### Quando mexer aqui

- ao alterar versão;
- ao mudar nome do script;
- ao ampliar ou restringir URLs do `@match`.

---

## 2) Configuração geral

Normalmente é o bloco de constantes e chaves de configuração.

Exemplo do tipo de conteúdo esperado:

```javascript
const CONFIG = {
    habilitarColunaCredor: true,
    usarXlsx: true,
    destacarAtrasos: true
};
```

Ou ainda:

```javascript
const UNIDADES = {
    df: [...],
    dfpo: [...],
    contabilidade: [...],
    tesouraria: [...],
    tecnicas: [...]
};
```

### Função desse bloco

- centralizar parâmetros que mudam com frequência;
- evitar espalhar valores fixos por todo o arquivo;
- facilitar adaptação local sem reescrever regras.

### O que costuma existir aqui

- nomes de unidades;
- palavras-chave;
- cores de status;
- chaves de ativação de colunas;
- rótulos;
- listas de áreas técnicas;
- dicionários sintéticos ou locais.

---

## 3) Funções utilitárias

São pequenas funções de apoio reutilizadas em muitos pontos do script.

Exemplos típicos:

```javascript
function textoLimpo(valor) {
    return (valor || '').replace(/\s+/g, ' ').trim();
}
```

```javascript
function normalizarTexto(txt) {
    return textoLimpo(txt).toLowerCase();
}
```

```javascript
function diferencaEmHoras(dataA, dataB) {
    return Math.floor((dataB - dataA) / (1000 * 60 * 60));
}
```

### Função desse bloco

- evitar repetição;
- padronizar tratamento de texto, data e número;
- deixar o restante do código mais legível.

### Assuntos comuns nesse bloco

- limpeza de texto;
- normalização;
- parse de datas;
- cálculo de tempo;
- checagem de palavras;
- deduplicação;
- escape de HTML;
- formatação de duração.

---

## 4) Leitura do DOM da página principal

Aqui o script olha para a página aberta no navegador.

Exemplos:

```javascript
const titulo = document.querySelector('h1');
const linhas = [...document.querySelectorAll('table tr')];
```

```javascript
const textoPagina = document.body.innerText;
```

### Função desse bloco

- extrair o que já está visível na tela;
- localizar tabela principal;
- identificar processos listados;
- descobrir em que tela do SEI o usuário está.

---

## 5) Leitura de iframes

No SEI, parte do conteúdo pode estar dentro de `iframe`.

Exemplo:

```javascript
const frame = document.querySelector('iframe');
const docFrame = frame?.contentDocument || frame?.contentWindow?.document;
```

```javascript
const textoInterno = docFrame?.body?.innerText || '';
```

### Ideia importante

Cada iframe tem seu próprio `document`.

Então, em vez de:

```javascript
document.querySelector(...)
```

às vezes você precisa usar:

```javascript
docFrame.querySelector(...)
```

---

## 6) Requisições internas ao SEI

Esse é o bloco que consulta páginas internas além do que já está aberto.

Pode envolver `fetch`, `XMLHttpRequest`, jQuery AJAX ou reaproveitamento de URLs internas do SEI.

Exemplo genérico:

```javascript
const html = await fetch(url, { credentials: 'include' }).then(r => r.text());
```

### Função desse bloco

- buscar histórico;
- abrir páginas auxiliares;
- carregar árvore;
- consultar detalhes de processo;
- coletar HTML que não está carregado ainda no DOM atual.

---

## 7) Parsing de HTML retornado

Quando uma requisição devolve HTML, o script precisa transformar esse HTML em algo consultável.

Exemplo:

```javascript
const parser = new DOMParser();
const doc = parser.parseFromString(html, 'text/html');
```

Depois disso:

```javascript
const itens = [...doc.querySelectorAll('tr')];
```

### Cadeia prática

```text
response HTML
→ DOMParser
→ document temporário
→ querySelector
→ dados úteis
```

---

## 8) Extração de dados do histórico

Esse bloco costuma ler a tabela de andamentos do processo.

Exemplo genérico:

```javascript
function extrairAndamentos(doc) {
    const linhas = [...doc.querySelectorAll('table tr')];
    return linhas.map(linha => {
        const celulas = [...linha.querySelectorAll('td')];
        return {
            dataHora: celulas[0]?.innerText?.trim(),
            unidade: celulas[1]?.innerText?.trim(),
            usuario: celulas[2]?.innerText?.trim(),
            descricao: celulas[3]?.innerText?.trim()
        };
    });
}
```

### Função desse bloco

- estruturar o histórico em objetos;
- permitir regras temporais;
- reconstruir o fluxo do processo.

---

## 9) Extração da árvore documental

Esse é um dos blocos mais importantes para classificação.

Ele identifica nomes das peças, títulos e marcadores da árvore.

Exemplo do tipo de saída:

```javascript
[
  "Despacho para aferir alíquota",
  "Nota Técnica IRRF",
  "Guia de ISS",
  "Despacho Relatório de Retenção",
  "Termo de Requisitos Mínimos para Repasse de Prestação de Serviços"
]
```

### Padrão técnico

```text
lê nós da árvore
→ extrai texto
→ normaliza títulos
→ procura palavras-chave
→ gera indicadores booleanos
```

Exemplo:

```javascript
const possuiTRM = titulos.some(t =>
    normalizarTexto(t).includes('termo de requisitos mínimos')
);
```

---

## 10) Normalização e indicadores intermediários

Antes de classificar, o script normalmente monta um conjunto de indicadores.

Exemplo:

```javascript
const indicadores = {
    possuiComprovante: true,
    possuiTRM: false,
    possuiRelatorioFotografico: true,
    emDFPO: true,
    emACI: false,
    diasEmAberto: 8
};
```

### Função desse bloco

- transformar muitos sinais brutos em poucas variáveis confiáveis;
- simplificar o motor de regras;
- evitar que as regras precisem reler o DOM toda hora.

---

## 11) Motor de regras

É o coração analítico do script.

Exemplo:

```javascript
function classificarProcesso(ctx) {
    if (ctx.possuiTRM && ctx.emACI) {
        return 'Cumprindo TRM';
    }

    if (ctx.emContabilidade && !ctx.possuiRelatorioRetencao) {
        return 'Aferindo alíquota';
    }

    if (ctx.possuiComprovante && !ctx.aberto) {
        return 'Arquivamento provável 🗂️';
    }

    return 'Caso externo ao dicionário. Contactar administrador.';
}
```

### Função desse bloco

- priorizar regras;
- resolver ambiguidades;
- definir o texto final da sinalização.

---

## 12) Montagem da linha do relatório

Depois da classificação, o script transforma tudo em uma linha exibível.

Exemplo:

```javascript
const linha = {
    processo,
    credor,
    unidadeAberta,
    diretoria,
    sinalizacao,
    entradaDfPo,
    tempoDfPo,
    entradaCircuitoDf,
    tempoCircuitoDf
};
```

---

## 13) Renderização da interface

Esse bloco cria elementos na página: botão, painel, tabela, rótulos e destaques.

Exemplo:

```javascript
const botao = document.createElement('button');
botao.textContent = 'Gerar relatório';
```

---

## 14) Exportação

É o bloco que converte o relatório para CSV ou XLSX.

Exemplo de lógica:

```javascript
function exportarCsv(linhas) { ... }
function exportarXlsx(linhas) { ... }
```

---

## 15) Inicialização

É o trecho que junta tudo.

Exemplo:

```javascript
(async function init() {
    await carregarContexto();
    criarBotaoPrincipal();
})();
```

---

## Desenho material do arquivo

A pessoa que abrir um script grande pode pensar assim:

```text
[ A ] METADADOS DO USERSCRIPT
[ B ] CONFIGURAÇÃO
[ C ] UTILITÁRIOS
[ D ] LEITURA DE DOM / IFRAMES
[ E ] REQUISIÇÕES INTERNAS
[ F ] PARSING DE HTML
[ G ] EXTRAÇÃO DO HISTÓRICO
[ H ] EXTRAÇÃO DA ÁRVORE
[ I ] INDICADORES INTERMEDIÁRIOS
[ J ] MOTOR DE REGRAS
[ K ] MONTAGEM DAS LINHAS
[ L ] INTERFACE
[ M ] EXPORTAÇÃO
[ N ] INICIALIZAÇÃO
```

Uma leitura produtiva do código costuma ser:

```text
primeiro: [N] inicialização
depois:   [L] interface
depois:   [K] linha do relatório
depois:   [J] motor de regras
depois:   [I] indicadores
depois:   [G] [H] [D] [E] origem dos dados
por fim:  [B] [C] utilidades e configuração
```

Essa ordem é boa porque começa pelo resultado visível e vai voltando até a origem.

---

## Como se orientar dentro de 15 mil linhas

Em vez de ler tudo linearmente, use perguntas.

### Quero mudar a aparência da tabela

Procure blocos de:

- `createElement`
- `innerHTML`
- `appendChild`
- estilos CSS
- renderização de cabeçalhos
- nomes das colunas

### Quero mudar uma sinalização

Procure:

- função de classificação;
- `if (...) return ...`;
- palavras do status final;
- motor de regras;
- ordem das regras.

### Quero incluir uma nova peça como evidência

Procure:

- leitura da árvore;
- lista de títulos;
- funções de detecção por palavra-chave;
- indicadores do tipo `possuiX`.

### Quero corrigir um falso positivo

Procure:

- função que detecta o padrão;
- condição ampla demais;
- regra genérica executada antes da específica.

### Quero alterar tempos

Procure:

- parse de datas;
- cálculo de duração;
- colunas “desde” e “tempo em”.

---

## Estratégia recomendada de manutenção

Para mexer em arquivo grande, siga esta ordem:

```text
1. Identifique o sintoma
2. Descubra qual coluna ou status saiu errado
3. Localize a função que monta esse resultado
4. Volte uma etapa e ache o indicador usado
5. Volte mais uma etapa e confirme a extração bruta
6. Só então altere a regra
7. Teste com 2 ou 3 casos conhecidos
```

---

## Exemplo de cadeia de raciocínio

Suponha que um processo deveria aparecer como:

```text
Cumprindo TRM
```

mas apareceu como:

```text
Caso externo ao dicionário. Contactar administrador.
```

O caminho de depuração é:

```text
status final incorreto
→ função classificarProcesso()
→ condição de TRM não ativou
→ indicador possuiTRM está falso
→ leitura da árvore não reconheceu o título
→ faltou incluir nova variação textual da peça
```

Isso evita corrigir no lugar errado.

---

## Relação entre coleta e interpretação

O script funciona melhor quando separa claramente:

### Coleta

```javascript
const titulos = extrairTitulosDaArvore(doc);
```

### Interpretação

```javascript
const possuiTRM = titulos.some(t =>
    normalizarTexto(t).includes('termo de requisitos mínimos')
);
```

### Decisão

```javascript
if (possuiTRM && emACI) {
    return 'Cumprindo TRM';
}
```

Separar essas três camadas ajuda muito a manter o código compreensível.

---

## Resumo prático

O arquivo grande não deve ser visto como um bloco único.

Ele é melhor entendido como a soma de cinco partes:

```text
1. Onde configurar
2. Onde coletar
3. Onde transformar
4. Onde decidir
5. Onde exibir/exportar
```

Quando essa divisão está clara, mesmo um script longo deixa de parecer um “paredão de 15 mil linhas” e passa a ser navegável por blocos.

---

## Próximos documentos

Depois deste mapa geral, a leitura mais útil é:

- `docs/guia-inspecao-navegador.md`
- `docs/montando-seu-script.md`
- `docs/exercicios-debug/`
