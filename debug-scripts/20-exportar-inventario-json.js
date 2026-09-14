/*
====================================================================
20 — Exportar inventário estrutural em JSON
====================================================================

PARA QUE SERVE
Cria um pequeno texto JSON com a estrutura da página
e tenta copiar esse texto para a área de transferência.

EXEMPLO PRÁTICO
Você quer guardar no repositório um retrato técnico da tela,
mas sem salvar processo, fornecedor ou conteúdo de documentos.

O QUE VOCÊ PRECISA MUDAR
Nada.

COMO LER A SINTAXE
JSON.stringify(objeto, null, 2) transforma o objeto JavaScript
em texto JSON bem formatado.
navigator.clipboard.writeText(...) tenta copiar o texto.

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
  const inventario = {
    pagina: {
      titulo: document.title,
      caminho: location.pathname
    },

    estrutura: {
      iframes: document.querySelectorAll("iframe").length,
      tabelas: document.querySelectorAll("table").length,
      formularios: document.forms.length,
      links: document.links.length,
      botoes: document.querySelectorAll(
        "button, input[type='button'], input[type='submit']"
      ).length
    },

    iframes: [...document.querySelectorAll("iframe")].map(
      (iframe, indice) => ({
        indice,
        id: iframe.id || "",
        name: iframe.name || "",
        title: iframe.title || ""
      })
    )
  };

  const texto = JSON.stringify(inventario, null, 2);

  console.log(texto);

  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(texto)
      .then(() => {
        console.log(
          "Inventário copiado para a área de transferência."
        );
      })
      .catch(() => {
        console.log(
          "Não foi possível copiar automaticamente."
        );
      });
  }
})();
