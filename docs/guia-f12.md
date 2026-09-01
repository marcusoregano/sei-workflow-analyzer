# Guia prático: usando o F12 para entender o SEI

Este guia ensina uma forma de investigar o comportamento da interface do SEI observando o que o próprio navegador recebe.

## 1. Abra as Ferramentas do Desenvolvedor

Com o SEI aberto, pressione:

```text
F12
```

ou:

```text
Ctrl + Shift + I
```

As quatro abas mais importantes são:

```text
Elements
Console
Network
Sources
```

## 2. Elements: descubra onde a informação está

Use **Elements / Elementos** quando quiser saber de onde vem algo visível na tela.

Use:

```text
Ctrl + Shift + C
```

e clique no elemento.

Observe:

- `id`;
- `class`;
- `href`;
- atributos `data-*`;
- estrutura dos elementos pais;
- texto exibido.

Procure o menor elemento estável que identifica a informação.

## 3. Console: faça experiências pequenas

Comece com:

```javascript
document.title
```

Depois:

```javascript
location.href
```

Depois:

```javascript
document.querySelector('a')
```

ou:

```javascript
[...document.querySelectorAll('a')]
    .map(a => a.textContent.trim())
```

O objetivo nessa fase é responder perguntas pequenas.

## 4. Use `console.log()` e `console.table()`

Exemplo:

```javascript
const links = [...document.querySelectorAll('a')]
    .map(a => ({
        texto: a.textContent.trim(),
        href: a.href
    }));

console.table(links);
```

## 5. Network: descubra o que acontece quando você clica

Abra **Network / Rede** e execute uma ação manual no SEI, por exemplo:

```text
abrir um processo
abrir o histórico
abrir a árvore
abrir um documento
trocar de página
```

Observe quais requisições aparecem.

Você pode filtrar por termos como:

```text
controlador
procedimento
documento
arvore
historico
```

Os nomes e parâmetros podem variar conforme a instalação e a versão.

## 6. Separe aquisição de interpretação

Uma função pode apenas obter HTML:

```javascript
async function obterHtml(url) {
    const resposta = await fetch(url, {
        credentials: 'same-origin'
    });

    if (!resposta.ok) {
        throw new Error(`HTTP ${resposta.status}`);
    }

    return resposta.text();
}
```

Outra função interpreta:

```javascript
function extrairAlgumaInformacao(html) {
    const doc = new DOMParser().parseFromString(
        html,
        'text/html'
    );

    // procurar apenas o que interessa
}
```

## 7. DOMParser

Quando você recebe HTML como texto:

```javascript
const doc = new DOMParser().parseFromString(
    html,
    'text/html'
);
```

Depois pode usar:

```javascript
doc.querySelector(...)
doc.querySelectorAll(...)
```

## 8. Normalize textos antes de comparar

```javascript
function normalizarTexto(valor) {
    return String(valor || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toUpperCase();
}
```

## 9. Transforme observações em funções pequenas

Prefira funções como:

```text
extrairDocumentosDaArvore()
extrairUnidadesAbertas()
extrairHistorico()
normalizarUnidade()
calcularTempo()
classificarFluxo()
```

## 10. Monte casos de regressão

Quando um caso for classificado errado, não corrija apenas aquele processo.

Descubra a condição que diferencia o caso e crie um teste sintético.

## 11. Use exemplos sintéticos

Exemplo:

```javascript
const processo = {
    numero: 'PROCESSO_EXEMPLO_001',
    unidade: 'ORG/FIN/PLANEJAMENTO',
    credor: 'FORNECEDOR_FICTICIO_A'
};
```

O exemplo deve reproduzir a **estrutura**, não a identidade do caso real.

## 12. Cuidado especial com Network

A aba Network pode exibir cookies, tokens, IDs internos, URLs assinadas e conteúdo de documentos.

Antes de compartilhar qualquer requisição:

1. revise;
2. remova dados reais;
3. remova autenticação;
4. remova tokens;
5. substitua identificadores.

## 13. Método recomendado

```text
1. executar manualmente
2. observar no F12
3. localizar a origem do dado
4. copiar apenas uma amostra anonimizada
5. testar no Console
6. transformar em função
7. testar novamente
8. documentar
9. integrar
```
