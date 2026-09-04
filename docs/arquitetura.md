# Arquitetura do script

Este documento é um **mapa de navegação do código**.

O objetivo não é explicar cada linha do userscript. A ideia é permitir que uma pessoa abra um arquivo com mais de 15 mil linhas e consiga responder rapidamente:

- onde o script começa;
- onde ficam as configurações;
- onde ocorre a coleta de processos;
- onde são feitas as requisições;
- onde o HTML é transformado em dados;
- onde a árvore documental é interpretada;
- onde o histórico é analisado;
- onde ficam as regras;
- onde o relatório é montado;
- onde ficam exportação, impressão e estilos;
- qual região do arquivo deve ser investigada para cada tipo de problema.

> **Referência de linhas**
>
> O mapa abaixo foi produzido a partir da linhagem técnica **v9.9.146**, com 16.315 linhas.
> A versão pública pode receber anonimizações, comentários ou pequenas alterações que desloquem a numeração.
> Por isso, use as faixas como **mapa de orientação**, e os nomes das funções como referência principal.

---

## 1. O arquivo visto de longe

Em nível alto, o script pode ser imaginado assim:

```text
┌──────────────────────────────────────────────┐
│  1. METADADOS / CONFIGURAÇÃO                 │
│     ~ linhas 1–514                           │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│  2. DETECTORES E BASES AUXILIARES            │
│     ~ linhas 515–2384                        │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│  3. INICIALIZAÇÃO E COLETA                   │
│     ~ linhas 2385–3009                       │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│  4. CONSULTA DO PROCESSO                     │
│     consultarProcesso()                      │
│     ~ linhas 3010–5219                       │
└──────────────────────┬───────────────────────┘
                       │
             ┌─────────┴──────────┐
             ▼                    ▼
┌───────────────────────┐  ┌────────────────────────┐
│ 5. AQUISIÇÃO DE HTML  │  │ 6. ÁRVORE DOCUMENTAL   │
│ ~ 5220–5595           │  │ ~ 5596–9460            │
└───────────┬───────────┘  └────────────┬───────────┘
            │                           │
            └──────────────┬────────────┘
                           ▼
┌──────────────────────────────────────────────┐
│  7. HISTÓRICO E REGRAS TEMPORAIS             │
│     ~ linhas 9461–12242                       │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│  8. MODAL / TABELA / DIAGNÓSTICO             │
│     ~ linhas 12243–13690                      │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│  9. EXPORTAÇÃO / IMPRESSÃO / ESTILOS         │
│     ~ linhas 13691–16195                      │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│ 10. UTILITÁRIOS FINAIS                       │
│    ~ linhas 16196–16315                       │
└──────────────────────────────────────────────┘
```

A cadeia principal é, portanto:

```text
página do SEI
→ coleta
→ consulta
→ HTML
→ DOM temporário
→ árvore + histórico
→ indicadores
→ regras
→ resultado
→ tabela/modal
→ exportação/impressão
```

---

# 2. Mapa real por faixas de linhas

## Bloco A — metadados, privacidade e configuração

**Faixa predominante:** linhas **1–514**

```text
1–10       cabeçalho do userscript
13–42      autoria / licença / identificação
46–146     configuração e orientações de privacidade
151        início da IIFE principal
154–185    grupos de unidades e parâmetros locais
187–510    bases e dicionários auxiliares
```

Esse é o bloco em que o script define **com que parâmetros trabalhará**.

Em termos mentais:

```text
CONFIGURAÇÃO
    ↓
listas
    ↓
dicionários
    ↓
regras auxiliares
```

Se o problema for um parâmetro fixo, lista de unidades, chave de ativação ou base de referência, comece aqui.

---

## Bloco B — detectores e correspondências auxiliares

**Faixa predominante:** linhas **515–2384**

Principais funções:

```text
515–626
detectarArtRrtTecnica()

627–676
rotuloCurtoNaoRepasse()

677–700
tokensFr189950()

701–855
compararComDicionarioFr189950()

856–987
detectarCorrespondenciaAguaEsgotoNaArvore()

988–2384
detectarCorrespondenciaFr189950PrimeiraPeca()
```

