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

---

## Caso didático consolidado — Sacolão Vila das Frutas

Para tornar a lógica do script compreensível sem expor o ambiente operacional real, o repositório usa abaixo um fluxo totalmente fictício de um Sacolão Municipal. As tabelas preservam a ideia do motor de regras, mas substituem unidades, documentos, processos, fontes, ordens e exemplos por equivalentes didáticos.

Este documento converte a planilha de lógica em uma leitura contínua para GitHub.

**Todo o universo operacional abaixo é fictício.** A lógica técnica foi preservada, mas nomes, siglas, unidades, processos, documentos, ordens, contas, valores e exemplos foram substituídos por um cenário de Sacolão Municipal.

## Universo fictício

| Sigla | Significado didático |
| --- | --- |
| `SAC/ADM` | Administração do Sacolão |
| `SAC/COORD` | Coordenação de Abastecimento |
| `SAC/CONF` | Conferência de Preços e Documentos |
| `SAC/FIN` | Financeiro do Sacolão |
| `SAC/PAG` | Pagamentos |
| `SAC/FISC` | Fiscalização de Entregas |
| `NQ` | Núcleo de Qualidade |
| `CDF` | Central de Documentos do Fornecedor |
| `CENTRAL/LOG` | Central de Logística |
| `CENTRAL/PAG` | Central de Pagamentos |
| `TCA` | Termo de Conferência de Abastecimento |
| `GLP` | Guia de Liberação de Pagamento |
| `LS` | Laudo Sanitário |
| `RQ` | Registro de Qualidade |
| `OC` | Ordem de Compra fictícia |
| `CA` | Conta de Abastecimento fictícia |

Empresa fictícia de exemplo:

```text
Hortifruti Exemplo Ltda.
```

Processo fictício de exemplo:

```text
PED-SAC-0001/2026
```

### Tradução conceitual

```text
árvore documental
→ pedidos, relatórios de entrega, laudos, recibos e guias

histórico
→ passagem do pedido entre coordenação, conferência, qualidade e pagamento

motor de regras
→ interpreta em que fase o abastecimento se encontra

resultado
→ informa a providência seguinte ao usuário
```

## Como ler

Para uma primeira leitura:

```text
Visão Geral
→ Mapa Panorâmico
→ Prioridades
→ Regras Atuais
```

Para manutenção:

```text
Lacunas
→ Regras Atuais
→ Nova Regra
```

Para acompanhar a evolução do motor:

```text
Evolução v62-v97
→ Evolução v98-v149
```


---

## Visão Geral

Resumo do motor usando somente o universo fictício do Sacolão.


| Bloco | Estado atual | Quantidade / alcance | Observação |
| --- | --- | --- | --- |
| Processos / coleta | Painel de Abastecimento + Controle de Pedidos SAC/COORD → união sem duplicatas → processo → árvore → histórico | Universo híbrido | Processos só do Controle SAC/COORD ficam em 5ª tabela de auditoria e não entram no PDF |
| Controle SAC/COORD | #tblPedidosFicticios em painel_pedidos_ficticio | Carga atual da unidade | Usado para não perder processos abertos na SAC/COORD fora do grupo selecionado |
| Unidades do Sacolão | SAC/ADM, SAC/COORD, SAC/CONF, SAC/PAG, SAC/FIN | Circuito do Sacolão | SAC/CONF é fase de aferição; não pode receber 'Despachar para aferir' |
| Central de Abastecimento | CENTRAL/PAG, CENTRAL/LOG, CENTRAL/CONF, CDF | 4 unidades principais | GLP e despacho CENTRAL/LOG podem superar retorno CDF antigo |
| Tempos | Gerência SAC/ADM/SAC/COORD + circuito do Sacolão | Maior rodada histórica quando encerrado | Microaberturas administrativas Reabertura/Conclusão ≤15 min são ignoradas |
| Marcadores de abastecimento compartilhado | Fotográfico, Diário de Entregas; confirmação contábil; GLP; despacho CENTRAL/LOG | Forte | Planilha + Conferência Mensal continua marcador fraco/potencial |
| TCA | TCA ou título completo 'Termo de Conferência de Abastecimento para Abastecimento compartilhado...' | Centralizado por helper | 1ª tentativa na NQ sem limite fixo de 5 peças |
| Compra direta precoce | Dicionário + padrões determinísticos de primeira peça | OC/CA conhecidos | Ausência de match nunca prova abastecimento compartilhado |
| Compra de Hortifruti | Sempre genérica quanto ao ordem de compra | Leque 1/2/3/5/8 + 371/372 | Mantém 'Valor expressivo ⚠️' quando > VALOR-FICTÍCIO mil |
| Novos determinísticos | Higienização, refrigeração, pensões, Controle Sanitário, entre outros | CA-FICTÍCIA / CA-FICTÍCIA | CEO: OC-FICTÍCIA CA-FICTÍCIA |
| Arquivamento | Comprovante SAC/PAG forte; 'para arquivamento' em peça CENTRAL; sem novo ciclo posterior | Abastecimento compartilhado e compra direta | Retorno Central de Abastecimento deixa de dominar quando há evidência posterior de encerramento |
| GLP | Título GLP + processo aberto na Central de Abastecimento | Fase final | Status: GLP localizada — possível abastecimento compartilhado à Tesouraria; bloco verde próprio |
| Credor | Feature opcional por chave local | ATIVAR_COLUNA_CREDOR | Desligada por padrão |
| Diagnóstico final | Caso externo ao dicionário. Contactar administrador. | Fallback | Arquivamento enriquecido é status único |
| Versão lógica de referência | 9.9.149 |  | Inclui evolução v9.9.62–v9.9.149. |



---

## Regras Atuais

Catálogo das regras traduzido para situações de abastecimento, entrega, conferência, qualidade e pagamento.


