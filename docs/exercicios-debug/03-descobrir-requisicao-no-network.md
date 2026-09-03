# Exercício 3 — Descobrir uma requisição no Network

## Problema

Você executa uma ação no SEI, como:

```text
abrir Histórico
abrir documento
abrir árvore
abrir modal
```

e quer descobrir qual requisição foi realizada pelo navegador.

## Objetivo

Aprender a:

- usar a aba Network;
- identificar requests;
- observar URL;
- identificar método;
- observar parâmetros;
- observar payload;
- observar response;
- comparar duas ações semelhantes.

---

## Passo 1 — Abra o Network

Abra:

```text
Ferramentas do Desenvolvedor
→ Network / Rede
```

---

## Passo 2 — Limpe a lista

Antes do teste, limpe as requisições anteriores.

Depois execute apenas uma ação.

Exemplo:

```text
clicar em Histórico
```

---

## Passo 3 — Observe as novas requisições

Procure uma linha que pareça relacionada à ação.

Exemplo sintético:

```text
controlador.php?acao=historico_visualizar&id_procedimento=123
```

Clique nela.

---

## Passo 4 — Veja os Headers

Procure:

```text
Request URL
Request Method
Status Code
```

Exemplo:

```text
Request URL:
https://sei.exemplo.invalid/controlador.php?acao=historico_visualizar&id_procedimento=123

Request Method:
GET

Status Code:
200
```

---

## Passo 5 — Veja os parâmetros

Pode existir:

```text
Query String Parameters
```

Exemplo:

```text
acao=historico_visualizar
id_procedimento=123
```

Se for POST, procure:

```text
Payload
```

ou:

```text
Form Data
```

---

## Passo 6 — Veja a Response

Abra:

```text
Response
```

Pode vir:

```text
HTML
JSON
texto
PDF
outro conteúdo
```

Se for HTML, procure algum texto que você reconheça na interface.

---

## Passo 7 — Repita em outro processo

Faça a mesma ação em outro processo.

Exemplo:

```text
PROCESSO A
acao=historico_visualizar
id_procedimento=123
```

```text
PROCESSO B
acao=historico_visualizar
id_procedimento=456
```

Pergunte:

```text
o que permaneceu?
o que mudou?
```

---

## Passo 8 — Monte uma pequena hipótese

Exemplo:

```text
acao=historico_visualizar
```

parece permanecer constante.

Já:

```text
id_procedimento
```

parece variar conforme o processo.

Essa hipótese ainda deve ser testada em outros casos.

---

## Resultado esperado

Ao final, você deve conseguir registrar:

```text
Ação manual:
____________________

Request observada:
____________________

Método:
____________________

Parâmetros:
____________________

Payload:
____________________

Tipo de response:
____________________
```

---

## Desafio extra

Repita o exercício para:

```text
abrir documento
```

e compare duas requests.

Exemplo sintético:

```text
acao=documento_visualizar
id_documento=1001
```

```text
acao=documento_visualizar
id_documento=1002
```