Esse bloco pega texto ou sinais documentais e tenta responder perguntas específicas.

A lógica típica é:

```text
texto bruto
→ limpeza
→ regex / palavras
→ comparação
→ evidências
→ resultado estruturado
```

Exemplo mental:

```javascript
const resultado = {
    detectada: true,
    pontos: 100,
    evidencias: [...]
};
```

### Região de atenção

`detectarCorrespondenciaFr189950PrimeiraPeca()` é uma das maiores funções do arquivo.

```text
~ linhas 988–2384
~ 1.400 linhas
```

Ela concentra várias regras de interpretação da primeira peça.

Se uma correspondência documental estiver errada, esta é uma das primeiras regiões a investigar.

---

# 3. Inicialização e descoberta da tela

**Faixa predominante:** linhas **2385–2641**

```text
2385  iniciar()
2397  tentarCriarBotao()
2439  ehTelaAcompanhamento()
2470  localizarBarraAcoes()
2480  localizarTabela()
2490  executar()
```

É a porta de entrada do script.

Fluxo simplificado:

```text
iniciar()
    ↓
confirmar que estamos na tela adequada
    ↓
localizar elementos do SEI
    ↓
criar botão
    ↓
executar()
```

Se o botão não aparece, o script não reconhece a página ou a execução não começa, procure aqui.

---

# 4. Coleta da lista de processos

**Faixa predominante:** linhas **2642–3009**

Principais funções:

```text
2642  coletarProcessos()

2695  localizarUrlControleProcessos()

2767  extrairProcessosControleDfpoDoHtml()

2849  coletarProcessosControleDfpo()

2892  unirProcessosSemDuplicar()

2954  extrairNumeroProcesso()

2964  extrairUrlDoLink()
```

Esse bloco responde:

> **Quais processos serão analisados?**

Fluxo:

```text
tabela / página
→ localizar links
→ extrair números
→ coletar listas adicionais
→ eliminar duplicidades
→ produzir conjunto de processos
```

Se um processo deveria aparecer na análise e não aparece, o problema pode estar aqui antes mesmo de chegar às regras.

---

# 5. Núcleo de consulta de cada processo

## `consultarProcesso()`

**Faixa predominante:** linhas **3010–5219**

```text
consultarProcesso()
≈ 2.210 linhas
```

É a maior região funcional do script.

Ela funciona como um **orquestrador**.

Conceitualmente:

```text
processo
   │
   ├─ obter página
   ├─ descobrir URLs
   ├─ obter árvore
   ├─ obter histórico
   ├─ extrair unidades
   ├─ identificar peças
   ├─ calcular sinais
   ├─ aplicar regras
   └─ devolver resultado
```

Não pense nessa função apenas como uma regra.

Ela é mais próxima de um controlador:

```text
consultarProcesso()
      │
      ├── aquisição
      ├── parsing
      ├── árvore
      ├── histórico
      ├── detectores
      └── montagem do resultado
```

### Quando investigar essa região

Use `consultarProcesso()` quando:

- vários campos de um processo chegam vazios;
- árvore e histórico parecem não conversar;
- uma exceção interrompe a análise inteira de um processo;
- o resultado final existe, mas você não sabe de onde determinada propriedade veio;
- precisa seguir a cadeia completa de chamadas.

---

# 6. Aquisição de páginas e HTML

**Faixa predominante:** linhas **5220–5595**

Principais funções:

```text
5220  obterHtml()

5258  decodificarResposta()

5292  tentarExpandirPastasSemRisco()

5442  localizarUrlAbrirPastas()

5506  localizarUrlPorAcao()
```

Aqui o script sai do DOM que já está visível e passa a **buscar outras páginas do próprio fluxo**.

Modelo mental:

```text
URL
 ↓
request
 ↓
response
 ↓
HTML
 ↓
próxima etapa
```

`obterHtml()` é uma função especialmente importante porque separa:

```text
aquisição da informação
```

de:

```text
interpretação da informação
```

Se a página correta não está sendo recuperada, procure aqui.

