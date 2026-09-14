/*
====================================================================
01 — Inventário rápido da página
====================================================================

PARA QUE SERVE
Mostra quantos links, botões, formulários, iframes, tabelas e scripts
existem na tela atual. É uma primeira fotografia da página.

EXEMPLO PRÁTICO
Você abriu uma tela do Sacolão e quer saber:
"Essa tela tem iframe? Tem tabela? Tem formulário?"
Este script responde isso sem você precisar procurar manualmente.

O QUE VOCÊ PRECISA MUDAR
Nada. Basta colar e executar.

COMO LER A SINTAXE
document.querySelectorAll("iframe") procura todos os elementos <iframe>.
.length conta quantos foram encontrados.
console.table(...) mostra o resultado em formato de tabela.

COMO USAR
1) Abra o SEI na tela que deseja investigar.
2) Abra as Ferramentas do Desenvolvedor.
3) Vá até a aba Console.
4) Cole este script inteiro.
5) Pressione Enter.
6) Leia a tabela ou mensagens que aparecerem.

IMPORTANTE
- Este script é para diagnóstico/leitura.
- Não publique capturas ou saídas com dados reais.
- Se houver processo, fornecedor, valor, CPF/CNPJ ou URL interna,
  anonimize antes de guardar no GitHub.
====================================================================
*/


(() => {
  const q = seletor => document.querySelectorAll(seletor).length;

  console.table({
    elementos: q("*"),
    links: q("a"),
    botoes: q("button, input[type='button'], input[type='submit']"),
    formularios: q("form"),
    iframes: q("iframe"),
    tabelas: q("table"),
    dialogs: q("dialog, [role='dialog']"),
    scripts: q("script")
  });
})();
