# RPA / Scraping de Requisições, Payloads e Responses no SEI

Projeto experimental para exploração prática do SEI pelo navegador, com foco em:

- requisições;
- payloads;
- responses;
- iframes;
- DOM;
- nós HTML;
- atributos;
- links;
- formulários;
- tabelas;
- árvores de documentos;
- páginas internas;
- testes de debug no Console;
- automações locais com JavaScript e userscripts.

A proposta é simples:

```text
ação no SEI
→ inspeção no navegador
→ teste no Console
→ identificação de request/response
→ leitura de HTML/DOM/iframe
→ validação
→ função pequena
→ userscript
```

> Este repositório contém um snapshot público anonimizado. Os exemplos devem usar dados sintéticos.

## Exercícios práticos de debug

Uma parte central deste repositório é aprender por experimentação direta no navegador.

Os exercícios abaixo reproduzem uma sequência de investigação usada para descobrir comportamentos e transformar observações em código:

1. [Encontrar um elemento no DOM](docs/exercicios-debug/01-encontrar-elemento-no-dom.md)
2. [Investigar um iframe](docs/exercicios-debug/02-investigar-iframe.md)
3. [Descobrir uma requisição no Network](docs/exercicios-debug/03-descobrir-requisicao-no-network.md)
4. [Inspecionar uma função JavaScript já carregada](docs/exercicios-debug/04-inspecionar-funcao-javascript.md)
5. [Da descoberta ao mini-script](docs/exercicios-debug/05-da-descoberta-ao-mini-script.md)

A progressão é:

```text
DOM
→ iframe
→ request/response
→ função JavaScript
→ mini-script
```

A ideia não é decorar comandos, mas aprender a fazer perguntas pequenas e verificáveis, como:

```text
Onde esta informação está?
Ela está no DOM principal ou em um iframe?
Qual requisição aparece quando executo esta ação?
O que veio na response?
Existe alguma função JavaScript já carregada envolvida?
Como transformar essa descoberta em uma função simples?
```

## Comece pela inspeção no navegador

Abra o SEI normalmente e use as Ferramentas do Desenvolvedor do navegador.

Atalhos comuns:

```text
F12
Ctrl + Shift + I
```

As áreas mais úteis são:

```text
Network / Rede
Elements / Elementos
Console
Sources / Fontes
```

## 1. Network: descobrir requisições

Abra:

```text
Network / Rede
```

Limpe as requisições anteriores e execute uma única ação.

Exemplos:

```text
abrir processo
abrir documento
abrir árvore
consultar histórico
abrir modal
```

Exemplos sintéticos de requests:

```text
GET controlador.php?acao=procedimento_trabalhar&id_procedimento=EXEMPLO
GET controlador.php?acao=arvore_visualizar&id_procedimento=EXEMPLO
GET controlador.php?acao=documento_visualizar&id_documento=EXEMPLO
```

Abra uma requisição e examine:

```text
Headers
Query String Parameters
Payload
Form Data
Preview
Response
```

## 2. Parâmetros e payloads

Uma URL pode conter:

```text
acao=procedimento_trabalhar
id_procedimento=123
id_documento=456
```

Em POST, os dados podem aparecer como:

```text
acao=alguma_acao
id_unidade=123
id_procedimento=456
```

Uma técnica útil é repetir a mesma ação em dois processos diferentes e comparar:

```text
processo A
↓
requisição A

processo B
↓
requisição B
```

Observe o que mudou e o que permaneceu.

## 3. Response

Em:

```text
Network
→ requisição
→ Response
```

você pode encontrar:

```text
HTML
JSON
JavaScript
PDF
texto
```

Exemplo de HTML:

```html
<div id="areaProcesso">
    <span class="numero">PROCESSO_EXEMPLO_001</span>
</div>
```

## 4. DOM

Pense de forma prática:

```text
HTML
= texto com marcação

document
= objeto que representa o documento atual

DOM
= árvore de nós mantida pelo navegador
```

Exemplo:

```html
<div>
    <span>Nota de Empenho</span>
</div>
```

Representação simplificada:

```text
Document
└── div
    └── span
        └── "Nota de Empenho"
```

No Console:

```javascript
document.querySelector('span')
```

Para ler o texto:

```javascript
document
    .querySelector('span')
    ?.textContent
    ?.trim();
```

## 5. Procurar texto no DOM

Se você vê na tela:

```text
Nota de Empenho
```

mas não sabe o seletor:

