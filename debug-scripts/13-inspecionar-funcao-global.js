/*
====================================================================
13 — Inspecionar uma função JavaScript já carregada
====================================================================

PARA QUE SERVE
Mostra o código textual de uma função que existe na página.

EXEMPLO PRÁTICO
Você encontrou no onclick algo como:
abrirJanelaConferencia(...)
Agora quer saber o que essa função faz.

O QUE VOCÊ PRECISA MUDAR
Troque:
const NOME = "abrirJanelaConferencia";
pelo nome real encontrado.

COMO LER A SINTAXE
window representa o contexto global da página.
typeof atual === "function" confirma que o nome realmente aponta para uma função.
.toString() tenta mostrar o texto da função.

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
  const NOME = "abrirJanelaConferencia";

  const partes = NOME.split(".");
  let atual = window;

  for (const parte of partes) {
    atual = atual?.[parte];
  }

  if (typeof atual !== "function") {
    console.warn(
      "O nome informado não corresponde a uma função acessível:",
      NOME,
      atual
    );
    return;
  }

  console.log("Função encontrada:", atual);

  try {
    console.log(atual.toString());
  } catch (erro) {
    console.warn(
      "Não foi possível converter a função em texto:",
      erro.name
    );
  }
})();
