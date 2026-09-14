/*
====================================================================
18 — Capturar exatamente o elemento clicado
====================================================================

PARA QUE SERVE
Espera você clicar uma vez e mostra qual elemento recebeu o clique.

EXEMPLO PRÁTICO
Você vê um ícone pequeno ao lado de um documento e não sabe se o clique
vai no <img>, no <span>, no <a> ou no botão pai.
Execute o script e clique no ícone.

O QUE VOCÊ PRECISA MUDAR
Nada. Depois de executar, dê UM clique no elemento desejado.

COMO LER A SINTAXE
addEventListener("click", ..., true) captura o clique antes da ação normal.
preventDefault() impede a navegação.
stopPropagation() impede o clique de continuar subindo pela página.

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
  const capturar = evento => {
    evento.preventDefault();
    evento.stopPropagation();

    const elemento = evento.target;

    console.log("Elemento efetivamente clicado:", elemento);

    console.table([{
      tag: elemento.tagName,
      id: elemento.id || "",
      classe: elemento.className || "",
      texto: (elemento.innerText || elemento.value || "")
        .trim().slice(0, 120),
      onclick: (elemento.getAttribute?.("onclick") || "")
        .slice(0, 120)
    }]);

    document.removeEventListener("click", capturar, true);
    console.log("Captura encerrada.");
  };

  document.addEventListener("click", capturar, true);

  console.log(
    "Agora clique UMA VEZ no elemento que você deseja investigar."
  );
})();