Se a página é recuperada corretamente, mas o dado é interpretado errado, provavelmente o problema está em um bloco posterior.

---

# 7. Grande núcleo de interpretação da árvore

## `extrairSinalizacaoArvore()`

**Faixa predominante:** linhas **5596–6980**

```text
extrairSinalizacaoArvore()
≈ 1.385 linhas
```

É outro grande núcleo do código.

Seu papel é transformar a árvore documental em sinais úteis para o motor.

Fluxo mental:

```text
HTML da árvore
     ↓
documentos / títulos / posições
     ↓
presença ou ausência de peças
     ↓
evidências
     ↓
sinalização
```

Se uma sinalização depende da presença de determinado documento, título ou sequência documental, este bloco é central.

---

# 8. Detectores da primeira peça e sinais documentais

**Faixa predominante:** linhas **6981–8402**

Principais funções:

```text
6981  extrairUrlsDocumentosDaArvore()

7045  obterTituloPrimeiraPecaDaArvore()

7062  detectarProvavelProrrogacaoTituloPrimeiraPeca()

7085  detectarProvavelAditivoTituloPrimeiraPeca()

7111  detectarProvavelReequilibrioTituloPrimeiraPeca()

7138  detectarProvavelReajusteTituloPrimeiraPeca()

7191  detectarCredorPrimeiraPeca()

7609  detectarProvavelContratacaoPrimeiraPeca()

7979  detectarAciIndicouEnvioSmf()

8243  detectarMedicaoZeradaNaArvore()
```

Esse conjunto funciona como vários pequenos sensores.

Exemplo:

```text
primeira peça
    ├─ título
    ├─ conteúdo
    ├─ unidade geradora
    └─ posição na árvore
          ↓
       detector
          ↓
     true / false
```

Essas funções são bons pontos para debug porque têm responsabilidades mais delimitadas que as funções gigantes.

---

# 9. Parsing estrutural da árvore

**Faixa predominante:** linhas **8403–9460**

Principais funções:

```text
8403  extrairDocumentosDaArvore()

8496  extrairUnidadesGeradorasDaArvore()

8560  extrairChamadasConstrutor()

8657  separarArgumentosJavaScript()

8745  desescaparArgumentoJs()

8774  extrairItensArvore()

8822  extrairItensArvoreDoHtml()

8910  extrairPecasNumeradasComUnidade()

9041  localizarComprovantePagamentoSmf()

9185  extrairUltimaPecaPorPosicao()

9226  extrairUnidades()

9276  extrairBlocosNos()

9301  interpretarMensagemUnidades()
```

Essa região é importante porque transforma uma estrutura difícil de ler em objetos que o restante do código consegue usar.

Pense assim:

```text
HTML / JavaScript da árvore
          ↓
parser
          ↓
[
  {
    titulo: ...,
    numero: ...,
    unidade: ...,
    url: ...
  }
]
```

### Diferença importante

```text
extrairDocumentosDaArvore()
```

não deveria decidir o status final do processo.

Sua responsabilidade principal é **extrair estrutura**.

Depois, outra função interpreta essa estrutura.

Essa separação é útil para localizar bugs:

```text
documento não foi extraído
→ parser

documento foi extraído, mas interpretado errado
→ detector/regra
```

---

# 10. Histórico e sequência de movimentações

**Faixa predominante:** linhas **9461–10459**

Principais funções:

```text
9461   historicoTemRetornoCorrecaoTecnicaViaDfParaDfpo()

9652   historicoTemSequenciaAciPresDfOuDfpo()

9820   historicoIndicaRemessaPresParaDf()

9875   historicoIndicaRemessaDaCodoc()

9930   historicoIndicaPagamentoRecursosProprios()

10059  historicoTemPassagemPelaAci()

10103  extrairSinalizacaoHistorico()

10434  ehTituloTrm()
```

A árvore responde principalmente:

> **Quais documentos existem?**

O histórico responde principalmente:

> **Por onde o processo passou e em que ordem?**

Modelo:

```text
andamento 1
   ↓
andamento 2
   ↓
andamento 3
   ↓
andamento 4
```

