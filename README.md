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
- automações locais com JavaScript e userscripts.

A proposta é simples:

```text
clicar no SEI
→ observar o F12
→ identificar a requisição
→ examinar parâmetros e response
→ localizar a informação no HTML
→ transformar em JavaScript
→ testar
→ incorporar ao script
```

> Este repositório contém um snapshot público anonimizado. Os exemplos devem usar dados sintéticos.

## 1. Comece pela aba Network

Abra o SEI e pressione `F12`. Depois abra `Network / Rede`, limpe as requisições existentes e execute uma ação no SEI.

Exemplos:

```text
abrir processo
abrir documento
abrir árvore
consultar histórico
trocar de unidade
abrir modal
```

Exemplos de formatos que podem surgir:

```text
GET controlador.php?acao=procedimento_trabalhar&id_procedimento=EXEMPLO
GET controlador.php?acao=arvore_visualizar&id_procedimento=EXEMPLO
GET controlador.php?acao=documento_visualizar&id_documento=EXEMPLO
```

Abra uma requisição e examine:

```text
Headers
Payload
Query String Parameters
Form Data
Preview
Response
```

## 2. Examine os parâmetros

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

Repita a mesma ação em dois processos diferentes e compare os parâmetros.

## 3. Examine a response

Em `Network → requisição → Response`, você pode encontrar HTML, JSON, JavaScript, PDF ou texto.

Exemplo de HTML:

```html
<div id="areaProcesso">
    <span class="numero">PROCESSO_EXEMPLO_001</span>
</div>
```

## 4. Teste no Console

```javascript
document.title
location.href
document.querySelector('body')
document.querySelectorAll('a')
```

Para listar links:

```javascript
console.table(
    [...document.querySelectorAll('a')].map(a => ({
        texto: a.textContent.trim(),
        href: a.getAttribute('href')
    }))
);
```

## 5. Liste IDs existentes

```javascript
console.table(
    [...document.querySelectorAll('[id]')].map(el => ({
        tag: el.tagName,
        id: el.id
    }))
);
```

## 6. Liste classes

```javascript
console.table(
    [...document.querySelectorAll('[class]')]
        .slice(0, 200)
        .map(el => ({
            tag: el.tagName,
            classe: el.className
        }))
);
```

## 7. Procure iframes

```javascript
console.table(
    [...document.querySelectorAll('iframe')].map(frame => ({
        id: frame.id,
        name: frame.name,
        src: frame.getAttribute('src')
    }))
);

window.frames.length
```

## 8. Entre em um iframe

```javascript
const frame = document.querySelector('iframe');
const docFrame = frame.contentDocument;

console.table(
    [...docFrame.querySelectorAll('a')].map(a => ({
        texto: a.textContent.trim(),
        href: a.getAttribute('href')
    }))
);
```

## 9. Procure texto no DOM

```javascript
const encontrados = [...document.querySelectorAll('body *')]
    .filter(el =>
        el.children.length === 0 &&
        el.textContent.includes('Histórico')
    );

console.log(encontrados);
console.log(encontrados[0]?.parentElement);
```

## 10. Suba pela árvore do DOM

```javascript
const el = document.querySelector('.algumaClasse');

el.parentElement
el.parentElement?.parentElement
el.closest('table')
el.closest('form')
el.closest('div')
```

## 11. Examine formulários

```javascript
console.table(
    [...document.forms].map(f => ({
        id: f.id,
        name: f.name,
        action: f.action,
        method: f.method
    }))
);
```

Campos:

```javascript
const formulario = document.forms[0];

console.table(
    [...formulario.elements].map(el => ({
        nome: el.name,
        tipo: el.type,
        valor: el.value
    }))
);
```

## 12. Reproduza uma leitura com fetch

Depois de identificar uma URL útil:

```javascript
const resposta = await fetch('URL_OBSERVADA');
const html = await resposta.text();

const parser = new DOMParser();
const doc = parser.parseFromString(html, 'text/html');

console.log(doc);
```

Liste links da response:

```javascript
console.table(
    [...doc.querySelectorAll('a')].map(a => ({
        texto: a.textContent.trim(),
        href: a.getAttribute('href')
    }))
);
```

## 13. Transforme HTML em dados

```javascript
function extrairLinks(doc) {
    return [...doc.querySelectorAll('a')].map(a => ({
        texto: a.textContent.trim(),
        href: a.getAttribute('href')
    }));
}

const links = extrairLinks(doc);
console.table(links);
```

Depois filtre:

```javascript
const linksProcesso = links.filter(item =>
    item.href?.includes('procedimento')
);
```

## 14. Caminho típico de exploração

```text
ação manual
↓
Network
↓
request
↓
parâmetros
↓
payload
↓
response
↓
HTML
↓
iframe
↓
DOM
↓
nós
↓
atributos
↓
extração
↓
função JavaScript
↓
userscript
```

## 15. Ferramentas do F12 mais úteis

### Network

Use para observar GET, POST, query strings, payloads, responses, headers, documentos HTML e arquivos carregados.

### Elements

Use para observar DOM, IDs, classes, atributos, iframes, formulários, tabelas e links.

### Console

Use para testar:

```javascript
document.querySelector(...)
document.querySelectorAll(...)
fetch(...)
DOMParser()
console.log(...)
console.table(...)
```

### Sources

Use para observar JavaScript carregado, funções, arquivos, eventos e comportamentos da interface.

## 16. Estrutura do repositório

```text
src/
    analisador-fluxo-sei.user.js

docs/
    arquitetura.md
    auditoria-anonimizacao.txt
    guia-f12.md
    montando-seu-script.md
    privacidade-e-anonimizacao.md
    proveniencia.md

examples/
    configuracao-exemplo.js
    processos-sinteticos.json
```

## 17. Privacidade

Antes de publicar qualquer saída do F12, revise o conteúdo.

Podem aparecer processos, documentos, unidades, nomes, IDs, URLs, parâmetros, dados de formulários e informações de sessão.

Nunca publique cookies, tokens, credenciais, cabeçalhos de autenticação, parâmetros assinados, URLs autenticadas ou dados reais de processos.

Use exemplos sintéticos.

## 18. Status

Versão pública atual: **v0.1.0**

Status: **experimental**.

## 19. Proveniência

A primeira publicação pública foi derivada da fonte privada experimental:

```text
v0.9.9.145
```

O hash SHA-256 correspondente está registrado em `docs/proveniencia.md`.

## 20. Aviso

Projeto independente de estudo, scraping, RPA e automação local.

Não é um produto oficial do SEI, TRF4 ou de qualquer órgão público.
