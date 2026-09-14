/*
====================================================================
12 — Observar requisições fetch e XHR
====================================================================

PARA QUE SERVE
Registra quando a página faz uma requisição em segundo plano.
Mostra método, caminho, status e tempo, sem mostrar payload ou query string.

EXEMPLO PRÁTICO
Você clica em "Mostrar todos" e quer descobrir se o navegador pediu
novos dados ao servidor. Execute este script antes do clique.

O QUE VOCÊ PRECISA MUDAR
Nada.

COMO LER A SINTAXE
fetch e XMLHttpRequest são duas formas comuns de o JavaScript
pedir dados ao servidor sem recarregar a página.
status 200 normalmente significa que a resposta chegou com sucesso.
pathname mostra só o caminho e evita expor parâmetros da URL.

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
  if (window.__debugNetAtivo) {
    console.warn("O monitor já está ativo.");
    return;
  }

  window.__debugNetAtivo = true;

  const apenasCaminho = valor => {
    try {
      return new URL(valor, location.href).pathname;
    } catch {
      return String(valor).split("?")[0];
    }
  };

  const fetchOriginal = window.fetch;

  window.fetch = async function(input, opcoes = {}) {
    const metodo = (opcoes.method || "GET").toUpperCase();
    const url = typeof input === "string" ? input : input?.url;
    const inicio = performance.now();

    try {
      const resposta = await fetchOriginal.apply(this, arguments);

      console.log(
        "[fetch]",
        metodo,
        apenasCaminho(url),
        "status:", resposta.status,
        "tempo:", `${Math.round(performance.now() - inicio)}ms`
      );

      return resposta;
    } catch (erro) {
      console.log(
        "[fetch erro]",
        metodo,
        apenasCaminho(url),
        erro.name
      );
      throw erro;
    }
  };

  const openOriginal = XMLHttpRequest.prototype.open;
  const sendOriginal = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function(metodo, url) {
    this.__debugMetodo = metodo;
    this.__debugUrl = url;
    return openOriginal.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function() {
    const inicio = performance.now();

    this.addEventListener("loadend", () => {
      console.log(
        "[xhr]",
        String(this.__debugMetodo || "GET").toUpperCase(),
        apenasCaminho(this.__debugUrl || ""),
        "status:", this.status,
        "tempo:", `${Math.round(performance.now() - inicio)}ms`
      );
    }, { once: true });

    return sendOriginal.apply(this, arguments);
  };

  console.log(
    "Monitor ativo. Agora faça a ação que deseja investigar."
  );
})();
