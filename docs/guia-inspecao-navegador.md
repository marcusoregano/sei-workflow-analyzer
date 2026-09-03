# Guia prático de inspeção do SEI pelo navegador para áreas financeiras

Este guia foi pensado para quem trabalha com **execução orçamentária, financeira, contratos, empenhos, liquidações, pagamentos, repasses e acompanhamento de processos** e quer entender melhor o que o navegador mostra enquanto utiliza o SEI.

A ideia é avançar aos poucos.

Você não precisa saber programação para começar.

O roteiro é:

```text
1. observar a tela
2. abrir as Ferramentas do Desenvolvedor
3. localizar a ação no Network
4. ver parâmetros e response
5. localizar a mesma informação no HTML
6. testar uma leitura simples no Console
7. só depois transformar isso em script
```

> Os exemplos deste guia são sintéticos. Não publique dados reais de processos, contratos, empenhos, credores, valores, URLs internas, tokens ou informações de sessão.

---

# 1. Primeiro contato com as Ferramentas do Desenvolvedor

Abra o SEI normalmente e abra as **Ferramentas do Desenvolvedor** do navegador.

Atalho comum:

```text
F12
```

Em alguns navegadores também funciona:

```text
Ctrl + Shift + I
```

As quatro áreas que mais interessam neste projeto são:

```text
Network / Rede
Elements / Elementos
Console
Sources / Fontes
```

Para começar, use principalmente:

```text
Network
Elements
Console
```

---

# 2. Um exemplo financeiro simples

Imagine que você esteja com um processo de pagamento aberto.

Na tela você vê algo como:

```text
Processo: PROCESSO_EXEMPLO_001
Assunto: Pagamento de serviços
Unidade atual: ORG/FIN
```

A primeira pergunta prática pode ser:

```text
De onde a página tirou o número do processo?
```

Não tente automatizar nada ainda.

Primeiro localize essa informação na tela.

---

# 3. Encontrando um elemento com o mouse

Abra:

```text
Ferramentas do Desenvolvedor
→ Elements / Elementos
```

Clique no ícone de seleção de elemento.

Normalmente ele aparece como uma seta sobre um quadrado.

Atalho comum:

```text
Ctrl + Shift + C
```

Depois clique, na própria página do SEI, sobre o número do processo.

O navegador deve destacar algo parecido com:

```html
<span class="numero-processo">
    PROCESSO_EXEMPLO_001
</span>
```

ou:

```html
<a id="linkProcesso" href="...">
    PROCESSO_EXEMPLO_001
</a>
```

O formato real pode ser diferente.

O objetivo é reconhecer três coisas:

```text
tag
id ou class
texto
```

Exemplo:

```text
tag: span
class: numero-processo
texto: PROCESSO_EXEMPLO_001
```

---

# 4. Primeiro teste no Console

Abra:

```text
Ferramentas do Desenvolvedor
→ Console
```

Digite:

```javascript
document.title
```

Pressione Enter.

Depois:

```javascript
location.href
```

Isso mostra a página atual.

Agora teste:

```javascript
document.querySelector('body')
```

Isso retorna o elemento principal do documento.

Ainda não estamos procurando nada específico.

Estamos apenas confirmando que o Console consegue enxergar o DOM da página.

---

# 5. Procurando o número do processo

Suponha que, no Elements, você tenha encontrado:

```html
<span class="numero-processo">
    PROCESSO_EXEMPLO_001
</span>
```

No Console:

```javascript
document.querySelector('.numero-processo')
```

Se encontrar o elemento, teste:

```javascript
document.querySelector('.numero-processo').textContent
```

Depois:

```javascript
document.querySelector('.numero-processo').textContent.trim()
```

A saída esperada seria algo como:

```text
PROCESSO_EXEMPLO_001
```

Pronto.

Você acabou de transformar uma informação visível na tela em um dado que o JavaScript consegue ler.

---

# 6. Guardando o resultado em uma variável

Em vez de repetir o comando:

```javascript
const numeroProcesso =
    document.querySelector('.numero-processo')
        ?.textContent
        ?.trim();
```

Depois:

```javascript
console.log(numeroProcesso);
```

Resultado:

```text
PROCESSO_EXEMPLO_001
```

O `?.` ajuda a evitar erro caso o elemento não exista.

---

# 7. Outro exemplo: localizar a unidade atual

Imagine que o HTML contenha:

```html
<span id="unidadeAtual">
    ORG/FIN
</span>
```

No Console:

```javascript
const unidadeAtual =
    document.querySelector('#unidadeAtual')
        ?.textContent
        ?.trim();
```

Depois:

