# Exercício 1 — Encontrar um elemento no DOM

## Problema

Você está vendo uma informação na tela do SEI, por exemplo:

```text
Nota de Empenho
```

e quer descobrir onde esse texto está no HTML/DOM.

## Objetivo

Aprender a:

- localizar elementos;
- procurar texto;
- usar `querySelector`;
- usar `querySelectorAll`;
- ler `textContent`;
- subir para elementos pais com `parentElement` e `closest()`.

---

## Passo 1 — Abra o Console

Abra as Ferramentas do Desenvolvedor do navegador:

```text
F12
```

ou:

```text
Ctrl + Shift + I
```

Depois vá para:

```text
Console
```

---

## Passo 2 — Teste o `document`

Digite:

```javascript
document
```

Pense em `document` como a porta de entrada para o DOM do documento atual.

Agora teste:

```javascript
document.body
```

---

## Passo 3 — Liste alguns elementos

```javascript
document.querySelectorAll('a')
```

Depois:

```javascript
document.querySelectorAll('div')
```

Depois:

```javascript
document.querySelectorAll('span')
```

O objetivo aqui não é entender tudo.

É apenas perceber que o DOM é formado por elementos que podem ser consultados.

---

## Passo 4 — Procurar um texto visível

Suponha que a tela contenha:

```text
Nota de Empenho
```

Teste:

```javascript
const encontrados =
    [...document.querySelectorAll('body *')]
        .filter(el =>
            el.textContent.includes('Nota de Empenho')
        );

console.log(encontrados);
```

Talvez apareçam vários resultados.

Isso acontece porque um `div` pode conter um `span`, e ambos podem herdar o mesmo texto em `textContent`.

---

## Passo 5 — Tentar chegar ao nó mais específico

Use:

```javascript
const encontrados =
    [...document.querySelectorAll('body *')]
        .filter(el =>
            el.children.length === 0 &&
            el.textContent.includes('Nota de Empenho')
        );

console.log(encontrados);
```

Agora a busca tenta ficar apenas com elementos que não possuem outros elementos filhos.

---

## Passo 6 — Inspecione o primeiro resultado

```javascript
const el = encontrados[0];

console.log(el);
```

Depois:

```javascript
console.log(el.tagName);
```

```javascript
console.log(el.id);
```

```javascript
console.log(el.className);
```

```javascript
console.log(el.textContent.trim());
```

---

## Passo 7 — Suba pela árvore do DOM

```javascript
el.parentElement
```

Depois:

```javascript
el.parentElement?.parentElement
```

E tente:

```javascript
el.closest('div')
```

```javascript
el.closest('tr')
```

```javascript
el.closest('table')
```

```javascript
el.closest('form')
```

---

## Passo 8 — Criar um seletor

Se o elemento encontrado tiver:

```html
<span class="descricao-documento">
    Nota de Empenho
</span>
```

teste:

```javascript
document.querySelector('.descricao-documento')
```

Depois:

```javascript
document
    .querySelector('.descricao-documento')
    ?.textContent
    ?.trim();
```

Resultado esperado:

```text
Nota de Empenho
```

---

## Resultado esperado

Ao final, você deve conseguir responder:

```text
Qual elemento contém a informação?
Qual seletor encontra esse elemento?
Qual texto o JavaScript consegue extrair?
```

---

## Desafio extra

Tente encontrar outro texto visível, como:

```text
Liquidação
```

ou:

```text
Pagamento
```

e repita o mesmo processo.

A ideia é praticar:

```text
ver
→ localizar
→ testar
→ extrair
```