| ID | Nome da regra | Documento / árvore | Unidade atual | Histórico necessário | Tempo | Sinalização gerada | Prioridade | Cor / apresentação | Observação |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Arquivamento provável | Peça de arquivamento; peça CENTRAL com 'para arquivamento'; comprovante/pagamento SAC/PAG sem novo ciclo posterior | Qualquer / sem unidade | Pode usar CDF/SAC/PAG | — | Arquivamento provável 🗂️ | Dominante | Própria | Quando há OC/CA conhecida, vira status único enriquecido |
| 2 | Arquivamento + correspondência | Correspondência determinística/dicionário + arquivamento | Sem unidade aberta | — | — | Arquivamento provável 🗂️ — [família], OC/CA | Dominante | Própria | Não usa separador '·'; evita falso diagnóstico externo |
| 3 | Retorno CDF pendente | Retorno CDF→SACOLÃO sem nova evidência superveniente | SACOLÃO/DIR/SAC/NQ/SAC/ADM etc. | Histórico completo | — | ⚠ Retorno da Central de Abastecimento - Providência pendente na SACOLÃO | Dominante | Alerta | Persiste durante circulação interna |
| 4 | GLP localizada supera retorno | GLP explícita na árvore e processo atualmente aberto na Central de Abastecimento | CENTRAL | — | — | GLP localizada — possível abastecimento compartilhado à Tesouraria | Muito alta | Azul | Leitura por URL assinada real |
| 5 | GLP provável por despacho CENTRAL/LOG | Peça CENTRAL/LOG contém 'processamento' + 'descentralização dos recursos' | CENTRAL | — | — | GLP provável — processamento e descentralização dos recursos no CENTRAL/LOG | Muito alta | Roxo | Vale abastecimento compartilhado e compra direta |
| 6 | Conferência Mensal zerada | Leitura interna de candidatos; contexto de conferência mensal + valor zero | Qualquer | — | — | Conferência Mensal zerada 0️⃣ | Muito alta | #FF8300 | Potencial abastecimento compartilhado recebe aviso de conferir CA na OC/NL |
| 7 | Providência na fiscalização do Sacolão | Unidade técnica atual; última remessa veio de SAC/COORD/SAC/CONF | Fiscalização do Sacolão | Histórico | — | Providência na fiscalização do Sacolão | Muito alta | Amarelo | Ação utilizável mesmo em potencial abastecimento compartilhado |
| 8 | Retomar aferição | Correção técnica após aferição, sem Relatório de Conferência de Preço; retorno direto ou via SAC/ADM | SAC/COORD | Histórico SAC/COORD/SAC/CONF→técnica→[SAC/ADM]→SAC/COORD | — | Retomar aferição | Muito alta | Amarelo | Não exige nº mínimo de peças |
| 9 | Despachar para conferência de preço | Abastecimento compartilhado forte/potencial sem alíquota; proibido se aberto em SAC/CONF | SAC/ADM/SAC/COORD | — | — | Despachar para conferência de preço | Muito alta | #FF0049 | Retenção literal ou SN+(Mapa de Preços/Comprovante Fiscal) |
| 10 | Conferir preço | Despacho de conferência mensal/fluxo inicial; sem evidência de aferição concluída | SAC/ADM / SAC/COORD | DIR/SAC→SAC/ADM quando necessário | — | Conferir preço | Alta | Normal | Marcador fraco; não confirma abastecimento compartilhado |
| 11 | Conferindo preço | Aberto SAC/CONF + indício/abastecimento compartilhado | SAC/CONF | — | — | Conferindo preço | Base | — | Categorias: SN, Mapa de Preços, Comprovante Fiscal, Relatório de Conferência de Preço |
| 12 | Pré-NQ | Abastecimento compartilhado + retorno SAC/CONF→SAC/COORD + tributário concluído | SAC/COORD | SAC/CONF→SAC/COORD | — | Pré-NQ: NL, Ofício, TCA, assinaturas 📝 | Alta | Roxo | Sem limite rígido de 5 peças; NL/CPFGF/ofício não quebram sequência |
| 13 | Potencial abastecimento compartilhado | Planilha + Conferência Mensal sem marcador forte | SAC/ADM | — | — | Potencial abastecimento compartilhado (conferir CA na OC e/ou NL) | Normal | Roxo | — |
| 14 | Marcador forte de abastecimento compartilhado | Fotográfico/Diário; ou aferição + ≥2 categorias típicas SAC/CONF | — | — | — | Flag interna | Alta | Vermelho legado | Prioridade acima de pagamento pendente |
| 15 | Primeira tentativa de TCA na NQ | 1 TCA posterior ao marco tributário, sem novo ciclo incompatível | Somente NQ | Sequência | — | Na NQ, 1ª tentativa de TCA... | Muito alta | Laranja / vermelho | Abastecimento compartilhado confirmado bloqueia |
| 16 | Mais de um TCA na NQ | 2+ TCAs | Somente NQ | — | — | TCA provavelmente sendo lapidado | Muito alta | Verde/teal | Comprovante SN não conta |
| 17 | Cumprindo TCA | TCA real + já passou pela NQ | Unidades SAC/ADM | Histórico NQ | — | Cumprindo TCA | Muito alta | Vermelho | — |
| 18 | Pagamento pendente | Compra direta sem comprovante; cobrança/autorização/boleto | SAC/ADM/SAC/COORD/SAC/PAG | Contextual | <7 / >7 | Pagamento pendente | Muito alta | Laranja <7 / vermelho >7 | Ao ter comprovante deixa de usar 'Pendente' |
| 19 | Comprovante SAC/PAG forte | Comprovante/Pagamento produzido pela SAC/PAG | Qualquer | Novo ciclo posterior | — | Pode promover para Arquivamento provável | Muito alta | Laranja/vermelho | Ignora art. jurídico |
| 20 | Concluído sem comprovante | Pagamento pendente inferido e nenhuma unidade aberta | Sem unidade | — | — | Concluído sem comprovante de pagamento ⚠️ | Muito alta | Laranja/vermelho | — |
| 21 | Compra direta por OC/CA conhecida | Correspondência forte com dicionário/padrão determinístico | Qualquer | — | Circuito do Sacolão se aberto | Pendente — [família], OC/CA (tempo) | Muito alta | Laranja/vermelho | Base CA-FICTÍCIA |
| 22 | Compra de Hortifruti sempre genérica | Compra de Hortifruti mensal/suplementar/pensão/CAETE/EMBALAGENS e dicionário de compra de hortifruti | Qualquer | — | — | Pendente — HORTICAUTI, OC-FICTÍCIA, 2, 3, 5 ou OC-FICTÍCIA, CA-FICTÍCIA ou CA-FICTÍCIA — EMBALAGENS/CAETE, OC-FICTÍCIA, CA-FICTÍCIA | Muito alta | Laranja/vermelho | — |
| 23 | Valor expressivo compra de hortifruti | Maior valor identificado > VALOR-FICTÍCIO mil | Qualquer | — | acima do LIMITE-DIDÁTICO | Acrescenta Valor expressivo ⚠️ | Muito alta | Laranja/vermelho | — |
| 24 | LS técnica → OC-FICTÍCIA | Contexto técnico VIGILÂNCIA SANITÁRIA/LS | Qualquer | — | — | Pendente — LS, OC-FICTÍCIA, CA-FICTÍCIA | Muito alta | Laranja/vermelho | Correspondência determinística |
| 25 | RQ técnica → OC-FICTÍCIA | Contexto técnico CONTROLE DE QUALIDADE/RQ | Qualquer | — | — | Pendente — RQ, OC-FICTÍCIA, CA-FICTÍCIA | Muito alta | Vermelho | Substitui regra genérica compra de hortifruti/ROMAOCIO quando match OC-FICTÍCIA existe |
| 26 | Sistema de Caixa → OC-FICTÍCIA | SISTEMA HORTI/W EMDIR/SACAS TELECOM/link internet | Qualquer | — | — | Pendente — SISTEMA DE CAIXA, OC-FICTÍCIA, CA-FICTÍCIA | Muito alta | Vermelho | CAETE + consignado também aceito pelo contexto |
| 27 | Câmara Fria → OC-FICTÍCIA | CAIOCERTO/CAIOCERTO/energia elétrica | Qualquer | — | — | Pendente — CÂMARA CAIA, OC-FICTÍCIA, CA-FICTÍCIA | Alta | Vermelho | Fallback do padrão mensal |
| 28 | Higienização → OC-FICTÍCIA | Padrão de água/esgoto na árvore | Qualquer | — | — | Pendente — HIGIENIZAÇÃO, OC-FICTÍCIA, CA-FICTÍCIA | Base | — | Snapshot até 21/OC-FICTÍCIA |
| 29 | Transporte Refrigerado estagiários → OC-FICTÍCIA | Transporte Refrigerado + estagiários/Porto/apólice/vidas | Qualquer | — | — | Pendente — TRANSPORTE RECAIGERADO, OC-FICTÍCIA, CA-FICTÍCIA | Proteção | — | Reconhecimento LS exige contexto técnico |
| 30 | Câmara Fria → OC-FICTÍCIA | Câmara Fria/ar condicionado + manutenção preventiva/corretiva | Qualquer | — | — | Pendente — CÂMARA CAIA, OC-FICTÍCIA, CA-FICTÍCIA | Alta | Verde/teal | — |
| 31 | Controle Sanitário → OC-FICTÍCIA | SAC/ADM/SAC/ADM-PESSOAS + CEO/Centro de Educação Ocupacional + saúde/medicina ocupacional | Qualquer | — | — | Pendente — CEO - SAÚDE OCUPNQONAL, OC-FICTÍCIA, CA-FICTÍCIA | Normal | Verde/teal | — |
| 32 | Taxas de Feira → OC-FICTÍCIA | Tributos próprios > VALOR-FICTÍCIO mil | Qualquer | — | — | Pendente — OC-FICTÍCIA, CA-FICTÍCIA | Residual | Amarelo escuro | Diretoria inclui tempo acumulado |
| 33 | Parcelamento CAETE | Contexto de parcelamento CAETE | Qualquer | — | — | Compra de Hortifruti com leque genérico de ordens de compra/fontes | Base | Cabeçalho amarelo | — |
| 34 | Circuito gerencial SAC/ADM/SAC/COORD | Maior rodada histórica; ignora pares administrativos curtos | SAC/ADM/SAC/COORD | Histórico | Acumulado | Em SAC/ADM/SAC/COORD desde / Tempo em SAC/ADM/SAC/COORD | Base | Cabeçalho amarelo | Só zera ao sair de todas as unidades do Sacolão |
| 35 | Circuito do Sacolão completo | Maior rodada histórica; SAC/ADM/SAC/COORD/SAC/CONF/SAC/PAG/SAC/FIN | SAC/ADM | Histórico | Contínuo | Em unidade da SAC/ADM desde / Em trabalho por | Diagnóstico | Roxo | Arquivamento enriquecido é protegido e não cai aqui |
| 36 | Microabertura administrativa | Reabertura+Conclusão mesma unidade ≤15 min, sem remessa | SAC/ADM/SAC/COORD | Histórico | ≤15 min | Ignorada nos tempos | Experimental | Padrão | Mantidas para exploração |
| 37 | Carga atual SAC/COORD | Texto singular/plural 'Processo aberto...' e Controle de Pedidos | SAC/COORD | — | — | Fonte de verdade da abertura atual |  |  |  |
| 38 | Universo híbrido | Acompanhamento selecionado + Controle SAC/COORD, sem duplicatas | Modal | — | — | Mantém cobertura do grupo e auditoria de processos fora do grupo |  |  |  |
| 39 | 5ª tabela auditoria | Processo veio só do Controle SAC/COORD e está aberto na SAC/COORD | Modal | — | — | Fora do grupo de acompanhamento selecionado. Aberto em SAC/COORD |  |  |  |
| 40 | Bloco verde GLP | Status exato GLP localizada | Modal/PDF | — | — | Abastecimento compartilhado em fase final / Tesouraria |  |  |  |
| 41 | Numeração local por tabela | Cada tbody conta suas próprias linhas | Modal | — | — | 1,2,3... em cada tabela |  |  |  |
| 42 | PDF operacional | Exclui arquivados e 5ª tabela de auditoria | PDF | — | — | Ativos SAC/COORD / fora SAC/COORD / bloco verde GLP |  |  |  |
| 43 | Caso externo ao dicionário | Resultado vazio/traço/anomalia | Qualquer | Resultado final | — | Caso externo ao dicionário. Contactar administrador. |  |  |  |
| 44 | Sementes administrativas | Contratação/Reajuste/Prorrogação/Aditivo/Reequilíbrio | Fallback | — | — | Provável ... (em desenvolvimento) |  |  |  |