```javascript
console.log(unidadeAtual);
```

Resultado:

```text
ORG/FIN
```

A lógica foi a mesma:

```text
ver na tela
→ localizar no Elements
→ identificar seletor
→ testar no Console
```

---

# 8. Quando há vários elementos parecidos

Suponha que uma tela tenha vários links:

```html
<a href="...">Processo</a>
<a href="...">Histórico</a>
<a href="...">Documentos</a>
<a href="...">Pagamento</a>
```

Use:

```javascript
document.querySelectorAll('a')
```

Isso retorna vários elementos.

Para visualizar melhor:

```javascript
console.table(
    [...document.querySelectorAll('a')].map(a => ({
        texto: a.textContent.trim(),
        href: a.getAttribute('href')
    }))
);
```

O resultado pode parecer com:

| texto | href |
|---|---|
| Processo | controlador.php?... |
| Histórico | controlador.php?... |
| Documentos | controlador.php?... |
| Pagamento | controlador.php?... |

Essa tabela é muito útil para quem está começando.

---

# 9. Procurando apenas links que interessam

Se você quiser links que contenham a palavra `procedimento`:

```javascript
const links = [...document.querySelectorAll('a')];

const encontrados = links.filter(a =>
    a.href.includes('procedimento')
);

console.table(
    encontrados.map(a => ({
        texto: a.textContent.trim(),
        href: a.href
    }))
);
```

A ideia é ir reduzindo o universo.

Primeiro:

```text
todos os links
```

Depois:

```text
links que parecem relacionados ao processo
```

---

# 10. Agora vamos para a aba Network

Abra:

```text
Ferramentas do Desenvolvedor
→ Network / Rede
```

A aba Network mostra requisições realizadas pelo navegador.

Para aprender, faça um teste bem controlado.

Primeiro limpe a lista.

Depois execute apenas uma ação.

Exemplo:

```text
clicar em Histórico
```

Observe quais novas linhas apareceram.

Você pode encontrar algo parecido com:

```text
controlador.php?acao=historico_visualizar&id_procedimento=EXEMPLO
```

Não se preocupe ainda em entender todos os parâmetros.

Clique na requisição.

---

# 11. O que observar em uma requisição

Dentro da requisição, procure:

```text
Headers
Payload
Preview
Response
```

Dependendo do método e do navegador, você também pode encontrar:

```text
Query String Parameters
Form Data
```

Comece por:

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

A URL acima é apenas ilustrativa.

---

# 12. Entendendo parâmetros sem programação

Veja esta URL fictícia:

```text
controlador.php?acao=historico_visualizar&id_procedimento=123
```

Ela contém:

```text
acao=historico_visualizar
```

e:

```text
id_procedimento=123
```

Você pode pensar assim:

```text
ação desejada:
historico_visualizar

registro envolvido:
123
```

Isso ainda não é uma regra definitiva.

É apenas uma observação útil.

---

# 13. Comparando dois processos

Esta é uma das técnicas mais didáticas.

Abra o processo A.

Clique em Histórico.

Anote a requisição.

Depois abra o processo B.

Repita a mesma ação.

Você pode observar:

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

O que mudou?

```text
id_procedimento
```

O que permaneceu?

```text
acao=historico_visualizar
```

Esse tipo de comparação ajuda muito a entender padrões.

---

# 14. Exemplo financeiro: abrir um documento

Imagine um processo com:

```text
Nota de Empenho
Nota Fiscal
Liquidação
Despacho
Ordem de Pagamento
```

Clique em um documento.

No Network, pode aparecer uma requisição parecida com:

```text
controlador.php?acao=documento_visualizar&id_documento=789
```

Agora clique em outro documento.

Pode surgir:

```text
controlador.php?acao=documento_visualizar&id_documento=790
```

Comparação:

```text
acao=documento_visualizar
```

permaneceu igual.

O identificador mudou.

---

# 15. Observando a Response

Clique na requisição e depois em:

```text
Response
```

Você pode encontrar HTML.

Exemplo fictício:

```html
<html>
<body>

<div id="documento">
    <h1>Nota de Empenho</h1>
    <span class="numero">NE_EXEMPLO_001</span>
</div>

</body>
</html>
```

Esse HTML pode ser muito mais útil do que tentar copiar texto visualmente da tela.

---

# 16. Copiando a ideia para o Console

Se a informação já está na página atual:

```javascript
document.querySelector('.numero')?.textContent?.trim()
```

Resultado:

```text
NE_EXEMPLO_001
```

Esse é o padrão básico de scraping do DOM:

```text
encontrar elemento
→ pegar conteúdo
→ limpar conteúdo
```

