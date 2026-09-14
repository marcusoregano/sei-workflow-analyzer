/*
====================================================================
17 — Inventariar candidatos da árvore de documentos
====================================================================

PARA QUE SERVE
Procura links dentro de elementos cujo id ou classe lembrem árvore/tree.

EXEMPLO PRÁTICO
Você está na tela de um processo e quer saber quais itens da árvore
documental já estão presentes no HTML.

O QUE VOCÊ PRECISA MUDAR
Nada.

COMO LER A SINTAXE
[id*='arvore'] significa:
"qualquer elemento cujo id contenha a palavra arvore".
Depois o espaço + a procura links dentro desse elemento.

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
  const seletores = [
    "[id*='arvore'] a",
    "[class*='arvore'] a",
    "[id*='tree'] a",
    "[class*='tree'] a"
  ];

  const vistos = new Set();
  const linhas = [];

  for (const seletor of seletores) {
    document.querySelectorAll(seletor).forEach(link => {
      if (vistos.has(link)) return;
      vistos.add(link);

      linhas.push({
        texto: (link.innerText || link.title || "")
          .trim().slice(0, 100),
        id: link.id || "",
        classe: link.className || "",
        caminho: (() => {
          try {
            return new URL(link.href, location.href).pathname;
          } catch {
            return "";
          }
        })()
      });
    });
  }

  console.table(linhas);
})();