---

## Lacunas

Riscos e pontos de manutenção convertidos para exemplos didáticos, sem referências à estrutura operacional real.


| ID | Situação observada | Por que ainda é delicada | Possível caminho | Prioridade | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Novos ordens de compra 2026 | A base determinística fica desatualizada ao longo do ano | Atualizar dicionário sempre que novos OCs relevantes forem emitidos | Alta | Aberto |
| 2 | Fonte/OC pode mudar entre exercícios/suplementações | Mesmo objeto pode migrar de ordem de compra/fonte | Usar associação positiva; nunca ausência como prova de abastecimento compartilhado | Muito alta | Regra de proteção |
| 3 | Compra de Hortifruti muda de ordem de compra/fonte | A gerente pediu para não apostar o ordem de compra | Manter leque genérico e apenas sinalizar valor expressivo | Muito alta | Implementado v9.9.145 |
| 4 | Retorno CDF pode ficar obsoleto | Eventos posteriores na Central de Abastecimento mudam o estado real | GLP/arquivamento/comprovante devem superar retorno antigo | Muito alta | Mitigado v148-v149 |
| 5 | Despacho CENTRAL/LOG sem GLP visível | Árvore pode não expandir a peça GLP | Usar 'processamento + descentralização dos recursos' como sinal subsidiário | Alta | Implementado v9.9.149 |
| 6 | Microaberturas administrativas | Reabertura/Conclusão de minutos distorciam tempos históricos | Ignorar par simétrico ≤15 min sem remessa | Alta | Implementado v122-v123 |
| 7 | Maior rodada histórica | Última rodada curta podia esconder rodada principal de dias | Guardar maior rodada histórica para colunas de tempo | Alta | Implementado v139 |
| 8 | Controle SAC/COORD x Acompanhamento | Grupo selecionado pode não conter toda a carga da unidade | Universo híbrido e 5ª tabela de auditoria | Muito alta | Implementado v141-v142 |
| 9 | Árvore com pastas recolhidas | Pode ocultar peças | Expansão auxiliar não destrutiva | Muito alta | Mitigado |
| 10 | Mudança estrutural do SEI | DOM/URLs/histórico podem mudar | Logs, fallbacks e testes reais | Muito alta | Risco permanente |
| 11 | Leitura interna adicional | Regras semânticas CENTRAL/CENTRAL/LOG aumentam fetches | Limitar candidatas e leitura seletiva | Média | Controlado |
| 12 | Correspondências futuras CA-FICTÍCIA / CA-FICTÍCIA | Dicionário cresce durante o exercício | Migrar gradualmente para dicionário geral de compra direta | Média | Em evolução |
| 13 | GLP provável é inferência | Despacho CENTRAL/LOG é forte, mas não prova sozinho que título GLP foi lido | Manter texto 'GLP provável' quando a GLP explícita não aparecer | Média | Proteção implementada |
| 14 | Controle SAC/COORD depende de link assinado | Mudança no menu/URL pode impedir fetch silencioso | Fallback para Acompanhamento e log de erro | Média | Mitigado |



