/*
====================================================================
16 — Detectar sinais de paginação
====================================================================

PARA QUE SERVE
Procura controles que possam indicar página seguinte, anterior
ou seleção de número de página.

EXEMPLO PRÁTICO
Uma lista mostra apenas 50 registros e você suspeita que existam
mais páginas. Este script procura indícios de paginação.

O QUE VOCÊ PRECISA MUDAR
Nada.

COMO LER A SINTAXE
a[rel='next'] procura link marcado como próxima página.
[class*='pagin'] procura classes que contenham 'pagin'.

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
    "a[rel='next']",
    "a[rel='prev']",
    "[class*='pagin']",
    "[id*='pagin']",
    "select[name*='pagina']",
    "input[name*='pagina']"
  ];

  const resultados = [];

  for (const seletor of seletores) {
    document.querySelectorAll(seletor).forEach(elemento => {
      resultados.push({
        seletor,
        tag: elemento.tagName,
        texto: (elemento.innerText || elemento.value || "")
          .trim().slice(0, 80),
        id: elemento.id || "",
        name: elemento.getAttribute("name") || ""
      });
    });
  }

  console.table(resultados);
})();
