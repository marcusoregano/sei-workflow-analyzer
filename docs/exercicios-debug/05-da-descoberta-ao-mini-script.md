# Exercício 5 — Da descoberta ao mini-script

## Problema

Você já encontrou um elemento, entendeu onde ele está e conseguiu lê-lo no Console.

Agora quer transformar esse teste em uma função pequena e reutilizável.

## Objetivo

Aprender a:

- transformar testes soltos em função;
- separar aquisição e extração;
- lidar com valores ausentes;
- testar em mais de um processo;
- montar um userscript mínimo.

---

## Passo 1 — Comece pelo teste direto

Suponha:

```javascript
document
    .querySelector('.numero-processo')
    ?.textContent
    ?.trim();
```

Resultado:

```text
PROCESSO_EXEMPLO_001
```

---

## Passo 2 — Crie uma função genérica

```javascript
function textoDe(selector, doc = document) {
    return doc
        .querySelector(selector)
        ?.textContent
        ?.trim() ?? null;
}
```

---

## Passo 3 — Use a função

```javascript
const processo =
    textoDe('.numero-processo');

console.log(processo);
```

---

## Passo 4 — Leia mais de um campo

Exemplo sintético:

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

Resultado aproximado:

| processo | empenho | valor |
|---|---|---|
| PROCESSO_EXEMPLO_001 | NE_EXEMPLO_001 | R$ 10.000,00 |

---

## Passo 5 — Teste ausência

Se um processo não possuir empenho:

```javascript
const empenho =
    textoDe('.empenho');

console.log(empenho);
```

O esperado é:

```text
null
```

Isso é melhor do que quebrar o script.

---

## Passo 6 — Teste com iframe

Se a informação estiver dentro de um iframe:

```javascript
const frame =
    document.querySelector('#frameDocumento');

const docFrame =
    frame?.contentDocument;

const empenho =
    textoDe('.empenho', docFrame);

console.log(empenho);
```

A mesma função continua funcionando porque recebe outro `document`.

---

## Passo 7 — Separar carregamento e leitura

Se você já descobriu uma URL de leitura:

```javascript
async function carregarPagina(url) {
    const resposta = await fetch(url);
    return await resposta.text();
}
```

Depois:

```javascript
function converterParaDOM(html) {
    return new DOMParser()
        .parseFromString(
            html,
            'text/html'
        );
}
```

Uso:

```javascript
const html =
    await carregarPagina('URL_OBSERVADA');

const doc =
    converterParaDOM(html);

const empenho =
    textoDe('.empenho', doc);

console.log(empenho);
```

---

## Passo 8 — Monte um userscript mínimo

```javascript
// ==UserScript==
// @name         Meu teste local no SEI
// @version      0.0.1
// @description  Exemplo experimental
// @match        https://SEU-SEI-AQUI/*
// ==/UserScript==

(function () {
    'use strict';

    function textoDe(selector, doc = document) {
        return doc
            .querySelector(selector)
            ?.textContent
            ?.trim() ?? null;
    }

    const processo =
        textoDe('.numero-processo');

    console.log({
        processo
    });
})();
```

---

## Passo 9 — Teste em casos diferentes

Use pelo menos:

```text
caso A
informação existe
```

```text
caso B
informação não existe
```

```text
caso C
há mais de um resultado possível
```

---

## Resultado esperado

Ao final, você deve ter entendido a transição:

```text
teste no Console
↓
seletor confiável
↓
função pequena
↓
teste em vários casos
↓
userscript
```

---

## Desafio extra

Crie uma função:

```javascript
function listarTextos(selector, doc = document) {
    return [...doc.querySelectorAll(selector)]
        .map(el => el.textContent.trim())
        .filter(Boolean);
}
```

E teste:

```javascript
console.table(
    listarTextos('a')
);
```

Depois adapte para algum grupo de elementos relevante no seu ambiente.