---

## Prioridades

Ordem em que os estados fictícios prevalecem quando mais de uma condição é verdadeira.


| Ordem | Regra / grupo | Comportamento | Observação |
| --- | --- | --- | --- |
| 1 | Arquivamento provável / enriquecido | Dominante | Inclui 'para arquivamento' CENTRAL e comprovante SAC/PAG sem novo ciclo |
| 2 | GLP localizada em processo aberto na Central de Abastecimento | Dominante sobre retorno CDF | Evento superveniente; bloco verde |
| 3 | GLP provável por despacho CENTRAL/LOG | Muito alta | Processamento + descentralização dos recursos |
| 4 | Retorno CDF pendente | Dominante residual | Só enquanto não houver evidência posterior mais forte |
| 5 | Conferência Mensal zerada | Muito alta | Leitura interna |
| 6 | Correspondência forte OC/CA compra direta | Muito alta | OC/CA conhecida supera heurísticas |
| 7 | Compra de Hortifruti genérica / valor expressivo | Muito alta | Não fixa ordem de compra individual |
| 8 | Providência na fiscalização do Sacolão | Muito alta | Antes das ações genéricas |
| 9 | Retomar aferição | Muito alta | Após correção técnica, inclusive via SAC/ADM |
| 10 | Despachar / Aferir / Conferindo preço | Muito alta | SAC/CONF nunca fica em 'Despachar' |
| 11 | Pré-NQ | Muito alta | Pode operar sobre potencial abastecimento compartilhado |
| 12 | Caso externo NQ→CENTRAL / triagens | Alta diagnóstico | Anomalias específicas |
| 13 | Cumprindo TCA | Alta | Acima de pagamento pendente |
| 14 | Potencial abastecimento compartilhado | Alta | Planilha+Conferência Mensal; conferir CA |
| 15 | Pagamento pendente | Alta | Compra direta sem comprovante |
| 16 | Pagamento provável / comprovante | Alta | Comprovante SAC/PAG pode promover arquivamento |
| 17 | Central de Abastecimento sem sinal específico | Residual | Tempo acumulado |
| 18 | Fluxo atípico / temporal | Residual | Fallback temporal |
| 19 | Sementes administrativas | Experimental | Fallback |
| 20 | Caso externo ao dicionário | Diagnóstico final | Último recurso |



