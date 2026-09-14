/*
====================================================================
07 — Listar links e ações onclick
====================================================================

PARA QUE SERVE
Mostra os links da página, o texto de cada link e a ação JavaScript
que possa estar escrita diretamente no atributo onclick.

EXEMPLO PRÁTICO
Você clica em "Mostrar todos" e algo acontece,
mas não sabe qual função é chamada.
Este script pode revelar se existe onclick no próprio link.

O QUE VOCÊ PRECISA MUDAR
Nada. Depois procure na tabela o texto do botão/link desejado.

COMO LER A SINTAXE
<a> é a tag de link.
getAttribute("onclick") lê exatamente o conteúdo do atributo onclick.
.href lê o endereço do link.

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
  const linhas = [...document.querySelectorAll("a")].map((link, indice) => ({
    indice,
    texto: (link.innerText || "").trim().slice(0, 80),
    caminho: (() => {
      try {
        return new URL(link.href, location.href).pathname;
      } catch {
        return "";
      }
    })(),
    onclick: (link.getAttribute("onclick") || "").slice(0, 120)
  }));

  console.table(linhas);
})();