```javascript
const encontrados =
    [...document.querySelectorAll('body *')]
        .filter(el =>
            el.children.length === 0 &&
            el.textContent.includes('Nota de Empenho')
        );

console.log(encontrados);
```

Depois:

```javascript
const el = encontrados[0];

console.log(el);
console.log(el.parentElement);
```

E tente:

```javascript
el.closest('div')
el.closest('tr')
el.closest('table')
el.closest('form')
```

## 6. Iframes

Às vezes um conteúdo visível não está no `document` principal.

Liste os iframes:

```javascript
console.table(
    [...document.querySelectorAll('iframe')].map(frame => ({
        id: frame.id,
        name: frame.name,
        src: frame.getAttribute('src')
    }))
);
```

Depois:

```javascript
const frame =
    document.querySelector('iframe');

const docFrame =
    frame?.contentDocument;

console.log(docFrame);
```

Pense assim:

```text
document
= documento atual

frame.contentDocument
= documento carregado dentro do iframe
```

## 7. Funções JavaScript já carregadas

Algumas ações da interface podem usar funções JavaScript já presentes na página.

Exemplo:

```javascript
$.modalLink
```

Liste propriedades:

```javascript
Object.keys($.modalLink)
```

Teste:

```javascript
typeof $.modalLink.open
```

Se for função:

```javascript
$.modalLink.open.toString()
```

ou:

```javascript
console.log(
    $.modalLink.open.toString()
);
```

Isso pode ajudar a descobrir:

```text
parâmetros
URLs
opções
mecanismos de modal
ações disparadas pela interface
```

## 8. Quando olhar DOM e quando olhar Network

Regra prática:

```text
se a informação já está na tela
→ Elements
→ DOM
→ querySelector
```

```text
se a informação aparece depois de uma ação
→ Network
→ request
→ parâmetros/payload
→ response
→ depois DOM
```

## 9. Reproduzir uma leitura

Depois de identificar uma URL de leitura:

```javascript
const resposta =
    await fetch('URL_OBSERVADA');

const html =
    await resposta.text();
```

Converta para DOM:

```javascript
const doc =
    new DOMParser()
        .parseFromString(
            html,
            'text/html'
        );
```

Agora:

```javascript
doc.querySelector(...)
doc.querySelectorAll(...)
```

## 10. Da descoberta à função

Exemplo:

```javascript
function textoDe(selector, doc = document) {
    return doc
        .querySelector(selector)
        ?.textContent
        ?.trim() ?? null;
}
```

Uso:

```javascript
const processo =
    textoDe('.numero-processo');

const empenho =
    textoDe('.empenho');

const valor =
    textoDe('.valor');

console.table([
    {
        processo,
        empenho,
        valor
    }
]);
```

A sequência é:

```text
teste no Console
↓
seletor
↓
função
↓
teste em vários casos
↓
userscript
```

## Guia prático de inspeção

O passo a passo mais completo está em:

[Guia prático de inspeção do SEI pelo navegador](docs/guia-inspecao-navegador.md)

## Estrutura do repositório

```text
src/
    analisador-fluxo-sei.user.js

docs/
    arquitetura.md
    auditoria-anonimizacao.txt
    guia-inspecao-navegador.md
    montando-seu-script.md
    privacidade-e-anonimizacao.md
    proveniencia.md

    exercicios-debug/
        01-encontrar-elemento-no-dom.md
        02-investigar-iframe.md
        03-descobrir-requisicao-no-network.md
        04-inspecionar-funcao-javascript.md
        05-da-descoberta-ao-mini-script.md

examples/
    configuracao-exemplo.js
    processos-sinteticos.json
```

## Privacidade

Antes de publicar qualquer saída das Ferramentas do Desenvolvedor, revise o conteúdo.

Podem aparecer:

- processos;
- documentos;
- unidades;
- nomes;
- IDs;
- URLs;
- parâmetros;
- dados de formulários;
- informações de sessão.

Nunca publique:

```text
cookies
tokens
credenciais
Authorization
dados de sessão
URLs autenticadas
parâmetros assinados
```

Use exemplos sintéticos.

## Status

Versão pública atual: **v0.1.0**

Status: **experimental**.

## Proveniência

A primeira publicação pública foi derivada da fonte privada experimental:

```text
v0.9.9.145
```

O hash SHA-256 correspondente está registrado em:

```text
docs/proveniencia.md
```

## Aviso

Projeto independente de estudo, scraping, RPA, debug no navegador e automação local.

Não é um produto oficial do SEI, TRF4 ou de qualquer órgão público.