---

## Nova Regra

Modelo para criar uma regra nova usando um caso sintético do Sacolão.


| Campo | Preenchimento / ideia | Exemplo | Obrigatório? | Status | Observações |
| --- | --- | --- | --- | --- | --- |
| Nome da regra |  | Pagamento mensal de nova concessionária | Sim | Rascunho |  |
| Texto da primeira peça |  | Assunto / objeto / palavras raras | Não | Rascunho | Preferir contexto forte |
| OC provável |  | OC-FICTÍCIA | Não | Rascunho | Só declarar OC se houver base conhecida; compra de hortifruti é exceção e permanece genérica |
| Fonte provável |  | CA-FICTÍCIA | Não | Rascunho | Ausência nunca prova abastecimento compartilhado |
| Valor mínimo/máximo |  | > VALOR-FICTÍCIO | Não | Rascunho | Útil para ROMAOCIO/CAETE |
| Marcador de árvore |  | Boleto / Planilha / TCA | Não | Rascunho |  |
| Conteúdo interno necessário? |  | Sim, somente se título não bastar | Não | Rascunho |  |
| Unidade atual |  | SAC/COORD | Não | Rascunho |  |
| Veio de |  | SAC/CONF | Não | Rascunho |  |
| Histórico necessário |  | Sim | Não | Rascunho |  |
| Tempo |  | <7 / >7 / exato | Não | Rascunho |  |
| Sinalização desejada |  | Pendente — correspondência OC... | Sim | Rascunho | Texto único, sem separador que crie status adicional |
| Deve prevalecer? |  | Definir posição em Prioridades | Sim | Rascunho | Definir também quais eventos supervenientes derrubam esta regra |
| Quando termina? |  | Comprovante SAC/PAG / conclusão | Sim | Rascunho | Comprovante SAC/PAG / GLP / 'para arquivamento' / conclusão, conforme o fluxo |
| Risco de falso positivo |  | Baixo / Médio / Alto | Sim | Rascunho | Ex.: LS jurídico |
| Casos positivos de teste |  | NIT-... | Sim | Rascunho |  |
| Casos negativos de teste |  | NIT-... com palavra parecida | Sim | Rascunho | Importante para regressão |
| Resultado esperado |  | Uma única sinalização | Sim | Rascunho |  |



---

## Mapa Panorâmico

Pipeline completo do caso fictício, da entrada do pedido à classificação e à saída.


| Camada | Fonte / dependência | O que é extraído | Regra associada | Saída possível | Prioridade | Risco técnico | Observação |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1. Entrada Acompanhamento | Painel de Abastecimento | Número + URL | Grupo selecionado | Processos do grupo | Base | Alto | Botão fica restrito às telas adequadas |
| 2. Controle SAC/COORD | painel_pedidos_ficticio / #tblPedidosFicticios | Carga atual da SAC/COORD | Universo híbrido | Processos fora do grupo | Base | Médio | União sem duplicatas |
| 3. Unidade atual | Texto 'Processo aberto...' singular/plural | Unidades abertas | Carga/Diretoria | SAC/ADM/Central de Abastecimento/SACOLÃO/fora | Base | Alto | Fonte de verdade para abertura atual |
| 4. Histórico | #tblHistorico | origem/destino/recebimento/conclusão | CDF, tempos, retornos técnicos | Diversas | Alta | Muito alto | Maior rodada histórica + filtro microabertura |
| 5. Árvore | infraArvoreNo + infraArvoreAcao | título, nº SEI, unidade geradora | TCA, abastecimento compartilhado, cobrança, comprovante, GLP | Flags | Variável | Muito alto | ID interno liga ações às peças |
| 6. Pastas | abrir_pastas=1 | mais documentos | Expansão segura | Árvore ampliada | Infra | Muito alto | Só aceita se vierem mais docs |
| 7. Documento interno | Nos[n].src | texto completo | Primeira peça, conferência mensal zero, Central de Abastecimento | Sinais fortes | Muito alta | Muito alto | Nunca fabricar URL |
| 8. Abastecimento compartilhado forte | Fotográfico/Diário/SAC/CONF/GLP | flag abastecimento compartilhado | Alíquota/Pré-NQ/TCA/GLP | Ações de abastecimento compartilhado | Alta | Médio | — |
| 9. Abastecimento compartilhado potencial | Planilha + Conferência Mensal | flag fraca | Mesmas ações + aviso CA | Ação + conferir CA | Alta | Médio | Não confirma abastecimento compartilhado |
| 10. Tributário | SN + NT + ISS + Retenção | conclusão tributária | Aferindo/Pré-NQ | Abastecimento compartilhado | Alta | Médio | SAC/CONF já é fase de aferição |
| 11. Retorno técnico | Histórico + árvore | SAC/COORD/SAC/CONF→técnica→[SAC/ADM]→SAC/COORD | Retomar aferição | Retomar aferição | Muito alta | Médio | Cobre retorno via SAC/ADM |
| 12. Compra direta | Primeira peça + dicionário | OC/CA/família | Pendente/Arquivamento | OC/CA conhecida | Muito alta | Médio | Compra de Hortifruti é genérica |
| 13. Financeiro | Comprovante SAC/PAG | pagamento concluído | Arquivamento | Arquivamento provável | Muito alta | Médio | Exige ausência de novo ciclo posterior |
| 14. Central de Abastecimento / arquivamento | Peça CENTRAL | 'para arquivamento' | Bloqueia retorno pendente | Arquivamento provável | Muito alta | Médio | Leitura seletiva de peças CENTRAL |
| 15. Central de Abastecimento / GLP | Título GLP + despacho CENTRAL/LOG | fase de descentralização | Supera retorno CDF | GLP localizada/provável | Muito alta | Médio | Despacho: processamento + descentralização |
| 16. UI modal | 5 tabelas | roteamento por status/origem | Auditoria visual | Blocos separados | UI | Baixo | Numeração local por tabela |
| 17. PDF | Somente ativos do grupo | 3 blocos ativos | Impressão operacional | SAC/COORD / fora / GLP | UI | Baixo | 5ª tabela não imprime |
| 18. Diagnóstico | resultado final | vazio/traço/anomalia | Fallback | Caso externo ao dicionário | Final | Baixo | — |
| Ordem resumida de prevalência |  |  |  |  |  |  |  |
| Arquivamento → GLP localizada/provável → Retorno Central de Abastecimento → Conferência Mensal zero → OC/CA compra direta/compra de hortifruti → Fiscalização do Sacolão/Retomar aferição → Alíquota/Pré-NQ → TCA → Potencial abastecimento compartilhado → Pagamento → residual → diagnóstico |  |  |  |  |  |  |  |



