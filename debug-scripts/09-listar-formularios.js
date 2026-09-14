/*
====================================================================
09 — Listar formulários da página
====================================================================

PARA QUE SERVE
Mostra os formulários existentes, método GET/POST, caminho de envio
e quantidade de campos.

EXEMPLO PRÁTICO
Você preenche uma pesquisa e clica em Pesquisar.
Quer saber se a tela envia um formulário e para onde ele vai.

O QUE VOCÊ PRECISA MUDAR
Nada.

COMO LER A SINTAXE
document.forms contém os formulários da página.
method mostra GET ou POST.
action indica para onde o formulário é enviado.
elements.length conta seus campos.

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
  const linhas = [...document.forms].map((formulario, indice) => ({
    indice,
    id: formulario.id || "",
    name: formulario.name || "",
    metodo: (formulario.method || "GET").toUpperCase(),
    caminho: (() => {
      try {
        return new URL(
          formulario.action || location.href,
          location.href
        ).pathname;
      } catch {
        return "";
      }
    })(),
    quantidadeDeCampos: formulario.elements.length
  }));

  console.table(linhas);
})();
