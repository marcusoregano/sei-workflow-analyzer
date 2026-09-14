/*
====================================================================
15 — Localizar links para controlador.php
====================================================================

PARA QUE SERVE
Procura links que apontem para controlador.php e mostra somente
o caminho e o parâmetro 'acao'.

EXEMPLO PRÁTICO
Você quer descobrir qual ação está associada a "Mostrar todos"
ou "Abrir árvore", sem copiar a URL inteira.

O QUE VOCÊ PRECISA MUDAR
Nada.

COMO LER A SINTAXE
u.searchParams.get("acao") lê somente o parâmetro chamado acao.
O restante dos parâmetros não é exibido.

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
  const linhas = [...document.querySelectorAll("a[href]")]
    .map(link => {
      try {
        const url = new URL(link.href, location.href);

        if (!/controlador\.php$/i.test(url.pathname)) {
          return null;
        }

        return {
          texto: (link.innerText || "").trim().slice(0, 80),
          caminho: url.pathname,
          acao: url.searchParams.get("acao") || ""
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  console.table(linhas);
})();