---

## Dicionário de Compras Diretas

Dicionário didático de compras diretas, usando ordens e contas de abastecimento fictícias.


| OC | CA | Sigla / família | Padrão da primeira peça / árvore | Condição adicional | Status pendente | Status arquivado | Notas |
| --- | --- | --- | --- | --- | --- | --- | --- |
| OC-FICTÍCIA | CA-FICTÍCIA | LS | Pagamento LS; boleto+LS; LS nº; LS fiscalização/orçamento; VIGILÂNCIA SANITÁRIA+LS | Contexto técnico obrigatório | Pendente — LS, OC-FICTÍCIA, CA-FICTÍCIA (tempo) | Arquivamento provável 🗂️ — LS, OC-FICTÍCIA, CA-FICTÍCIA | Ignora art. jurídico |
| OC-FICTÍCIA | CA-FICTÍCIA | RQ | Pagamento RQ; boleto+RQ; RQ nº; CONTROLE DE QUALIDADE+RQ | Contexto técnico | Pendente — RQ, OC-FICTÍCIA, CA-FICTÍCIA (tempo) | Arquivamento provável 🗂️ — RQ, OC-FICTÍCIA, CA-FICTÍCIA | — |
| Genérico | CA-FICTÍCIA / CA-FICTÍCIA / CA-FICTÍCIA | HORTICAUTI / EMBALAGENS / CAETE | Compra de Hortifruti mensal, suplementar, pensão, CAETE, EMBALAGENS/PERDAS ou dicionário de compra de hortifruti | Nunca fixar ordem de compra individual; valor expressivo se >VALOR-FICTÍCIO mil | Pendente — HORTICAUTI, OC-FICTÍCIA, 2, 3, 5 ou OC-FICTÍCIA, CA-FICTÍCIA ou CA-FICTÍCIA — EMBALAGENS/CAETE, OC-FICTÍCIA, CA-FICTÍCIA | Arquivamento provável 🗂️ — HORTICAUTI [leque genérico] | Orientação gerencial v9.9.145 |
| OC-FICTÍCIA | CA-FICTÍCIA | SISTEMA DE CAIXA | SISTEMA HORTI / W EMDIR/SACAS TELECOM; link internet + SAC/UNIDADE-FICTÍCIA/São Lourenço/Almoxarifado | — | Pendente — SISTEMA DE CAIXA, OC-FICTÍCIA, CA-FICTÍCIA (tempo) | Arquivamento provável 🗂️ — SISTEMA DE CAIXA, OC-FICTÍCIA, CA-FICTÍCIA | — |
| OC-FICTÍCIA | CA-FICTÍCIA | CÂMARA CAIA | CAIOCERTO / CAIOCERTO / fornecimento energia elétrica | — | Pendente — CÂMARA CAIA, OC-FICTÍCIA, CA-FICTÍCIA (tempo) | Arquivamento provável 🗂️ — CÂMARA CAIA, OC-FICTÍCIA, CA-FICTÍCIA | — |
| OC-FICTÍCIA | CA-FICTÍCIA | ÁGUA / ESGOTO | Títulos de água/esgoto na árvore | Padrão determinístico de árvore | Pendente — HIGIENIZAÇÃO, OC-FICTÍCIA, CA-FICTÍCIA | Arquivamento provável 🗂️ — HIGIENIZAÇÃO, OC-FICTÍCIA, CA-FICTÍCIA | v9.9.98 |
| OC-FICTÍCIA | CA-FICTÍCIA | TRANSPORTE RECAIGERADO | Pagamento de seguro/seguro de vida + estagiários/Porto Transporte Refrigerado/apólice/vidas | — | Pendente — TRANSPORTE RECAIGERADO, OC-FICTÍCIA, CA-FICTÍCIA (tempo) | Arquivamento provável 🗂️ — TRANSPORTE RECAIGERADO, OC-FICTÍCIA, CA-FICTÍCIA | Transporte Refrigerado de vida dos estagiários |
| OC-FICTÍCIA | CA-FICTÍCIA | TRIBUTOS RECEITAS PRÓPRIAS | Tributos/impostos próprios | Valor >VALOR-FICTÍCIO mil | Pendente — OC-FICTÍCIA, CA-FICTÍCIA - Valor expressivo ⚠️ | Arquivamento provável 🗂️ — OC-FICTÍCIA, CA-FICTÍCIA | v9.9.100 |
| 371 ou OC-FICTÍCIA | CA-FICTÍCIA | HORTICAUTI / EMBALAGENS / CAETE | ROMAOCIO/CAETE Digital/GFD + contexto compra de hortifruti | Não individualiza qual dos dois; valor expressivo se >VALOR-FICTÍCIO mil | Usa texto genérico de HORTICAUTI | Arquivamento provável 🗂️ — HORTICAUTI [leque genérico] | v9.9.145 substituiu aposta única |
| OC-FICTÍCIA | CA-FICTÍCIA | CÂMARA CAIA | Câmara Fria/ar condicionado + manutenção preventiva/corretiva/sistema de refrigeração | Contexto forte | Pendente — CÂMARA CAIA, OC-FICTÍCIA, CA-FICTÍCIA | Arquivamento provável 🗂️ — CÂMARA CAIA, OC-FICTÍCIA, CA-FICTÍCIA | v9.9.133 |
| OC-FICTÍCIA | CA-FICTÍCIA | CEO - SAÚDE OCUPNQONAL | SAC/ADM/SAC/ADM-PESSOAS + CEO/Centro de Educação Ocupacional + Saúde/Medicina Ocupacional/ASO | Primeira peça SAC/ADM-PESSOAS ou SAC/ADM | Pendente — CEO - SAÚDE OCUPNQONAL, OC-FICTÍCIA, CA-FICTÍCIA | Arquivamento provável 🗂️ — CEO - SAÚDE OCUPNQONAL, OC-FICTÍCIA, CA-FICTÍCIA | v9.9.144; regressão 000385 |
| Genérico | — | CESTAS SOCIAIS | Pagamento Pensão / Pensão Vitalícia vinculada à compra de hortifruti | Tratada como compra de hortifruti; não fixa OC-FICTÍCIA | Usa texto genérico de HORTICAUTI | Arquivamento provável 🗂️ — HORTICAUTI [leque genérico] | v9.9.134→145 |
| Genérico | — | PARCELAMENTO CAETE | Parcelamento CAETE | Tratada como compra de hortifruti; sem aposta individual | Usa texto genérico de HORTICAUTI | Arquivamento provável 🗂️ — HORTICAUTI [leque genérico] | v9.9.99→145 |
| Base geral CA-FICTÍCIA | 19 ordens de compra | Várias famílias | Contrato exato; credor compatível; palavras distintivas | Limiar forte no comparador | Pendente — OC X/2026, [SIGLA], CA-FICTÍCIA | Arquivamento provável 🗂️ — [SIGLA], OC X/2026, CA-FICTÍCIA | Snapshot legado 21/OC-FICTÍCIA; complementar com regras novas |



