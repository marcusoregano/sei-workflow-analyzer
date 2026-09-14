/*
====================================================================
02 — Localizar um texto na tela
====================================================================

PARA QUE SERVE
Procura um texto que você consegue enxergar na tela e mostra
qual elemento HTML contém esse texto.

EXEMPLO PRÁTICO
Na tela aparece "Cumprindo TCA".
Você quer descobrir qual elemento do HTML contém essa frase para depois
entender onde ela está e como o sistema a montou.

O QUE VOCÊ PRECISA MUDAR
Troque apenas:
const TERMO = "Cumprindo TCA";
por outro texto que esteja visível na tela.

COMO LER A SINTAXE
const cria uma variável.
TERMO é o nome da variável.
"Cumprindo TCA" é o texto procurado.
.toLowerCase() transforma tudo em minúsculas para facilitar a busca.
.includes(...) pergunta: "este texto contém aquele texto?".

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
  const TERMO = "Cumprindo TCA";
  const termoMinusculo = TERMO.toLowerCase();

  const achados = [...document.querySelectorAll("body *")]
    .filter(elemento => {
      const texto = (elemento.innerText || "").trim().toLowerCase();
      return texto &&
             texto.includes(termoMinusculo) &&
             elemento.children.length === 0;
    })
    .slice(0, 100);

  console.log(`Foram encontrados ${achados.length} elementos.`);
  achados.forEach((elemento, numero) => {
    console.log(numero + 1, elemento, (elemento.innerText || "").trim());
  });
})();
