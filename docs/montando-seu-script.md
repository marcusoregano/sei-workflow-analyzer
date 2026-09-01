# Montando seu próprio script de análise do SEI

Não é necessário começar com milhares de linhas.

## 1. Comece com um userscript mínimo

```javascript
// ==UserScript==
// @name         Meu analisador SEI
// @namespace    exemplo-local
// @version      0.0.1
// @description  Experimento local
// @match        https://SEU-SEI-AQUI/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    console.log('Meu analisador SEI carregou.');
})();
```

## 2. Primeira meta: reconhecer a página

Teste:

```javascript
console.log(location.href);
console.log(document.title);
```

Depois tente identificar se está em:

```text
lista de processos
processo aberto
árvore
documento
histórico
```

## 3. Crie uma camada de leitura

```javascript
function limpar(valor) {
    return String(valor || '')
        .replace(/\s+/g, ' ')
        .trim();
}
```

## 4. Crie uma camada de normalização

```javascript
function normalizar(valor) {
    return String(valor || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toUpperCase();
}
```

## 5. Crie uma camada de aquisição

```javascript
async function obterHtml(url) {
    const resposta = await fetch(url, {
        credentials: 'same-origin'
    });

    if (!resposta.ok) {
        throw new Error(
            `Erro ao obter página: HTTP ${resposta.status}`
        );
    }

    return resposta.text();
}
```

## 6. Crie uma camada de extração

```javascript
function extrairTitulos(html) {
    const doc = new DOMParser().parseFromString(
        html,
        'text/html'
    );

    return [...doc.querySelectorAll('a')]
        .map(a => limpar(a.textContent))
        .filter(Boolean);
}
```

## 7. Só então crie regras

```javascript
function classificarProcesso(dados) {
    if (dados.unidades.length === 0) {
        return 'SEM_UNIDADE';
    }

    if (dados.unidades.length > 1) {
        return 'MULTIPLAS_UNIDADES';
    }

    return 'UNIDADE_UNICA';
}
```

## 8. Separe dado observado de interpretação

Dado observado:

```javascript
{
    unidades: [
        'ORG/FIN/CONTABILIDADE'
    ]
}
```

Interpretação:

```text
Processo em etapa contábil
```

## 9. Não transforme uma hipótese em certeza

Quando o dado não comprovar uma conclusão, prefira termos como:

```text
provável
potencial
indício
```

## 10. Crie prioridades explícitas

Quando várias regras puderem disparar, deixe a prioridade documentada.

## 11. Adicione saída visual apenas depois

Primeiro garanta que:

```javascript
console.log(resultado);
```

está correto.

Só depois crie tabela, modal, cores, exportação ou PDF.

## 12. Registre versões experimentais

Enquanto estiver testando:

```text
0.0.1
0.0.2
0.0.3
```

Reserve `1.0.0` para quando considerar a versão suficientemente validada.

## 13. Crie casos sintéticos

```javascript
const CASOS = [
    {
        nome: 'processo_em_contabilidade',
        entrada: {
            unidades: [
                'ORG/FIN/CONTABILIDADE'
            ]
        },
        esperado: 'CONTABILIDADE'
    }
];
```

## 14. Antes de publicar

Faça uma varredura por:

```text
números de processo
nomes de pessoas
e-mails
contratos
empenhos
fontes
credores
valores
URLs internas
unidades reais
comentários com casos reais
```

## 15. Regra principal

```text
entenda uma pequena parte
→ transforme em código
→ valide
→ documente
→ avance
```

O F12 é a ferramenta de observação.

O script é a formalização do que você aprendeu observando.