---

## Evolução v62-v97

Histórico técnico das versões, com exemplos operacionais convertidos para o universo fictício.


| Versão | Mudança principal | Impacto |
| --- | --- | --- |
| 9.9.62 | Origem SAC/CONF→SAC/COORD recuperada pelo histórico | Corrige Pré-NQ |
| 9.9.63–64 | XLSX via SheetJS; lazy load; Nome do processo | Exportação |
| 9.9.65 | Pré-NQ aceita conclusão tributária alternativa | SN + NT/ISS |
| 9.9.67 | Conferindo preço simplificado em SAC/CONF | Fluxo abastecimento compartilhado |
| 9.9.68 | Cumprindo TCA acima de pagamento pendente | Prioridade |
| 9.9.69 | Retorno CDF dominante durante circulação interna | Central de Abastecimento |
| 9.9.70–71 | Tempos gerencial vs circuito do Sacolão; pausa em SAC/CONF | Temporização |
| 9.9.72–74 | Reordenação de colunas e cabeçalhos de tempo amarelos | UI |
| 9.9.75 | Título completo de TCA reconhecido | TCA |
| 9.9.76 | Tempo acumulado da Central de Abastecimento | Diretoria |
| 9.9.77–78 | Abastecimento compartilhado forte/fraco; potencial abastecimento compartilhado; pagamento pendente exclusivo compra direta | Classificação |
| 9.9.79 | Providência na fiscalização do Sacolão | Fluxo técnico |
| 9.9.80 | Planilha+Conferência Mensal flexível | Potencial abastecimento compartilhado |
| 9.9.83–84 | Dicionário CA-FICTÍCIA + uso precoce | Compra direta |
| 9.9.85 | TCA NQ por sequência, sem limite de 5 peças | TCA |
| 9.9.86 | LS/RQ compra direta + arquivamento após pagamento | Compra direta |
| 9.9.87 | Potencial abastecimento compartilhado ganha ações + aviso CA OC/NL | Ação operacional |
| 9.9.88 | NQ e fiscalização do Sacolão em roxo | UI |
| 9.9.89–90 | OC/CA determinísticas + siglas + cores pendente | Compra direta/UI |
| 9.9.91 | LS contextual; ignora artigos de lei | Proteção falso positivo |
| 9.9.92 | ROMAOCIO/compra de hortifruti acima do LIMITE-DIDÁTICO | Valor expressivo |
| 9.9.93–94 | Arquivamento enriquecido e tratado como status único | Diagnóstico |
| 9.9.95 | Novo texto do fallback | Caso externo ao dicionário |
| 9.9.96 | Transporte Refrigerado dos estagiários → OC-FICTÍCIA | Dicionário |
| 9.9.97 | ROMAOCIO/CAETE acima do LIMITE-DIDÁTICO → OC-FICTÍCIA CA-FICTÍCIA | Dicionário/valor expressivo |



---

## Evolução v98-v149

Evolução recente do motor com exemplos inteiramente fictícios.


