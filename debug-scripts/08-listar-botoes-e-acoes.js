/*
====================================================================
08 — Listar botões da tela
====================================================================

PARA QUE SERVE
Mostra os botões encontrados, seus textos, IDs e ações inline.

EXEMPLO PRÁTICO
Você está procurando o botão que abre a conferência do Sacolão,
mas não sabe seu id nem sua classe.
Este script fornece um inventário dos botões.

O QUE VOCÊ PRECISA MUDAR
Nada. Procure na tabela o texto do botão que você reconhece.

COMO LER A SINTAXE
button procura tags <button>.
input[type='button'] procura botões criados com <input>.
[role='button'] procura elementos que se comportam como botão.

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
  const SELETOR =
    "button, input[type='button'], input[type='submit'], [role='button']";

  const linhas = [...document.querySelectorAll(SELETOR)].map((elemento, indice) => ({
    indice,
    tag: elemento.tagName,
    texto: (elemento.innerText || elemento.value || elemento.title || "")
      .trim().slice(0, 80),
    id: elemento.id || "",
    name: elemento.getAttribute("name") || "",
    onclick: (elemento.getAttribute("onclick") || "").slice(0, 120)
  }));

  console.table(linhas);
})();
