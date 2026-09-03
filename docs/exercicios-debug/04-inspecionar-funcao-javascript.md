# Exercício 4 — Inspecionar uma função JavaScript já carregada

## Problema

Uma ação da interface abre um modal, muda um painel ou dispara algum comportamento.

Você quer descobrir se existe uma função JavaScript já carregada pela página envolvida nessa ação.

## Objetivo

Aprender a:

- testar se um objeto existe;
- listar propriedades;
- testar tipos;
- inspecionar uma função;
- interpretar parâmetros;
- formular hipóteses a partir do código cliente.

---

## Passo 1 — Teste um objeto conhecido

Exemplo:

```javascript
$.modalLink
```

Se existir, o Console deve retornar algum objeto ou função.

---

## Passo 2 — Veja o tipo

```javascript
typeof $.modalLink
```

Possíveis resultados:

```text
"object"
```

ou:

```text
"function"
```

---

## Passo 3 — Liste as propriedades

```javascript
Object.keys($.modalLink)
```

Pode aparecer algo como:

```text
["open"]
```

---

## Passo 4 — Inspecione a propriedade

```javascript
$.modalLink.open
```

Depois:

```javascript
typeof $.modalLink.open
```

Se retornar:

```text
"function"
```

já sabemos que `open` é uma função.

---

## Passo 5 — Tente ver a função como texto

```javascript
$.modalLink.open.toString()
```

Ou:

```javascript
console.log(
    $.modalLink.open.toString()
);
```

Pode surgir algo semelhante a:

```javascript
function(url, options) {
    ...
}
```

---

## Passo 6 — Interprete apenas o que aparece

Nesse exemplo:

```text
url
options
```

são nomes de parâmetros.

Uma hipótese simples:

```text
a função recebe uma URL
e um conjunto de opções
```

Não é necessário entender a função inteira.

---

## Passo 7 — Descubra outras propriedades

Se o objeto tiver várias chaves:

```javascript
Object.keys($.modalLink)
```

você pode testar uma por uma:

```javascript
typeof $.modalLink.algumaPropriedade
```

---

## Passo 8 — Relacione com a ação visual

Faça uma ação manual.

Exemplo:

```text
abrir Acompanhamento
```

Pergunte:

```text
a função parece participar da abertura?
ela recebe URL?
ela recebe opções?
aparece uma request logo depois?
```

A investigação pode seguir:

```text
ação visual
↓
função JavaScript
↓
URL
↓
request
↓
response
↓
DOM criado/alterado
```

---

## Resultado esperado

Ao final, você deve conseguir responder:

```text
Existe uma função cliente envolvida?
Qual é o nome?
Quais parâmetros aparecem?
Ela parece disparar uma URL?
Qual request surge depois?
```

---

## Desafio extra

Escolha outra função visível em `Sources` ou no Console e tente:

```javascript
typeof nomeDaFuncao
```

Depois:

```javascript
nomeDaFuncao.toString()
```

Sempre faça isso apenas para inspeção e entendimento do comportamento cliente.
