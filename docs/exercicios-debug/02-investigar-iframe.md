# Exercício 2 — Investigar um iframe

## Problema

Você vê um conteúdo na tela, mas:

```javascript
document.querySelector(...)
```

não encontra nada.

Uma possibilidade é que o conteúdo esteja dentro de um `iframe`.

## Objetivo

Aprender a:

- localizar iframes;
- identificar o documento interno;
- acessar `contentDocument`;
- pesquisar dentro do DOM do iframe.

---

## Passo 1 — Liste os iframes

No Console:

```javascript
document.querySelectorAll('iframe')
```

Para visualizar melhor:

```javascript
console.table(
    [...document.querySelectorAll('iframe')].map(frame => ({
        id: frame.id,
        name: frame.name,
        src: frame.getAttribute('src')
    }))
);
```

---

## Passo 2 — Pegue um iframe

```javascript
const frame =
    document.querySelector('iframe');

console.log(frame);
```

Aqui:

```text
frame
```

é o elemento `<iframe>` que existe no DOM principal.

---

## Passo 3 — Acesse o documento interno

```javascript
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

---

## Passo 4 — Pesquise dentro do iframe

```javascript
docFrame?.querySelectorAll('a')
```

Ou:

```javascript
console.table(
    [...docFrame.querySelectorAll('a')].map(a => ({
        texto: a.textContent.trim(),
        href: a.getAttribute('href')
    }))
);
```

---

## Passo 5 — Procure um texto

Suponha que você veja:

```text
Despacho
```

dentro do iframe.

Teste:

```javascript
const encontrados =
    [...docFrame.querySelectorAll('body *')]
        .filter(el =>
            el.children.length === 0 &&
            el.textContent.includes('Despacho')
        );

console.log(encontrados);
```

---

## Passo 6 — Compare os dois documentos

Teste:

```javascript
document === docFrame
```

O esperado é:

```text
false
```

Isso ajuda a perceber que são documentos diferentes.

---

## Passo 7 — Veja a estrutura mental

```text
document principal
└── DOM principal
    └── iframe
        └── contentDocument
            └── outro DOM
```

---

## Resultado esperado

Ao final, você deve conseguir responder:

```text
O conteúdo está no DOM principal?
Existe iframe?
Qual iframe contém o conteúdo?
Como acessar o document interno?
```

---

## Desafio extra

Se houver mais de um iframe:

```javascript
const frames =
    [...document.querySelectorAll('iframe')];
```

Liste cada um:

```javascript
frames.forEach((frame, i) => {
    console.log(
        i,
        frame.id,
        frame.name,
        frame.getAttribute('src')
    );
});
```

Tente identificar qual deles contém a informação procurada.
