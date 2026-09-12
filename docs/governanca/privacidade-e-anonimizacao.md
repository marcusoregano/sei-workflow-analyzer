# Política de Privacidade e Anonimização

Este repositório contém uma versão pública e anonimizada de um userscript de análise de fluxo de processos.

## Princípio central

A versão pública deve preservar a lógica do software, removendo identificadores operacionais, pessoais, contratuais, financeiros e institucionais derivados de processos administrativos reais.

## Informações que não devem ser publicadas

Os seguintes dados devem ser removidos, generalizados ou substituídos por exemplos sintéticos:

- números reais de processos administrativos;
- números reais de empenhos ou notas de empenho;
- identificadores reais de fontes de recursos;
- números reais de contratos;
- objetos reais de compras, contratações ou despesas;
- fornecedores, credores ou contratadas reais;
- CNPJ, CPF ou outros números de identificação;
- números reais de notas fiscais ou documentos de pagamento;
- valores monetários reais quando associados a casos identificáveis;
- nomes de servidores, agentes públicos ou terceiros;
- matrículas ou identificadores internos;
- endereços de e-mail reais;
- estruturas organizacionais internas quando desnecessariamente específicas;
- URLs autenticadas do SEI;
- IDs internos, hashes, tokens ou parâmetros assinados;
- códigos de verificação e valores de CRC;
- exemplos reais incluídos em comentários, logs ou casos de teste;
- capturas de tela, PDFs ou relatórios contendo dados operacionais reais.

## Exemplos públicos

Os exemplos incluídos neste repositório devem utilizar dados sintéticos.

Os exemplos sintéticos devem:

- preservar a estrutura necessária para demonstrar o funcionamento do software;
- evitar reproduzir combinações reais de processo, contrato, credor, valor e fonte de recursos;
- indicar claramente que os dados são fictícios;
- utilizar nomes e identificadores organizacionais genéricos;
- nunca apontar para um ambiente real do SEI.

## Dicionários determinísticos

Dicionários operacionais que associem padrões textuais reais a empenhos, fontes de recursos, contratos ou credores não devem ser publicados como estão.

A versão pública deve conter apenas exemplos sintéticos que demonstrem a estrutura esperada.

## Comentários no código

Os comentários devem ser revisados com o mesmo cuidado aplicado ao código executável.

Números reais de processos, contratos, empenhos, nomes de credores, valores e outros exemplos identificáveis devem ser removidos dos comentários e das notas de regressão.

## Saídas visuais

Capturas de tela, PDFs, planilhas e saídas para impressão devem ser gerados exclusivamente com dados sintéticos antes da publicação.

## Separação entre versões

A versão interna de trabalho e a versão pública são artefatos separados.

A versão interna pode conter configurações específicas da organização e mapeamentos operacionais reais.

A versão pública deve conter apenas lógica anonimizada, exemplos sintéticos e configurações genéricas.

## Regra de revisão

Antes de publicar qualquer informação, faça a seguinte pergunta:

> Uma pessoa de fora da organização poderia utilizar esta informação, isoladamente ou combinada com outras fontes, para identificar um processo, contrato, fornecedor, despesa ou pessoa real?

Se a resposta for sim, ou houver dúvida, a informação deve ser anonimizada.

# Decisões de anonimização por categoria de dados

## Identificadores de processos administrativos

**Tratamento público: REMOVER OU SUBSTITUIR POR IDENTIFICADORES SINTÉTICOS**

Identificadores reais de processos administrativos nunca devem aparecer em:

- código-fonte executável;
- dicionários;
- comentários;
- casos de regressão;
- documentação;
- capturas de tela;
- exemplos;
- logs incluídos no repositório.

Identificadores reais devem ser substituídos por valores claramente sintéticos, por exemplo:

- `PROCESSO_EXEMPLO_001`
- `CASO_REGRESSAO_001`
- `PROCESSO_SINTETICO_A`

Preferencialmente, os identificadores sintéticos não devem reproduzir exatamente o padrão de numeração utilizado pela organização real, reduzindo a possibilidade de coincidência acidental com um processo existente.

Dicionários específicos da organização que contenham processos reais não devem ser anonimizados registro por registro.

Eles devem ser removidos da versão pública e substituídos por um pequeno conjunto de dados sintéticos de demonstração.

Comentários sobre casos reais de regressão devem preservar o raciocínio técnico, substituindo a identificação real por um caso sintético.

## Empenhos e notas de empenho

**Tratamento público: REMOVER MAPEAMENTOS REAIS E SUBSTITUIR POR DADOS SINTÉTICOS**

Identificadores reais de empenhos ou notas de empenho não devem ser publicados.

O repositório público não deve preservar associações reais entre:

- empenho;
- fonte de recursos;
- credor ou fornecedor;
- contrato;
- processo administrativo;
- objeto da despesa;
- valor monetário;
- termos distintivos utilizados para correspondência.

Essas relações podem permitir a reconstrução de um caso administrativo real mesmo quando um dos campos foi anonimizado.

Por esse motivo, dicionários operacionais reais devem ser removidos integralmente da versão pública.

A versão pública pode preservar:

- a estrutura dos dados;
- o algoritmo de correspondência;
- a lógica de pontuação;
- os limites de confiança;
- o comportamento genérico do motor de regras.

Os dicionários de demonstração devem conter apenas dados integralmente sintéticos e não devem reproduzir combinações reais do ambiente interno.

Exemplos de identificadores públicos:

- `NE_SINTETICA_001`
- `FONTE_EXEMPLO_A`
- `FORNECEDOR_FICTICIO_A`
- `CONTRATO_EXEMPLO_001`

O objetivo é demonstrar a arquitetura do software, e não reproduzir a base contábil ou financeira da organização.

## Identificadores de fontes de recursos

**Tratamento público: REMOVER VALORES REAIS E SUBSTITUIR POR PLACEHOLDERS SINTÉTICOS**

Identificadores reais de fontes de recursos não devem ser publicados.

O repositório público não deve conter códigos reais de fontes de recursos utilizados pela organização, especialmente quando associados a:

- empenhos;
- contratos;
- credores;
- processos administrativos;
- objetos de despesa;
- valores monetários;
- regras determinísticas de workflow.

As fontes reais devem ser substituídas por identificadores claramente sintéticos, por exemplo:

- `FONTE_EXEMPLO_A`
- `FONTE_EXEMPLO_B`
- `FONTE_INTERNA_DEMO`

O código público pode preservar a lógica utilizada para comparar ou classificar fontes de recursos, mas não os valores reais nem suas associações operacionais.

Combinações como empenho + fonte + credor + objeto devem ser removidas como um conjunto, em vez de serem anonimizadas campo por campo.

## Unidades organizacionais

**Tratamento público: GENERALIZAR OU SUBSTITUIR POR IDENTIFICADORES SINTÉTICOS**

Identificadores reais de unidades organizacionais não devem ser publicados quando sua divulgação puder revelar a estrutura interna do ambiente de origem.

A versão pública deve utilizar nomes genéricos, por exemplo:

- `ORG/FIN`
- `ORG/FIN/CONTABILIDADE`
- `ORG/FIN/PLANEJAMENTO`
- `ORG/FIN/TESOURARIA`
- `ORG/TEC/UNIDADE-A`

A lógica do software pode preservar conceitos como:

- unidade financeira;
- planejamento;
- contabilidade;
- tesouraria;
- área técnica;
- unidade externa.

A versão pública deve demonstrar o comportamento do algoritmo sem depender da identificação real das unidades administrativas utilizadas no ambiente original.