As funções procuram padrões nessa sequência.

Portanto:

```text
árvore = evidência documental

histórico = evidência temporal / de fluxo
```

---

# 11. Combinação de sinais e cálculo temporal

**Faixa predominante:** linhas **10460–12242**

Principais funções:

```text
10460  combinarSinalizacoes()

10515  calcularTempoAcumuladoNasUnidades()

10647  extrairRodadaGerencialDfDfpoAtual()

11409  extrairInicioCircuitoDfAtual()

11902  extrairUltimaRemessaParaUnidade()

12002  extrairAndamentoAberto()

12079  interpretarDataBrasileira()

12102  formatarDuracao()

12162  verificarErroSei()

12194  aplicarSinalizacaoCumprindoTrm()

12208  criarResultadoErro()
```

Esse bloco junta sinais que vieram de regiões diferentes.

Exemplo conceitual:

```text
árvore ─────────┐
                │
histórico ──────┼──→ combinarSinalizacoes()
                │
tempo ──────────┤
                │
unidade atual ──┘
```

É aqui que dados independentes começam a virar **interpretação do fluxo**.

---

## Duas funções temporais grandes

### `extrairRodadaGerencialDfDfpoAtual()`

```text
linhas ~10647–11408
≈ 760 linhas
```

### `extrairInicioCircuitoDfAtual()`

```text
linhas ~11409–11901
≈ 490 linhas
```

Se o problema for:

- data de entrada;
- tempo acumulado;
- início de rodada;
- retorno para determinada área;
- circuito atual;

essas funções merecem atenção especial.

---

# 12. Construção do modal

## `criarModal()`

**Faixa predominante:** linhas **12243–12718**

```text
criarModal()
≈ 476 linhas
```

Aqui o sistema começa a transformar dados em interface.

Modelo:

```text
dados
 ↓
HTML
 ↓
modal
 ↓
cabeçalhos
 ↓
tabela
 ↓
botões
```

Se o cálculo está correto, mas a janela aparece quebrada, uma coluna não existe ou um botão sumiu, procure nesta região e nos blocos seguintes de renderização.

---

# 13. Diagnóstico e montagem das linhas

**Faixa predominante:** linhas **12719–13690**

Principais funções:

```text
12719  sinalizacaoComDiagnostico()

12791  ehSlipLocalizadaFaseFinal()

12802  adicionarLinha()

13162  aplicarCorResultadoPelaSinalizacao()

13428  preencherCelulaSinalizacao()
```

`adicionarLinha()` é especialmente importante para entender:

> **Como o objeto de resultado vira uma linha na tabela?**

Fluxo:

```text
resultado do processo
        ↓
adicionarLinha()
        ↓
células
        ↓
formatação
        ↓
tabela
```

Se uma informação foi calculada corretamente mas apareceu na coluna errada ou não foi exibida, comece por aqui.

---

# 14. Progresso, exportação e planilha

**Faixa predominante:** linhas **13691–14299**

Principais funções:

```text
13691  atualizarProgresso()

13722  atualizarStatus()

13733  habilitarBotoes()

13762  linhasExportacao()

13837  copiarTabela()

13873  carregarSheetJsSobDemanda()

13940  baixarXLSX()

14074  classeResultadoPelaSinalizacao()
```

Essa região é relativamente independente do motor de análise.

Em geral:

```text
motor
 ↓
linhas prontas
 ↓
exportação
```

Se a tabela na tela está correta mas o XLSX está errado, é melhor investigar esse bloco em vez do motor de regras.

---

# 15. Impressão

## `imprimirRelatorio()`

**Faixa predominante:** linhas **14300–15349**

```text
imprimirRelatorio()
≈ 1.050 linhas
```

É um dos maiores blocos do arquivo.

Ele trata da representação do relatório para impressão.

Por isso, um erro exclusivamente visual na impressão não significa necessariamente erro na análise dos processos.

Pense em duas camadas:

```text
resultado lógico
      ↓
representação na tela
      ↓
representação para impressão
```

---

# 16. Fechamento e estilos

**Faixa predominante:** linhas **15350–15904**