| Versão | Mudança principal | Impacto | Caso / observação | Área |
| --- | --- | --- | --- | --- |
| 9.9.98 | Higienização → OC-FICTÍCIA CA-FICTÍCIA | Novo determinístico | — | Compra direta |
| 9.9.99 | Parcelamento CAETE tratado de forma conservadora | Evita aposta excessiva | Depois absorvido pela regra genérica de compra de hortifruti | Compra de Hortifruti |
| 9.9.100 | Taxas de Feira → OC-FICTÍCIA CA-FICTÍCIA | Novo determinístico | >VALOR-FICTÍCIO mil | Compra direta |
| 9.9.101–102 | Rótulos compactos + cabeçalho agrupado Execução / Diretoria Financeira | Melhora leitura | — | UI |
| 9.9.103–104 | Tempos SAC/ADM/SAC/COORD individualizados + histórico | Evita falso encerramento e preserva duração anterior | — | Tempos |
| 9.9.105–106 | Relatório dividido em 3 tabelas | SAC/COORD / fora SAC/COORD / arquivamento | — | UI |
| 9.9.107–110 | Fallbacks, cores e compra de hortifruti/CAETE ambígua | Mais diagnóstico e conservadorismo | — | Classificação |
| 9.9.111–116 | OC-FICTÍCIA, cores, correspondências e triagem SAC/ADM-PROT→DIR/SAC | Refino de regras | — | Compra direta/triagem |
| 9.9.117 | Abertura residual SAC/COORD pós-pagamento | Arquivamento provável | Comprovante SAC/PAG sem novo ciclo | Arquivamento |
| 9.9.118 | DATI + NQ→DIR/SAC→SAC/ADM[→SAC/COORD] | Conferir preço | — | Abastecimento compartilhado |
| 9.9.119 | Concluído + pagamento provável | Promove a arquivamento | — | Arquivamento |
| 9.9.120 | Providência na fiscalização do Sacolão em laranja | Identidade visual própria | — | UI |
| 9.9.121–123 | Filtro de reabertura/conclusão administrativa curta | Elimina microtempos falsos | Par simétrico ≤15 min | Tempos |
| 9.9.124 | Exceção pontual processo 000115 | Compra direta pago / arquivável | Regressão conhecida | Exceção |
| 9.9.125–128 | PDF só ativos; 2 tabelas ativas; cor em 3 células | PDF operacional | Arquivados fora do PDF | PDF/UI |
| 9.9.129 | Texto conservador para compra de hortifruti | Leque de OCs/CAs | Precursor da regra genérica | Compra de Hortifruti |
| 9.9.130–131 | Detecção robusta de Contratação + texto limpo | Fallback administrativo melhor | — | Administrativo |
| 9.9.132 | Compra de Hortifruti mensal expressiva | Evita cair em OC-FICTÍCIA | >VALOR-FICTÍCIO mil | Compra de Hortifruti |
| 9.9.133 | Câmara Fria → OC-FICTÍCIA CA-FICTÍCIA | Novo determinístico | — | Compra direta |
| 9.9.134–135 | Cestas Sociais pequenas + trava contra OC-FICTÍCIA | Compra de Hortifruti mais conservadora | Depois generalizado v145 | Compra de Hortifruti |
| 9.9.136 | Compra direta conhecido + comprovante SAC/PAG | Arquivamento apesar de abertura residual | Sem novo ciclo posterior | Arquivamento |
| 9.9.137 | GLP localizada em bloco verde próprio | Abastecimento compartilhado em fase final / Tesouraria | Modal e PDF | GLP/UI |
| 9.9.138–140 | Maior rodada histórica + carga atual singular/plural | Corrige microtempos e leitura de abertura SAC/COORD | Maior rodada substitui última rodada curta | Tempos/unidade |
| 9.9.141 | Universo híbrido Acompanhamento + Controle SAC/COORD | Evita omissões da carga real | União sem duplicatas | Coleta |
| 9.9.142 | 5ª tabela de auditoria | Mostra abertos SAC/COORD fora do grupo | Não entra no PDF | UI/auditoria |
| 9.9.143 | Numeração sequencial local por tabela | Facilita contar cada bloco | Começa em 1 em cada tabela | UI |
| 9.9.144 | Controle Sanitário → OC-FICTÍCIA CA-FICTÍCIA | Novo determinístico | Regressão 000385 | Compra direta |
| 9.9.145 | Compra de Hortifruti sempre genérica, sem aposta de ordem de compra | Orientação gerencial | Mantém valor expressivo quando houver | Compra de Hortifruti |
| 9.9.146 | Retomar aferição também via SAC/ADM | Corrige retorno técnico indireto | Regressão 000300 | Abastecimento compartilhado |
| 9.9.147 | SAC/CONF nunca fica em 'Despachar para aferir' | Estado correto: Conferindo preço | Regressão 000370 | Abastecimento compartilhado |
| 9.9.148 | 'para arquivamento' CENTRAL + comprovante SAC/PAG forte | Retorno Central de Abastecimento não domina após encerramento | Regressão 000118 | Arquivamento |
| 9.9.149 | GLP localizada/provável supera retorno Central de Abastecimento | Estado superveniente na CENTRAL | Despacho CENTRAL/LOG: processamento + descentralização; regressão 000228 | GLP/Central de Abastecimento |



---

## Exemplo narrativo: uma entrega mensal

O mesmo universo pode ser usado nos exercícios de DOM, Network e JavaScript:

```text
PED-SAC-0001/2026
Objeto: operação e abastecimento do Sacolão Vila das Frutas
Fornecedor: Hortifruti Exemplo Ltda.

Entrega mensal
   ↓
SAC/FISC confere quantidade e qualidade
   ↓
SAC/CONF confere preços e documentos
   ↓
NQ verifica o TCA
   ↓
CENTRAL/LOG registra a GLP
   ↓
SAC/PAG efetua o pagamento
   ↓
CDF recebe a documentação final
```

Caso haja problema:

```text
entrega
→ divergência de peso
→ SAC/FISC devolve para correção
→ fornecedor apresenta novo relatório
→ conferência é retomada
→ pagamento prossegue
```

A vantagem é que a pessoa consegue estudar a lógica completa sem conhecer nenhum processo, unidade, fornecedor, contrato ou fonte real.

## Relação com os demais documentos

- [`arquitetura.md`](arquitetura.md): mostra **onde** os grandes blocos estão no código.
- [`guia-inspecao-navegador.md`](guia-inspecao-navegador.md): mostra **como descobrir** requests, responses, DOM e iframes.
- [`exercicios-debug/`](exercicios-debug/): transforma essas ideias em pequenos experimentos práticos.

---

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
