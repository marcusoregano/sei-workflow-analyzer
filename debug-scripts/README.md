# Debug scripts de Console — versão para iniciantes

Esta pasta foi escrita pensando em funcionários administrativos e financeiros
que nunca programaram.

A regra é simples:

> primeiro explicar o que será feito; depois mostrar o código.

Cada arquivo contém, antes do script:

- para que ele serve;
- um exemplo concreto;
- o que precisa ser alterado;
- uma explicação da sintaxe usada;
- o passo a passo de execução.

Os exemplos usam o cenário fictício do **Sacolão Vila das Frutas**.

## Ordem recomendada

Comece pelos arquivos 01 a 06.

Eles ensinam a responder perguntas básicas como:

```text
O que existe nesta página?
Onde está este texto?
Está no documento principal ou em um iframe?
Qual caixa contém este elemento?
```

Depois avance para:

```text
07–10 → links, botões, formulários e modais
11–12 → mudanças no DOM e requisições
13–15 → funções JavaScript e URLs
16–20 → paginação, árvore e inventários
```

## Ideia central

Não é necessário "saber programar" antes.

O objetivo é aprender a fazer pequenas perguntas ao navegador:

```text
"quantos iframes existem?"
"onde está este texto?"
"qual botão eu cliquei?"
"houve uma requisição quando fiz esta ação?"
```

Cada script é uma dessas perguntas escrita em JavaScript.

## Segurança e privacidade

Os scripts evitam, quando possível, mostrar query strings e payloads.
Mesmo assim, sempre revise qualquer saída antes de publicar no GitHub.

Nunca publique:

- cookies;
- tokens;
- credenciais;
- URLs assinadas;
- identificadores reais de processos;
- fornecedores;
- CPF/CNPJ;
- valores operacionais identificáveis.
