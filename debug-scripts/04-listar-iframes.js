/*
====================================================================
04 — Listar os iframes da página
====================================================================

PARA QUE SERVE
Mostra todos os iframes existentes na tela.
Um iframe é uma página carregada dentro de outra página.

EXEMPLO PRÁTICO
Você vê uma árvore de documentos, mas document.querySelector(...)
não encontra nada. Uma hipótese é que a árvore esteja dentro de um iframe.
Este script mostra os iframes existentes.

O QUE VOCÊ PRECISA MUDAR
Nada. Basta executar.

COMO LER A SINTAXE
document.querySelectorAll("iframe") procura todos os iframes.
map(...) transforma cada iframe em uma linha mais fácil de ler.
new URL(...).pathname mostra apenas o caminho, sem parâmetros sensíveis.

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
  const dados = [...document.querySelectorAll("iframe")].map((iframe, indice) => ({
    indice,
    id: iframe.id || "",
    name: iframe.name || "",
    title: iframe.title || "",
    caminho: (() => {
      try {
        return new URL(iframe.src || "", location.href).pathname;
      } catch {
        return "";
      }
    })()
  }));

  console.table(dados);
})();