```text
15350  fecharModal()

15372  criarEstilos()
```

`criarEstilos()` ocupa aproximadamente:

```text
linhas 15372–15904
≈ 530 linhas
```

Esse bloco concentra grande parte da aparência da aplicação:

- tamanhos;
- espaçamentos;
- cores;
- tabela;
- modal;
- botões;
- impressão;
- classes visuais.

Se a lógica está correta e o problema é estritamente visual, investigue primeiro aqui.

---

# 17. Formatação visual das células

**Faixa predominante:** linhas **15905–16195**

```text
15905  preencherCelulaUnidades()

15942  formatarUnidadesHtml()

15965  formatarSinalizacaoHtml()
```

Essas funções fazem a última transformação antes do usuário enxergar o dado.

Exemplo:

```text
valor lógico
     ↓
formatador
     ↓
HTML
     ↓
célula
```

É diferente do motor de regras.

Uma boa pergunta de debug é:

```text
o valor está errado
OU
o valor está certo e apenas foi apresentado errado?
```

---

# 18. Utilitários finais

**Faixa predominante:** linhas **16196–16315**

```text
16196  escaparHtml()

16205  acaoDaUrl()

16216  normalizarUrl()

16227  decodificarUrl()

16235  limparUrl()

16244  decodificarJs()

16257  htmlParaTexto()

16271  removerPontuacao()

16277  normalizarUnidade()

16285  limpar()

16292  limparComQuebras()

16302  normalizar()

16309  esperar()
```

Essas funções são pequenas, mas aparecem em muitos lugares.

Por isso, uma alteração aparentemente simples em um utilitário pode afetar várias partes do script.

Exemplo:

```text
normalizar()
   ├─ detector A
   ├─ detector B
   ├─ parser
   ├─ histórico
   └─ regras
```

Modificações nessas funções devem ser tratadas como mudanças de alto alcance.

---

# 19. As maiores regiões do arquivo

O script não é composto por 16 mil linhas igualmente importantes.

Uma parte significativa está concentrada em algumas funções grandes:

```text
consultarProcesso()
~3010–5219
≈ 2.210 linhas

detectarCorrespondenciaFr189950PrimeiraPeca()
~988–2384
≈ 1.400 linhas

extrairSinalizacaoArvore()
~5596–6980
≈ 1.385 linhas

imprimirRelatorio()
~14300–15349
≈ 1.050 linhas

extrairRodadaGerencialDfDfpoAtual()
~10647–11408
≈ 760 linhas

criarEstilos()
~15372–15904
≈ 530 linhas

extrairInicioCircuitoDfAtual()
~11409–11901
≈ 490 linhas

criarModal()
~12243–12718
≈ 476 linhas
```

Visualmente:

```text
16.315 linhas
│
├── ~2.210  consultarProcesso()
│
├── ~1.400  correspondência da primeira peça
│
├── ~1.385  sinalização da árvore
│
├── ~1.050  impressão
│
├──   ~760  rodada gerencial
│
├──   ~530  estilos
│
├──   ~490  início do circuito
│
├──   ~476  modal
│
└── demais funções e blocos menores
```

Essa visão é importante porque mostra onde a complexidade está concentrada.

---

# 20. Como ler o script sem percorrer 16 mil linhas

Não é recomendável começar na linha 1 e seguir até o final.

Uma leitura mais produtiva é:

```text
1. iniciar()
      ↓
2. executar()
      ↓
3. coletarProcessos()
      ↓
4. consultarProcesso()
      ↓
5. obterHtml()
      ↓
6. extrairSinalizacaoArvore()
      ↓
7. extrairSinalizacaoHistorico()
      ↓
8. combinarSinalizacoes()
      ↓
9. adicionarLinha()
      ↓
10. criarModal()
```

Depois aprofunde apenas o ramo necessário.

---

# 21. Mapa por tipo de problema

## O botão não aparece

Procure:

```text
iniciar()
tentarCriarBotao()
ehTelaAcompanhamento()
localizarBarraAcoes()
localizarTabela()
```

Faixa aproximada:

```text
2385–2489
```

---

