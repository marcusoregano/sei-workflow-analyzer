/*
====================================================================
19 — Resumir o contexto da página
====================================================================

PARA QUE SERVE
Gera um resumo curto da tela atual sem despejar o conteúdo da página.

EXEMPLO PRÁTICO
Você quer mandar para um colega apenas:
"esta tela tem 2 iframes, 1 tabela, 3 formulários e 18 botões"
sem compartilhar dados do processo.

O QUE VOCÊ PRECISA MUDAR
Nada.

COMO LER A SINTAXE
location.pathname mostra apenas o caminho da página.
As demais linhas contam tipos de elementos existentes.

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
  const resumo = {
    titulo: document.title,
    caminho: location.pathname,
    iframes: document.querySelectorAll("iframe").length,
    tabelas: document.querySelectorAll("table").length,
    formularios: document.forms.length,
    links: document.links.length,
    botoes: document.querySelectorAll(
      "button, input[type='button'], input[type='submit']"
    ).length,
    dialogs: document.querySelectorAll(
      "dialog, [role='dialog']"
    ).length
  };

  console.table(resumo);
})();