---

# 17. O que significa DOM

Para uso prático, pense no DOM como uma árvore de elementos.

Exemplo:

```html
<div id="processo">

    <h1>Pagamento</h1>

    <div class="dados">
        <span class="empenho">NE_EXEMPLO_001</span>
        <span class="valor">R$ 10.000,00</span>
    </div>

</div>
```

Estrutura simplificada:

```text
div processo
│
├── h1
│   └── Pagamento
│
└── div dados
    ├── span empenho
    │   └── NE_EXEMPLO_001
    │
    └── span valor
        └── R$ 10.000,00
```

O JavaScript pode navegar por essa estrutura.

---

# 18. Extraindo empenho e valor de um exemplo fictício

```javascript
const empenho =
    document.querySelector('.empenho')
        ?.textContent
        ?.trim();

const valor =
    document.querySelector('.valor')
        ?.textContent
        ?.trim();

console.log(empenho);
console.log(valor);
```

Resultado:

```text
NE_EXEMPLO_001
R$ 10.000,00
```

Ou em tabela:

```javascript
console.table([
    {
        empenho,
        valor
    }
]);
```

---

# 19. Trabalhando com tabelas HTML

Áreas financeiras encontram muitas tabelas.

Exemplo:

```html
<table id="tabelaFinanceira">

<tr>
    <th>Empenho</th>
    <th>Valor</th>
</tr>

<tr>
    <td>NE_EXEMPLO_001</td>
    <td>R$ 10.000,00</td>
</tr>

<tr>
    <td>NE_EXEMPLO_002</td>
    <td>R$ 5.000,00</td>
</tr>

</table>
```

Podemos pegar as linhas:

```javascript
const linhas =
    document.querySelectorAll('#tabelaFinanceira tr');

console.log(linhas);
```

---

# 20. Transformando uma tabela em dados

```javascript
const linhas =
    [...document.querySelectorAll('#tabelaFinanceira tr')];

const dados = linhas
    .slice(1)
    .map(linha => {

        const colunas =
            [...linha.querySelectorAll('td')];

        return {
            empenho: colunas[0]?.textContent.trim(),
            valor: colunas[1]?.textContent.trim()
        };
    });

console.table(dados);
```

Resultado aproximado:

| empenho | valor |
|---|---|
| NE_EXEMPLO_001 | R$ 10.000,00 |
| NE_EXEMPLO_002 | R$ 5.000,00 |

Essa transformação é muito importante para automações financeiras.

---

# 21. Encontrando formulários

Algumas páginas trabalham com formulários HTML.

Liste os formulários:

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

Se houver apenas um formulário:

```javascript
const formulario = document.forms[0];
```

Liste os campos:

```javascript
console.table(
    [...formulario.elements].map(el => ({
        nome: el.name,
        tipo: el.type,
        valor: el.value
    }))
);
```

---

# 22. Payload e Form Data

Se uma ação usa POST, o Network pode mostrar:

```text
Payload
```

ou:

```text
Form Data
```

Exemplo sintético:

```text
acao=consulta_exemplo
id_procedimento=123
tipo_documento=financeiro
```

Antes de automatizar qualquer chamada, observe:

```text
qual ação manual gerou isso?
quais campos mudaram?
quais permaneceram?
o response trouxe o quê?
```

---

# 23. Iframes: por que às vezes querySelector não encontra nada

Você vê um documento na tela.

Mas:

```javascript
document.querySelector('.numero')
```

retorna:

```text
null
```

Uma possibilidade é que o conteúdo esteja dentro de um iframe.

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

---

# 24. Entrando em um iframe

Suponha:

```html
<iframe id="frameDocumento"></iframe>
```

No Console:

```javascript
const frame =
    document.querySelector('#frameDocumento');

const docFrame =
    frame?.contentDocument;

console.log(docFrame);
```

Agora:

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

# 25. Descobrindo tudo que tem ID na página

Uma técnica exploratória útil:

```javascript
console.table(
    [...document.querySelectorAll('[id]')].map(el => ({
        tag: el.tagName,
        id: el.id
    }))
);
```

Isso pode revelar elementos como:

```text
frmProcesso
divArvore
iframeVisualizacao
btnHistorico
tblDocumentos
```

Os nomes reais variam.

---

# 26. Procurando texto quando você não sabe o seletor

Imagine que você vê:

```text
Nota de Liquidação
```

mas não sabe onde está no HTML.

Teste:

```javascript
const encontrados =
    [...document.querySelectorAll('body *')]
        .filter(el =>
            el.children.length === 0 &&
            el.textContent.includes('Nota de Liquidação')
        );

console.log(encontrados);
```

