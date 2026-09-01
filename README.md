# Analisador de Fluxo SEI

Projeto experimental para estudo e adaptação de automações locais sobre o SEI.

A proposta deste repositório não é entregar uma solução universal pronta para qualquer órgão. O objetivo principal é mostrar como observar o comportamento do SEI pelo navegador, identificar rotas, elementos e padrões úteis e, a partir disso, construir o seu próprio script de apoio.

> **Importante:** este projeto é um snapshot público anonimizado. A versão pública não contém os mapeamentos operacionais reais usados no ambiente em que o projeto foi desenvolvido.

## Status

Versão pública atual: **v0.1.0**

Esta versão deve ser tratada como **experimental**.

## Para que serve

O projeto demonstra técnicas para:

- ler a página atual do SEI;
- identificar processos e unidades;
- consultar páginas internas do próprio sistema;
- interpretar histórico de tramitação;
- ler a árvore de documentos;
- medir tempos de permanência em unidades;
- reconhecer padrões de fluxo;
- montar sinalizações e relatórios locais.

## A ideia central

O SEI já entrega ao navegador grande parte das informações necessárias para exibir sua interface.

Ao abrir o **F12 — Ferramentas do Desenvolvedor**, é possível observar como o navegador recebe essas informações e como a interface navega entre páginas internas.

O caminho de aprendizado recomendado é:

1. executar manualmente uma ação no SEI;
2. observar o que mudou no navegador;
3. identificar a página, elemento ou requisição correspondente;
4. reproduzir somente a leitura necessária em JavaScript;
5. testar com dados fictícios ou previamente anonimizados;
6. transformar a observação em uma regra pequena;
7. documentar a regra;
8. só depois incorporá-la ao script principal.

## Começando pelo F12

Abra o SEI normalmente e pressione:

```text
F12
```

As abas mais úteis são:

- **Elements / Elementos** — estrutura HTML;
- **Console** — testes de JavaScript;
- **Network / Rede** — requisições feitas pelo SEI;
- **Sources / Fontes** — scripts carregados pela página.

Leia: [Guia prático: usando o F12 para entender o SEI](docs/guia-f12.md)

## Como montar o seu próprio arquivo

Não comece alterando centenas de linhas.

Escolha primeiro uma pergunta simples, por exemplo:

```text
Em qual unidade este processo está aberto agora?
```

Depois descubra manualmente de onde essa informação vem.

O princípio é:

```text
observar
→ entender
→ testar
→ transformar em função
→ validar
→ integrar
```

Leia: [Montando seu próprio script de análise do SEI](docs/montando-seu-script.md)

## Estrutura do repositório

```text
src/
    analisador-fluxo-sei.user.js

docs/
    arquitetura.md
    auditoria-anonimizacao.txt
    fluxo-de-dados.md
    manutencao.md
    motor-de-regras.md
    privacidade-e-anonimizacao.md
    proveniencia.md
    solucao-de-problemas.md
    guia-f12.md
    montando-seu-script.md

examples/
    configuracao-exemplo.js
    processos-sinteticos.json

tests/
    casos-de-regressao.js
```

## Privacidade

Antes de compartilhar qualquer material coletado pelo F12, revise cuidadosamente o conteúdo.

Podem aparecer:

- número de processo;
- nomes;
- unidades;
- documentos;
- contratos;
- credores;
- valores;
- e-mails;
- IDs internos;
- URLs do ambiente;
- tokens ou dados de sessão.

**Nunca publique cookies, tokens, cabeçalhos de autenticação, credenciais ou dados reais de processos.**

Prefira sempre exemplos sintéticos.

## Segurança operacional

Este projeto deve ser usado para **leitura e apoio à análise**.

Antes de automatizar ações que alterem processos, documentos, assinaturas, tramitações ou registros, entenda completamente o comportamento da instalação do SEI utilizada pela sua organização.

## Desenvolvimento incremental

Uma regra nova deve nascer de um caso pequeno e verificável.

Evite:

```text
"vou automatizar todo o fluxo"
```

Prefira:

```text
"vou descobrir como o SEI mostra a unidade atual"
```

Depois avance uma etapa de cada vez.

## Proveniência

A primeira publicação pública foi derivada de uma fonte privada experimental identificada como **v0.9.9.145**.

O hash SHA-256 do snapshot privado de origem está registrado em `docs/proveniencia.md`.

## Aviso

Este projeto não é um produto oficial do SEI, do TRF4 ou de qualquer órgão público.

É um projeto independente de estudo, automação local e documentação técnica.
