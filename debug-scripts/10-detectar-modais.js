/*
====================================================================
10 — Detectar janelas modais
====================================================================

PARA QUE SERVE
Procura elementos que tenham aparência ou marcação de modal/dialog.

EXEMPLO PRÁTICO
Você clica em uma ação e abre uma "janelinha".
Quer descobrir se aquilo é um modal dentro da mesma página
ou se o conteúdo veio de outro mecanismo.

O QUE VOCÊ PRECISA MUDAR
Nada.

COMO LER A SINTAXE
[role='dialog'] procura qualquer elemento cujo atributo role seja dialog.
[class*='modal'] significa: classe que contém a palavra modal.
[id*='modal'] faz a mesma coisa com o id.

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
    "dialog",
    "[role='dialog']",
    "[aria-modal='true']",
    ".modal",
    "[class*='modal']",
    "[id*='modal']"
  ];

  const vistos = new Set();
  const achados = [];

  for (const seletor of seletores) {
    document.querySelectorAll(seletor).forEach(elemento => {
      if (vistos.has(elemento)) return;
      vistos.add(elemento);

      achados.push({
        seletor,
        tag: elemento.tagName,
        id: elemento.id || "",
        classe: elemento.className || "",
        visivel: !!(
          elemento.offsetWidth ||
          elemento.offsetHeight ||
          elemento.getClientRects().length
        )
      });
    });
  }

  console.table(achados);
})();