## Um processo não entrou na análise

Procure:

```text
coletarProcessos()
extrairProcessosControleDfpoDoHtml()
coletarProcessosControleDfpo()
unirProcessosSemDuplicar()
```

Faixa:

```text
2642–2953
```

---

## O script não consegue abrir uma página auxiliar

Procure:

```text
obterHtml()
decodificarResposta()
localizarUrlAbrirPastas()
localizarUrlPorAcao()
```

Faixa:

```text
5220–5595
```

---

## Uma peça existe, mas não foi reconhecida

Primeiro confira o parsing:

```text
extrairDocumentosDaArvore()
extrairItensArvore()
extrairItensArvoreDoHtml()
extrairPecasNumeradasComUnidade()
```

Faixa principal:

```text
8403–9040
```

Depois confira o detector correspondente.

---

## O documento foi reconhecido, mas a sinalização está errada

Procure:

```text
extrairSinalizacaoArvore()
extrairSinalizacaoHistorico()
combinarSinalizacoes()
```

---

## O fluxo histórico está errado

Procure:

```text
historicoTem...
historicoIndica...
extrairSinalizacaoHistorico()
```

Faixa:

```text
9461–10459
```

---

## O tempo calculado está errado

Procure:

```text
calcularTempoAcumuladoNasUnidades()
extrairRodadaGerencialDfDfpoAtual()
extrairInicioCircuitoDfAtual()
extrairUltimaRemessaParaUnidade()
extrairAndamentoAberto()
interpretarDataBrasileira()
formatarDuracao()
```

Faixa:

```text
10515–12161
```

---

## A classificação está certa, mas a tabela está errada

Procure:

```text
adicionarLinha()
preencherCelulaSinalizacao()
preencherCelulaUnidades()
formatarUnidadesHtml()
formatarSinalizacaoHtml()
```

---

## A tela está correta, mas o XLSX está errado

Procure:

```text
linhasExportacao()
carregarSheetJsSobDemanda()
baixarXLSX()
```

Faixa:

```text
13762–14073
```

---

## A impressão está errada

Procure:

```text
imprimirRelatorio()
```

Faixa:

```text
14300–15349
```

---

## Cor, tamanho ou layout estão errados

Procure:

```text
criarEstilos()
```

Faixa:

```text
15372–15904
```

---

# 22. Aquisição, extração, interpretação e apresentação

Uma das divisões mais importantes do projeto é esta:

```text
AQUISIÇÃO
    ↓
EXTRAÇÃO
    ↓
INTERPRETAÇÃO
    ↓
APRESENTAÇÃO
```

### Aquisição

Obtém uma página ou conteúdo.

Exemplo conceitual:

```javascript
const resposta = await obterHtml(url);
```

### Extração

Transforma HTML em informação estruturada.

```javascript
const documentos = extrairDocumentosDaArvore(html);
```

### Interpretação

Decide o significado dos dados.

```javascript
const sinalizacao = extrairSinalizacaoArvore(html);
```

### Apresentação

Transforma o resultado em interface.

```javascript
adicionarLinha(resultado);
```

Essa separação ajuda a localizar defeitos.

```text
request errada
→ aquisição

HTML correto, dado ausente
→ extração

dado correto, conclusão errada
→ interpretação

conclusão correta, tela errada
→ apresentação
```

---

# 23. Relação com DOM, Network e debug no navegador

A arquitetura do script reflete diretamente o trabalho feito nas Ferramentas do Desenvolvedor.

Uma descoberta normalmente segue:

```text
ação manual no SEI
        ↓
Network
        ↓
request / payload / response
        ↓
HTML
        ↓
DOM / DOMParser
        ↓
querySelector / extração
        ↓
função pequena
        ↓
regra
        ↓
incorporação ao userscript
```

Por isso, antes de alterar uma função grande, é recomendável tentar reproduzir o comportamento isoladamente no Console.

---

# 24. Uma regra prática para debug

Quando surgir um resultado incorreto, não comece modificando a regra final.

Volte pela cadeia:

