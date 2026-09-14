/*
====================================================================
11 — Observar mudanças no DOM
====================================================================

PARA QUE SERVE
Fica observando a página e avisa quando elementos são adicionados ou removidos.

EXEMPLO PRÁTICO
Você clica em "Mostrar todos" e vários documentos aparecem sem a página recarregar.
Este script ajuda a confirmar se o clique alterou o DOM diretamente.

O QUE VOCÊ PRECISA MUDAR
Nada. Execute primeiro, depois faça a ação na tela.

COMO LER A SINTAXE
MutationObserver é um observador nativo do navegador.
observe(..., {subtree:true}) significa observar também os elementos internos.

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
  const observador = new MutationObserver(listaDeMudancas => {
    for (const mudanca of listaDeMudancas) {
      if (mudanca.addedNodes.length || mudanca.removedNodes.length) {
        console.log("Mudança detectada", {
          alvo: mudanca.target,
          adicionados: [...mudanca.addedNodes]
            .filter(no => no.nodeType === 1),
          removidos: [...mudanca.removedNodes]
            .filter(no => no.nodeType === 1)
        });
      }
    }
  });

  observador.observe(document.body, {
    childList: true,
    subtree: true
  });

  window.__debugMutationObserver = observador;

  console.log(
    "Monitor ativo. Para parar:",
    "window.__debugMutationObserver.disconnect()"
  );
})();
