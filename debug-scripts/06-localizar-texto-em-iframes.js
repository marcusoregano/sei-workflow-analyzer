/*
====================================================================
06 — Procurar o mesmo texto na página e nos iframes
====================================================================

PARA QUE SERVE
Procura uma frase no documento principal e também nos iframes acessíveis.

EXEMPLO PRÁTICO
Você vê "Guia de Liberação de Pagamento" na tela,
mas não sabe se está no HTML principal ou em outro documento.
Este script procura nos dois lugares.

O QUE VOCÊ PRECISA MUDAR
Troque:
const TERMO = "Guia de Liberação de Pagamento";

COMO LER A SINTAXE
A função procurar(...) recebe um document.
Primeiro usamos document, que é a página principal.
Depois usamos iframe.contentDocument, que é o documento interno do iframe.

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
  const TERMO = "Guia de Liberação de Pagamento".toLowerCase();

  function procurar(documento, origem) {
    const achados = [...documento.querySelectorAll("body *")]
      .filter(elemento => {
        const texto = (elemento.innerText || "").trim().toLowerCase();
        return texto &&
               texto.includes(TERMO) &&
               elemento.children.length === 0;
      })
      .slice(0, 50);

    achados.forEach(elemento => {
      console.log(origem, elemento, (elemento.innerText || "").trim());
    });

    return achados.length;
  }

  let total = procurar(document, "página principal");

  [...document.querySelectorAll("iframe")].forEach((iframe, indice) => {
    try {
      if (iframe.contentDocument) {
        total += procurar(iframe.contentDocument, `iframe ${indice}`);
      }
    } catch {}
  });

  console.log("Total encontrado:", total);
})();