```text
resultado errado
    ↓
qual função montou o resultado?
    ↓
qual indicador ela recebeu?
    ↓
qual função criou o indicador?
    ↓
qual dado bruto foi extraído?
    ↓
qual HTML / histórico / árvore originou o dado?
```

Exemplo:

```text
sinalização incorreta
→ combinarSinalizacoes()
→ sinal da árvore inesperado
→ extrairSinalizacaoArvore()
→ detector específico
→ título extraído
→ extrairDocumentosDaArvore()
→ HTML original
```

Esse caminho costuma ser mais seguro que alterar condicionais por tentativa e erro.

---

# 25. Funções grandes merecem tratamento especial

Funções com centenas ou milhares de linhas devem ser lidas como pequenos subsistemas.

Em vez de tentar entender toda `consultarProcesso()` de uma vez:

```text
consultarProcesso()
│
├─ entrada
├─ obtenção das páginas
├─ parsing
├─ unidades
├─ árvore
├─ histórico
├─ indicadores
├─ regras
└─ retorno
```

Use:

- busca pelo nome de uma função chamada;
- breakpoints;
- `console.log`;
- inspeção de variáveis;
- Network;
- testes com um processo sintético ou devidamente anonimizado.

---

# 26. Índice rápido de funções

```text
INICIALIZAÇÃO
2385   iniciar
2397   tentarCriarBotao
2490   executar

COLETA
2642   coletarProcessos
2849   coletarProcessosControleDfpo
2892   unirProcessosSemDuplicar

NÚCLEO
3010   consultarProcesso

HTTP / HTML
5220   obterHtml
5258   decodificarResposta
5506   localizarUrlPorAcao

ÁRVORE
5596   extrairSinalizacaoArvore
6981   extrairUrlsDocumentosDaArvore
8403   extrairDocumentosDaArvore
8496   extrairUnidadesGeradorasDaArvore
8774   extrairItensArvore
8910   extrairPecasNumeradasComUnidade
9226   extrairUnidades

HISTÓRICO
10103  extrairSinalizacaoHistorico

REGRAS / TEMPO
10460  combinarSinalizacoes
10515  calcularTempoAcumuladoNasUnidades
10647  extrairRodadaGerencialDfDfpoAtual
11409  extrairInicioCircuitoDfAtual
12002  extrairAndamentoAberto

INTERFACE
12243  criarModal
12802  adicionarLinha
13428  preencherCelulaSinalizacao

EXPORTAÇÃO
13762  linhasExportacao
13940  baixarXLSX

IMPRESSÃO
14300  imprimirRelatorio

ESTILO
15372  criarEstilos

FORMATAÇÃO
15905  preencherCelulaUnidades
15965  formatarSinalizacaoHtml

UTILITÁRIOS
16196  escaparHtml
16257  htmlParaTexto
16277  normalizarUnidade
16285  limpar
16302  normalizar
16309  esperar
```

---

# 27. Resumo visual

```text
                       SEI
                        │
                        ▼
              ┌──────────────────┐
              │ inicialização    │
              └────────┬─────────┘
                       ▼
              ┌──────────────────┐
              │ coleta processos │
              └────────┬─────────┘
                       ▼
              ┌──────────────────┐
              │ consultarProcesso│
              └────────┬─────────┘
                       │
          ┌────────────┼─────────────┐
          ▼            ▼             ▼
      requisições    árvore       histórico
          │            │             │
          ▼            ▼             ▼
        HTML        documentos     movimentos
          │            │             │
          └────────────┼─────────────┘
                       ▼
                 indicadores
                       │
                       ▼
                    regras
                       │
                       ▼
                   resultado
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
      tabela          XLSX         impressão
        │
        ▼
      estilos
```

---

# 28. Para continuar estudando

Depois deste mapa, a sequência recomendada é:

```text
docs/guia-inspecao-navegador.md
        ↓
docs/exercicios-debug/
        ↓
docs/montando-seu-script.md
        ↓
src/analisador-fluxo-sei.user.js
```

A arquitetura deve servir como o mapa.

Os exercícios mostram como descobrir cada peça.

O arquivo-fonte mostra como essas peças foram combinadas em um userscript grande.
