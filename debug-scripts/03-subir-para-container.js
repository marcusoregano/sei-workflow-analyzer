/*
====================================================================
03 — Subir do elemento para o bloco maior
====================================================================

PARA QUE SERVE
Parte de um elemento conhecido e mostra seus elementos-pai.
Isso ajuda a descobrir a caixa, linha, célula ou formulário que contém
o item encontrado.

EXEMPLO PRÁTICO
Você encontrou a frase "Cumprindo TCA" dentro de um <span>.
Mas o que interessa é descobrir em qual linha da tabela ela está.
Este script sobe alguns níveis e mostra cada container acima dela.

O QUE VOCÊ PRECISA MUDAR
Troque:
const SELETOR = "#meuElemento";
pelo seletor do elemento que você encontrou.

COMO LER A SINTAXE
document.querySelector("#meuElemento") procura um único elemento.
.parentElement significa "elemento-pai".
O for repete a subida até 8 níveis.

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
  const SELETOR = "#meuElemento";
  const elementoInicial = document.querySelector(SELETOR);

  if (!elementoInicial) {
    console.warn("Elemento não encontrado. Confira o seletor.");
    return;
  }

  let atual = elementoInicial;
  const niveis = [];

  for (let nivel = 0; nivel < 8 && atual; nivel++, atual = atual.parentElement) {
    niveis.push({
      nivel,
      tag: atual.tagName,
      id: atual.id || "",
      classe: atual.className || "",
      texto: (atual.innerText || "").trim().slice(0, 120)
    });
  }

  console.table(niveis);
})();
