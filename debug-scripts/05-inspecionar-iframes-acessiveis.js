/*
====================================================================
05 — Ver quais iframes podem ser lidos
====================================================================

PARA QUE SERVE
Testa cada iframe e informa se o navegador permite acessar
o documento carregado dentro dele.

EXEMPLO PRÁTICO
Você encontrou 3 iframes no script anterior.
Agora quer saber em quais deles é possível usar querySelector e procurar
elementos normalmente.

O QUE VOCÊ PRECISA MUDAR
Nada. Execute depois de listar os iframes.

COMO LER A SINTAXE
iframe.contentDocument significa:
"me dê o document que está carregado dentro deste iframe".
Se o acesso for permitido, o script conta quantos elementos existem nele.

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
  [...document.querySelectorAll("iframe")].forEach((iframe, indice) => {
    try {
      const documentoInterno = iframe.contentDocument;

      console.log(indice, {
        acessivel: !!documentoInterno,
        titulo: documentoInterno?.title || "",
        elementos: documentoInterno?.querySelectorAll("*").length || 0
      }, iframe);

    } catch (erro) {
      console.log(indice, {
        acessivel: false,
        motivo: erro.name
      }, iframe);
    }
  });
})();
