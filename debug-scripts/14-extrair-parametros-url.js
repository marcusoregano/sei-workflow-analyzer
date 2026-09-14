/*
====================================================================
14 — Separar caminho e parâmetros de uma URL
====================================================================

PARA QUE SERVE
Mostra a estrutura da URL atual e esconde automaticamente nomes
que parecem token, hash, sessão ou credencial.

EXEMPLO PRÁTICO
Você está em uma página com endereço grande e quer entender quais
parâmetros existem sem copiar dados sensíveis para o GitHub.

O QUE VOCÊ PRECISA MUDAR
Nada. Por padrão usa a URL atual.

COMO LER A SINTAXE
new URL(location.href) transforma o endereço atual em um objeto.
searchParams contém os parâmetros depois de ?.
pathname é somente o caminho da página.

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
  const url = new URL(location.href);

  console.log("Origem:", url.origin);
  console.log("Caminho:", url.pathname);

  const parametros = {};

  for (const [nome, valor] of url.searchParams.entries()) {
    const pareceSensivel =
      /token|hash|auth|session|sid|verifier|crc/i.test(nome);

    parametros[nome] = pareceSensivel
      ? "[REDACTED]"
      : valor;
  }

  console.table(parametros);
})();