Depois:

```javascript
console.log(encontrados[0]);
```

---

# 27. Subindo para o elemento pai

Depois de encontrar um texto:

```javascript
const el = encontrados[0];
```

Teste:

```javascript
el.parentElement
```

Depois:

```javascript
el.parentElement?.parentElement
```

Ou:

```javascript
el.closest('table')
```

```javascript
el.closest('tr')
```

```javascript
el.closest('form')
```

Isso ajuda a encontrar o bloco completo onde aquela informação está.

---

# 28. Exemplo financeiro: encontrar linha de um empenho

Suponha uma tabela:

```text
Empenho             Valor
NE_EXEMPLO_001      R$ 10.000,00
NE_EXEMPLO_002      R$ 5.000,00
```

Você quer encontrar apenas:

```text
NE_EXEMPLO_002
```

Teste:

```javascript
const linhas =
    [...document.querySelectorAll('tr')];

const linhaEmpenho =
    linhas.find(tr =>
        tr.textContent.includes('NE_EXEMPLO_002')
    );

console.log(linhaEmpenho);
```

Agora veja as células:

```javascript
console.table(
    [...linhaEmpenho.querySelectorAll('td')]
        .map(td => td.textContent.trim())
);
```

---

# 29. Reproduzindo uma leitura com fetch

Depois de identificar uma URL de leitura no Network, você pode testar:

```javascript
const resposta =
    await fetch('URL_OBSERVADA');

const html =
    await resposta.text();

console.log(html);
```

Use somente URLs de leitura que você compreendeu.

Não copie para exemplos públicos URLs reais do ambiente.

---

# 30. Transformando a response em DOM

```javascript
const parser =
    new DOMParser();

const doc =
    parser.parseFromString(
        html,
        'text/html'
    );

console.log(doc);
```

Agora você pode usar:

```javascript
doc.querySelector(...)
```

e:

```javascript
doc.querySelectorAll(...)
```

como se estivesse trabalhando com a página atual.

---

# 31. Extraindo dados de uma página carregada por fetch

Exemplo fictício:

```javascript
const empenho =
    doc.querySelector('.empenho')
        ?.textContent
        ?.trim();

const valor =
    doc.querySelector('.valor')
        ?.textContent
        ?.trim();

console.table([
    {
        empenho,
        valor
    }
]);
```

---

# 32. Separando aquisição e extração

Uma boa prática é não misturar tudo.

Primeiro:

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
        .parseFromString(html, 'text/html');
}
```

Depois:

```javascript
function extrairEmpenho(doc) {
    return doc
        .querySelector('.empenho')
        ?.textContent
        ?.trim();
}
```

Uso:

```javascript
const html =
    await carregarPagina('URL_OBSERVADA');

const doc =
    converterParaDOM(html);

const empenho =
    extrairEmpenho(doc);

console.log(empenho);
```

---

# 33. Um pequeno fluxo financeiro completo

Imagine que você queira apenas responder:

```text
Qual empenho aparece nesta página?
```

Caminho:

```text
abrir processo
↓
abrir documento financeiro
↓
Network
↓
identificar request
↓
ver response
↓
localizar empenho no HTML
↓
testar querySelector
↓
criar função extrairEmpenho()
```

Somente depois você pensa em percorrer vários processos.

---

# 34. Não comece com 100 processos

Para aprender, trabalhe nesta ordem:

```text
1 processo
↓
2 processos
↓
3 casos diferentes
↓
10 casos
↓
conjunto maior
```

Primeiro confirme que a regra funciona em situações diferentes.

---

# 35. Três tipos de teste úteis para área financeira

## Caso A — informação existe

Exemplo:

```text
há empenho
```

Resultado esperado:

```text
NE_EXEMPLO_001
```

## Caso B — informação não existe

Exemplo:

```text
processo ainda não chegou à fase de empenho
```

Resultado esperado:

```text
null
```

ou:

```text
Não localizado
```

## Caso C — há mais de uma informação

Exemplo:

```text
dois empenhos
```

Resultado esperado:

```text
[
    "NE_EXEMPLO_001",
    "NE_EXEMPLO_002"
]
```

Esses três casos já evitam muitos erros.

---

# 36. Evite depender apenas do texto visível

Texto pode variar.

Por exemplo:

```text
Nota de Empenho
```

pode aparecer de forma diferente em outra situação.

Quando possível, observe também:

```text
id
class
href
name
action
data-*
estrutura da tabela
posição no DOM
```

Não dependa de um único sinal se houver alternativas mais estáveis.

---

# 37. Exemplo de inspeção de atributos

```javascript
const el =
    document.querySelector('a');

console.table(
    [...el.attributes].map(attr => ({
        atributo: attr.name,
        valor: attr.value
    }))
);
```

Pode aparecer:

| atributo | valor |
|---|---|
| id | linkDocumento |
| class | infraLink |
| href | controlador.php?... |

---

# 38. Network: uma rotina simples de investigação

Sempre que quiser entender uma ação:

```text
1. abrir Network
2. limpar a lista
3. executar uma única ação
4. identificar novas requests
5. abrir a mais provável
6. olhar URL
7. olhar método
8. olhar parâmetros
9. olhar payload
10. olhar response
11. repetir em outro processo
12. comparar
```

Essa rotina vale mais do que tentar adivinhar como a página funciona.

---

# 39. Exemplo prático de comparação

Ação:

```text
abrir documento
```

Caso 1:

```text
acao=documento_visualizar
id_documento=1001
```

Caso 2:

```text
acao=documento_visualizar
id_documento=1002
```

Hipótese útil:

```text
a ação é a mesma
o documento é identificado pelo parâmetro id_documento
```

Depois essa hipótese deve ser testada em outros casos.

---

# 40. Um passo além: criar uma função pequena

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

---

# 41. O resultado já começa a parecer uma rotina financeira

Exemplo sintético:

| processo | empenho | valor |
|---|---|---|
| PROCESSO_EXEMPLO_001 | NE_EXEMPLO_001 | R$ 10.000,00 |

Esse tipo de estrutura pode depois alimentar:

```text
relatórios
sinalizações
listas de conferência
painéis locais
exportação para CSV
validações
```

---

# 42. Antes de transformar em userscript

Confirme primeiro no Console:

```text
o seletor encontra o elemento?
o texto está correto?
há iframe?
a mesma lógica funciona em outro processo?
o resultado continua correto quando a informação não existe?
há mais de um elemento possível?
```

Se ainda houver dúvida, continue nas Ferramentas do Desenvolvedor.

---

# 43. Um userscript mínimo

Somente depois dos testes:

```javascript
// ==UserScript==
// @name         Meu teste local no SEI
// @version      0.0.1
// @description  Exemplo experimental
// @match        https://SEU-SEI-AQUI/*
// ==/UserScript==

(function () {
    'use strict';

    const processo =
        document
            .querySelector('.numero-processo')
            ?.textContent
            ?.trim();

    console.log({
        processo
    });
})();
```

Substitua o endereço apenas no seu ambiente local.

Não publique URLs internas reais.

---

# 44. Regra prática para quem está começando

Não tente fazer isto:

```text
ler processo
+ histórico
+ árvore
+ empenho
+ liquidação
+ pagamento
+ unidade atual
+ classificação
+ relatório
```

de uma só vez.

Faça:

```text
hoje:
ler o número do processo
```

Depois:

```text
ler a unidade
```

Depois:

```text
achar o histórico
```

Depois:

```text
achar um documento
```

Depois:

```text
extrair um dado financeiro
```

Cada pequena descoberta vira uma função.

---

# 45. Checklist de uma descoberta

Antes de considerar uma leitura pronta, anote:

```text
Ação manual:
________________________________

Request observada:
________________________________

Método:
GET / POST / outro

Parâmetros:
________________________________

Payload:
________________________________

Tipo de response:
HTML / JSON / PDF / outro

Elemento encontrado:
________________________________

Seletor testado:
________________________________

Resultado esperado:
________________________________

Casos testados:
________________________________
```

Esse registro torna o desenvolvimento muito mais organizado.

---

# 46. Privacidade durante o uso das Ferramentas do Desenvolvedor

As Ferramentas do Desenvolvedor podem mostrar informações sensíveis.

Antes de copiar qualquer coisa para documentação pública, revise:

```text
número do processo
número de documento
contrato
empenho
credor
fornecedor
valor
unidade
nome
e-mail
URL
IDs internos
dados de formulário
parâmetros
```

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

---

# 47. Resumo do método

Para uma rotina financeira, o caminho mais seguro para aprender é:

```text
pergunta pequena
↓
ação manual
↓
Ferramentas do Desenvolvedor
↓
Network
↓
request
↓
payload / parâmetros
↓
response
↓
Elements
↓
DOM
↓
querySelector
↓
Console
↓
função pequena
↓
teste em outros processos
↓
userscript
```

O importante não é decorar JavaScript.

O importante é aprender a responder, uma pergunta por vez:

```text
onde esta informação aparece?
como o navegador a recebeu?
como localizo esse dado novamente?
como transformo isso em uma leitura confiável?
```
