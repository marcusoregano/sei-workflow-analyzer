// ==UserScript==
// @name         SEI - Unidades Abertas, Tempo na DF-PO e PDF
// @namespace    https://sei.exemplo.invalid/
// @version      9.9.145-public
// @description  Snapshot público anonimizado — versão consolidada: unidades abertas, tempo na DF-PO, passagem pela ACI, retorno CODOC, leitura real da árvore, regras da ACI para TRM, provável envio à SMF e trabalho em andamento na Fazenda.
// @author       Marcus
// @match        https://sei.exemplo.invalid/sei/controlador.php*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

/*
 * SNAPSHOT PÚBLICO ANONIMIZADO
 * -----------------------------------------------------------------------------
 * Esta cópia preserva a estrutura e a lógica do código para fins de autoria,
 * documentação e estudo. Identificadores operacionais, processos, empenhos,
 * fontes, contratos, credores, objetos, valores específicos e unidades reais
 * foram removidos, generalizados ou substituídos por dados sintéticos.
 *
 * Esta versão pública não contém a configuração operacional privada.
 */

/*
===============================================================================
 CONTROLE ESPECIAL
-------------------------------------------------------------------------------
 Autor:     Marcus Vinicius Roque
 Empresa:   ORGANIZAÇÃO_EXEMPLO
 Setor:     UNIDADE_EXEMPLO - Planejamento e Orçamento
 Matrícula: [omitida na versão pública]
 LinkedIn:  https://www.linkedin.com/in/marcusoregano/

 Assistência: ChatGPT (OpenAI), utilizado na elaboração, revisão e aprimoramento do código.

 Licença: Creative Commons Atribuição 4.0 Internacional (CC BY 4.0)

 Este script pode ser compartilhado e adaptado, inclusive para fins comerciais,
 desde que seja mantido o crédito ao autor e indicada a existência de alterações.

 Licença completa:
 https://creativecommons.org/licenses/by/4.0/deed.pt-br
===============================================================================

░░░░░░░░▀████▀▄▄░░░░░░░░░░░░░░▄█
░░░░░░░░░░█▀░░░░▀▀▄▄▄▄▄░░░░▄▄▀▀█
░░▄░░░░░░░░█░░░░░░░░░░▀▀▀▀▄░░▄▀
░▄▀░▀▄░░░░░░▀▄░░░░░░░░░░░░░░▀▄▀
▄▀░░░░█░░░░░█▀░░░▄█▀▄░░░░░░▄█
▀▄░░░░░▀▄░░█░░░░░▀██▀░░░░░██▄█
░▀▄░░░░▄▀░█░░░▄██▄░░░▄░░▄░░▀▀░█
░░█░░▄▀░░█░░░░▀██▀░░░░▀▀░▀▀░░▄▀
░█░░░█░░█░░░░░░▄▄░░░░░░░░░░░▄▀
*/


/*
===============================================================================
 CONFIGURAÇÕES LOCAIS
-------------------------------------------------------------------------------
 false = coluna Credor desligada
 true  = coluna Credor ligada e leitura da primeira peça habilitada
===============================================================================
*/
const ATIVAR_COLUNA_CREDOR = false;


/*
===============================================================================
 PRIVACIDADE / LGPD
-------------------------------------------------------------------------------

 Antes de compartilhar prints, HTML, logs do Console, respostas do Network,
 PDFs, imagens ou qualquer conteúdo obtido no SEI para fins de suporte,
 desenvolvimento ou depuração, revise e anonimize os dados reais.

 PRESERVE A ESTRUTURA TÉCNICA.
 ANONIMIZE O CONTEÚDO REAL.

 Exemplos de informações que devem ser verificadas:

 - nomes de pessoas;
 - CPF, RG e outros documentos;
 - matrícula;
 - telefone e e-mail;
 - endereço;
 - número de processo;
 - interessado;
 - conteúdo de CI, despacho, parecer e outros documentos.

 Nunca compartilhe:

 - senhas;
 - cookies;
 - tokens de sessão;
 - cabeçalhos Authorization;
 - CSRF tokens;
 - credenciais ou outros dados de autenticação.

 Para permitir o diagnóstico, preserve sempre que possível:

 - IDs e classes dos elementos HTML;
 - estrutura do DOM;
 - nomes de funções;
 - mensagens de erro;
 - nomes das ações/rotas do SEI;
 - sequência lógica das requisições.

 Exemplo:

 PESSOA_REAL               -> USUARIO_EXEMPLO
 PROCESSO_EXEMPLO_004      -> PROCESSO_EXEMPLO_001
 usuario@exemplo.invalid        -> usuario@exemplo.com

-------------------------------------------------------------------------------
 SUGESTÃO DE FERRAMENTAS PARA ANONIMIZAÇÃO
-------------------------------------------------------------------------------

 Para grandes volumes de arquivos ou quando a anonimização manual não for
 conveniente, podem ser utilizadas ferramentas em Python, por exemplo:

 - Microsoft Presidio

   Detecção e anonimização de informações pessoais (PII), com possibilidade
   de criação de regras próprias para CPF, CNPJ, matrícula, números de
   processo etc.

   Pacotes:
     presidio-analyzer
     presidio-anonymizer
     presidio-image-redactor

 - PyMuPDF (pymupdf)

   Manipulação de PDFs e aplicação de redação permanente ("redaction"),
   removendo efetivamente o conteúdo selecionado do documento.

 - OCR

   Pode ser utilizado em conjunto com as ferramentas acima quando os dados
   estiverem em documentos digitalizados, screenshots ou imagens.

 IMPORTANTE:

 Ferramentas automáticas de detecção podem apresentar falsos positivos ou
 deixar de identificar algum dado sensível. Portanto, o material anonimizado
 deve ser revisado antes de ser compartilhado.

 Respostas provenientes de ações como:

 - arvore_visualizar
 - procedimento_visualizar
 - documento_visualizar

 também podem conter informações reais do processo e devem passar pela mesma
 revisão antes do compartilhamento.

===============================================================================
*/



(function () {
    'use strict';

    const UNIDADE_ALVO = 'ORG/FIN/PLANEJAMENTO';
    const UNIDADES_DF = [
        'ORG/FIN',
        'ORG/FIN/EXECUCAO',
        'ORG/FIN/PLANEJAMENTO',
        'ORG/FIN/CONTABILIDADE',
        'ORG/FIN/TESOURARIA'
    ];
    const UNIDADES_FAZENDA = [
        'EXT/FIN/UNIDADE-A',
        'EXT/FIN/UNIDADE-B',
        'EXT/FIN/UNIDADE-C',
        'EXT/FIN/UNIDADE-D'
    ];

    /*
     * ÁREAS TÉCNICAS
     *
     * Quando um processo sai de DF-PO ou DF-CONT diretamente para uma
     * destas unidades e permanece aberto ali, interpretamos como uma
     * providência técnica/corretiva que deverá retornar à DF.
     *
     * Esta regra vale tanto para repasse quanto para não-repasse.
     */
    const UNIDADES_AREA_TECNICA = [
        'ORG/TEC/UNIDADE-A',
        'ORG/TEC/UNIDADE-B',
        'ORG/TEC/UNIDADE-C',
        'ORG/TEC/UNIDADE-D',
        'ORG/TEC/UNIDADE-E'
    ];

    /*
     * ========================================================================
     * BASE DETERMINÍSTICA — EXEMPLO PÚBLICO SINTÉTICO
     * ========================================================================
     *
     * Dataset sintético destinado exclusivamente a demonstrar a estrutura
     * do mecanismo de correspondência na versão pública.
     *
     * IMPORTANTE:
     * - a base é positiva/unidirecional;
     * - encontrar uma correspondência forte pode ser usado futuramente como
     *   evidência de recurso próprio / não-repasse;
     * - NÃO encontrar correspondência não prova que o processo seja repasse;
     * - novos empenhos FONTE_EXEMPLO_A podem ser emitidos ao longo de 2026 e devem
     *   ser acrescentados aqui sem alterar o algoritmo de comparação.
     *
     * A partir da v9.9.84, correspondência FORTE com esta base passa a
     * gerar sinalização precoce de provável não-repasse.
     */
    const BASE_PUBLICA_ATUALIZADA_ATE = 'SNAPSHOT_PUBLICO';

    const PALAVRAS_IGNORADAS_BASE_PUBLICA = new Set([
        'A', 'AS', 'AO', 'AOS', 'DA', 'DAS', 'DE', 'DO', 'DOS',
        'E', 'EM', 'NA', 'NAS', 'NO', 'NOS', 'PARA', 'POR', 'COM',
        'SEM', 'SOB', 'SOBRE', 'UM', 'UMA', 'UNS', 'UMAS',
        'EMPRESA', 'CONTRATADA', 'CONTRATADO', 'CONTRATAÇÃO',
        'SERVIÇO', 'SERVIÇOS', 'OBRA', 'OBRAS', 'CONTRATO',
        'TERMO', 'ADITIVO', 'PROCESSO', 'MEDIÇÃO', 'FOLHA',
        'VALOR', 'PERÍODO', 'DESPESA', 'ORGAO_EXEMPLO', 'ORGAO_ANTERIOR', 'CIDADE_EXEMPLO'
    ]);

    const DICIONARIO_BASE_PUBLICA = [
        {
            empenho: 7001,
            fonte: 'FONTE_EXEMPLO_A',
            valor: 12345.67,
            credor: 'FORNECEDOR_FICTICIO_A',
            contrato: 'CONTRATO_EXEMPLO_001',
            processo: 'PROCESSO_EXEMPLO_001',
            familia: 'servico_exemplo',
            objeto: 'OBJETO FICTÍCIO UTILIZADO APENAS PARA DEMONSTRAÇÃO DA LÓGICA.',
            palavrasDistintivas: [
                'TERMO FICTÍCIO A',
                'TERMO FICTÍCIO B'
            ]
        },
        {
            empenho: 7002,
            fonte: 'FONTE_EXEMPLO_B',
            valor: 98765.43,
            credor: 'FORNECEDOR_FICTICIO_B',
            contrato: 'CONTRATO_EXEMPLO_002',
            processo: 'PROCESSO_EXEMPLO_002',
            familia: 'material_exemplo',
            objeto: 'SEGUNDO OBJETO FICTÍCIO PARA TESTE DO ALGORITMO DE CORRESPONDÊNCIA.',
            palavrasDistintivas: [
                'MATERIAL FICTÍCIO',
                'EXEMPLO PÚBLICO'
            ]
        }
    ];

    /*
     * Helpers preparados para a etapa seguinte.
     * Nenhum deles interfere nas sinalizações enquanto não for chamado.
     */
    function detectarArtRrtTecnica(
        textoBruto
    ) {
        const texto =
            String(
                textoBruto || ''
            )
                .replace(
                    /\u00A0/g,
                    ' '
                )
                .replace(
                    /\s+/g,
                    ' '
                )
                .trim();

        /*
         * ART jurídica:
         * "art. 1º", "Art. 714", "arts. 5º e 6º", etc.
         *
         * Não usamos a simples existência das letras ART. A evidência
         * precisa trazer contexto de Anotação/Registro de Responsabilidade
         * Técnica, CREA/CAU, boleto ou solicitação explícita de pagamento.
         */
        const artTecnica =
            /\bPAGAMENTO\s+(?:DE\s+|DA\s+)?ARTs?\b/i.test(
                texto
            ) ||
            /\bARTs?\s+(?:DE\s+)?(?:FISCALIZA[CÇ][AÃ]O|OR[CÇ]AMENTO|PROJETO|EXECU[CÇ][AÃ]O|OBRA)\b/i.test(
                texto
            ) ||
            /\bBOLETO\b[\s\S]{0,100}\bARTs?\b/i.test(
                texto
            ) ||
            /\bARTs?\s*(?:N[º°]|N\.|NÚMERO)\s*[A-Z0-9]/i.test(
                texto
            ) ||
            (
                /\bANOTA[CÇ][AÃ]O\s+DE\s+RESPONSABILIDADE\s+T[EÉ]CNICA\b/i.test(
                    texto
                ) &&
                /\bCREA\b/i.test(
                    texto
                )
            ) ||
            (
                /\bCREA(?:-RJ)?\b/i.test(
                    texto
                ) &&
                /\bARTs?\b(?!\s*\.)/i.test(
                    texto
                )
            );

        const rrtTecnica =
            /\bPAGAMENTO\s+(?:DE\s+|DA\s+)?RRTs?\b/i.test(
                texto
            ) ||
            /\bRRTs?\s+(?:DE\s+)?(?:FISCALIZA[CÇ][AÃ]O|OR[CÇ]AMENTO|PROJETO|EXECU[CÇ][AÃ]O|OBRA)\b/i.test(
                texto
            ) ||
            /\bBOLETO\b[\s\S]{0,100}\bRRTs?\b/i.test(
                texto
            ) ||
            /\bRRTs?\s*(?:N[º°]|N\.|NÚMERO)\s*[A-Z0-9]/i.test(
                texto
            ) ||
            (
                /\bANOTA[CÇ][AÃ]O\s+DE\s+RESPONSABILIDADE\s+T[EÉ]CNICA\b/i.test(
                    texto
                ) &&
                /\bCAU\b/i.test(
                    texto
                )
            ) ||
            (
                /\bCAU(?:\/RJ|-RJ)?\b/i.test(
                    texto
                ) &&
                /\bRRTs?\b/i.test(
                    texto
                )
            );

        return {
            artTecnica,
            rrtTecnica,
            detectada:
                artTecnica ||
                rrtTecnica,
            sigla:
                artTecnica
                    ? 'ART'
                    : rrtTecnica
                        ? 'RRT'
                        : ''
        };
    }


    /*
     * RÓTULO CURTO NA SINALIZAÇÃO — v9.9.108
     *
     * Corrige a consulta do mapa (normalizar() devolve minúsculas) e
     * compacta o texto, retirando "Correspondência".
     *
     * Exemplo:
     *   antes: Correspondência NE 7008/ANO_EXEMPLO, FR FONTE_EXEMPLO_A
     *   agora: ART, NE 7008/ANO_EXEMPLO, FR FONTE_EXEMPLO_A
     */

    function rotuloCurtoNaoRepasse(
        correspondencia
    ) {
        const familia =
            normalizar(
                correspondencia?.item?.familia || ''
            );

        const mapa = {
            FOLHA_PAGAMENTO: 'FOLHA',
            LOCACAO_ALMOXARIFADO: 'LOCAÇÃO',
            LOCACAO_TOWER_2000: 'LOCAÇÃO',
            PORTAL_SITE: 'SITE',
            IMPOSTO_RENDA: 'IR',
            ART_CREA: 'ART',
            RRT_CAU: 'RRT',
            IMPRESSAO_REPROGRAFIA: 'REPROGRAFIA',
            MATERIAL_EXPEDIENTE: 'EXPEDIENTE',
            DESPESAS_BANCARIAS: 'BANCÁRIO',
            PUBLICACOES_LEGAIS: 'PUBLICAÇÃO',
            UNIFORMES: 'UNIFORMES',
            MOBILIARIO_CADEIRAS: 'MOBILIÁRIO',
            SOFTWARE_EXEMPLO: 'SOFTWARE_EXEMPLO',

            /*
             * Famílias determinísticas adicionadas na v9.9.89.
             */
            'INTERNET / OPERADORA_EXEMPLO': 'INTERNET',
            'ENERGIA ELETRICA': 'ENERGIA',
            'RRT / CAU': 'RRT',
            'ART / CREA': 'ART',
            'FOLHA DE PAGAMENTO': 'FOLHA',
            'RECEITAS PROPRIAS / TRIBUTOS': 'TRIBUTOS',
            'AGUA_ESGOTO': 'ÁGUA/ESGOTO',
            'SEGURO ESTAGIARIOS': 'SEGURO',
            'REFRIGERACAO': 'REFRIGERAÇÃO',
            'CEO / SAUDE OCUPACIONAL': 'CEO - SAÚDE OCUPACIONAL',
            'FOLHA / INSS / IRRF / FGTS': 'FOLHA/FGTS',
            'PARCELAMENTO FGTS': 'FOLHA/FGTS'
        };

        return (
            mapa[
                familia.toUpperCase()
            ] ||
            ''
        );
    }


    function tokensBasePublica(
        texto
    ) {
        return normalizar(
            texto || ''
        )
            .replace(
                /[^A-Z0-9]+/g,
                ' '
            )
            .split(/\s+/)
            .map(
                token =>
                    token.trim()
            )
            .filter(
                token =>
                    token.length >= 3 &&
                    !PALAVRAS_IGNORADAS_BASE_PUBLICA.has(
                        token
                    )
            );
    }

    function compararComDicionarioBasePublica(
        dados = {}
    ) {
        const textoObjeto =
            normalizar(
                dados.objeto || ''
            );
        const textoCredor =
            normalizar(
                dados.credor || ''
            );
        const textoContrato =
            normalizar(
                dados.contrato || ''
            );
        const tokensObjeto =
            new Set(
                tokensBasePublica(
                    dados.objeto || ''
                )
            );

        const resultadosComparacao =
            DICIONARIO_BASE_PUBLICA.map(
                item => {
                    let pontos = 0;
                    const evidencias = [];

                    const contratoExato =
                        textoContrato &&
                        normalizar(
                            item.contrato || ''
                        ) === textoContrato;

                    if (contratoExato) {
                        pontos += 100;
                        evidencias.push(
                            `Contrato ${item.contrato}`
                        );
                    }

                    const credorCompativel =
                        textoCredor &&
                        (
                            textoCredor.includes(
                                normalizar(
                                    item.credor || ''
                                )
                            ) ||
                            normalizar(
                                item.credor || ''
                            ).includes(
                                textoCredor
                            )
                        );

                    if (credorCompativel) {
                        pontos += 35;
                        evidencias.push(
                            'Credor compatível'
                        );
                    }

                    let distintivasEncontradas = 0;

                    for (
                        const expressao of item.palavrasDistintivas || []
                    ) {
                        const alvo =
                            normalizar(
                                expressao
                            );

                        if (
                            alvo &&
                            textoObjeto.includes(
                                alvo
                            )
                        ) {
                            distintivasEncontradas++;
                            pontos +=
                                alvo.includes(' ')
                                    ? 35
                                    : 25;
                            evidencias.push(
                                expressao
                            );
                        }
                    }

                    const tokensItem =
                        new Set(
                            tokensBasePublica(
                                item.objeto || ''
                            )
                        );

                    const tokensComuns =
                        [
                            ...tokensObjeto
                        ].filter(
                            token =>
                                tokensItem.has(
                                    token
                                )
                        );

                    if (
                        tokensComuns.length >= 3
                    ) {
                        pontos += Math.min(
                            30,
                            tokensComuns.length * 5
                        );
                        evidencias.push(
                            `${tokensComuns.length} palavras relevantes em comum`
                        );
                    }

                    return {
                        item,
                        pontos,
                        contratoExato,
                        credorCompativel,
                        distintivasEncontradas,
                        tokensComuns,
                        evidencias
                    };
                }
            )
                .sort(
                    (a, b) =>
                        b.pontos - a.pontos
                );

        return resultadosComparacao[0] || null;
    }

    /*
     * ========================================================================
     * CORRESPONDÊNCIA PRECOCE COM A BASE PÚBLICA SINTÉTICA
     * ========================================================================
     *
     * Lê somente a PRIMEIRA PEÇA interna do processo e tenta extrair:
     * - credor/contratada;
     * - contrato;
     * - objeto.
     *
     * A comparação é POSITIVA: um match forte pode indicar não-repasse;
     * a ausência de match não indica repasse.
     *
     * Limiar atual:
     * - >= 60 pontos: correspondência forte;
     * - < 60 pontos: não interfere na sinalização.
     */
    function detectarCorrespondenciaAguaEsgotoNaArvore(
        html
    ) {
        const documentos =
            extrairDocumentosDaArvore(
                html
            );

        /*
         * Este fluxo pode começar diretamente por PDFs, sem CI interna.
         * Por isso, aqui a evidência vem do TÍTULO das primeiras peças
         * da árvore, e não do conteúdo da primeira peça interna legível.
         *
         * Proteção contra falso positivo:
         * - olha somente as 5 primeiras peças;
         * - exige título com ÁGUA + ESGOTO juntos, ou dois títulos iniciais
         *   distintos relacionados a conta/ofício de água/esgoto.
         */
        const iniciais =
            documentos
                .slice(
                    0,
                    5
                );

        const relacionados =
            iniciais.filter(
                documento => {
                    const titulo =
                        documento.titulo || '';

                    const agua =
                        /\b(?:[aá]gua|[aá]guas)\b/i.test(
                            titulo
                        );

                    const esgoto =
                        /\besgoto\b/i.test(
                            titulo
                        );

                    const contaOuOficio =
                        /\b(?:conta|of[ií]cio)\b/i.test(
                            titulo
                        );

                    return (
                        contaOuOficio &&
                        (
                            agua ||
                            esgoto
                        )
                    );
                }
            );

        const tituloComAguaEEsgoto =
            relacionados.some(
                documento => {
                    const titulo =
                        documento.titulo || '';

                    return (
                        /\b(?:[aá]gua|[aá]guas)\b/i.test(
                            titulo
                        ) &&
                        /\besgoto\b/i.test(
                            titulo
                        )
                    );
                }
            );

        const detectada =
            tituloComAguaEEsgoto ||
            relacionados.length >= 2;

        if (
            !detectada
        ) {
            return {
                detectada: false,
                pontos: 0,
                empenho: null,
                ne: null,
                fonte: '',
                tipoCorrespondencia: '',
                item: null,
                evidencias: [],
                dadosPrimeiraPeca: {
                    credor: '',
                    contrato: '',
                    objeto: ''
                }
            };
        }

        return {
            detectada: true,
            pontos: 999,
            empenho: 7015,
            ne: 7015,
            fonte: 'FONTE_EXEMPLO_B',
            tipoCorrespondencia:
                'deterministica-arvore',
            item: {
                empenho: 7015,
                fonte: 'FONTE_EXEMPLO_B',
                familia: 'AGUA_ESGOTO'
            },
            evidencias:
                relacionados.map(
                    documento =>
                        documento.titulo || ''
                ),
            dadosPrimeiraPeca: {
                credor: '',
                contrato: '',
                objeto:
                    relacionados
                        .map(
                            documento =>
                                documento.titulo || ''
                        )
                        .join(
                            ' | '
                        )
            }
        };
    }


    async function detectarCorrespondenciaBasePublicaPrimeiraPeca(
        html,
        base
    ) {
        const resultadoVazio = {
            detectada: false,
            pontos: 0,
            empenho: null,
            ne: null,
            fonte: '',
            tipoCorrespondencia: '',
            item: null,
            evidencias: [],
            dadosPrimeiraPeca: {
                credor: '',
                contrato: '',
                objeto: ''
            }
        };

        const documentos =
            extrairDocumentosDaArvore(
                html
            );

        const urls =
            extrairUrlsDocumentosDaArvore(
                html
            );

        const unidadesGeradoras =
            extrairUnidadesGeradorasDaArvore(
                html
            );

        const primeiraPeca =
            documentos
                .map(
                    documento => ({
                        ...documento,
                        url:
                            urls.get(
                                String(
                                    documento.idInterno
                                )
                            ) || '',
                        unidadeGeradora:
                            unidadesGeradoras.get(
                                String(
                                    documento.idInterno
                                )
                            ) || ''
                    })
                )
                .filter(
                    documento =>
                        Boolean(
                            documento.url
                        )
                )
                .sort(
                    (a, b) =>
                        Number(
                            a.numeroSei || 0
                        ) -
                        Number(
                            b.numeroSei || 0
                        )
                )[0] || null;

        if (!primeiraPeca) {
            return resultadoVazio;
        }

        try {
            const url =
                new URL(
                    primeiraPeca.url,
                    base
                ).href;

            const resposta =
                await obterHtml(
                    url
                );

            verificarErroSei(
                resposta.html
            );

            const htmlDocumento =
                resposta.html || '';

            const doc =
                new DOMParser().parseFromString(
                    htmlDocumento,
                    'text/html'
                );

            const texto =
                htmlParaTexto(
                    htmlDocumento
                )
                    .replace(
                        /\u00A0/g,
                        ' '
                    )
                    .replace(
                        /\r/g,
                        ''
                    )
                    .replace(
                        /[ \t]+/g,
                        ' '
                    )
                    .replace(
                        /\n{3,}/g,
                        '\n\n'
                    )
                    .trim();

            const dados = {
                credor: '',
                contrato: '',
                objeto: ''
            };

            const rotulosCredor = [
                'EMPRESA CONTRATADA',
                'CONTRATADA',
                'CONTRATADO',
                'CREDOR',
                'CONCESSIONÁRIA',
                'CONCESSIONARIA',
                'FORNECEDOR'
            ];

            const rotulosContrato = [
                'Nº CONTRATO',
                'N° CONTRATO',
                'CONTRATO Nº',
                'CONTRATO N°',
                'CONTRATO'
            ];

            const rotulosObjeto = [
                'OBJETO',
                'OBJETO DA CONTRATAÇÃO',
                'OBJETO DO CONTRATO'
            ];

            function extrairValorTabela(
                rotulos
            ) {
                for (
                    const linha of doc.querySelectorAll(
                        'tr'
                    )
                ) {
                    const celulas =
                        [
                            ...linha.querySelectorAll(
                                ':scope > td, :scope > th'
                            )
                        ]
                            .map(
                                celula =>
                                    limpar(
                                        celula.textContent || ''
                                    )
                            )
                            .filter(Boolean);

                    if (!celulas.length) {
                        continue;
                    }

                    const primeira =
                        celulas[0]
                            .replace(
                                /[:：]\s*$/,
                                ''
                            )
                            .trim();

                    const bate =
                        rotulos.some(
                            rotulo =>
                                normalizar(
                                    primeira
                                ) ===
                                normalizar(
                                    rotulo
                                )
                        );

                    if (
                        bate &&
                        celulas.length >= 2
                    ) {
                        return limpar(
                            celulas
                                .slice(1)
                                .join(' ')
                        );
                    }
                }

                return '';
            }

            dados.credor =
                extrairValorTabela(
                    rotulosCredor
                );

            dados.contrato =
                extrairValorTabela(
                    rotulosContrato
                );

            dados.objeto =
                extrairValorTabela(
                    rotulosObjeto
                );

            const linhasTexto =
                texto
                    .split('\n')
                    .map(
                        linha =>
                            limpar(
                                linha
                            )
                    )
                    .filter(Boolean);

            function extrairLinhaSeguinte(
                rotulos
            ) {
                for (
                    let i = 0;
                    i < linhasTexto.length;
                    i++
                ) {
                    const atual =
                        linhasTexto[i];

                    const atualSemDoisPontos =
                        atual
                            .replace(
                                /[:：]\s*$/,
                                ''
                            )
                            .trim();

                    const bate =
                        rotulos.some(
                            rotulo =>
                                normalizar(
                                    atualSemDoisPontos
                                ) ===
                                normalizar(
                                    rotulo
                                )
                        );

                    if (
                        bate &&
                        linhasTexto[i + 1]
                    ) {
                        return linhasTexto[
                            i + 1
                        ];
                    }
                }

                return '';
            }

            if (!dados.credor) {
                dados.credor =
                    extrairLinhaSeguinte(
                        rotulosCredor
                    );
            }

            if (!dados.contrato) {
                dados.contrato =
                    extrairLinhaSeguinte(
                        rotulosContrato
                    );
            }

            if (!dados.objeto) {
                dados.objeto =
                    extrairLinhaSeguinte(
                        rotulosObjeto
                    );
            }

            const textoPlano =
                texto
                    .replace(
                        /\s*\n\s*/g,
                        ' '
                    )
                    .replace(
                        /\s{2,}/g,
                        ' '
                    )
                    .trim();

            if (!dados.credor) {
                const match =
                    textoPlano.match(
                        /\b(?:EMPRESA\s+CONTRATADA|CONTRATADA|CONTRATADO|CREDOR|CONCESSION[ÁA]RIA|FORNECEDOR)\b\s*:?\s*(.{2,180}?)(?=\s+(?:CONTRATO|PROCESSO|OBJETO|VALOR|CNPJ|CPF|PER[IÍ]ODO)\b\s*:?|$)/i
                    );

                if (match) {
                    dados.credor =
                        limpar(
                            match[1] || ''
                        );
                }
            }

            if (!dados.contrato) {
                const match =
                    textoPlano.match(
                        /\b(?:N[º°]\s*CONTRATO|CONTRATO\s*N[º°]|CONTRATO)\b\s*:?\s*([A-Z0-9.\-\/]{3,30})/i
                    );

                if (match) {
                    dados.contrato =
                        limpar(
                            match[1] || ''
                        );
                }
            }

            if (!dados.objeto) {
                const match =
                    textoPlano.match(
                        /\bOBJETO(?:\s+DA\s+CONTRATA[CÇ][AÃ]O|\s+DO\s+CONTRATO)?\b\s*:?\s*(.{10,700}?)(?=\s+(?:CONTRATO|PROCESSO|VALOR|PER[IÍ]ODO|PRAZO|CNPJ|CPF|FICHA|ACORDO)\b\s*:?|$)/i
                    );

                if (match) {
                    dados.objeto =
                        limpar(
                            match[1] || ''
                        );
                }
            }

            /*
             * DICIONÁRIO DETERMINÍSTICO DE NÃO-REPASSES 2026
             *
             * Algumas CIs têm expressões suficientemente específicas para
             * associá-las diretamente a empenhos conhecidos. A associação
             * é positiva: encontrar um padrão forte indica provável
             * não-repasse; não encontrar não prova repasse.
             *
             * Base conhecida:
             * - ART  -> NE 7008/ANO_EXEMPLO, FR FONTE_EXEMPLO_A
             * - RRT  -> NE 7009/ANO_EXEMPLO, FR FONTE_EXEMPLO_A
             * - FOLHA SUPLEMENTAR -> NE 7001/ANO_EXEMPLO, FR FONTE_EXEMPLO_A
             * - LINK_EXEMPLO / OPERADORA_EXEMPLO / link DPR -> NE 7010/ANO_EXEMPLO,
             *   FR FONTE_EXEMPLO_B
             * - CONCESSIONARIA_EXEMPLO / CONCESSIONARIA_EXEMPLO / energia elétrica ORGAO_EXEMPLO -> NE 7011/ANO_EXEMPLO,
             *   FR FONTE_EXEMPLO_B
             * - seguro de vida dos estagiários / Seguradora Exemplo ->
             *   NE 7012/ANO_EXEMPLO, FR FONTE_EXEMPLO_B
             * - DARF de folha com INSS + IRRF e valor > R$ 100 mil ->
             *   NE 7006/ANO_EXEMPLO, FR FONTE_EXEMPLO_D
             * - FGTS Digital / GFD e valor > R$ 100 mil ->
             *   NE 7006/ANO_EXEMPLO, FR FONTE_EXEMPLO_D
             * - água/esgoto (fluxo sem CI; títulos iniciais da árvore) ->
             *   NE 7015/ANO_EXEMPLO, FR FONTE_EXEMPLO_B
             * - parcelamento FGTS ->
             *   NE 7001/ANO_EXEMPLO, FR FONTE_EXEMPLO_A OU NE 7006/ANO_EXEMPLO, FR FONTE_EXEMPLO_D
             *   enquanto a NL não confirmar qual empenho foi usado
             * - tributos federais sobre receitas próprias / outorga /
             *   intraorçamentário, com valor > R$ 100 mil ->
             *   NE 7013/ANO_EXEMPLO, FR FONTE_EXEMPLO_A
             */
            const textoNormalizadoPrimeiraPeca =
                normalizar(
                    textoPlano
                );

            let correspondenciaDeterministica =
                null;

            const registrarCorrespondenciaDeterministica =
                (
                    ne,
                    fonte,
                    tipo,
                    evidencias
                ) => ({
                    detectada: true,
                    pontos: 999,
                    empenho: ne,
                    ne,
                    fonte,
                    tipoCorrespondencia:
                        'deterministica',
                    item: {
                        empenho: ne,
                        fonte,
                        familia: tipo
                    },
                    evidencias,
                    dadosPrimeiraPeca:
                        dados
                });

            const valoresMonetariosPrimeiraPeca =
                [
                    ...textoPlano.matchAll(
                        /(?:R\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2})/g
                    )
                ]
                    .map(
                        match =>
                            Number(
                                String(
                                    match[1] || ''
                                )
                                    .replace(
                                        /\./g,
                                        ''
                                    )
                                    .replace(
                                        ',',
                                        '.'
                                    )
                            )
                    )
                    .filter(
                        Number.isFinite
                    );

            const valorMaximoPrimeiraPeca =
                valoresMonetariosPrimeiraPeca.length
                    ? Math.max(
                        ...valoresMonetariosPrimeiraPeca
                    )
                    : 0;

            const valorExpressivoFolha =
                valorMaximoPrimeiraPeca >
                    100000;

            /*
             * FOLHA MENSAL EXPRESSIVA — v9.9.132
             *
             * Caso sintético de regressão PROCESSO_EXEMPLO_023:
             * a CI trata da folha mensal completa (VALOR_REAL_OMITIDO) e,
             * dentro da discriminação, também menciona "FOLHA SUPLEMENTAR".
             *
             * A regra antiga via essa expressão isolada e concluía NE 7001.
             * Porém, numa folha mensal grande, "FOLHA SUPLEMENTAR" é apenas
             * uma das parcelas e não identifica o empenho principal.
             *
             * Portanto, quando houver contexto explícito de folha mensal,
             * valor > R$ 100 mil e sinais de encargos (FGTS/INSS/IRRF),
             * usamos o leque conservador de empenhos.
             */
            const folhaMensalExpressiva =
                valorExpressivoFolha &&
                (
                    /\bASSUNTO\s*:\s*FOLHA\s+DE\s+PAGAMENTO\b/i.test(
                        textoPlano
                    ) ||
                    /\bFOLHA\s+DE\s+PAGAMENTO\s+(?:DO\s+M[EÊ]S\s+DE\s+)?[A-ZÇÃÕÉÊÍÓÚ]+\s*\/?\s*20\d{2}\b/i.test(
                        textoPlano
                    ) ||
                    /\bFOLHA\s+DE\s+PAGAMENTO\b/i.test(
                        textoPlano
                    )
                );

            const folhaMensalTemEncargos =
                /\b(?:FGTS|INSS|IRRF)\b/i.test(
                    textoPlano
                );

            /*
             * TRIBUTOS SOBRE RECEITAS PRÓPRIAS — NE 7013
             *
             * O padrão mensal nasce na Divisão de Contabilidade e costuma
             * mencionar OUTORGA e/ou INTRAORÇAMENTÁRIO, além de Receitas
             * Próprias. Exigimos valor > R$ 100 mil para manter o destaque
             * "Valor expressivo" e reduzir colisões com recolhimentos menores.
             */
            const tributosReceitasPropriasExemplo =
                valorMaximoPrimeiraPeca >
                    100000 &&
                /\bRECEITAS?\s+PR[ÓO]PRIAS?\b/i.test(
                    textoPlano
                ) &&
                (
                    /\bOUTORGA\b/i.test(
                        textoPlano
                    ) ||
                    /\bINTRAOR[CÇ]AMENT[ÁA]RIO\b/i.test(
                        textoPlano
                    ) ||
                    /\bINTRAOR[CÇ]AMENT[ÁA]RI[AO]S?\b/i.test(
                        textoPlano
                    )
                ) &&
                (
                    /\bIRPJ\b/i.test(
                        textoPlano
                    ) ||
                    /\bCSLL\b/i.test(
                        textoPlano
                    ) ||
                    /\bPIS\/?PASEP\b/i.test(
                        textoPlano
                    ) ||
                    /\bCOFINS\b/i.test(
                        textoPlano
                    ) ||
                    /\bTRIBUTOS?\s+FEDERAIS?\b/i.test(
                        textoPlano
                    )
                );

            const darfFolhaExemplo =
                valorExpressivoFolha &&
                /\bDARF\b/i.test(
                    textoPlano
                ) &&
                /\b(?:INSS|PREVID[EÊ]NCIA\s+SOCIAL|CONTRIBUI[CÇ][AÃ]O\s+PREVIDENCI[AÁ]RIA)\b/i.test(
                    textoPlano
                ) &&
                /\bIRRF\b/i.test(
                    textoPlano
                );

            const parcelamentoFgts =
                /\bPARCELAMENTO\s+(?:DE\s+|DO\s+)?FGTS\b/i.test(
                    textoPlano
                ) ||
                /\bPAGAMENTO\s+(?:DE\s+|DO\s+)?PARCELAMENTO\s+(?:DE\s+|DO\s+)?FGTS\b/i.test(
                    textoPlano
                );

            const fgtsFolhaExemplo =
                valorExpressivoFolha &&
                (
                    /\bFGTS\s+DIGITAL\b/i.test(
                        textoPlano
                    ) ||
                    /\bGFD\b/i.test(
                        textoPlano
                    ) ||
                    /\bPAGAMENTO\s+GUIA\s+DO\s+FGTS\b/i.test(
                        textoPlano
                    )
                ) &&
                /\bFGTS\b/i.test(
                    textoPlano
                );

            const seguroEstagiarios =
                (
                    /\bPAGAMENTO\s+DE\s+SEGURO\b/i.test(
                        textoPlano
                    ) ||
                    /\bSEGURO\s+DE\s+VIDA\b/i.test(
                        textoPlano
                    )
                ) &&
                (
                    /\bESTAGI[AÁ]RIOS?\b/i.test(
                        textoPlano
                    ) ||
                    /\bPORTO\s+SEGURO\b/i.test(
                        textoPlano
                    ) ||
                    /\b(?:AP[ÓO]LICE|VIDAS?)\b/i.test(
                        textoPlano
                    )
                );

            /*
             * CEO — SAÚDE OCUPACIONAL — v9.9.144
             *
             * Caso sintético de regressão:
             * PROCESSO_EXEMPLO_024
             *
             * Primeira peça:
             * CI ORG/ADM/PESSOAL nº 37, com referência expressa à
             * CEO - PRESTADOR_OCUPACIONAL_EXEMPLO e a serviços de
             * Medicina do Trabalho / Saúde Ocupacional.
             *
             * Para evitar colisões com usos genéricos da sigla "CEO",
             * exigimos conjuntamente:
             * - primeira peça gerada por DGAP-GP ou DGAP;
             * - identificação da empresa CEO/PRESTADOR_OCUPACIONAL_EXEMPLO;
             * - contexto forte de saúde/medicina ocupacional.
             */
            const primeiraPecaEhDgap =
                [
                    'ORG/ADM/PESSOAL',
                    'ORG/ADM'
                ].some(
                    unidade =>
                        normalizarUnidade(
                            primeiraPeca.unidadeGeradora || ''
                        ) ===
                        normalizarUnidade(
                            unidade
                        )
                );

            const mencionaCeoOcupacional =
                (
                    /\bCEO\b/i.test(
                        textoPlano
                    ) ||
                    /\bCENTRO\s+DE\s+EDUCA[CÇ][AÃ]O\s+OCUPACIONAL\b/i.test(
                        textoPlano
                    )
                ) &&
                (
                    /\bSA[ÚU]DE\s+OCUPACIONAL\b/i.test(
                        textoPlano
                    ) ||
                    /\bMEDICINA\s+(?:DO\s+TRABALHO|OCUPACIONAL)\b/i.test(
                        textoPlano
                    ) ||
                    /\bASSESSORIA\s+E\s+MEDICINA\s+DO\s+TRABALHO\b/i.test(
                        textoPlano
                    ) ||
                    /\bEXAMES?\s+OCUPACIONAIS?\b/i.test(
                        textoPlano
                    ) ||
                    /\bASO\s+CL[IÍ]NICO\b/i.test(
                        textoPlano
                    )
                );

            const ceoSaudeOcupacional =
                primeiraPecaEhDgap &&
                mencionaCeoOcupacional;

            if (
                ceoSaudeOcupacional
            ) {
                correspondenciaDeterministica =
                    registrarCorrespondenciaDeterministica(
                        7017,
                        'FONTE_EXEMPLO_B',
                        'CEO / SAUDE OCUPACIONAL',
                        [
                            'CEO - PRESTADOR_OCUPACIONAL_EXEMPLO',
                            'Saúde / Medicina Ocupacional',
                            `Primeira peça: ${primeiraPeca.unidadeGeradora || 'DGAP'}`
                        ]
                    );
            } else if (
                tributosReceitasPropriasExemplo
            ) {
                correspondenciaDeterministica =
                    registrarCorrespondenciaDeterministica(
                        7013,
                        'FONTE_EXEMPLO_A',
                        'RECEITAS PRÓPRIAS / TRIBUTOS',
                        [
                            'Tributos federais sobre receitas próprias / outorga / intraorçamentário'
                        ]
                    );

                correspondenciaDeterministica.valorExpressivo =
                    true;
                correspondenciaDeterministica.valorReferencia =
                    valorMaximoPrimeiraPeca;
            } else if (
                folhaMensalExpressiva
            ) {
                correspondenciaDeterministica =
                    registrarCorrespondenciaDeterministica(
                        null,
                        '',
                        'FOLHA / INSS / FGTS',
                        [
                            'Folha mensal expressiva; empenho ainda não determinado' + (folhaMensalTemEncargos ? ' (com FGTS/INSS/IRRF)' : '')
                        ]
                    );

                correspondenciaDeterministica.descricaoCorrespondenciaCustom =
                    'FOLHA, NE 7001, 7002, 7003, 7004 ou 7005/ANO_EXEMPLO, FR FONTE_EXEMPLO_A ou FONTE_EXEMPLO_C — INSS/FGTS, NE 7006 ou 7007/ANO_EXEMPLO, FR FONTE_EXEMPLO_D';

                correspondenciaDeterministica.valorExpressivo =
                    true;

                correspondenciaDeterministica.valorReferencia =
                    valorMaximoPrimeiraPeca;

                correspondenciaDeterministica.tipoCorrespondencia =
                    'deterministica-ambigua-folha-mensal';

            } else if (
                parcelamentoFgts
            ) {
                /*
                 * Parcelamento de FGTS pode cair em empenhos de folha
                 * distintos. Enquanto a NL não for lida para confirmar
                 * o empenho, mostramos as duas possibilidades conhecidas.
                 */
                correspondenciaDeterministica =
                    registrarCorrespondenciaDeterministica(
                        null,
                        '',
                        'PARCELAMENTO FGTS',
                        [
                            'Parcelamento de FGTS'
                        ]
                    );

                correspondenciaDeterministica.descricaoCorrespondenciaCustom =
                    'FOLHA, NE 7001, 7002, 7003, 7004 ou 7005/ANO_EXEMPLO, FR FONTE_EXEMPLO_A ou FONTE_EXEMPLO_C — INSS/FGTS, NE 7006 ou 7007/ANO_EXEMPLO, FR FONTE_EXEMPLO_D';
                correspondenciaDeterministica.valorExpressivo =
                    true;
                correspondenciaDeterministica.valorReferencia =
                    valorMaximoPrimeiraPeca;
                correspondenciaDeterministica.tipoCorrespondencia =
                    'deterministica-ambigua';
            } else if (
                darfFolhaExemplo ||
                fgtsFolhaExemplo
            ) {
                correspondenciaDeterministica =
                    registrarCorrespondenciaDeterministica(
                        7006,
                        'FONTE_EXEMPLO_D',
                        'FOLHA / INSS / IRRF / FGTS',
                        [
                            darfFolhaExemplo
                                ? 'DARF de folha com INSS + IRRF e valor expressivo'
                                : 'FGTS Digital / GFD com valor expressivo'
                        ]
                    );

                /*
                 * v9.9.111:
                 * há empenhos 7006 e 7007/ANO_EXEMPLO com o mesmo objeto-base de
                 * folha/INSS/FGTS. Enquanto a peça inicial não permitir
                 * distinguir qual deles foi usado, a sinalização mostra
                 * ambos de forma conservadora.
                 */
                /*
                 * v9.9.129:
                 * ainda não há segurança suficiente para afirmar que o
                 * principal da folha está apenas nas NEs sintéticas de exemplo.
                 * Mantemos, portanto, o mesmo leque conservador usado no
                 * parcelamento FGTS.
                 */
                correspondenciaDeterministica.descricaoCorrespondenciaCustom =
                    'FOLHA, NE 7001, 7002, 7003, 7004 ou 7005/ANO_EXEMPLO, FR FONTE_EXEMPLO_A ou FONTE_EXEMPLO_C — INSS/FGTS, NE 7006 ou 7007/ANO_EXEMPLO, FR FONTE_EXEMPLO_D';

                correspondenciaDeterministica.valorExpressivo =
                    true;
                correspondenciaDeterministica.valorReferencia =
                    valorMaximoPrimeiraPeca;
            } else if (
                seguroEstagiarios
            ) {
                correspondenciaDeterministica =
                    registrarCorrespondenciaDeterministica(
                        7012,
                        'FONTE_EXEMPLO_B',
                        'SEGURO ESTAGIÁRIOS',
                        [
                            'Seguro de vida dos estagiários / Seguradora Exemplo'
                        ]
                    );
            } else if (
                /\b(?:W\s+FIBRA|W\s+EMPRESAS)\s+TELECOM\b/i.test(
                    textoPlano
                ) ||
                (
                    /\blink\s+de\s+internet\b/i.test(
                        textoPlano
                    ) &&
                    /\b(?:DPR|S[AÃ]O\s+LOUREN[CÇ]O|ALMOXARIFADO)\b/i.test(
                        textoPlano
                    )
                )
            ) {
                correspondenciaDeterministica =
                    registrarCorrespondenciaDeterministica(
                        7010,
                        'FONTE_EXEMPLO_B',
                        'INTERNET / OPERADORA_EXEMPLO',
                        [
                            'Operadora Exemplo / link de internet DPR-Almoxarifado'
                        ]
                    );
            } else if (
                detectarArtRrtTecnica(
                    textoPlano
                ).rrtTecnica
            ) {
                correspondenciaDeterministica =
                    registrarCorrespondenciaDeterministica(
                        7009,
                        'FONTE_EXEMPLO_A',
                        'RRT / CAU',
                        [
                            'RRT técnica / CAU'
                        ]
                    );
            } else if (
                detectarArtRrtTecnica(
                    textoPlano
                ).artTecnica
            ) {
                correspondenciaDeterministica =
                    registrarCorrespondenciaDeterministica(
                        7008,
                        'FONTE_EXEMPLO_A',
                        'ART / CREA',
                        [
                            'ART técnica / CREA'
                        ]
                    );
            } else if (
                /*
                 * PENSÕES / PAGAMENTOS PEQUENOS DE FOLHA — v9.9.134
                 *
                 * Casos reais:
                 * - PROCESSO_EXEMPLO_021 — Pensão de dependentes;
                 * - PROCESSO_EXEMPLO_022 — Pensão Vitalícia.
                 *
                 * São despesas de Gestão de Pessoas, de baixo valor,
                 * sem contexto de tributos/encargos, e entram no grupo
                 * genérico de FOLHA, sem individualização do empenho.
                 */
                valorMaximoPrimeiraPeca > 0 &&
                valorMaximoPrimeiraPeca < 100000 &&
                (
                    /\bASSUNTO\s*:\s*PAGAMENTO\s+PENS[AÃ]O\b/i.test(
                        textoPlano
                    ) ||
                    /\bPENS[AÃ]O\s+VITAL[IÍ]CIA\b/i.test(
                        textoPlano
                    ) ||
                    /\bFOLHA\s+DE\s+PAGAMENTO\s+DA\s+PENS[AÃ]O\b/i.test(
                        textoPlano
                    ) ||
                    /\bPENS[AÃ]O\s+DOS\s+DEPENDENTES\b/i.test(
                        textoPlano
                    )
                ) &&
                !/\b(?:FGTS|INSS|IRRF|DARF|TRIBUTO|IMPOSTO)\b/i.test(
                    textoPlano
                )
            ) {
                correspondenciaDeterministica =
                    registrarCorrespondenciaDeterministica(
                        null,
                        '',
                        'FOLHA / INSS / FGTS',
                        [
                            'Pensão / pensão vitalícia vinculada à folha; empenho não individualizado por orientação gerencial'
                        ]
                    );

                correspondenciaDeterministica.descricaoCorrespondenciaCustom =
                    'FOLHA, NE 7001, 7002, 7003, 7004 ou 7005/ANO_EXEMPLO, FR FONTE_EXEMPLO_A ou FONTE_EXEMPLO_C — INSS/FGTS, NE 7006 ou 7007/ANO_EXEMPLO, FR FONTE_EXEMPLO_D';

                correspondenciaDeterministica.valorExpressivo =
                    valorExpressivoFolha;

                correspondenciaDeterministica.valorReferencia =
                    valorMaximoPrimeiraPeca;

                correspondenciaDeterministica.tipoCorrespondencia =
                    'deterministica-ambigua-folha-generica';

            } else if (
                /\bFOLHA\s+SUPLEMENTAR\b/i.test(
                    textoPlano
                )
            ) {
                correspondenciaDeterministica =
                    registrarCorrespondenciaDeterministica(
                        null,
                        '',
                        'FOLHA / INSS / FGTS',
                        [
                            'Folha suplementar; empenho não individualizado por orientação gerencial'
                        ]
                    );

                correspondenciaDeterministica.descricaoCorrespondenciaCustom =
                    'FOLHA, NE 7001, 7002, 7003, 7004 ou 7005/ANO_EXEMPLO, FR FONTE_EXEMPLO_A ou FONTE_EXEMPLO_C — INSS/FGTS, NE 7006 ou 7007/ANO_EXEMPLO, FR FONTE_EXEMPLO_D';

                correspondenciaDeterministica.valorExpressivo =
                    valorExpressivoFolha;

                correspondenciaDeterministica.valorReferencia =
                    valorMaximoPrimeiraPeca;

                correspondenciaDeterministica.tipoCorrespondencia =
                    'deterministica-ambigua-folha-generica';
            } else if (
                (
                    /\bREFRIGERA[CÇ][AÃ]O\b/i.test(
                        textoPlano
                    ) ||
                    /\bAR\s+CONDICIONADO\b/i.test(
                        textoPlano
                    )
                ) &&
                (
                    /\bMANUTEN[CÇ][AÃ]O\s+PREVENTIVA\b/i.test(
                        textoPlano
                    ) ||
                    /\bMANUTEN[CÇ][AÃ]O\s+CORRETIVA\b/i.test(
                        textoPlano
                    ) ||
                    /\bSISTEMA\s+DE\s+REFRIGERA[CÇ][AÃ]O\b/i.test(
                        textoPlano
                    )
                )
            ) {
                /*
                 * REFRIGERAÇÃO — v9.9.133
                 *
                 * Exemplo real:
                 * PROCESSO_EXEMPLO_013
                 * Contrato CONTRATO_EXEMPLO_003 — manutenção preventiva e corretiva
                 * no sistema de refrigeração da ORGAO_EXEMPLO.
                 *
                 * Associação conhecida:
                 * NE 7014/ANO_EXEMPLO — FR FONTE_EXEMPLO_B.
                 */
                correspondenciaDeterministica =
                    registrarCorrespondenciaDeterministica(
                        7014,
                        'FONTE_EXEMPLO_B',
                        'REFRIGERACAO',
                        [
                            'Manutenção preventiva/corretiva de refrigeração ou ar-condicionado'
                        ]
                    );

            } else if (
                /\bCONCESSIONARIA_EXEMPLO\b/i.test(
                    textoPlano
                ) ||
                /\bCONCESSIONARIA_EXEMPLO\b/i.test(
                    textoPlano
                ) ||
                /\bFORNECIMENTO\s+DE\s+ENERGIA\s+EL[EÉ]TRICA\b/i.test(
                    textoPlano
                )
            ) {
                correspondenciaDeterministica =
                    registrarCorrespondenciaDeterministica(
                        7011,
                        'FONTE_EXEMPLO_B',
                        'ENERGIA ELÉTRICA',
                        [
                            'CONCESSIONARIA_EXEMPLO/CONCESSIONARIA_EXEMPLO / fornecimento de energia elétrica da ORGAO_EXEMPLO'
                        ]
                    );
            }

            if (
                /\barts?\.\s*\d/i.test(
                    textoPlano
                ) &&
                !detectarArtRrtTecnica(
                    textoPlano
                ).artTecnica
            ) {
                console.debug(
                    '[SEI][ART] Referência jurídica ignorada; não é ART técnica:',
                    textoPlano.match(
                        /\barts?\.\s*\d[^.;,]*/i
                    )?.[0] || 'artigo legal'
                );
            }

            if (
                correspondenciaDeterministica
            ) {
                console.info(
                    '[SEI][Não-repasse] Correspondência determinística de empenho:',
                    correspondenciaDeterministica
                );

                return correspondenciaDeterministica;
            }

            /*
             * Se não houver um campo "OBJETO" bem formado, usamos o texto
             * inteiro da primeira peça como campo auxiliar. Isso permite
             * reconhecer expressões raras como SOFTWARE_EXEMPLO sem transformar
             * palavras genéricas em evidência forte.
             */
            const dadosComparacao = {
                credor:
                    dados.credor,
                contrato:
                    dados.contrato,
                objeto:
                    dados.objeto ||
                    textoPlano
            };

            const melhor =
                compararComDicionarioBasePublica(
                    dadosComparacao
                );

            if (!melhor) {
                return {
                    ...resultadoVazio,
                    dadosPrimeiraPeca:
                        dados
                };
            }

            const LIMIAR_FORTE_BASE_PUBLICA =
                60;

            const detectada =
                melhor.pontos >=
                LIMIAR_FORTE_BASE_PUBLICA;

            /*
             * TRAVA DE SEGURANÇA — FOLHA MENSAL EXPRESSIVA — v9.9.135
             *
             * Mesmo que o dicionário genérico associe "FOLHA DE PAGAMENTO"
             * à NE 7001/ANO_EXEMPLO, uma CI mensal de valor superior a R$ 100 mil
             * NÃO pode ser fechada prematuramente na NE 7001.
             *
             * Nesses casos, prevalece o leque conservador até que a NL/NE
             * permita confirmar quais empenhos foram efetivamente usados.
             *
             * Regressão: PROCESSO_EXEMPLO_023.
             */
            /*
             * FOLHA SEM APOSTA DE EMPENHO — v9.9.145
             *
             * Orientação gerencial:
             * qualquer despesa reconhecida como folha deve permanecer
             * genérica quanto ao empenho. Não fixamos mais NE 7001, 7002, 7003,
             * 5, 8, 371 ou 372 a partir da primeira peça.
             *
             * O mesmo texto conservador é usado para folha mensal,
             * suplementar, pensões e correspondências de folha vindas
             * do dicionário. "Valor expressivo" continua aparecendo
             * quando o maior valor identificado superar R$ 100 mil.
             */
            const familiaMelhor =
                normalizar(
                    melhor.item?.familia || ''
                );

            const textoIndicaFolha =
                /\bFOLHA\s+DE\s+PAGAMENTO\b/i.test(
                    textoPlano
                ) ||
                /\bFOLHA\s+SUPLEMENTAR\b/i.test(
                    textoPlano
                ) ||
                /\bPENS[AÃ]O(?:\s+VITAL[IÍ]CIA)?\b/i.test(
                    textoPlano
                ) ||
                /\b(?:FGTS|INSS)\b/i.test(
                    textoPlano
                );

            const dicionarioTentouIndividualizarFolha =
                detectada &&
                (
                    familiaMelhor.includes(
                        normalizar('FOLHA')
                    ) ||
                    textoIndicaFolha
                );

            if (
                dicionarioTentouIndividualizarFolha
            ) {
                const folhaAmbigua =
                    registrarCorrespondenciaDeterministica(
                        null,
                        '',
                        'FOLHA / INSS / FGTS',
                        [
                            'Despesa de folha; empenho não individualizado por orientação gerencial'
                        ]
                    );

                folhaAmbigua.descricaoCorrespondenciaCustom =
                    'FOLHA, NE 7001, 7002, 7003, 7004 ou 7005/ANO_EXEMPLO, FR FONTE_EXEMPLO_A ou FONTE_EXEMPLO_C — INSS/FGTS, NE 7006 ou 7007/ANO_EXEMPLO, FR FONTE_EXEMPLO_D';

                folhaAmbigua.valorExpressivo =
                    valorExpressivoFolha;

                folhaAmbigua.valorReferencia =
                    valorMaximoPrimeiraPeca;

                folhaAmbigua.tipoCorrespondencia =
                    'deterministica-ambigua-folha-generica';

                console.info(
                    '[SEI][Folha] Empenho individual bloqueado; usando leque genérico:',
                    {
                        valor:
                            valorMaximoPrimeiraPeca,
                        valorExpressivo:
                            valorExpressivoFolha,
                        melhorEmpenho:
                            melhor.item?.empenho,
                        familia:
                            melhor.item?.familia || ''
                    }
                );

                return folhaAmbigua;
            }

            if (detectada) {
                console.info(
                    '[SEI][FR FONTE_EXEMPLO_A] Correspondência forte na primeira peça:',
                    {
                        empenho:
                            melhor.item.empenho,
                        pontos:
                            melhor.pontos,
                        evidencias:
                            melhor.evidencias,
                        dados
                    }
                );
            }

            return {
                detectada,
                pontos:
                    melhor.pontos,
                empenho:
                    melhor.item?.empenho ??
                    null,
                ne:
                    melhor.item?.empenho ??
                    null,
                fonte:
                    detectada
                        ? 'FONTE_EXEMPLO_A'
                        : '',
                tipoCorrespondencia:
                    detectada
                        ? 'dicionario-base-publica'
                        : '',
                item:
                    melhor.item || null,
                evidencias:
                    melhor.evidencias || [],
                dadosPrimeiraPeca:
                    dados
            };
        } catch (erro) {
            console.warn(
                '[SEI][FR FONTE_EXEMPLO_A] Falha ao comparar primeira peça:',
                erro
            );

            return resultadoVazio;
        }
    }


    /*
     * PADRÃO VISUAL DE CATEGORIA CURTA (v9.9.101)
     *
     * Sempre que a família for conhecida, a sinalização mostra:
     *   NE XX/2026, CATEGORIA, FR X.XXX.XX
     *
     * Categorias atuais:
     *   ART, RRT, FOLHA, INTERNET, ENERGIA, ÁGUA/ESGOTO,
     *   SEGURO, FOLHA/FGTS, TRIBUTOS, etc.
     */

    /*
     * RECEITAS PRÓPRIAS / TRIBUTOS — NE 7013 (v9.9.100)
     *
     * Reconhecimento precoce pela primeira peça:
     * - "Receitas Próprias";
     * - OUTORGA e/ou INTRAORÇAMENTÁRIO;
     * - contexto de tributos federais (IRPJ/CSLL/PIS-PASEP/COFINS);
     * - valor > R$ 100.000,00.
     *
     * Associação:
     *   NE 7013/ANO_EXEMPLO, FR FONTE_EXEMPLO_A
     *
     * Pendente:
     *   Pendente — correspondência NE 7013/ANO_EXEMPLO, TRIBUTOS,
     *   FR FONTE_EXEMPLO_A - Valor expressivo ⚠️ (tempo)
     *
     * Arquivado:
     *   Arquivamento provável 🗂️ — Correspondência NE 7013/ANO_EXEMPLO,
     *   TRIBUTOS, FR FONTE_EXEMPLO_A - Valor expressivo ⚠️
     */

    /*
     * PENSÕES / PAGAMENTOS PEQUENOS DE FOLHA — v9.9.134
     *
     * Reconhecimento pela primeira peça quando houver:
     * - Pensão / Pensão Vitalícia / folha de pagamento da pensão;
     * - valor positivo inferior a R$ 100 mil;
     * - ausência de FGTS, INSS, IRRF, DARF ou contexto tributário.
     *
     * Associação:
     *   FOLHA com leque genérico de empenhos/fontes, sem aposta individual.
     *
     * Regressões:
     *   PROCESSO_EXEMPLO_021
     *   PROCESSO_EXEMPLO_022
     */

    /*
     * FOLHA MENSAL EXPRESSIVA — v9.9.132
     *
     * Regressão real: PROCESSO_EXEMPLO_023.
     * Uma folha mensal completa pode conter a linha "FOLHA SUPLEMENTAR"
     * sem que isso signifique que toda a despesa será liquidada na NE 7001.
     * Quando valor > R$ 100 mil + contexto explícito de folha mensal,
     * prevalece o leque conservador de NEs/FRs. FGTS/INSS/IRRF reforçam
     * a evidência, mas não são mais requisito para impedir a NE 7001.
     */

    /*
     * LEQUE CONSERVADOR DE EMPENHOS DE FOLHA — v9.9.110
     *
     * Nos casos ainda duvidosos de folha/parcelamento, não tentamos
     * antecipar uma única NE. A sinalização lista todas as possibilidades
     * informadas para facilitar a futura associação por palavras da CI/NL.
     */

    /*
     * PARCELAMENTO FGTS — NE AMBÍGUA (v9.9.99)
     *
     * Primeira peça com:
     *   "parcelamento FGTS" / "parcelamento de FGTS"
     *
     * Enquanto a Nota de Liquidação ainda não for lida para confirmar
     * o empenho, o relatório mostra um leque conservador das NEs de folha:
     *
     *   FOLHA:
     *   NE 7001, 7002, 7003, 7004 ou 7005/ANO_EXEMPLO, FR FONTE_EXEMPLO_A ou FONTE_EXEMPLO_C
     *
     *   INSS/FGTS:
     *   NE 7006 ou 7007/ANO_EXEMPLO, FR FONTE_EXEMPLO_D
     *
     * A família recebe "Valor expressivo ⚠️" independentemente do
     * limite de R$ 100 mil usado no DARF/FGTS Digital.
     */

    /*
     * REFRIGERAÇÃO — NE 7014 (v9.9.133)
     *
     * Reconhecimento forte pela primeira peça quando houver:
     * - REFRIGERAÇÃO ou AR CONDICIONADO;
     * - e contexto de MANUTENÇÃO PREVENTIVA/CORRETIVA ou
     *   SISTEMA DE REFRIGERAÇÃO.
     *
     * Associação:
     *   NE 7014/ANO_EXEMPLO, FR FONTE_EXEMPLO_B
     *
     * Regressão:
     *   PROCESSO_EXEMPLO_013
     */

    /*
     * ÁGUA / ESGOTO — NE 7015 (v9.9.98)
     *
     * Caso sem CI interna: o processo pode iniciar por PDFs.
     *
     * Evidência forte nas primeiras 5 peças da árvore:
     * - título com ÁGUA + ESGOTO; ou
     * - pelo menos 2 títulos iniciais de conta/ofício ligados a
     *   água/esgoto.
     *
     * Associação:
     *   NE 7015/ANO_EXEMPLO, FR FONTE_EXEMPLO_B
     *
     * Pendente:
     *   Pendente — correspondência NE 7015/ANO_EXEMPLO, ÁGUA/ESGOTO, FR FONTE_EXEMPLO_B (tempo)
     *
     * Arquivado:
     *   Arquivamento provável 🗂️ — ÁGUA/ESGOTO, NE 7015/ANO_EXEMPLO, FR FONTE_EXEMPLO_B
     */

    /*
     * FOLHA / INSS / IRRF / FGTS — NE 7006 (v9.9.97)
     *
     * Associação determinística somente com valor > R$ 100.000,00:
     *
     * DARF:
     *   DARF + INSS/Previdência + IRRF
     *
     * FGTS:
     *   FGTS Digital / GFD / Pagamento Guia do FGTS
     *
     * Associação conservadora:
     *   FOLHA, NE 7001, 7002, 7003, 7004 ou 7005/ANO_EXEMPLO, FR FONTE_EXEMPLO_A ou FONTE_EXEMPLO_C
     *   INSS/FGTS, NE 7006 ou 7007/ANO_EXEMPLO, FR FONTE_EXEMPLO_D
     *
     * Pendente:
     *   Pendente — FOLHA, NE 7001, 7002, 7003, 7004 ou 7005/ANO_EXEMPLO,
     *   FR FONTE_EXEMPLO_A ou FONTE_EXEMPLO_C — INSS/FGTS,
     *   NE 7006 ou 7007/ANO_EXEMPLO, FR FONTE_EXEMPLO_D - Valor expressivo ⚠️ (...)
     *
     * Arquivado:
     *   Arquivamento provável 🗂️ — FOLHA, NE 7001, 7002, 7003, 7004 ou 7005/ANO_EXEMPLO,
     *   FR FONTE_EXEMPLO_A ou FONTE_EXEMPLO_C — INSS/FGTS,
     *   NE 7006 ou 7007/ANO_EXEMPLO, FR FONTE_EXEMPLO_D - Valor expressivo ⚠️
     */

    /*
     * SEGURO DOS ESTAGIÁRIOS (v9.9.96)
     *
     * Primeira peça com contexto forte:
     * - "PAGAMENTO DE SEGURO" ou "SEGURO DE VIDA";
     * - e "ESTAGIÁRIOS", "SEGURADORA_EXEMPLO", "APÓLICE" ou "VIDAS".
     *
     * Associação:
     *   NE 7012/ANO_EXEMPLO, FR FONTE_EXEMPLO_B
     *
     * Enquanto sem comprovante:
     *   Pendente — correspondência NE 7012/ANO_EXEMPLO, FR FONTE_EXEMPLO_B (...)
     *
     * Após pagamento/conclusão:
     *   Arquivamento provável 🗂️ — SEGURO, NE 7012/ANO_EXEMPLO, FR FONTE_EXEMPLO_B
     */

    /*
     * ARQUIVAMENTO COM CONTEXTO (v9.9.93)
     *
     * Quando houver correspondência conhecida:
     *   Arquivamento provável 🗂️ — SIGLA, NE XX/2026, FR X.XXX.XX
     *
     * A palavra "Pendente" nunca acompanha o arquivamento.
     */

    /*
     * CASO DE REGRESSÃO DARF/FOLHA (v9.9.92)
     *
     * PROCESSO_EXEMPLO_014:
     * - Pagamento DARF;
     * - Previdência Social / INSS;
     * - IRRF;
     * - VALOR_REAL_OMITIDO;
     * => Pendente — folha/DARF (INSS + IRRF) - Valor expressivo ⚠️
     *
     * O destaque "Valor expressivo" exige valor > R$ 100.000,00.
     */

    /*
     * CASOS DE REGRESSÃO ART (v9.9.91)
     *
     * Devem ser FALSOS:
     * - "conforme art. 1º, III, b, da Lei 11.419/2006"
     * - "Conforme o Art. 714, § 1º, inciso XVII..."
     *
     * Devem ser VERDADEIROS:
     * - "PAGAMENTO DE ART"
     * - "Boleto de pagamento de ART"
     * - "ART nº 2020260257394"
     * - "ANOTAÇÃO DE RESPONSABILIDADE TÉCNICA - CREA"
     */

    const ID_BOTAO = 'mv-sei-extrator-v145';
    const ID_MODAL = 'mv-sei-modal-v145';
    const ID_ESTILO = 'mv-sei-estilo-v145';
    const INTERVALO = 650;

    let resultados = [];
    let emAndamento = false;
    let cancelado = false;

    iniciar();

    function iniciar() {
        criarEstilos();
        tentarCriarBotao();

        new MutationObserver(tentarCriarBotao).observe(
            document.documentElement,
            { childList: true, subtree: true }
        );

        setInterval(tentarCriarBotao, 1500);
    }

    function tentarCriarBotao() {
        /*
         * BOTÃO SOMENTE NO ACOMPANHAMENTO ESPECIAL — v9.9.138
         *
         * O menu lateral do SEI contém a expressão "Acompanhamento Especial"
         * em praticamente todas as telas. Por isso, texto da página não é
         * suficiente para identificar a tela correta.
         *
         * Também removemos o botão se a navegação interna do SEI trocar
         * de tela sem recarregar completamente a página.
         */
        if (!ehTelaAcompanhamento()) {
            document.getElementById(
                ID_BOTAO
            )?.remove();

            return;
        }

        if (document.getElementById(ID_BOTAO)) {
            return;
        }

        const botao = document.createElement('button');
        botao.id = ID_BOTAO;
        botao.type = 'button';
        botao.textContent = 'Relatório Scraping/RPA\n(instável 🔥⚗️)';
        botao.title = 'Relatório Scraping/RPA (instável)';
        botao.addEventListener('click', executar);

        const barra = localizarBarraAcoes();
        const tabela = localizarTabela();

        if (barra) {
            barra.insertAdjacentElement('afterend', botao);
        } else if (tabela?.parentElement) {
            tabela.parentElement.insertBefore(botao, tabela);
        } else {
            document.body.prepend(botao);
        }
    }

    function ehTelaAcompanhamento() {
        /*
         * Critério estrutural, não apenas textual.
         *
         * A tela válida precisa possuir a tabela específica do
         * Acompanhamento Especial, reconhecida pelos cabeçalhos:
         * Processo + Usuário + Grupo.
         *
         * Isso evita falso positivo em Blocos de Assinatura, Pesquisa,
         * Controle de Processos etc., onde "Acompanhamento Especial"
         * aparece apenas no menu lateral.
         */
        const tabelaAcompanhamento =
            localizarTabela();

        if (!tabelaAcompanhamento) {
            return false;
        }

        const textoTabela =
            normalizar(
                tabelaAcompanhamento.innerText || ''
            );

        return (
            textoTabela.includes('processo') &&
            textoTabela.includes('usuario') &&
            textoTabela.includes('grupo')
        );
    }

    function localizarBarraAcoes() {
        return [...document.querySelectorAll('div, td, span')].find(el => {
            const texto = normalizar(el.innerText || '');

            return texto.includes('baixar') &&
                texto.includes('copiar') &&
                texto.includes('pesquisar');
        });
    }

    function localizarTabela() {
        return [...document.querySelectorAll('table')].find(tabela => {
            const texto = normalizar(tabela.innerText || '');

            return texto.includes('processo') &&
                texto.includes('usuario') &&
                texto.includes('grupo');
        });
    }

    async function executar() {
        if (emAndamento) {
            alert('Já existe uma consulta em andamento.');
            return;
        }

        emAndamento = true;
        cancelado = false;
        resultados = [];

        const botao = document.getElementById(ID_BOTAO);
        botao.disabled = true;
        botao.textContent = '⏳ Montando universo...';

        let processos = [];

        try {
            /*
             * UNIVERSO HÍBRIDO — v9.9.141
             *
             * O relatório continua sendo iniciado no Acompanhamento
             * Especial, mas acrescenta automaticamente a carga atual do
             * Controle de Processos da unidade ORG/FIN/PLANEJAMENTO.
             *
             * A união é feita pelo número do processo, portanto um processo
             * existente nas duas fontes é consultado apenas uma vez.
             */
            const processosAcompanhamento =
                coletarProcessos();

            let processosControleDfpo = [];

            try {
                processosControleDfpo =
                    await coletarProcessosControleDfpo();
            } catch (erroControle) {
                console.warn(
                    '[SEI][Controle DF-PO] Não foi possível incorporar a carga atual. ' +
                    'O relatório seguirá somente com o Acompanhamento Especial.',
                    erroControle
                );
            }

            processos =
                unirProcessosSemDuplicar(
                    processosAcompanhamento,
                    processosControleDfpo
                );

            console.info(
                '[SEI][Universo híbrido v9.9.141]',
                {
                    acompanhamento:
                        processosAcompanhamento.length,
                    controleDfpo:
                        processosControleDfpo.length,
                    totalSemDuplicatas:
                        processos.length
                }
            );

            if (!processos.length) {
                alert(
                    'Nenhum processo foi encontrado no Acompanhamento Especial ' +
                    'nem no Controle de Processos da DF-PO.'
                );
                return;
            }

            botao.textContent = '⏳ Consultando...';

            criarModal(processos.length);
            for (let i = 0; i < processos.length; i++) {
                if (cancelado) {
                    atualizarStatus(
                        `Consulta interrompida após ${resultados.length} processo(s).`
                    );
                    break;
                }

                const processo = processos[i];

                atualizarStatus(
                    `Consultando ${i + 1} de ${processos.length}: ${processo.numero}`
                );

                atualizarProgresso(i, processos.length);

                let resultado;

                try {
                    resultado = await consultarProcesso(processo);
                } catch (erro) {
                    console.error(`[SEI] Erro em ${processo.numero}:`, erro);

                    resultado = criarResultadoErro(
                        processo,
                        erro?.message || String(erro)
                    );
                }

                resultado.nomeProcesso =
                    processo.nome || '';

                /*
                 * PROCESSO VINDO SOMENTE DO CONTROLE DF-PO — v9.9.142
                 *
                 * Esses casos servem como auditoria da cobertura do grupo
                 * de Acompanhamento Especial selecionado. Eles aparecem em
                 * uma quinta tabela no fundo do modal e não entram no PDF.
                 */
                resultado.foraGrupoSelecionado =
                    processo.origemRelatorio ===
                    'Controle DF-PO';

                resultados.push(resultado);
                adicionarLinha(resultado, i + 1);
                atualizarProgresso(i + 1, processos.length);

                if (i < processos.length - 1 && !cancelado) {
                    await esperar(INTERVALO);
                }
            }

            if (!cancelado) {
                const abertos = resultados.filter(
                    item => item.abertoDfpo
                ).length;

                const fora = resultados.filter(
                    item => !item.abertoDfpo && item.situacao !== 'Erro'
                ).length;

                const erros = resultados.filter(
                    item => item.situacao === 'Erro'
                ).length;

                atualizarStatus(
                    `Consulta concluída: ${resultados.length} processo(s). ` +
                    `${abertos} aberto(s) na DF-PO, ` +
                    `${fora} fora da DF-PO (incluindo Fazenda) e ${erros} com erro.`
                );
            }

            habilitarBotoes();
        } finally {
            emAndamento = false;
            botao.disabled = false;
            botao.textContent = 'Relatório Scraping/RPA\n(instável 🔥⚗️)';
        }
    }

    function coletarProcessos() {
        const tabela = localizarTabela();

        if (!tabela) {
            return [];
        }

        const mapa = new Map();

        for (const link of tabela.querySelectorAll('a')) {
            const numero = extrairNumeroProcesso(
                link.textContent || ''
            );

            if (!numero) {
                continue;
            }

            const url = extrairUrlDoLink(link);

            if (!url) {
                continue;
            }

            if (!mapa.has(numero)) {
                mapa.set(numero, {
                    numero,
                    url,
                    nome:
                        limpar(
                            link.getAttribute(
                                'title'
                            ) || ''
                        )
                });
            }
        }

        return [...mapa.values()];
    }


    /*
     * CONTROLE DE PROCESSOS DA DF-PO — v9.9.141
     *
     * A tela é procedimento_controlar e possui, na versão observada,
     * a tabela:
     *
     *   #tblProcessosDetalhado
     *
     * Não dependemos de iframe. O link assinado da tela é localizado no
     * menu da página atual; em seguida fazemos apenas uma leitura via fetch.
     */
    function localizarUrlControleProcessos() {
        const candidatos = [
            ...document.querySelectorAll(
                'a[href], area[href]'
            )
        ];

        for (const elemento of candidatos) {
            const href =
                elemento.getAttribute('href') || '';

            if (
                !/acao=procedimento_controlar(?:&|$)/i.test(
                    href
                )
            ) {
                continue;
            }

            try {
                return new URL(
                    decodificarUrl(href),
                    location.href
                ).href;
            } catch (_) {
                // Continua procurando outro link válido.
            }
        }

        /*
         * Alguns menus usam onclick em vez de href.
         */
        for (
            const elemento of document.querySelectorAll(
                '[onclick]'
            )
        ) {
            const onclick =
                elemento.getAttribute('onclick') || '';

            if (
                !/procedimento_controlar/i.test(
                    onclick
                )
            ) {
                continue;
            }

            const achado =
                onclick.match(
                    /['"]([^'"]*controlador\.php\?[^'"]*acao=procedimento_controlar[^'"]*)['"]/i
                );

            if (!achado?.[1]) {
                continue;
            }

            try {
                return new URL(
                    decodificarUrl(
                        achado[1]
                    ),
                    location.href
                ).href;
            } catch (_) {
                // Continua procurando.
            }
        }

        return null;
    }

    function extrairProcessosControleDfpoDoHtml(
        html,
        urlBase
    ) {
        const doc =
            new DOMParser().parseFromString(
                String(html || ''),
                'text/html'
            );

        const tabela =
            doc.querySelector(
                '#tblProcessosDetalhado'
            );

        if (!tabela) {
            throw new Error(
                'Tabela #tblProcessosDetalhado não localizada no Controle de Processos.'
            );
        }

        const mapa =
            new Map();

        for (
            const link of tabela.querySelectorAll(
                'a'
            )
        ) {
            const numero =
                extrairNumeroProcesso(
                    link.textContent || ''
                );

            if (!numero) {
                continue;
            }

            const href =
                link.getAttribute('href') || '';

            if (
                !href ||
                href.toLowerCase().startsWith(
                    'javascript:'
                ) ||
                href.startsWith('#')
            ) {
                continue;
            }

            let url;

            try {
                url =
                    new URL(
                        decodificarUrl(href),
                        urlBase || location.href
                    ).href;
            } catch (_) {
                continue;
            }

            if (!mapa.has(numero)) {
                mapa.set(
                    numero,
                    {
                        numero,
                        url,
                        nome: '',
                        origemRelatorio:
                            'Controle DF-PO'
                    }
                );
            }
        }

        return [
            ...mapa.values()
        ];
    }

    async function coletarProcessosControleDfpo() {
        const urlControle =
            localizarUrlControleProcessos();

        if (!urlControle) {
            throw new Error(
                'Link assinado para procedimento_controlar não localizado na tela atual.'
            );
        }

        const resposta =
            await obterHtml(
                urlControle
            );

        verificarErroSei(
            resposta.html
        );

        const processos =
            extrairProcessosControleDfpoDoHtml(
                resposta.html,
                resposta.url || urlControle
            );

        console.info(
            '[SEI][Controle DF-PO]',
            {
                url:
                    resposta.url ||
                    urlControle,
                quantidade:
                    processos.length,
                processos:
                    processos.map(
                        item => item.numero
                    )
            }
        );

        return processos;
    }

    function unirProcessosSemDuplicar(
        processosAcompanhamento,
        processosControleDfpo
    ) {
        const mapa =
            new Map();

        /*
         * Acompanhamento primeiro para preservar nome/metadados que
         * eventualmente já tenham sido capturados nessa tela.
         */
        for (
            const processo of [
                ...(processosAcompanhamento || []),
                ...(processosControleDfpo || [])
            ]
        ) {
            if (
                !processo?.numero ||
                !processo?.url
            ) {
                continue;
            }

            const chave =
                String(
                    processo.numero
                ).toUpperCase();

            if (!mapa.has(chave)) {
                mapa.set(
                    chave,
                    {
                        ...processo
                    }
                );

                continue;
            }

            const existente =
                mapa.get(chave);

            /*
             * Se a entrada do Acompanhamento não tiver nome, aproveita
             * qualquer metadado futuro vindo do Controle.
             */
            if (
                !existente.nome &&
                processo.nome
            ) {
                existente.nome =
                    processo.nome;
            }
        }

        return [
            ...mapa.values()
        ];
    }


    function extrairNumeroProcesso(texto) {
        const achado = String(texto || '').match(
            /[A-Z]{2,}(?:-[A-Z0-9]+)*-\d{5,}\/\d{5,}\/\d{4}/i
        );

        return achado
            ? achado[0].toUpperCase()
            : null;
    }

    function extrairUrlDoLink(link) {
        const href = link.getAttribute('href') || '';

        if (
            href &&
            !href.toLowerCase().startsWith('javascript:') &&
            !href.startsWith('#')
        ) {
            try {
                return new URL(
                    decodificarUrl(href),
                    location.href
                ).href;
            } catch (_) {
                // Tenta o atributo onclick.
            }
        }

        const onclick = link.getAttribute('onclick') || '';

        const padroes = [
            /window\.open\s*\(\s*['"]([^'"]+)['"]/i,
            /location(?:\.href)?\s*=\s*['"]([^'"]+)['"]/i,
            /['"]([^'"]*controlador\.php[^'"]+)['"]/i
        ];

        for (const padrao of padroes) {
            const achado = onclick.match(padrao);

            if (!achado?.[1]) {
                continue;
            }

            try {
                return new URL(
                    decodificarUrl(achado[1]),
                    location.href
                ).href;
            } catch (_) {
                // Continua procurando.
            }
        }

        return null;
    }

    async function consultarProcesso(processo) {
        const inicial = await obterHtml(processo.url);

        verificarErroSei(inicial.html);

        const urlInicial = inicial.url || processo.url;

        let urlVisualizar = null;
        let htmlVisualizar = inicial.html;

        if (acaoDaUrl(urlInicial) === 'procedimento_visualizar') {
            urlVisualizar = urlInicial;
        } else {
            urlVisualizar = localizarUrlPorAcao(
                inicial.html,
                urlInicial,
                'procedimento_visualizar',
                ['id_procedimento', 'infra_hash']
            );
        }

        if (
            !urlVisualizar &&
            acaoDaUrl(processo.url) === 'procedimento_visualizar'
        ) {
            urlVisualizar = processo.url;
        }

        if (!urlVisualizar) {
            throw new Error(
                'Não foi possível localizar procedimento_visualizar.'
            );
        }

        if (
            normalizarUrl(urlVisualizar) !==
            normalizarUrl(urlInicial)
        ) {
            const visualizacao = await obterHtml(urlVisualizar);

            htmlVisualizar = visualizacao.html;

            verificarErroSei(htmlVisualizar);
        }

        const situacao = extrairUnidades(htmlVisualizar);
        const unidades = situacao.unidades;

        /*
         * Algumas pastas/lotes da árvore são carregados de forma
         * recolhida. Nessa situação, os documentos internos podem não
         * aparecer no HTML normal de procedimento_visualizar.
         *
         * O próprio SEI fornece no código da árvore uma URL assinada
         * com abrir_pastas=1. Consultamos essa URL somente para leitura
         * da árvore, sem alterar a tela do usuário.
         */
        let htmlPastasAbertas = '';

        const urlAbrirPastas =
            localizarUrlAbrirPastas(
                htmlVisualizar,
                urlVisualizar
            );

        if (urlAbrirPastas) {
            try {
                const respostaPastas =
                    await obterHtml(
                        urlAbrirPastas
                    );

                htmlPastasAbertas =
                    respostaPastas.html || '';

                verificarErroSei(
                    htmlPastasAbertas
                );
            } catch (erroPastas) {
                console.warn(
                    '[SEI] Não foi possível abrir todas as pastas para leitura da árvore:',
                    erroPastas
                );
            }
        }

        let htmlFonteArvore = [
            htmlPastasAbertas || '',
            htmlVisualizar || '',
            inicial.html || ''
        ].join('\n');

        /*
         * EXPANSÃO AUXILIAR NÃO DESTRUTIVA
         *
         * A árvore atual continua sendo a fonte principal.
         * Uma resposta alternativa só é acrescentada se trouxer
         * MAIS documentos do que o conteúdo já disponível.
         *
         * Se a tentativa falhar, nada é substituído.
         */
        try {
            const expansaoAuxiliar =
                await tentarExpandirPastasSemRisco(
                    htmlFonteArvore,
                    urlVisualizar
                );

            if (
                expansaoAuxiliar.melhorou &&
                expansaoAuxiliar.html
            ) {
                htmlFonteArvore = [
                    htmlFonteArvore,
                    expansaoAuxiliar.html
                ].join('\n');

                console.info(
                    '[SEI][Pastas] Árvore ampliada com segurança:',
                    {
                        antes:
                            expansaoAuxiliar.quantidadeBase,
                        depois:
                            expansaoAuxiliar.quantidadeFinal
                    }
                );
            }
        } catch (erroExpansaoAuxiliar) {
            console.warn(
                '[SEI][Pastas] Tentativa auxiliar descartada; mantendo árvore original:',
                erroExpansaoAuxiliar
            );
        }

        const sinalizacao = extrairSinalizacaoArvore(
            htmlFonteArvore,
            unidades
        );

        const provavelReajuste =
            detectarProvavelReajusteTituloPrimeiraPeca(
                htmlFonteArvore
            );

        const provavelProrrogacao =
            detectarProvavelProrrogacaoTituloPrimeiraPeca(
                htmlFonteArvore
            );

        const provavelAditivo =
            detectarProvavelAditivoTituloPrimeiraPeca(
                htmlFonteArvore
            );

        const provavelReequilibrio =
            detectarProvavelReequilibrioTituloPrimeiraPeca(
                htmlFonteArvore
            );

        /*
         * MEDIÇÃO ZERADA
         *
         * A árvore fornece, em Nos[n].src, a URL assinada de cada
         * documento interno. Consultamos somente peças candidatas e
         * procuramos no texto da peça:
         *
         *   contexto de medição + valor igual a 0,00
         *
         * Isso evita classificar como "Cumprindo TRM" processos que
         * passaram pela ACI, mas cuja medição não gera retenção.
         */
        const medicaoZerada =
            await detectarMedicaoZeradaNaArvore(
                htmlFonteArvore,
                urlVisualizar
            );

        const aCiIndicouEnvioSmf =
            await detectarAciIndicouEnvioSmf(
                htmlFonteArvore,
                urlVisualizar
            );

        const provavelContratacao =
            await detectarProvavelContratacaoPrimeiraPeca(
                htmlFonteArvore,
                urlVisualizar
            );

        /*
         * Classificação precoce por correspondência determinística.
         *
         * Alguns fluxos começam por PDF e não possuem CI interna.
         * Água/esgoto é tratado primeiro pelo título das peças iniciais.
         * Os demais continuam usando a leitura da primeira peça interna.
         */
        const correspondenciaAguaEsgoto =
            detectarCorrespondenciaAguaEsgotoNaArvore(
                htmlFonteArvore
            );

        const correspondenciaPrimeiraPeca =
            await detectarCorrespondenciaBasePublicaPrimeiraPeca(
                htmlFonteArvore,
                urlVisualizar
            );

        const correspondenciaBasePublica =
            correspondenciaAguaEsgoto.detectada
                ? correspondenciaAguaEsgoto
                : correspondenciaPrimeiraPeca;

        const credor =
            ATIVAR_COLUNA_CREDOR
                ? await detectarCredorPrimeiraPeca(
                    htmlFonteArvore,
                    urlVisualizar
                )
                : {
                    nome: '',
                    origem: '',
                    rotulo: ''
                };

        if (
            processo.numero ===
            'PROCESSO_EXEMPLO_003'
        ) {
            console.debug(
                '[SEI][Diagnóstico processo 99]',
                {
                    inicialTemComprovante:
                        /comprovante\s+de\s+pagamento/i.test(
                            htmlParaTexto(
                                decodificarJs(
                                    inicial.html || ''
                                )
                            )
                        ),
                    visualizarTemComprovante:
                        /comprovante\s+de\s+pagamento/i.test(
                            htmlParaTexto(
                                decodificarJs(
                                    htmlVisualizar || ''
                                )
                            )
                        ),
                    fonteCombinadaTemComprovante:
                        /comprovante\s+de\s+pagamento/i.test(
                            htmlParaTexto(
                                decodificarJs(
                                    htmlFonteArvore
                                )
                            )
                        ),
                    fonteCombinadaTemCopmf:
                        /NIT\/SMF\/COPMF/i.test(
                            htmlFonteArvore
                        )
                }
            );
        }

        if (
            processo.numero ===
            'PROCESSO_EXEMPLO_007'
        ) {
            console.info(
                '[SEI][Processo 123 - árvore expandida]',
                {
                    urlAbrirPastas:
                        urlAbrirPastas || '',
                    recebeuHtmlPastasAbertas:
                        Boolean(
                            htmlPastasAbertas
                        ),
                    contemComprovante:
                        /\bcomprovante\b/i.test(
                            htmlParaTexto(
                                decodificarJs(
                                    htmlPastasAbertas ||
                                    htmlFonteArvore
                                )
                            )
                        ),
                    contemDfTes:
                        /NIT\/ORGAO_EXEMPLO\/DF-TES/i.test(
                            htmlPastasAbertas ||
                            htmlFonteArvore
                        )
                }
            );
        }

        /*
         * DF-PO EM QUALQUER POSIÇÃO DA CARGA ATUAL — v9.9.140
         *
         * Vale tanto para:
         *   "Processo aberto somente na unidade ORG/FIN/PLANEJAMENTO"
         *
         * quanto para:
         *   "Processo aberto nas unidades: ..."
         *   com ORG/FIN/PLANEJAMENTO misturada a quaisquer outras unidades.
         *
         * O histórico não pode anular esta informação atual.
         */
        const abertoDfpo = unidades.some(
            unidade =>
                normalizarUnidade(unidade) ===
                normalizarUnidade(
                    'ORG/FIN/PLANEJAMENTO'
                )
        );

        if (
            processo.numero ===
            'PROCESSO_EXEMPLO_005'
        ) {
            console.info(
                '[SEI][Regressão 000118 - carga atual]',
                {
                    frase:
                        situacao.frase || '',
                    unidades,
                    abertoDfpo
                }
            );
        }

        const abertoDgapProt = unidades.some(
            unidade =>
                normalizarUnidade(unidade) ===
                normalizarUnidade(
                    'ORG/ADM/PROTOCOLO'
                )
        );

        const abertoDfTes = unidades.some(
            unidade =>
                normalizarUnidade(unidade) ===
                normalizarUnidade(
                    'ORG/FIN/TESOURARIA'
                )
        );

        const abertoFazenda = unidades.some(
            unidade =>
                UNIDADES_FAZENDA.some(
                    unidadeFazenda =>
                        normalizarUnidade(unidade).includes(
                            normalizarUnidade(unidadeFazenda)
                        )
                )
        );

        const abertoDf = unidades.some(
            unidade =>
                UNIDADES_DF.some(
                    unidadeDf =>
                        normalizarUnidade(unidade) ===
                        normalizarUnidade(unidadeDf)
                )
        );

        const abertoIon = unidades.some(
            unidade => {
                const unidadeNormalizada =
                    normalizarUnidade(unidade);

                const pertenceIon =
                    unidadeNormalizada.startsWith(
                        normalizarUnidade('ORG/')
                    );

                const pertenceDf =
                    UNIDADES_DF.some(
                        unidadeDf =>
                            unidadeNormalizada ===
                            normalizarUnidade(unidadeDf)
                    );

                return pertenceIon && !pertenceDf;
            }
        );

        /*
         * Considera "somente DF" quando todas as unidades atualmente
         * abertas pertencem a um dos três setores:
         *
         * ORG/FIN
         * ORG/FIN/EXECUCAO
         * ORG/FIN/PLANEJAMENTO
         * ORG/FIN/CONTABILIDADE
         */
        const abertoSomenteDf =
            unidades.length > 0 &&
            unidades.every(
                unidade => {
                    const unidadeNormalizada =
                        normalizarUnidade(unidade);

                    return UNIDADES_DF.some(
                        unidadeDf =>
                            unidadeNormalizada.startsWith(
                                normalizarUnidade(unidadeDf)
                            )
                    );
                }
            );

        let passouPelaAci = false;

        const urlHistorico = localizarUrlPorAcao(
            htmlVisualizar,
            urlVisualizar,
            'procedimento_consultar_historico',
            ['id_procedimento', 'infra_hash']
        );

        let htmlHistorico = '';
        let sinalizacaoHistorico = '—';
        let historicoPagamentoRecursosProprios = false;
        let historicoTemRemessaCodoc = false;
        let historicoTemRemessaPresParaDf = false;
        let sequenciaDatiAciPresDf = {
            detectada: false,
            chegouDfpo: false
        };
        let andamentoAtualDfTes = null;
        let andamentoAtualDfpo = null;
        let inicioCircuitoDfAtual = null;
        let tempoCircuitoDfAtualMs = 0;
        let tempoHistoricoCircuitoDfMs = 0;

        /*
         * VISÃO GERENCIAL DF / DF-PO
         *
         * Relógio separado, limitado ao tempo efetivamente trabalhado em:
         * - ORG/FIN
         * - ORG/FIN/PLANEJAMENTO
         *
         * DF <-> DF-PO mantém a mesma rodada.
         *
         * DF-CONT funciona como PAUSA:
         * o tempo dentro da Contabilidade não é contado, mas, se o processo
         * retornar da DF-CONT para DF/DF-PO, o tempo anterior é preservado
         * e somado ao novo período.
         *
         * Saídas para ACI, PRES, DF-TES, DF-FIN, SMF etc. encerram a rodada.
         */
        let inicioCircuitoDfDfpoAtual = null;
        let tempoCircuitoDfDfpoAtualMs = 0;
        let tempoHistoricoDfDfpoMs = 0;

        let tempoAtualDfTesMs = 0;
        let tempoAcumuladoCircuitoDfMs = 0;

        /*
         * TEMPO ACUMULADO NA FAZENDA
         *
         * Soma o tempo passado em qualquer unidade reconhecida da Fazenda:
         * DETES, DEFIN, COPMF e CODOC.
         *
         * Esse valor é exibido somente quando o processo está atualmente
         * aberto na Fazenda.
         */
        let tempoAcumuladoFazendaMs = 0;

        if (urlHistorico) {
            const historico = await obterHtml(urlHistorico);

            htmlHistorico = historico.html;

            verificarErroSei(htmlHistorico);

            sinalizacaoHistorico =
                extrairSinalizacaoHistorico(
                    htmlHistorico
                );

            passouPelaAci =
                historicoTemPassagemPelaAci(
                    htmlHistorico
                );

            historicoPagamentoRecursosProprios =
                historicoIndicaPagamentoRecursosProprios(
                    htmlHistorico
                );

            historicoTemRemessaCodoc =
                historicoIndicaRemessaDaCodoc(
                    htmlHistorico
                );

            historicoTemRemessaPresParaDf =
                historicoIndicaRemessaPresParaDf(
                    htmlHistorico
                );

            sequenciaDatiAciPresDf =
                historicoTemSequenciaAciPresDfOuDfpo(
                    htmlHistorico
                );

            const circuitoDf =
                extrairInicioCircuitoDfAtual(
                    htmlHistorico
                );

            inicioCircuitoDfAtual =
                circuitoDf.inicio;

            tempoHistoricoCircuitoDfMs =
                circuitoDf.tempoHistoricoMs || 0;

            if (abertoDf) {
                const dataInicioCircuitoDf =
                    interpretarDataBrasileira(
                        inicioCircuitoDfAtual?.dataHora || ''
                    );

                tempoCircuitoDfAtualMs =
                    dataInicioCircuitoDf
                        ? Date.now() -
                            dataInicioCircuitoDf.getTime()
                        : 0;
            }

            const abertoEmDfOuDfpo =
                unidades.some(
                    unidade =>
                        [
                            'ORG/FIN',
                            'ORG/FIN/PLANEJAMENTO'
                        ].some(
                            unidadeAlvo =>
                                normalizarUnidade(
                                    unidade
                                ) ===
                                normalizarUnidade(
                                    unidadeAlvo
                                )
                        )
                );

            const rodadaGerencial =
                extrairRodadaGerencialDfDfpoAtual(
                    htmlHistorico
                );

            tempoHistoricoDfDfpoMs =
                rodadaGerencial.tempoHistoricoMs || 0;

            if (abertoEmDfOuDfpo) {
                inicioCircuitoDfDfpoAtual =
                    rodadaGerencial.inicio;

                tempoCircuitoDfDfpoAtualMs =
                    rodadaGerencial.tempoAcumuladoMs;
            }

            if (abertoDfpo) {
                andamentoAtualDfpo =
                    extrairAndamentoAberto(
                        htmlHistorico,
                        'ORG/FIN/PLANEJAMENTO'
                    );
            }

            if (abertoDfTes) {
                andamentoAtualDfTes =
                    extrairAndamentoAberto(
                        htmlHistorico,
                        'ORG/FIN/TESOURARIA'
                    );

                const dataDfTes =
                    interpretarDataBrasileira(
                        andamentoAtualDfTes?.dataHora || ''
                    );

                tempoAtualDfTesMs =
                    dataDfTes
                        ? Date.now() -
                            dataDfTes.getTime()
                        : 0;
            }

            tempoAcumuladoCircuitoDfMs =
                calcularTempoAcumuladoNasUnidades(
                    htmlHistorico,
                    [
                        'ORG/FIN/PLANEJAMENTO',
                        'ORG/FIN/TESOURARIA',
                        'ORG/FIN/CONTABILIDADE'
                    ]
                );

            tempoAcumuladoFazendaMs =
                calcularTempoAcumuladoNasUnidades(
                    htmlHistorico,
                    UNIDADES_FAZENDA
                );
        }

        const abertoAgoraEmDfOuDfpo =
            unidades.some(
                unidade =>
                    [
                        'ORG/FIN',
                        'ORG/FIN/PLANEJAMENTO'
                    ].some(
                        unidadeAlvo =>
                            normalizarUnidade(
                                unidade
                            ) ===
                            normalizarUnidade(
                                unidadeAlvo
                            )
                    )
            );

        const desdeDfDfpo =
            abertoAgoraEmDfOuDfpo
                ? (
                    inicioCircuitoDfDfpoAtual?.dataHora ||
                    ''
                )
                : '';

        const tempoDfDfpo =
            abertoAgoraEmDfOuDfpo
                ? (
                    inicioCircuitoDfDfpoAtual
                        ? formatarDuracao(
                            tempoCircuitoDfDfpoAtualMs
                        )
                        : 'Entrada atual não identificada'
                )
                : (
                    tempoHistoricoDfDfpoMs > 0
                        ? (
                            formatarDuracao(
                                tempoHistoricoDfDfpoMs
                            ) +
                            '\n(histórico)'
                        )
                        : 'Não está em DF/DF-PO'
                );

        const eventoAberturaDfDfpo =
            abertoAgoraEmDfOuDfpo
                ? (
                    inicioCircuitoDfDfpoAtual?.descricao ||
                    ''
                )
                : '';

        /*
         * AFERIR ALÍQUOTA
         *
         * Condições:
         * - processo aberto somente em ORG/FIN;
         * - veio diretamente da Presidência para a DF;
         * - última peça da árvore é um Despacho de Medição;
         * - ainda não existem peças que indiquem alíquota já aferida.
         */
        const abertoSomenteNaDfCentral =
            unidades.length > 0 &&
            unidades.every(
                unidade =>
                    normalizarUnidade(unidade) ===
                    normalizarUnidade(
                        'ORG/FIN'
                    )
            );

        const aferirAliquota =
            abertoSomenteNaDfCentral &&
            historicoTemRemessaPresParaDf &&
            sinalizacao.ultimaPecaDespachoMedicao &&
            !sinalizacao.temEvidenciaAliquotaAferida;

        /*
         * DATI + ACI -> PRES -> DF [-> DF-PO] — v9.9.118
         *
         * Reaberturas/conclusões posteriores em DGAP/DATI não invalidam
         * a sequência substantiva já percorrida.
         */
        const abertoSomenteDfOuDfpo =
            unidades.length > 0 &&
            unidades.every(
                unidade =>
                    [
                        'ORG/FIN',
                        'ORG/FIN/PLANEJAMENTO'
                    ].some(
                        alvo =>
                            normalizarUnidade(
                                unidade
                            ) ===
                            normalizarUnidade(
                                alvo
                            )
                    )
            );

        /*
         * Regressão:
         * PROCESSO_EXEMPLO_018
         * DATI + pagamento + ACI -> PRES -> DF -> DF-PO
         * sem alíquota/aferição produzida
         * => Aferir alíquota
         */
        const aferirAliquotaDati =
            abertoSomenteDfOuDfpo &&
            sinalizacao.temContextoPagamentoDati &&
            sequenciaDatiAciPresDf.detectada &&
            !sinalizacao.temAliquotaOuAfericaoNaArvore &&
            !sinalizacao.temEvidenciaAliquotaAferida;

        /*
         * POTENCIAL REPASSE — INDÍCIO OPERACIONAL
         *
         * Planilha de Medição, sozinha, não confirma repasse. Porém, para
         * evitar sinalizações sem ação, ela pode "emprestar" o fluxo de
         * repasse enquanto a Fonte de Recursos ainda precisa ser conferida.
         *
         * Quando isso ocorrer, a ação operacional será exibida normalmente,
         * acompanhada de:
         *
         *   Potencial repasse (conferir FR na NE e/ou NL)
         *
         * A ausência de marcador forte continua impedindo que o processo
         * seja considerado repasse confirmado.
         */
        const potencialRepasse =
            abertoDf &&
            sinalizacao.temPlanilhaMedicaoNaArvore &&
            !sinalizacao.temMarcadorRepasseNaArvore;

        const indicioRepasseParaAcao =
            sinalizacao.temMarcadorRepasseNaArvore ||
            potencialRepasse;

        /*
         * Quando já existe despacho explícito "Para fins de verificação
         * de alíquota e SN", o processo está em aferição. Essa condição
         * continua válida após a saída da DF central para DF-PO ou
         * DF-CONT, enquanto não surgirem as peças que comprovam a
         * aferição concluída.
         */
        const abertoDfCont =
            unidades.some(
                unidade =>
                    normalizarUnidade(unidade) ===
                    normalizarUnidade(
                        'ORG/FIN/CONTABILIDADE'
                    )
            );

        /*
         * Aferição pode continuar mesmo após surgirem o Comprovante SN
         * e o Relatório de Retenção. Quando esse conjunto aparece e o
         * processo permanece aberto na DF-CONT, ele ainda está em fase
         * de tratamento contábil/tributário.
         */
        /*
         * AFERINDO ALÍQUOTA — PROCESSO DE REPASSE ABERTO NA DF-CONT
         *
         * Enquanto um processo reconhecido como REPASSE permanecer
         * aberto na ORG/FIN/CONTABILIDADE, consideramos que a Contabilidade
         * está executando a etapa de aferição tributária.
         *
         * A regra NÃO exige quantidade mínima de peças produzidas.
         * Portanto, vale desde 0 até 4 peças típicas da DF-CONT:
         *
         *   1. Comprovante SN
         *   2. Nota Técnica IRRF/DSR/Retenção
         *   3. Guia de ISS
         *   4. Relatório/Despacho de Retenção
         *
         * Isso evita que uma AUTORIZAÇÃO DE PAGAMENTO antiga na árvore
         * desvie o processo para "Pagamento pendente" enquanto ele
         * ainda está sendo trabalhado pela DF-CONT.
         *
         * Proteção: exige marcador forte de repasse OU potencial repasse
         * por Planilha de Medição. No segundo caso, a sinalização recebe
         * aviso explícito para conferir a FR na NE e/ou NL.
         */
        const aferindoAliquotaNaDfCont =
            abertoDfCont &&
            indicioRepasseParaAcao;

        const conjuntoAfericaoNaContabilidade =
            abertoDfCont &&
            sinalizacao.temVerificacaoAliquotaNaArvore &&
            sinalizacao.temComprovanteSnNaArvore &&
            sinalizacao.temRelatorioRetencaoNaArvore;

        const aferindoAliquota =
            aferindoAliquotaNaDfCont ||
            (
                abertoDf &&
                sinalizacao.ultimaPecaVerificacaoAliquota &&
                !sinalizacao.temEvidenciaAliquotaAferida
            ) ||
            conjuntoAfericaoNaContabilidade;

        /*
         * REPASSE SEM DESPACHO DE ALÍQUOTA
         *
         * A existência de peça com "fotográfico" ou "Diário de obra" indica processo de
         * medição/repasse. Enquanto não houver "alíquota" ou "aferição"
         * na árvore e o processo estiver aberto em unidade da DF,
         * sinaliza a necessidade de despacho para aferição.
         */
        const despacharParaAferirAliquota =
            abertoDf &&
            indicioRepasseParaAcao &&
            !sinalizacao.temAliquotaOuAfericaoNaArvore;

        /*
         * A passagem pela ACI, sozinha, não comprova cumprimento de TRM.
         * A sinalização só é válida quando existe ao menos uma peça
         * com a expressão TRM ou com o novo título por extenso na própria árvore do processo.
         */
        const sinalizacaoTrm =
            abertoSomenteDf &&
            passouPelaAci &&
            sinalizacao.temTrmNaArvore
                ? 'Cumprindo TRM'
                : '—';

        /*
         * A presença de NF, Nota Fiscal, Boleto, Fatura, NFE ou DANFE
         * não deve substituir as regras próprias da Fazenda.
         *
         * Quando o processo está atualmente aberto em unidade da
         * Fazenda, prevalecem SLIP explícita, SLIP provável ou a regra
         * residual de trabalho na Fazenda.
         */
        /*
         * REPASSE — PRÉ-ACI APÓS RETENÇÃO
         *
         * Características observadas:
         * - existe marcador forte de repasse na árvore:
         *   Relatório Fotográfico, Diário de obra ou confirmação
         *   contábil (aferição + 2 categorias típicas da DF-CONT);
         * - o Relatório de Retenção já foi produzido;
         * - o processo está atualmente aberto na DF-PO;
         * - a abertura atual da DF-PO veio diretamente da DF-CONT.
         *
         * Enquanto ele permanece nessa abertura da DF-PO, ainda não
         * houve o próximo envio à ACI. É a fase de preparação de
         * Nota de Liquidação, Ofício, TRM e assinaturas.
         */
        /*
         * RETORNO ATUAL DF-CONT -> DF-PO
         *
         * Não usamos mais somente andamentoAtualDfpo.descricao,
         * porque o andamento mais recente da DF-PO pode ser apenas:
         *
         *   "Processo recebido na unidade"
         *
         * e isso apaga a informação de qual unidade efetivamente
         * abriu a passagem atual pela DF-PO.
         *
         * Em vez disso, procuramos no histórico completo a REMESSA
         * mais recente cujo destino foi ORG/FIN/PLANEJAMENTO. Se essa remessa
         * veio de ORG/FIN/CONTABILIDADE, consideramos que a passagem atual
         * da DF-PO foi aberta pela Contabilidade.
         */
        const ultimaRemessaParaDfpo =
            extrairUltimaRemessaParaUnidade(
                htmlHistorico,
                'ORG/FIN/PLANEJAMENTO'
            );

        const retornoAtualDfContParaDfpo =
            Boolean(ultimaRemessaParaDfpo) &&
            normalizarUnidade(
                ultimaRemessaParaDfpo.origem || ''
            ) ===
            normalizarUnidade(
                'ORG/FIN/CONTABILIDADE'
            );

        /*
         * PROVIDÊNCIA NA ÁREA TÉCNICA
         *
         * Sinal operacional:
         * - processo está atualmente aberto em uma área técnica conhecida;
         * - a remessa mais recente para essa área veio diretamente de
         *   ORG/FIN/PLANEJAMENTO ou ORG/FIN/CONTABILIDADE.
         *
         * Não tentamos inferir o motivo exato (correção de NF, ajuste de
         * medição, insuficiência de empenho etc.). A própria devolução da
         * Financeira para a área técnica já caracteriza a etapa.
         */
        const unidadesTecnicasAbertas =
            unidades.filter(
                unidade =>
                    UNIDADES_AREA_TECNICA.some(
                        unidadeTecnica =>
                            normalizarUnidade(
                                unidade
                            ) ===
                            normalizarUnidade(
                                unidadeTecnica
                            )
                    )
            );

        const remessasParaAreasTecnicas =
            unidadesTecnicasAbertas
                .map(
                    unidadeTecnica =>
                        extrairUltimaRemessaParaUnidade(
                            htmlHistorico,
                            unidadeTecnica
                        )
                )
                .filter(Boolean)
                .sort(
                    (a, b) =>
                        b.data.getTime() -
                        a.data.getTime()
                );

        const ultimaRemessaParaAreaTecnica =
            remessasParaAreasTecnicas[0] || null;

        const providenciaAreaTecnica =
            Boolean(
                ultimaRemessaParaAreaTecnica
            ) &&
            [
                'ORG/FIN/PLANEJAMENTO',
                'ORG/FIN/CONTABILIDADE'
            ].some(
                unidadeOrigem =>
                    normalizarUnidade(
                        ultimaRemessaParaAreaTecnica.origem || ''
                    ) ===
                    normalizarUnidade(
                        unidadeOrigem
                    )
            );

        /*
         * RETOMAR AFERIÇÃO APÓS CORREÇÃO DA ÁREA TÉCNICA — v9.9.126
         *
         * Fluxo observado:
         *   DF/DF-PO -> DF-CONT
         *   DF-CONT -> área técnica
         *   área técnica corrige NF/documentação
         *   área técnica -> DF-PO
         *
         * A regra só entra quando:
         * - o processo está atualmente aberto na DF-PO;
         * - há marcador forte de repasse;
         * - a árvore já contém alíquota/aferição;
         * - ainda NÃO há retenção concluída;
         * - a remessa atual para DF-PO veio de uma área técnica conhecida;
         * - essa mesma área técnica recebeu anteriormente o processo
         *   diretamente da DF-CONT ou DF-PO.
         *
         * Regressões:
         * PROCESSO_EXEMPLO_016
         * PROCESSO_EXEMPLO_015
         */
        const origemAtualDfpoEhAreaTecnica =
            Boolean(
                ultimaRemessaParaDfpo
            ) &&
            UNIDADES_AREA_TECNICA.some(
                unidadeTecnica =>
                    normalizarUnidade(
                        ultimaRemessaParaDfpo.origem || ''
                    ) ===
                    normalizarUnidade(
                        unidadeTecnica
                    )
            );

        const ultimaAreaTecnicaQueRetornouDfpo =
            origemAtualDfpoEhAreaTecnica
                ? ultimaRemessaParaDfpo.origem
                : '';

        const remessaAnteriorParaAreaTecnica =
            ultimaAreaTecnicaQueRetornouDfpo
                ? extrairUltimaRemessaParaUnidade(
                    htmlHistorico,
                    ultimaAreaTecnicaQueRetornouDfpo
                )
                : null;

        const areaTecnicaVeioDaFinanceira =
            Boolean(
                remessaAnteriorParaAreaTecnica
            ) &&
            [
                'ORG/FIN/PLANEJAMENTO',
                'ORG/FIN/CONTABILIDADE'
            ].some(
                unidadeFinanceira =>
                    normalizarUnidade(
                        remessaAnteriorParaAreaTecnica.origem || ''
                    ) ===
                    normalizarUnidade(
                        unidadeFinanceira
                    )
            );

        const retomarAfericaoAposCorrecaoTecnica =
            abertoDfpo &&
            sinalizacao.temMarcadorRepasseNaArvore &&
            sinalizacao.temAliquotaOuAfericaoNaArvore &&
            !sinalizacao.temRelatorioRetencaoNaArvore &&
            origemAtualDfpoEhAreaTecnica &&
            areaTecnicaVeioDaFinanceira;

        /*
         * Alguns processos concluem o tratamento tributário na DF-CONT
         * sem que a última peça receba literalmente o título
         * "Relatório de Retenção". Exemplo observado:
         *
         *   Comprovante SN
         *   Nota Técnica IRRF/DSR
         *   Guia de ISS
         *   Despacho genérico
         *   DF-CONT -> DF-PO
         *
         * Nesse caso o retorno da DF-CONT para a DF-PO é evidência
         * operacional forte de que a etapa contábil/tributária terminou.
         */
        const tratamentoTributarioConcluidoSemTituloRetencao =
            sinalizacao.temComprovanteSnNaArvore &&
            (
                sinalizacao.temNotaTecnicaTributariaNaArvore ||
                sinalizacao.temGuiaIssNaArvore
            );

        const preAciRepasse =
            abertoDfpo &&
            indicioRepasseParaAcao &&
            retornoAtualDfContParaDfpo &&
            (
                sinalizacao.temRelatorioRetencaoNaArvore ||
                tratamentoTributarioConcluidoSemTituloRetencao
            );

        /*
         * CASO EXTERNO À EXPERIÊNCIA — REPASSE DEVOLVIDO À DF
         *
         * Situação anômala:
         * - processo reconhecido como repasse;
         * - retenção já concluída;
         * - TRM já existe;
         * - Despacho posterior da ACI foi lido por dentro e contém
         *   expressão forte de envio/encaminhamento à SMF;
         * - apesar disso, o processo está atualmente aberto na DF.
         *
         * Não transformamos esse erro de tramitação em uma etapa
         * normal do mapa. Ele deve cair no diagnóstico genérico.
         */
        const casoExternoAciEnvioSmfRetornouDf =
            abertoDf &&
            sinalizacao.temMarcadorRepasseNaArvore &&
            sinalizacao.temRelatorioRetencaoNaArvore &&
            sinalizacao.temTrmNaArvore &&
            aCiIndicouEnvioSmf.detectada;

        /*
         * PÓS-AFERIÇÃO / RETENÇÃO CONCLUÍDA
         *
         * Depois que o Relatório de Retenção é produzido, o retorno
         * para DF-PO ou o envio à DF-TES normalmente indica
         * preparação/espera do pagamento.
         *
         * Exceção: processos de repasse identificados pela regra
         * preAciRepasse permanecem em preparação documental antes
         * do novo envio à ACI.
         */
        const retencaoConcluidaAguardandoPagamento =
            !preAciRepasse &&
            sinalizacao.temRelatorioRetencaoNaArvore &&
            (
                abertoDfpo ||
                abertoDfTes
            );

        /*
         * PAGAMENTO PENDENTE — EXCLUSIVO DE NÃO-REPASSE
         *
         * Se o processo já foi confirmado como repasse por marcador forte
         * (Relatório Fotográfico, Diário de obra ou confirmação contábil),
         * esta sinalização fica bloqueada.
         */
        const pagamentoPendente =
            !sinalizacao.temMarcadorRepasseNaArvore &&
            !abertoFazenda &&
            !sinalizacao.temComprovanteNaArvore &&
            (
                retencaoConcluidaAguardandoPagamento ||
                sinalizacao.temAutorizacaoPagamento ||
                (
                    abertoDf &&
                    sinalizacao.temBoletoNaArvore
                ) ||
                (
                    abertoSomenteNaDfCentral &&
                    historicoTemRemessaPresParaDf &&
                    sinalizacao.temDocumentoCobrancaRecente
                )
            );

        const pagamentoRecursosProprios =
            sinalizacao.temPagamentoDfTes &&
            (
                abertoDfTes ||
                historicoPagamentoRecursosProprios
            );

        /*
         * NÃO-REPASSE PRECOCE — ART / RRT
         *
         * Regra deliberadamente específica:
         * - a primeira peça declara pagamento de ART/RRT;
         * - existe Boleto na árvore;
         * - não há Planilha de Medição;
         * - não há marcador forte de repasse.
         *
         * Isso permite reconhecer esses pagamentos administrativos antes
         * de eles chegarem à DF-TES.
         */
        const naoRepasseArtRrt =
            Boolean(
                provavelContratacao.naoRepasseArtRrt
            ) &&
            sinalizacao.temBoletoNaArvore &&
            !sinalizacao.temPlanilhaMedicaoNaArvore &&
            !sinalizacao.temMarcadorRepasseNaArvore;

        const pendenteDarfFolhaExpressivo =
            Boolean(
                provavelContratacao.darfFolhaValorExpressivo
            ) &&
            !sinalizacao.temPagamentoDfTes;

        const sinalizacaoDarfFolhaExpressivo =
            pendenteDarfFolhaExpressivo
                ? 'Pendente — folha/DARF (INSS + IRRF) - Valor expressivo ⚠️'
                : '';

        let sinalizacaoNaoRepasseArtRrt = '';

        if (
            naoRepasseArtRrt
        ) {
            sinalizacaoNaoRepasseArtRrt =
                'Provável não-repasse — ART/RRT';

            if (
                abertoDf &&
                Number.isFinite(
                    tempoCircuitoDfAtualMs
                ) &&
                tempoCircuitoDfAtualMs >= 0
            ) {
                const seteDiasArtRrt =
                    7 * 24 * 60 * 60 * 1000;

                sinalizacaoNaoRepasseArtRrt +=
                    tempoCircuitoDfAtualMs >
                        seteDiasArtRrt
                        ? ' (>7 dias ⚠️)'
                        : ' (<7 dias)';
            }
        }

        /*
         * ABERTURA RESIDUAL DA DF-PO APÓS PAGAMENTO — v9.9.117
         *
         * Se o processo:
         * - está aberto SOMENTE em ORG/FIN/PLANEJAMENTO;
         * - já possui comprovante/pagamento produzido por DF-TES;
         * - não possui nova peça financeira relevante depois do último
         *   comprovante;
         *
         * tratamos a abertura atual como provavelmente residual.
         */
        const abertoSomenteNaDfpo =
            unidades.length > 0 &&
            unidades.every(
                unidade =>
                    normalizarUnidade(
                        unidade
                    ) ===
                    normalizarUnidade(
                        'ORG/FIN/PLANEJAMENTO'
                    )
            );

        /*
         * Caso sintético de regressão:
         * PROCESSO_EXEMPLO_002
         * - últimas peças: Comprovante / Comprovante em DF-TES;
         * - processo aparece atualmente aberto somente em DF-PO;
         * - sem nova peça financeira posterior.
         *
         * Resultado esperado:
         * Arquivamento provável 🗂️ — pagamento concluído; abertura residual DF-PO
         */

        const aberturaResidualPagamentoDfpo =
            abertoSomenteNaDfpo &&
            sinalizacao.temPagamentoDfTes &&
            !sinalizacao.temNovoCicloAposPagamentoDfTes;

        /*
         * ARQUIVAMENTO APÓS PAGAMENTO DE NÃO-REPASSE
         *
         * Se já existe comprovante produzido pela DF-TES e o processo não
         * possui nenhuma unidade aberta, consideramos encerramento provável
         * quando não há marcador forte de repasse.
         *
         * ART/RRT também entra expressamente nesta regra.
         */
        const arquivamentoPorPagamentoNaoRepasse =
            unidades.length === 0 &&
            sinalizacao.temPagamentoDfTes &&
            (
                naoRepasseArtRrt ||
                !sinalizacao.temMarcadorRepasseNaArvore
            );

        /*
         * NÃO-REPASSE CONHECIDO + COMPROVANTE DF-TES — v9.9.136
         *
         * Uma correspondência determinística conhecida (ex.: REFRIGERAÇÃO,
         * REPROGRAFIA, INTERNET, ENERGIA etc.) não deve continuar como
         * "Pendente" depois que a DF-TES já produziu Comprovante/Pagamento,
         * desde que não tenha começado um novo ciclo financeiro depois.
         *
         * A existência de abertura residual em outra unidade não impede
         * o arquivamento provável. A trava é a ausência de novo ciclo
         * financeiro posterior ao último comprovante da DF-TES.
         */
        const arquivamentoCorrespondenciaConhecidaPaga =
            Boolean(
                correspondenciaBasePublica.detectada
            ) &&
            sinalizacao.temPagamentoDfTes &&
            !sinalizacao.temNovoCicloAposPagamentoDfTes;

        const arquivamentoDetectado =
            sinalizacao.temArquivamento ||
            aberturaResidualPagamentoDfpo ||
            arquivamentoPorPagamentoNaoRepasse ||
            arquivamentoCorrespondenciaConhecidaPaga ||
            (
                historicoTemRemessaCodoc &&
                (
                    sinalizacao.temPagamentoCodoc ||
                    sinalizacao.temPagamentoRecente
                )
            );

        const retornoFazendaAtivo =
            normalizar(
                sinalizacaoHistorico || ''
            ).includes(
                normalizar(
                    'Retorno da Fazenda'
                )
            );

        /*
         * NÃO-REPASSE PROVÁVEL — CORRESPONDÊNCIA COM EMPENHO CONHECIDO
         *
         * Exibe, sempre que disponível:
         *   NE XX/2026 + Fonte de Recursos
         *
         * Exemplos:
         *   Não-repasse provável — correspondência NE 7008/ANO_EXEMPLO,
         *   FR FONTE_EXEMPLO_A (2 dias e 4 horas)
         *
         *   Não-repasse provável — correspondência NE 7010/ANO_EXEMPLO,
         *   FR FONTE_EXEMPLO_B (8 dias e 1 hora ⚠️)
         */
        let sinalizacaoNaoRepasseBasePublica = '';
        let comentarioCorrespondenciaNaoRepasse = '';

        if (
            correspondenciaBasePublica.detectada
        ) {
            const neCorrespondente =
                correspondenciaBasePublica.ne ??
                correspondenciaBasePublica.empenho ??
                null;

            const fonteCorrespondente =
                correspondenciaBasePublica.fonte ||
                'FONTE_EXEMPLO_A';

            const rotuloCurto =
                rotuloCurtoNaoRepasse(
                    correspondenciaBasePublica
                );

            /*
             * A correspondência conhecida sempre recebe um estado:
             * - "Pendente —" enquanto não houver arquivamento provável;
             * - "Arquivamento provável 🗂️ —" quando a regra final de
             *   arquivamento for satisfeita.
             */
            /*
             * v9.9.113:
             * toda correspondência conhecida precisa carregar um ESTADO.
             *
             * Enquanto não houver enquadramento final em
             * "Arquivamento provável", o estado operacional exibido é
             * "Pendente —". O bloco de arquivamento abaixo substitui essa
             * abertura quando o processo efetivamente estiver arquivável.
             *
             * Isso evita sinalizações órfãs como:
             *   REPROGRAFIA, NE 7016/ANO_EXEMPLO, FR FONTE_EXEMPLO_A
             */
            sinalizacaoNaoRepasseBasePublica =
                'Pendente — ';

            const descricaoCorrespondenciaCustom =
                correspondenciaBasePublica
                    .descricaoCorrespondenciaCustom ||
                '';

            if (
                descricaoCorrespondenciaCustom
            ) {
                sinalizacaoNaoRepasseBasePublica +=
                    descricaoCorrespondenciaCustom;
            } else {
                if (
                    rotuloCurto
                ) {
                    sinalizacaoNaoRepasseBasePublica +=
                        `${rotuloCurto}, `;
                }

                sinalizacaoNaoRepasseBasePublica +=
                    (
                        neCorrespondente
                            ? `NE ${neCorrespondente}/2026`
                            : 'NE não identificada'
                    );

                sinalizacaoNaoRepasseBasePublica +=
                    `, FR ${fonteCorrespondente}`;
            }

            if (
                correspondenciaBasePublica.valorExpressivo
            ) {
                sinalizacaoNaoRepasseBasePublica +=
                    ' - Valor expressivo ⚠️';
            }

            /*
             * Versão neutra da mesma informação, sem "Pendente".
             * É preservada quando o processo já chegou ao
             * "Arquivamento provável", para não perdermos a associação
             * com NE, tipo e Fonte de Recursos.
             */
            comentarioCorrespondenciaNaoRepasse =
                '';

            if (
                descricaoCorrespondenciaCustom
            ) {
                comentarioCorrespondenciaNaoRepasse +=
                    descricaoCorrespondenciaCustom;
            } else {
                if (
                    rotuloCurto
                ) {
                    comentarioCorrespondenciaNaoRepasse +=
                        `${rotuloCurto}, `;
                }

                comentarioCorrespondenciaNaoRepasse +=
                    (
                        neCorrespondente
                            ? `NE ${neCorrespondente}/2026`
                            : 'NE não identificada'
                    );

                comentarioCorrespondenciaNaoRepasse +=
                    `, FR ${fonteCorrespondente}`;
            }

            if (
                correspondenciaBasePublica.valorExpressivo
            ) {
                comentarioCorrespondenciaNaoRepasse +=
                    ' - Valor expressivo ⚠️';
            }

            if (
                abertoDf &&
                Number.isFinite(
                    tempoCircuitoDfAtualMs
                ) &&
                tempoCircuitoDfAtualMs >= 0
            ) {
                const seteDiasNaoRepasse =
                    7 * 24 * 60 * 60 * 1000;

                sinalizacaoNaoRepasseBasePublica +=
                    ` (${formatarDuracao(
                        tempoCircuitoDfAtualMs
                    )}${
                        tempoCircuitoDfAtualMs >
                            seteDiasNaoRepasse
                            ? ' ⚠️'
                            : ''
                    })`;
            }
        }

        /*
         * CASO ESPECIAL: SLIP ainda não representa pagamento concluído.
         *
         * Quando:
         * - existe SLIP na árvore;
         * - não existe nenhuma peça com a palavra "pagamento";
         * - existe retorno ativo CODOC -> DGAP-PROT;
         *
         * a providência da Fazenda prevalece sozinha, pois ainda pode
         * existir uma pendência como atualização da Guia de ISS.
         */
        const retornoCodocComSlipSemPagamento =
            retornoFazendaAtivo &&
            sinalizacao.temSlip &&
            !sinalizacao.temPagamentoNaArvore;

        if (
            provavelContratacao.darfFolhaValorExpressivo
        ) {
            console.debug(
                '[SEI][DARF/Folha] Valor expressivo identificado na primeira peça:',
                {
                    processo:
                        processo.numero,
                    valor:
                        provavelContratacao.valorDarfFolha,
                    temPagamentoDfTes:
                        sinalizacao.temPagamentoDfTes,
                    pendenteDarfFolhaExpressivo
                }
            );
        }

        if (
            provavelContratacao.naoRepasseArtRrt
        ) {
            console.debug(
                '[SEI][ART/RRT] Evidência de não-repasse na primeira peça:',
                {
                    processo:
                        processo.numero,
                    temBoleto:
                        sinalizacao.temBoletoNaArvore,
                    temPlanilhaMedicao:
                        sinalizacao.temPlanilhaMedicaoNaArvore,
                    temMarcadorRepasse:
                        sinalizacao.temMarcadorRepasseNaArvore,
                    naoRepasseArtRrt,
                    arquivamentoPorPagamentoNaoRepasse
                }
            );
        }

        if (
            aCiIndicouEnvioSmf.detectada
        ) {
            console.info(
                '[SEI][ACI→SMF] Expressão encontrada no conteúdo interno do despacho:',
                aCiIndicouEnvioSmf
            );
        }

        /*
         * REGRESSÃO v9.9.136
         *
         * Classes determinísticas como:
         * - REFRIGERAÇÃO, NE 7014/ANO_EXEMPLO, FR FONTE_EXEMPLO_B
         * - REPROGRAFIA, NE 7016/ANO_EXEMPLO, FR FONTE_EXEMPLO_A
         *
         * deixam de aparecer como "Pendente" quando há
         * Comprovante/Pagamento da DF-TES e nenhum novo ciclo financeiro
         * posterior ao último comprovante.
         */

        /*
         * REGRA DOMINANTE DE ARQUIVAMENTO:
         *
         * 1. existe peça com a palavra "arquivamento" na árvore; ou
         * 2. o processo retornou da CODOC e existe peça com a palavra
         *    "pagamento" gerada pela própria CODOC; ou
         * 3. o processo retornou da CODOC e há "pagamento" entre as
         *    8 peças mais recentes.
         *
         * Nesse terceiro caso, a sinalização permanece mesmo depois
         * de o processo sair da DGAP-PROT e passar pela Presidência,
         * pois o pagamento recente após o retorno da CODOC indica
         * tendência de arquivamento.
         *
         * Arquivamento permanece acima das demais regras.
         *
         * RETORNO CODOC DOMINANTE:
         * depois que a CODOC devolve o processo à ORGAO_EXEMPLO, a sinalização
         * "Retorno da Fazenda - Providência pendente na ORGAO_EXEMPLO" permanece
         * dominante durante a circulação interna (DGAP-PROT, PRES, ACI,
         * DF, DF-PO etc.) até o histórico indicar nova remessa efetiva
         * da ORGAO_EXEMPLO para a Fazenda.
         *
         * Assim, Caso externo ACI→SMF, Cumprindo TRM ou Pagamento
         * pendente não apagam uma devolução da Fazenda ainda ativa.
         *
         * Nos demais casos, "Cumprindo TRM" continua prevalecendo sobre
         * "Pagamento pendente".
         */
        /*
         * REGRESSÃO v9.9.113 — PREFIXO DE ESTADO
         *
         * Correspondências conhecidas nunca devem aparecer sozinhas.
         *
         * Válido:
         *   Pendente — REPROGRAFIA, NE 7016/ANO_EXEMPLO, FR FONTE_EXEMPLO_A
         *   Pendente — LOCAÇÃO, NE 7018/ANO_EXEMPLO, FR FONTE_EXEMPLO_A (...)
         *   Pendente — INTERNET, NE 7010/ANO_EXEMPLO, FR FONTE_EXEMPLO_B (...)
         *   Arquivamento provável 🗂️ — ART, NE 7008/ANO_EXEMPLO, FR FONTE_EXEMPLO_A
         *
         * Inválido:
         *   REPROGRAFIA, NE 7016/ANO_EXEMPLO, FR FONTE_EXEMPLO_A
         */

        let sinalizacaoFinal =
            aberturaResidualPagamentoDfpo
                ? 'Arquivamento provável 🗂️ — pagamento concluído; abertura residual DF-PO'
                : arquivamentoDetectado
                    ? 'Arquivamento provável 🗂️'
                    : retornoFazendaAtivo
                    ? '⚠ Retorno da Fazenda - Providência pendente na ORGAO_EXEMPLO'
                    : medicaoZerada.detectada
                        ? 'Medição zerada  0️⃣'
                        : sinalizacaoNaoRepasseBasePublica
                            ? sinalizacaoNaoRepasseBasePublica
                        : sinalizacaoDarfFolhaExpressivo
                            ? sinalizacaoDarfFolhaExpressivo
                        : sinalizacaoNaoRepasseArtRrt
                            ? sinalizacaoNaoRepasseArtRrt
                        : sinalizacao.triagemCorrespondenciaExterna
                            ? sinalizacao.triagemCorrespondenciaExterna
                        : providenciaAreaTecnica
                            ? 'Providência na área técnica'
                        : retomarAfericaoAposCorrecaoTecnica
                            ? 'Retomar aferição'
                        : despacharParaAferirAliquota
                            ? 'Despachar para aferir alíquota'
                            : aferindoAliquota
                                ? 'Aferindo alíquota'
                                : (
                                    aferirAliquota ||
                                    aferirAliquotaDati
                                )
                                    ? 'Aferir alíquota'
                                    : preAciRepasse
                                        ? 'Pré-ACI: NL, Ofício, TRM, assinaturas 📝'
                                        : casoExternoAciEnvioSmfRetornouDf
                                            ? 'Caso externo ao dicionário. Contactar administrador.'
                                        : sinalizacaoTrm === 'Cumprindo TRM'
                                            ? 'Cumprindo TRM'
                                        : potencialRepasse
                                            ? 'Potencial repasse (conferir FR na NE e/ou NL)'
                                        : pagamentoPendente
                                            ? 'Pagamento pendente'
                                        : pagamentoRecursosProprios
                                            ? 'Palavra "pagamento/comprovante" identificada. Pagamento provável'
                                            : combinarSinalizacoes(
                                                sinalizacao.texto,
                                                sinalizacaoHistorico,
                                                sinalizacaoTrm
                                            );

        /*
         * AVISO DE POTENCIAL REPASSE JUNTO À AÇÃO
         *
         * Se a ação foi inferida usando apenas Planilha de Medição
         * (sem marcador forte de repasse), mantemos a ação à esquerda e
         * acrescentamos a necessidade de conferência da FR na NE/NL.
         *
         * Ex.:
         *   Aferir alíquota. Potencial repasse (conferir FR na NE e/ou NL)
         *   Pré-ACI: NL, Ofício, TRM, assinaturas 📝. Potencial repasse (...)
         */
        /*
         * ARQUIVAMENTO + MEMÓRIA DA CORRESPONDÊNCIA
         *
         * Quando o processo já está em Arquivamento provável, a informação
         * de NE/tipo/FR não deve desaparecer. Mantemos um comentário neutro
         * ao lado, sem a palavra "Pendente".
         *
         * Ex.:
         * Arquivamento provável 🗂️ — ART, NE 7008/ANO_EXEMPLO, FR FONTE_EXEMPLO_A
         */
        if (
            arquivamentoDetectado &&
            !aberturaResidualPagamentoDfpo &&
            comentarioCorrespondenciaNaoRepasse
        ) {
            /*
             * Uma única sinalização nativa:
             * não usamos " · " aqui porque esse separador representa
             * múltiplos status independentes no relatório.
             */
            sinalizacaoFinal =
                `Arquivamento provável 🗂️ — ${comentarioCorrespondenciaNaoRepasse}`;
        }

        const avisoPotencialRepasse =
            'Potencial repasse (conferir FR na NE e/ou NL)';

        if (
            potencialRepasse &&
            [
                'Despachar para aferir alíquota',
                'Aferir alíquota',
                'Aferindo alíquota',
                'Pré-ACI: NL, Ofício, TRM, assinaturas 📝'
            ].includes(
                sinalizacaoFinal
            )
        ) {
            sinalizacaoFinal +=
                `. ${avisoPotencialRepasse}`;
        }

        /*
         * PROCESSO CONCLUÍDO + PAGAMENTO PROVÁVEL — v9.9.119
         *
         * Se não há nenhuma unidade aberta e a sinalização chegou ao
         * estado "Palavra pagamento/comprovante identificada. Pagamento provável",
         * ele não deve permanecer entre os ativos.
         *
         * Promovemos o estado para Arquivamento provável para que:
         * - a sinalização fique semanticamente correta;
         * - a linha seja roteada automaticamente para a 3ª tabela.
         */
        if (
            unidades.length === 0 &&
            normalizar(
                sinalizacaoFinal
            ) ===
            normalizar(
                'Palavra "pagamento/comprovante" identificada. Pagamento provável'
            )
        ) {
            sinalizacaoFinal =
                'Arquivamento provável 🗂️ — pagamento provável';
        }

        /*
         * PROCESSO CONCLUÍDO SEM COMPROVANTE DE PAGAMENTO
         *
         * Se a lógica identificou uma pendência de pagamento, mas o
         * processo já não possui nenhuma unidade aberta, não existe
         * "Em trabalho por" atual para aplicar a regra dos 7 dias.
         *
         * Nesse caso descrevemos exatamente a situação observável:
         * o processo foi concluído sem que a árvore apresente um
         * comprovante financeiro reconhecido.
         */
        /*
         * Regressões esperadas v9.9.119:
         * PROCESSO_EXEMPLO_013
         * PROCESSO_EXEMPLO_010
         * PROCESSO_EXEMPLO_009
         * PROCESSO_EXEMPLO_006
         *
         * Todos sem unidade aberta + pagamento provável
         * => Arquivamento provável 🗂️ — pagamento provável
         */

        if (
            unidades.length === 0 &&
            sinalizacaoFinal ===
                'Pagamento pendente'
        ) {
            sinalizacaoFinal =
                'Concluído sem comprovante de pagamento ⚠️';
        }

        const abertoNoCircuitoDf =
            unidades.some(
                unidade =>
                    [
                        'ORG/FIN/PLANEJAMENTO',
                        'ORG/FIN/TESOURARIA',
                        'ORG/FIN/CONTABILIDADE'
                    ].some(
                        unidadeCircuito =>
                            normalizarUnidade(
                                unidade
                            ) ===
                            normalizarUnidade(
                                unidadeCircuito
                            )
                    )
            );

        const seteDiasMs =
            7 * 24 * 60 * 60 * 1000;

        const ateSeteDiasNaDfTes =
            Boolean(inicioCircuitoDfAtual) &&
            tempoCircuitoDfAtualMs >= 0 &&
            tempoCircuitoDfAtualMs <
                seteDiasMs;

        if (
            abertoDfTes &&
            ateSeteDiasNaDfTes &&
            (
                !sinalizacaoFinal ||
                sinalizacaoFinal === '—'
            )
        ) {
            sinalizacaoFinal =
                'Trâmite ORG/FIN/TESOURARIA (<7 dias)';
        }

        /*
         * EXCEÇÃO SINTÉTICA — PROCESSO_EXEMPLO_004 — v9.9.124
         *
         * Este processo percorreu praticamente todo o fluxo de repasse
         * (ACI, aferição, retenção, TRM e Fazenda), mas a despesa foi
         * posteriormente reconhecida como recursos próprios.
         *
         * Como a árvore preserva todos os marcadores típicos de repasse,
         * alterar as regras gerais para encaixá-lo criaria risco de falso
         * positivo em outros processos.
         *
         * Situação conhecida:
         * - processo sem unidade aberta;
         * - pagamento já concluído;
         * - comprovantes da DF-TES na árvore;
         * - deve ser tratado como não-repasse pago / arquivável.
         *
         * A exceção é propositalmente pelo número exato do processo.
         */
        const excecaoNaoRepassePago115 =
            String(
                processo.numero || ''
            ).trim() ===
                'PROCESSO_EXEMPLO_004';

        if (
            excecaoNaoRepassePago115 &&
            unidades.length === 0
        ) {
            sinalizacaoFinal =
                'Arquivamento provável 🗂️';
        }

        if (!abertoDf) {
            return {
                processo: processo.numero,
                credor:
                    ATIVAR_COLUNA_CREDOR
                        ? (credor.nome || '—')
                        : '',
                credorOrigem:
                    ATIVAR_COLUNA_CREDOR
                        ? (credor.origem || '')
                        : '',
                unidades: unidades.join('\n'),
                abertoDfpo,
                abertoFazenda,
                abertoDf,
                abertoIon,
                desdeDfDfpo,
                tempoDfDfpo,
                eventoAberturaDfDfpo,
                desdeDfpo: '',
                tempoDfpo:
                    tempoHistoricoCircuitoDfMs > 0
                        ? (
                            formatarDuracao(
                                tempoHistoricoCircuitoDfMs
                            ) +
                            '\n(histórico)'
                        )
                        : 'Não está aberto em unidade da DF',
                usuarioRecebimento: '',
                eventoAbertura: '',
                situacao:
                    abertoFazenda
                        ? (
                            'Aberto na Fazenda\n' +
                            `(${formatarDuracao(
                                tempoAcumuladoFazendaMs
                            )})`
                        )
                        : abertoIon
                            ? 'ORGAO_EXEMPLO (não-DF): ACI, PRES, DGAP, etc'
                            : unidades.length
                                ? 'Fora da ORGAO_EXEMPLO'
                                : 'Sem unidade aberta',
                sinalizacao: sinalizacaoFinal,
                detalhe: situacao.frase,
                url: processo.url
            };
        }

        if (!urlHistorico) {
            return {
                processo: processo.numero,
                credor:
                    ATIVAR_COLUNA_CREDOR
                        ? (credor.nome || '—')
                        : '',
                credorOrigem:
                    ATIVAR_COLUNA_CREDOR
                        ? (credor.origem || '')
                        : '',
                unidades: unidades.join('\n'),
                abertoDfpo,
                abertoFazenda,
                abertoDf,
                abertoIon,
                desdeDfDfpo,
                tempoDfDfpo,
                eventoAberturaDfDfpo,
                desdeDfpo: '',
                tempoDfpo:
                    'Aberto na DF, mas histórico não localizado',
                usuarioRecebimento: '',
                eventoAbertura: '',
                situacao: 'DF',
                sinalizacao: sinalizacaoFinal,
                detalhe:
                    'Existe unidade da DF aberta, mas o histórico não foi localizado.',
                url: processo.url
            };
        }

        /*
         * Procura a abertura atual de todas as unidades da DF que
         * estejam abertas no processo. Caso haja mais de uma, usa o
         * andamento mais recente para preencher as colunas de data
         * e tempo de trabalho.
         */
        const unidadesDfAbertas =
            unidades.filter(
                unidade =>
                    UNIDADES_DF.some(
                        unidadeDf =>
                            normalizarUnidade(
                                unidade
                            ) ===
                            normalizarUnidade(
                                unidadeDf
                            )
                    )
            );

        const andamentosDf =
            unidadesDfAbertas
                .map(
                    unidade => ({
                        unidade,
                        andamento:
                            extrairAndamentoAberto(
                                htmlHistorico,
                                unidade
                            )
                    })
                )
                .filter(
                    item =>
                        Boolean(item.andamento)
                )
                .map(
                    item => ({
                        ...item,
                        data:
                            interpretarDataBrasileira(
                                item.andamento.dataHora
                            )
                    })
                )
                .filter(
                    item =>
                        Boolean(item.data)
                )
                .sort(
                    (a, b) =>
                        b.data.getTime() -
                        a.data.getTime()
                );

        const andamentoDfAtual =
            inicioCircuitoDfAtual
                ? {
                    unidade:
                        inicioCircuitoDfAtual.unidade,
                    andamento:
                        inicioCircuitoDfAtual,
                    data:
                        inicioCircuitoDfAtual.data ||
                        interpretarDataBrasileira(
                            inicioCircuitoDfAtual.dataHora
                        )
                }
                : andamentosDf[0] || null;

        if (!andamentoDfAtual) {
            return {
                processo: processo.numero,
                credor:
                    ATIVAR_COLUNA_CREDOR
                        ? (credor.nome || '—')
                        : '',
                credorOrigem:
                    ATIVAR_COLUNA_CREDOR
                        ? (credor.origem || '')
                        : '',
                unidades: unidades.join('\n'),
                abertoDfpo,
                abertoFazenda,
                abertoDf,
                abertoIon,
                desdeDfDfpo,
                tempoDfDfpo,
                eventoAberturaDfDfpo,
                desdeDfpo: '',
                tempoDfpo:
                    'Aberto na DF; entrada atual não identificada',
                usuarioRecebimento: '',
                eventoAbertura: '',
                situacao: 'DF',
                sinalizacao: sinalizacaoFinal,
                detalhe:
                    'Não foi encontrada a linha de abertura atual para as unidades da DF.',
                url: processo.url
            };
        }

        const data =
            andamentoDfAtual.data;

        /*
         * "Em unidade da DF desde" e "Em trabalho por" representam
         * agora o CIRCUITO DF CONTÍNUO:
         *
         * começa quando o processo entra em qualquer unidade da DF;
         * transferências DF -> DF não reiniciam o relógio;
         * o relógio só reinicia depois que o processo sai de todas
         * as unidades da DF e posteriormente retorna.
         */
        const tempoAbertoDfMs =
            Date.now() -
            data.getTime();

        /*
         * TESOURARIA RECENTE
         *
         * Se o processo está na DF-TES e a regra anterior resultou em
         * "Pagamento pendente", usa o próprio tempo exibido na coluna
         * "Em trabalho por". Enquanto esse tempo for menor que 7 dias,
         * a etapa operacional da Tesouraria prevalece.
         */
        if (
            abertoDfTes &&
            sinalizacaoFinal ===
                'Pagamento pendente' &&
            tempoAbertoDfMs >= 0 &&
            tempoAbertoDfMs <
                7 * 24 * 60 * 60 * 1000
        ) {
            sinalizacaoFinal =
                'Trâmite ORG/FIN/TESOURARIA (<7 dias)';
        }

        /*
         * COMPLEMENTO TEMPORAL DO PAGAMENTO PENDENTE
         *
         * Usa exatamente o mesmo tempo mostrado na coluna
         * "Em trabalho por".
         */
        if (
            sinalizacaoFinal ===
                'Pagamento pendente'
        ) {
            const seteDiasMs =
                7 * 24 * 60 * 60 * 1000;

            sinalizacaoFinal =
                tempoAbertoDfMs >
                    seteDiasMs
                    ? 'Pagamento pendente (>7 dias ⚠️)'
                    : 'Pagamento pendente (<7 dias)';
        }

        /*
         * SEMENTE DE REAJUSTE
         *
         * Usa somente o título da primeira peça. É deliberadamente
         * conservadora e só entra como fallback.
         *
         * Além disso, bloqueia a classificação se houver sinais de
         * pagamento ou de repasse/medição já em curso, porque reajustes
         * já contratados podem mais tarde seguir esses fluxos.
         */
        const temSinalPagamentoOuRepasse =
            sinalizacao.temAutorizacaoPagamento ||
            sinalizacao.temPagamentoNaArvore ||
            sinalizacao.temComprovanteNaArvore ||
            sinalizacao.temBoletoNaArvore ||
            sinalizacao.temDocumentoCobrancaRecente ||
            sinalizacao.temMarcadorRepasseNaArvore ||
            sinalizacao.temRelatorioRetencaoNaArvore;

        if (
            (
                !sinalizacaoFinal ||
                sinalizacaoFinal === '—'
            ) &&
            provavelReajuste.detectada &&
            !temSinalPagamentoOuRepasse
        ) {
            sinalizacaoFinal =
                'Não mapeado: provável Reajuste (em desenvolvimento)';
        }

        if (
            (
                !sinalizacaoFinal ||
                sinalizacaoFinal === '—'
            ) &&
            provavelProrrogacao.detectada &&
            !temSinalPagamentoOuRepasse
        ) {
            sinalizacaoFinal =
                'Não mapeado: provável Prorrogação (em desenvolvimento)';
        }

        if (
            (
                !sinalizacaoFinal ||
                sinalizacaoFinal === '—'
            ) &&
            provavelAditivo.detectada &&
            !temSinalPagamentoOuRepasse
        ) {
            sinalizacaoFinal =
                'Não mapeado: provável Aditivo (em desenvolvimento)';
        }

        if (
            (
                !sinalizacaoFinal ||
                sinalizacaoFinal === '—'
            ) &&
            provavelReequilibrio.detectada &&
            !temSinalPagamentoOuRepasse
        ) {
            sinalizacaoFinal =
                'Não mapeado: provável Reequilíbrio/Repactuação (em desenvolvimento)';
        }

        /*
         * SEMENTE DE CONTRATAÇÃO
         *
         * v9.9.130 — regressão real:
         * PROCESSO_EXEMPLO_008
         * Primeira peça intitulada apenas "Despacho DO", porém conteúdo:
         * "Resumo do Assunto: Solicitação de obras e serviços",
         * "solicito autorizar", prazo de execução e valor global.
         *
         * Só entra quando nenhuma regra operacional anterior conseguiu
         * classificar o processo. Dessa forma a heurística da primeira
         * peça não interfere em pagamento, repasse, alíquota, ACI,
         * Fazenda, TRM etc.
         */
        if (
            (
                !sinalizacaoFinal ||
                sinalizacaoFinal === '—'
            ) &&
            provavelContratacao.detectada
        ) {
            sinalizacaoFinal =
                'Provável Contratação 🧾 (em desenvolvimento)';
        }

        /*
         * FLUXO ATÍPICO OU NÃO MAPEADO
         *
         * Fallback operacional para processos atualmente abertos na DF
         * que não foram reconhecidos por nenhuma regra específica.
         *
         * A faixa usa exatamente o mesmo tempo da coluna
         * "Em trabalho por".
         *
         * O diagnóstico "Caso externo a experiência..." continua
         * reservado para "-" e para conflitos de múltiplas sinalizações.
         */
        if (
            !sinalizacaoFinal ||
            sinalizacaoFinal === '—'
        ) {
            sinalizacaoFinal =
                tempoAbertoDfMs >
                    7 * 24 * 60 * 60 * 1000
                    ? 'Fluxo sem dicionário (>7 dias ⚠️)'
                    : 'Fluxo sem dicionário (<7 dias)';
        }

        return {
            processo: processo.numero,
            credor:
                ATIVAR_COLUNA_CREDOR
                    ? (credor.nome || '—')
                    : '',
            credorOrigem:
                ATIVAR_COLUNA_CREDOR
                    ? (credor.origem || '')
                    : '',
            unidades: unidades.join('\n'),
            abertoDfpo,
            abertoFazenda,
            abertoDf,
            abertoIon,
            desdeDfDfpo,
            tempoDfDfpo,
            eventoAberturaDfDfpo,
            desdeDfpo:
                andamentoDfAtual.andamento.dataHora,
            tempoDfpo:
                formatarDuracao(
                    tempoAbertoDfMs
                ),
            usuarioRecebimento:
                andamentoDfAtual.andamento.usuario,
            eventoAbertura:
                andamentoDfAtual.andamento.descricao,
            situacao: 'DF',
            sinalizacao: sinalizacaoFinal,
            detalhe:
                `${situacao.frase} Unidade da DF considerada no tempo: ${andamentoDfAtual.unidade}.`,
            url: processo.url
        };
    }

    async function obterHtml(url) {
        const resposta = await fetch(url, {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
            redirect: 'follow',
            headers: {
                Accept:
                    'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
        });

        if (!resposta.ok) {
            throw new Error(
                `O SEI respondeu com HTTP ${resposta.status}.`
            );
        }

        const buffer = await resposta.arrayBuffer();

        const contentType =
            resposta.headers.get('content-type') || '';

        const charset = (
            contentType.match(
                /charset\s*=\s*["']?([^;"'\s]+)/i
            )?.[1] || ''
        ).toLowerCase();

        return {
            html: decodificarResposta(
                buffer,
                charset
            ),
            url: resposta.url || url
        };
    }

    function decodificarResposta(buffer, charset) {
        const codificacoes = [
            charset,
            'windows-1252',
            'iso-8859-1',
            'utf-8'
        ].filter(Boolean);

        const tentadas = new Set();

        for (const codificacao of codificacoes) {
            if (tentadas.has(codificacao)) {
                continue;
            }

            tentadas.add(codificacao);

            try {
                const texto =
                    new TextDecoder(codificacao)
                        .decode(buffer);

                if (!(texto.match(/\uFFFD/g) || []).length) {
                    return texto;
                }
            } catch (_) {
                // Tenta outra codificação.
            }
        }

        return new TextDecoder('utf-8')
            .decode(buffer);
    }

    async function tentarExpandirPastasSemRisco(
        htmlBase,
        base
    ) {
        const quantidadeBase =
            extrairDocumentosDaArvore(
                htmlBase
            ).length;

        const candidatos = [];
        const vistos = new Set();

        const coletarCandidatos = html => {
            const texto =
                decodificarJs(
                    String(html || '')
                        .replace(/&amp;/gi, '&')
                );

            const regex =
                /(?:href|src)\s*=\s*(['"])([^'"]*abrir_pastas=1[^'"]*)\1/gi;

            let achado;

            while (
                (achado = regex.exec(texto)) !== null
            ) {
                const endereco =
                    desescaparArgumentoJs(
                        achado[2]
                    )
                        .replace(/&amp;/gi, '&')
                        .trim();

                if (!endereco) {
                    continue;
                }

                try {
                    const url =
                        new URL(
                            endereco,
                            base
                        ).href;

                    if (!vistos.has(url)) {
                        vistos.add(url);
                        candidatos.push(url);
                    }
                } catch (_) {
                    // Ignora candidatos inválidos.
                }
            }

            try {
                const urlAtual =
                    localizarUrlAbrirPastas(
                        html,
                        base
                    );

                if (
                    urlAtual &&
                    !vistos.has(urlAtual)
                ) {
                    vistos.add(urlAtual);
                    candidatos.push(urlAtual);
                }
            } catch (_) {
                // Mantém o fluxo antigo intacto.
            }
        };

        coletarCandidatos(htmlBase);

        let melhorHtml = htmlBase;
        let maiorQuantidade = quantidadeBase;

        for (
            let ciclo = 0;
            ciclo < 3;
            ciclo++
        ) {
            let encontrouMelhora = false;
            const rodada = [...candidatos];

            for (const url of rodada) {
                try {
                    const resposta =
                        await obterHtml(url);

                    verificarErroSei(
                        resposta.html
                    );

                    const quantidade =
                        extrairDocumentosDaArvore(
                            resposta.html
                        ).length;

                    console.debug(
                        '[SEI][Pastas][Expansão auxiliar]',
                        {
                            ciclo: ciclo + 1,
                            url,
                            quantidadeBase,
                            quantidadeAtual: quantidade
                        }
                    );

                    if (
                        quantidade >
                        maiorQuantidade
                    ) {
                        melhorHtml =
                            resposta.html || '';

                        maiorQuantidade =
                            quantidade;

                        encontrouMelhora = true;

                        coletarCandidatos(
                            melhorHtml
                        );
                    }
                } catch (erro) {
                    console.warn(
                        '[SEI][Pastas] Expansão auxiliar ignorada:',
                        erro
                    );
                }
            }

            if (!encontrouMelhora) {
                break;
            }
        }

        return {
            html: melhorHtml,
            quantidadeBase,
            quantidadeFinal: maiorQuantidade,
            melhorou:
                maiorQuantidade >
                quantidadeBase
        };
    }


    function localizarUrlAbrirPastas(
        html,
        base
    ) {
        const variacoes = [
            String(html || ''),
            String(html || '')
                .replace(/&amp;/gi, '&'),
            decodificarJs(
                String(html || '')
            )
        ];

        const candidatos = [];

        for (const texto of variacoes) {
            const regex =
                /(?:https?:\/\/[^"'<>\\\s]+)?(?:\/sei\/)?controlador\.php\?[^"'<>\\\s]{1,5000}/gi;

            for (const achado of texto.matchAll(regex)) {
                const candidato =
                    limparUrl(
                        achado[0]
                    );

                if (
                    candidato.includes(
                        'acao=procedimento_visualizar'
                    ) &&
                    candidato.includes(
                        'abrir_pastas=1'
                    )
                ) {
                    candidatos.push(
                        candidato
                    );
                }
            }
        }

        for (const candidato of candidatos) {
            try {
                const url = new URL(
                    candidato,
                    base
                );

                if (
                    url.searchParams.get('acao') ===
                        'procedimento_visualizar' &&
                    url.searchParams.get(
                        'abrir_pastas'
                    ) === '1'
                ) {
                    return url.href;
                }
            } catch (_) {
                // Continua procurando.
            }
        }

        return null;
    }

    function localizarUrlPorAcao(
        html,
        base,
        acao,
        obrigatorios = []
    ) {
        const candidatos = [];

        const variacoes = [
            String(html || ''),
            String(html || '')
                .replace(/&amp;/gi, '&'),
            String(html || '')
                .replace(/\\u0026/gi, '&')
                .replace(/\\x26/gi, '&')
                .replace(/\\\//g, '/')
                .replace(/&amp;/gi, '&')
        ];

        for (const texto of variacoes) {
            const regex =
                /(?:https?:\/\/[^"'<>\\\s]+)?(?:\/sei\/)?controlador\.php\?[^"'<>\\\s]{1,5000}/gi;

            for (const achado of texto.matchAll(regex)) {
                if (
                    achado[0].includes(
                        `acao=${acao}`
                    )
                ) {
                    candidatos.push(achado[0]);
                }
            }
        }

        const doc = new DOMParser().parseFromString(
            String(html || ''),
            'text/html'
        );

        for (
            const el of doc.querySelectorAll(
                'a[href], iframe[src], frame[src], form[action]'
            )
        ) {
            const endereco =
                el.getAttribute('href') ||
                el.getAttribute('src') ||
                el.getAttribute('action');

            if (
                endereco?.includes(
                    `acao=${acao}`
                )
            ) {
                candidatos.push(endereco);
            }
        }

        for (let candidato of candidatos) {
            candidato = limparUrl(candidato);

            try {
                const url = new URL(
                    candidato,
                    base
                );

                if (
                    url.searchParams.get('acao') !==
                    acao
                ) {
                    continue;
                }

                const ok = obrigatorios.every(
                    parametro =>
                        url.searchParams.get(parametro)
                );

                if (ok) {
                    return url.href;
                }
            } catch (_) {
                // Continua procurando.
            }
        }

        return null;
    }

    function extrairSinalizacaoArvore(
        html,
        unidadesAbertas
    ) {
        /*
         * LEITURA REAL DA ÁRVORE
         *
         * O SEI separa os dados:
         *
         * Nos[n] = new infraArvoreNo(...)
         *   -> contém o ID interno, título e número SEI.
         *
         * NosAcoes[n] = new infraArvoreAcao(
         *   "UNIDADE_GERADORA", ..., ID_INTERNO, ..., "NIT/..."
         * )
         *   -> contém a unidade que gerou a peça.
         *
         * A ligação correta é feita pelo ID interno do documento.
         */
        const documentos =
            extrairDocumentosDaArvore(html);

        const unidadesGeradoras =
            extrairUnidadesGeradorasDaArvore(html);

        const pecas = documentos
            .map(documento => ({
                ...documento,
                unidade:
                    unidadesGeradoras.get(
                        String(documento.idInterno)
                    ) || ''
            }))
            .sort(
                (a, b) =>
                    Number(b.numeroSei || 0) -
                    Number(a.numeroSei || 0)
            );

        const pecasRecentes =
            pecas.slice(0, 8);

        /*
         * CONTEXTO DATI / PAGAMENTO — v9.9.118
         */
        const temPecaDatiNaArvore =
            pecas.some(
                peca =>
                    normalizarUnidade(
                        peca.unidade || ''
                    ) ===
                    normalizarUnidade(
                        'ORG/TEC/UNIDADE-E'
                    )
            );

        const temContextoPagamentoDati =
            temPecaDatiNaArvore &&
            pecas.some(
                peca =>
                    /\b(?:solicita[cç][aã]o\s+de\s+pagamento|pagamento|nota\s+fiscal|\bnf\b)\b/i.test(
                        peca.titulo || ''
                    )
            );

        /*
         * REGRA: 1ª tentativa de TRM na ACI
         *
         * Condições:
         * 1. processo aberto atualmente somente em ORG/CONTROLE;
         * 2. existe "Relatório de Retenção" OU evidência equivalente
         *    de conclusão tributária (Comprovante SN + NT tributária/Guia ISS);
         * 3. existe exatamente um TRM posterior a esse marco;
         * 4. esse TRM está próximo do marco na sequência das peças.
         *
         * "Próximo" foi calibrado como até 5 posições depois do relatório
         * na ordenação cronológica da árvore.
         */
        const abertoSomenteNaAci =
            unidadesAbertas.length > 0 &&
            unidadesAbertas.every(
                unidade => {
                    const sigla = String(unidade || '')
                        .split(/\s*\(/)[0]
                        .trim();

                    return normalizarUnidade(sigla) ===
                        normalizarUnidade('ORG/CONTROLE');
                }
            );

        const pecasCronologicas =
            [...pecas].sort(
                (a, b) =>
                    Number(a.numeroSei || 0) -
                    Number(b.numeroSei || 0)
            );

        /*
         * TRIAGEM DGAP-PROT -> PRES LOGO NA 2ª PEÇA — v9.9.115
         *
         * A v9.9.114 era ampla demais: praticamente todo processo pode
         * começar em DGAP-PROT, inclusive concessionárias (água, energia,
         * internet etc.).
         *
         * Agora só abrimos esta família especial quando a sequência da
         * ÁRVORE é muito curta e específica:
         *
         *   1ª peça cronológica -> ORG/ADM/PROTOCOLO
         *   2ª peça cronológica -> ORG/PRESIDENCIA
         *                         e título contém "Despacho"
         *
         * Portanto, casos como:
         *
         *   DGAP-PROT PDF
         *   DGAP-PROT PDF
         *   DGAP Despacho
         *   ...
         *
         * NÃO entram nesta triagem.
         *
         * Observação:
         * nesta versão ainda não usamos tecnicamente o ícone PDF como
         * condição. O filtro seguro é a sequência estrutural 1ª/2ª peça.
         */
        const primeiraPecaCronologica =
            pecasCronologicas[0] || null;

        const segundaPecaCronologica =
            pecasCronologicas[1] || null;

        const primeiraPecaDgapProt =
            Boolean(
                primeiraPecaCronologica &&
                normalizarUnidade(
                    primeiraPecaCronologica.unidade || ''
                ) ===
                normalizarUnidade(
                    'ORG/ADM/PROTOCOLO'
                )
            );

        const segundaPecaDespachoPres =
            Boolean(
                segundaPecaCronologica &&
                normalizarUnidade(
                    segundaPecaCronologica.unidade || ''
                ) ===
                normalizarUnidade(
                    'ORG/PRESIDENCIA'
                ) &&
                /\bdespacho\b/i.test(
                    segundaPecaCronologica.titulo || ''
                )
            );

        const fluxoDiretoDgapProtPres =
            primeiraPecaDgapProt &&
            segundaPecaDespachoPres;

        const textoTitulosArvore =
            pecasCronologicas
                .map(
                    peca =>
                        peca.titulo || ''
                )
                .join(' | ');

        const arvoreIndicaRessarcimento =
            /\b(?:restitui[cç][aã]o|devolu[cç][aã]o|ressarcimento|estorno)\b/i.test(
                textoTitulosArvore
            );

        /*
         * v9.9.116:
         * enquanto ainda não há histórico suficiente de reajustes no SEI,
         * não tentamos separar subfamílias aqui.
         *
         * O próprio padrão estrutural:
         *   1ª peça DGAP-PROT
         *   2ª peça Despacho PRES
         *
         * passa a gerar uma única sinalização prudente.
         */
        const arvoreIndicaReajuste = false;

        let triagemCorrespondenciaExterna = '';

        if (fluxoDiretoDgapProtPres) {
            triagemCorrespondenciaExterna =
                'Provável Ressarcimento ou PDF sem dicionário';
        }

        /*
         * SINALIZAÇÃO UNIFICADA v9.9.116
         *
         * O fluxo direto DGAP-PROT -> PRES na 2ª peça passa a mostrar:
         *   Provável Ressarcimento ou PDF sem dicionário
         *
         * Sem tentar classificar reajuste neste momento.
         * A cor amarela fica restrita às 3 colunas operacionais.
         */

        /*
         * Casos de teste esperados:
         *
         * PROCESSO_EXEMPLO_012
         *   1ª DGAP-PROT: Requerimento de Restituição...
         *   2ª PRES: Despacho DF
         *   => Provável Ressarcimento
         *
         * PROCESSO_EXEMPLO_011
         *   1ª DGAP-PROT: Carta SEEL...
         *   2ª PRES: Despacho
         *   => palavras posteriores/primeira peça podem indicar devolução;
         *      se o título não trouxer palavra-chave, permanece a hipótese dupla.
         *
         * PROCESSO_EXEMPLO_020 (água/esgoto)
         *   1ª DGAP-PROT: Ofício conta de água/esgoto
         *   2ª DGAP-PROT: Conta de água/esgoto
         *   => NÃO entra nesta triagem.
         */

        const indiceRelatorioRetencao =
            (() => {
                for (
                    let i = pecasCronologicas.length - 1;
                    i >= 0;
                    i--
                ) {
                    if (
                        /relat[oó]rio\s+de\s+reten[cç][aã]o/i.test(
                            pecasCronologicas[i].titulo || ''
                        )
                    ) {
                        return i;
                    }
                }

                return -1;
            })();

        /*
         * A mesma conclusão tributária já aceita no Pré-ACI também
         * deve valer para a regra de TRM na ACI.
         *
         * Há processos em que a DF-CONT conclui a etapa com:
         *
         *   Comprovante SN
         *   + Nota Técnica IRRF/DSR/Retenção OU Guia de ISS
         *   + Despacho genérico
         *
         * sem criar uma peça literalmente chamada "Relatório de Retenção".
         *
         * Nessa situação usamos como marco cronológico a peça tributária
         * mais recente (Nota Técnica ou Guia ISS), desde que exista
         * Comprovante SN anterior ou na mesma sequência.
         */
        const indiceComprovanteSn =
            (() => {
                for (
                    let i = pecasCronologicas.length - 1;
                    i >= 0;
                    i--
                ) {
                    if (
                        /comprovante\s+sn|simples\s+nacional/i.test(
                            pecasCronologicas[i].titulo || ''
                        )
                    ) {
                        return i;
                    }
                }

                return -1;
            })();

        const indiceTratamentoTributarioAlternativo =
            (() => {
                if (indiceComprovanteSn < 0) {
                    return -1;
                }

                for (
                    let i = pecasCronologicas.length - 1;
                    i >= indiceComprovanteSn;
                    i--
                ) {
                    const titulo =
                        pecasCronologicas[i].titulo || '';

                    if (
                        /nota\s+t[eé]cnica\s+(?:dsr|irrf|reten[cç][aã]o)/i.test(
                            titulo
                        ) ||
                        /guia\s+(?:de\s+)?iss\b/i.test(
                            titulo
                        )
                    ) {
                        return i;
                    }
                }

                return -1;
            })();

        const indiceMarcoRetencao =
            indiceRelatorioRetencao >= 0
                ? indiceRelatorioRetencao
                : indiceTratamentoTributarioAlternativo;

        const trmsAposRelatorio =
            indiceMarcoRetencao >= 0
                ? pecasCronologicas
                    .map((peca, indice) => ({
                        peca,
                        indice
                    }))
                    .filter(
                        item =>
                            item.indice >
                                indiceMarcoRetencao &&
                            ehTituloTrm(
                                item.peca.titulo || ''
                            )
                    )
                : [];

        /*
         * ACI — 1ª TENTATIVA DE TRM
         *
         * A regra antiga exigia que o primeiro TRM surgisse em até 5 peças
         * depois do marco tributário. Isso era frágil porque peças normais de
         * preparação (NL, validação da NL, CPFGF, Ofício etc.) aumentavam a
         * distância sem representar um novo ciclo.
         *
         * Agora, em vez de contar peças, verificamos se apareceu algum MARCO
         * FORTE incompatível entre a retenção e o TRM candidato.
         */
        let houveNovoCicloIncompativelEntreRetencaoETrm = false;

        if (
            indiceMarcoRetencao >= 0 &&
            trmsAposRelatorio.length === 1
        ) {
            const indiceTrmCandidato =
                trmsAposRelatorio[0].indice;

            houveNovoCicloIncompativelEntreRetencaoETrm =
                pecasCronologicas.some(
                    (peca, indice) => {
                        if (
                            indice <= indiceMarcoRetencao ||
                            indice >= indiceTrmCandidato
                        ) {
                            return false;
                        }

                        const titulo =
                            peca.titulo || '';

                        return (
                            /despacho.*aferir.*al[ií]quota/i.test(
                                titulo
                            ) ||
                            /relat[oó]rio\s+de\s+reten[cç][aã]o/i.test(
                                titulo
                            ) ||
                            ehTituloTrm(
                                titulo
                            ) ||
                            /comprovante\s+de\s+pagamento/i.test(
                                titulo
                            ) ||
                            /arquiv/i.test(
                                titulo
                            )
                        );
                    }
                );
        }

        const primeiraTentativaTrmNaAci =
            abertoSomenteNaAci &&
            indiceMarcoRetencao >= 0 &&
            trmsAposRelatorio.length === 1 &&
            !houveNovoCicloIncompativelEntreRetencaoETrm;

        if (
            abertoSomenteNaAci &&
            trmsAposRelatorio.length === 1
        ) {
            console.debug(
                '[SEI][ACI/TRM] Análise da 1ª tentativa de TRM:',
                {
                    indiceMarcoRetencao,
                    indiceTrm:
                        trmsAposRelatorio[0].indice,
                    distancia:
                        trmsAposRelatorio[0].indice -
                        indiceMarcoRetencao,
                    houveNovoCicloIncompativelEntreRetencaoETrm,
                    primeiraTentativaTrmNaAci
                }
            );
        }

        /*
         * REGRA: mais de um TRM na ACI
         *
         * Condições:
         * 1. processo aberto atualmente somente em ORG/CONTROLE;
         * 2. existem 2 ou mais peças reconhecidas como TRM entre as peças da árvore.
         *
         * Interpretação:
         * forte sinal de que o TRM está sendo lapidado na ACI.
         */
        const trmsNaArvore =
            pecas.filter(
                peca =>
                    ehTituloTrm(
                        peca.titulo || ''
                    )
            );

        const maisDeUmTrmNaAci =
            abertoSomenteNaAci &&
            trmsNaArvore.length > 1;

        /*
         * REGRA: provável indicação da ACI para envio à SMF
         *
         * Condições:
         * 1. processo aberto atualmente em ORG/PRESIDENCIA e/ou ORG/CONTROLE;
         * 2. existe peça recente cujo título contenha simultaneamente
         *    expressões ligadas a:
         *       - Despacho
         *       - Presidência
         *       - SMF
         *       - ORG/CONTROLE
         *
         * Como a unidade ORG/CONTROLE pode aparecer como unidade geradora
         * da peça, ela também é considerada como evidência associada.
         */
        const abertoEmPresOuAci =
            unidadesAbertas.length > 0 &&
            unidadesAbertas.every(
                unidade => {
                    const sigla = String(unidade || '')
                        .split(/\s*\(/)[0]
                        .trim();

                    const normalizada =
                        normalizarUnidade(sigla);

                    return (
                        normalizada ===
                            normalizarUnidade(
                                'ORG/PRESIDENCIA'
                            ) ||
                        normalizada ===
                            normalizarUnidade(
                                'ORG/CONTROLE'
                            )
                    );
                }
            );

        const pecaIndicacaoSmf =
            pecasRecentes.find(
                peca => {
                    const titulo =
                        normalizar(
                            peca.titulo || ''
                        );

                    const unidade =
                        normalizarUnidade(
                            peca.unidade || ''
                        );

                    const temDespacho =
                        titulo.includes(
                            normalizar('Despacho')
                        );

                    const temPresidencia =
                        titulo.includes(
                            normalizar('Presidência')
                        ) ||
                        titulo.includes(
                            normalizar('Presidencia')
                        );

                    const temSmf =
                        titulo.includes(
                            normalizar('SMF')
                        );

                    const temAci =
                        titulo.includes(
                            normalizar('ORG/CONTROLE')
                        ) ||
                        unidade ===
                            normalizarUnidade(
                                'ORG/CONTROLE'
                            );

                    return (
                        temDespacho &&
                        temPresidencia &&
                        temSmf &&
                        temAci
                    );
                }
            );

        /*
         * CASO COMPLEMENTAR:
         *
         * A ACI pode produzir como última peça um despacho indicando
         * envio à SMF, mas remeter o processo por engano à DF-PO ou
         * a outra unidade da ORGAO_EXEMPLO. Nesse cenário, a unidade atualmente
         * aberta já pode não ser PRES/ACI.
         *
         * Quando a peça mais recente:
         * - contém "Despacho";
         * - contém "SMF";
         * - foi gerada pela ORG/CONTROLE;
         *
         * ela também é considerada evidência suficiente da indicação
         * de envio à SMF.
         */
        const ultimaPeca =
            pecas.length > 0
                ? pecas[0]
                : null;

        const ultimaPecaDespachoMedicao =
            Boolean(ultimaPeca) &&
            /despacho[\s\S]*medi[cç][aã]o/i.test(
                ultimaPeca.titulo || ''
            );

        const ultimaPecaVerificacaoAliquota =
            Boolean(ultimaPeca) &&
            /despacho[\s\S]*(?:verifica[cç][aã]o|aferi[cç][aã]o)[\s\S]*al[ií]quota/i.test(
                ultimaPeca.titulo || ''
            );

        const pecaVerificacaoAliquotaNaArvore =
            pecas.find(
                peca =>
                    /despacho[\s\S]*(?:verifica[cç][aã]o|aferi[cç][aã]o)[\s\S]*al[ií]quota/i.test(
                        peca.titulo || ''
                    )
            );

        const pecaComprovanteSnNaArvore =
            pecas.find(
                peca =>
                    /comprovante[\s\S]*(?:sn|simples\s+nacional)/i.test(
                        peca.titulo || ''
                    )
            );

        const pecaRelatorioRetencaoNaArvore =
            pecas.find(
                peca =>
                    /relat[oó]rio\s+de\s+reten[cç][aã]o/i.test(
                        peca.titulo || ''
                    )
            );

        const pecaNotaTecnicaTributariaNaArvore =
            pecas.find(
                peca =>
                    /nota\s+t[eé]cnica\s+(?:dsr|irrf|reten[cç][aã]o)/i.test(
                        peca.titulo || ''
                    )
            );

        const pecaGuiaIssNaArvore =
            pecas.find(
                peca =>
                    /guia\s+de?\s*iss|guia\s+iss/i.test(
                        peca.titulo || ''
                    )
            );

        const evidenciaAliquotaAferida =
            pecas.find(
                peca =>
                    /inscri[cç][aã]o\s+sn|simples\s+nacional|nota\s+t[eé]cnica\s+(?:dsr|irrf|reten[cç][aã]o)|guia\s+iss|relat[oó]rio\s+de\s+reten[cç][aã]o/i.test(
                        peca.titulo || ''
                    )
            );

        const pecaFotograficoNaArvore =
            pecas.find(
                peca =>
                    /fotogr[aá]fico/i.test(
                        peca.titulo || ''
                    )
            );

        const pecaDiarioObraNaArvore =
            pecas.find(
                peca =>
                    /di[aá]rio\s+de\s+obra/i.test(
                        peca.titulo || ''
                    )
            );

        /*
         * INDÍCIO FRACO DE REPASSE
         *
         * Os novos processos podem trazer:
         * - Planilha de Medição
         * - Planilha de Medição do Contrato
         * - Planilha de Medição do Aditivo
         *
         * Essas peças, isoladamente, NÃO confirmam repasse, porque também
         * podem existir em outros fluxos. Servem apenas para sinalizar:
         * "Potencial repasse (conferir FR na NE e/ou NL)".
         */
        const pecaPlanilhaMedicaoNaArvore =
            pecas.find(
                peca => {
                    const titulo =
                        peca.titulo || '';

                    return (
                        /planilha/i.test(
                            titulo
                        ) &&
                        /medi[cç][aã]o/i.test(
                            titulo
                        )
                    );
                }
            );

        /*
         * CONFIRMAÇÃO ALTERNATIVA DE REPASSE PELA DF-CONT
         *
         * Aferição/verificação de alíquota, sozinha, não confirma repasse:
         * processos de fonte própria também podem passar por essa etapa.
         *
         * Porém, aferição + pelo menos DUAS categorias de peças típicas
         * efetivamente geradas pela ORG/FIN/CONTABILIDADE é tratada como
         * evidência forte de que o fluxo seguirá para TRM.
         *
         * Categorias:
         * 1. Comprovante SN / Simples Nacional
         * 2. Nota Técnica tributária (IRRF/DSR/Retenção)
         * 3. Guia de ISS
         * 4. Relatório de Retenção
         */
        const pecasTipicasDfContRepasse = [
            pecas.find(
                peca =>
                    normalizarUnidade(
                        peca.unidade || ''
                    ) ===
                        normalizarUnidade(
                            'ORG/FIN/CONTABILIDADE'
                        ) &&
                    /comprovante[\s\S]*(?:sn|simples\s+nacional)/i.test(
                        peca.titulo || ''
                    )
            ),
            pecas.find(
                peca =>
                    normalizarUnidade(
                        peca.unidade || ''
                    ) ===
                        normalizarUnidade(
                            'ORG/FIN/CONTABILIDADE'
                        ) &&
                    /nota\s+t[eé]cnica\s+(?:dsr|irrf|reten[cç][aã]o)/i.test(
                        peca.titulo || ''
                    )
            ),
            pecas.find(
                peca =>
                    normalizarUnidade(
                        peca.unidade || ''
                    ) ===
                        normalizarUnidade(
                            'ORG/FIN/CONTABILIDADE'
                        ) &&
                    /guia\s+de?\s*iss|guia\s+iss/i.test(
                        peca.titulo || ''
                    )
            ),
            pecas.find(
                peca =>
                    normalizarUnidade(
                        peca.unidade || ''
                    ) ===
                        normalizarUnidade(
                            'ORG/FIN/CONTABILIDADE'
                        ) &&
                    /relat[oó]rio\s+de\s+reten[cç][aã]o/i.test(
                        peca.titulo || ''
                    )
            )
        ].filter(Boolean);

        const repasseConfirmadoPorContabilidade =
            Boolean(
                pecaVerificacaoAliquotaNaArvore
            ) &&
            pecasTipicasDfContRepasse.length >= 2;

        /*
         * MARCADOR DE REPASSE
         *
         * Repasse fica confirmado por:
         * - Relatório Fotográfico / Fotográfico; ou
         * - Diário de obra; ou
         * - aferição de alíquota + pelo menos 2 categorias típicas
         *   produzidas pela DF-CONT.
         *
         * Planilha de Medição isolada continua sendo apenas indício.
         */
        const pecaMarcadorRepasseNaArvore =
            pecaFotograficoNaArvore ||
            pecaDiarioObraNaArvore ||
            repasseConfirmadoPorContabilidade;

        const pecaAliquotaOuAfericaoNaArvore =
            pecas.find(
                peca =>
                    /al[ií]quota|aferi[cç][aã]o/i.test(
                        peca.titulo || ''
                    )
            );

        const ultimaPecaIndicaSmf =
            Boolean(ultimaPeca) &&
            normalizar(
                ultimaPeca.titulo || ''
            ).includes(
                normalizar('Despacho')
            ) &&
            normalizar(
                ultimaPeca.titulo || ''
            ).includes(
                normalizar('SMF')
            ) &&
            normalizarUnidade(
                ultimaPeca.unidade || ''
            ) ===
                normalizarUnidade(
                    'ORG/CONTROLE'
                );

        const provavelIndicacaoEnvioSmf =
            (
                abertoEmPresOuAci &&
                Boolean(pecaIndicacaoSmf)
            ) ||
            ultimaPecaIndicaSmf;

        /*
         * REGRA: pagamento com recursos próprios da ORGAO_EXEMPLO
         *
         * Evidência na árvore:
         * - peça recente contendo "comprovante" ou "pagamento";
         * - unidade geradora ORG/FIN/TESOURARIA.
         */
        const pecaArquivamento =
            pecas.find(
                peca =>
                    /\barquivamento\b/i.test(
                        peca.titulo || ''
                    )
            );

        const pecaPagamentoNaArvore =
            pecas.find(
                peca =>
                    /\bpagamento\b/i.test(
                        peca.titulo || ''
                    )
            );

        /*
         * AUTORIZAÇÃO DE PAGAMENTO não significa pagamento concluído.
         * É tratada como pendência enquanto não houver comprovante
         * de pagamento na árvore.
         */
        const pecaAutorizacaoPagamento =
            pecasRecentes.find(
                peca =>
                    /autoriza[cç][aã]o\s+de\s+pagamento/i.test(
                        peca.titulo || ''
                    )
            );

        /*
         * COMPROVANTE FINANCEIRO
         *
         * Regras:
         * - títulos explícitos como "Comprovante de Pagamento",
         *   "Comprovante PIX", "Comprovante Bancário" etc. contam;
         * - título genérico "Comprovante" também conta quando a peça
         *   foi gerada pela ORG/FIN/TESOURARIA;
         * - "Comprovante SN / Simples Nacional" NÃO conta, pois é
         *   evidência tributária, não financeira.
         */
        const pecaComprovanteNaArvore =
            pecas.find(
                peca => {
                    const titulo =
                        peca.titulo || '';

                    if (
                        /\b(?:sn|simples\s+nacional)\b/i.test(
                            titulo
                        )
                    ) {
                        return false;
                    }

                    const comprovanteExplicito =
                        /\bcomprovante\s+(?:de\s+)?(?:pagamento|transfer[eê]ncia|dep[oó]sito|pix|quita[cç][aã]o|banc[aá]rio)\b/i.test(
                            titulo
                        );

                    const comprovanteGenericoDfTes =
                        /^\s*comprovante\b/i.test(
                            titulo
                        ) &&
                        normalizarUnidade(
                            peca.unidade || ''
                        ) ===
                        normalizarUnidade(
                            'ORG/FIN/TESOURARIA'
                        );

                    return (
                        comprovanteExplicito ||
                        comprovanteGenericoDfTes
                    );
                }
            );

        /*
         * DOCUMENTO DE COBRANÇA/FATURAMENTO RECENTE
         *
         * A existência de NF/NFs, NFE/NFEs, Nota Fiscal/Notas Fiscais,
         * Boleto, Fatura, DANFE, GRERJ, DARF, FGTS, Guia ou Guias,
         * sem comprovante de pagamento, também indica
         * pagamento pendente.
         *
         * "Nota Técnica" é excluída para evitar falso positivo.
         */
        const pecaDocumentoCobrancaRecente =
            pecas.find(
                peca => {
                    const titulo =
                        peca.titulo || '';

                    const temDocumentoCobranca =
                        /\b(?:nfs?|nfes?|danfe|boletos?|faturas?|grerj|darf|fgts|guias?|notas?\s+fiscais?)\b/i.test(
                            titulo
                        ) ||
                        /\bnota\b(?!\s+t[eé]cnica)/i.test(
                            titulo
                        );

                    return temDocumentoCobranca;
                }
            );

        const pecaBoletoNaArvore =
            pecas.find(
                peca =>
                    /\bboleto\b/i.test(
                        peca.titulo || ''
                    )
            );

        const pecaPagamentoRecente =
            pecasRecentes.find(
                peca =>
                    /\bpagamento\b/i.test(
                        peca.titulo || ''
                    )
            );

        /*
         * Para inferir arquivamento após retorno da CODOC,
         * a peça com "pagamento" deve ter sido gerada pela
         * própria EXT/FIN/UNIDADE-D. Isso evita que pagamentos
         * antigos, produzidos por outras unidades, acionem
         * arquivamento indevidamente.
         */
        const pecaPagamentoCodoc =
            pecas.find(
                peca =>
                    /\bpagamento\b/i.test(
                        peca.titulo || ''
                    ) &&
                    normalizarUnidade(
                        peca.unidade
                    ) ===
                    normalizarUnidade(
                        'EXT/FIN/UNIDADE-D'
                    )
            );

        const pecaPagamentoDfTes =
            pecas.find(
                peca =>
                    /\b(comprovante|pagamento)\b/i.test(
                        peca.titulo || ''
                    ) &&
                    normalizarUnidade(
                        peca.unidade
                    ) ===
                    normalizarUnidade(
                        'ORG/FIN/TESOURARIA'
                    )
            );

        /*
         * ABERTURA RESIDUAL PÓS-PAGAMENTO — v9.9.117
         *
         * Identifica o comprovante financeiro MAIS RECENTE produzido
         * pela DF-TES e verifica se, depois dele, surgiu alguma peça que
         * represente um novo ciclo financeiro real.
         *
         * Outros comprovantes da própria DF-TES não contam como novo ciclo.
         */
        let indiceUltimoPagamentoDfTes = -1;

        for (
            let i = pecasCronologicas.length - 1;
            i >= 0;
            i--
        ) {
            const peca =
                pecasCronologicas[i];

            if (
                /\b(?:comprovante|pagamento)\b/i.test(
                    peca.titulo || ''
                ) &&
                normalizarUnidade(
                    peca.unidade
                ) ===
                normalizarUnidade(
                    'ORG/FIN/TESOURARIA'
                )
            ) {
                indiceUltimoPagamentoDfTes = i;
                break;
            }
        }

        const pecasAposUltimoPagamentoDfTes =
            indiceUltimoPagamentoDfTes >= 0
                ? pecasCronologicas.slice(
                    indiceUltimoPagamentoDfTes + 1
                )
                : [];

        const pecaNovoCicloAposPagamentoDfTes =
            pecasAposUltimoPagamentoDfTes.find(
                peca => {
                    const titulo =
                        peca.titulo || '';

                    const ehOutroComprovanteDfTes =
                        /\b(?:comprovante|pagamento)\b/i.test(
                            titulo
                        ) &&
                        normalizarUnidade(
                            peca.unidade
                        ) ===
                        normalizarUnidade(
                            'ORG/FIN/TESOURARIA'
                        );

                    if (ehOutroComprovanteDfTes) {
                        return false;
                    }

                    return (
                        /\b(?:boleto|fatura|danfe|nota\s+fiscal|nfe)\b/i.test(
                            titulo
                        ) ||
                        /\bautoriza[cç][aã]o\s+de\s+pagamento\b/i.test(
                            titulo
                        ) ||
                        /\baferir\b.*\bal[ií]quota\b/i.test(
                            titulo
                        ) ||
                        /\bverifica[cç][aã]o\b.*\bal[ií]quota\b/i.test(
                            titulo
                        ) ||
                        /\brelat[oó]rio\s+de\s+reten[cç][aã]o\b/i.test(
                            titulo
                        ) ||
                        /\bnota\s+de\s+liquida[cç][aã]o\b/i.test(
                            titulo
                        ) ||
                        /\bdespacho\b.*\bpagamento\b/i.test(
                            titulo
                        )
                    );
                }
            ) || null;

        const temNovoCicloAposPagamentoDfTes =
            Boolean(
                pecaNovoCicloAposPagamentoDfTes
            );

        const pecaSlip =
            pecasRecentes.find(
                peca =>
                    /\bSLIP\b/i.test(
                        peca.titulo || ''
                    )
            );

        const pecaPagamentoSmf =
            pecasRecentes.find(
                peca =>
                    /\bpagamento\b/i.test(
                        peca.titulo || ''
                    ) &&
                    normalizarUnidade(
                        peca.unidade
                    ).startsWith(
                        normalizarUnidade(
                            'EXT/FIN/'
                        )
                    )
            );

        const sinais = [];

        if (primeiraTentativaTrmNaAci) {
            sinais.push(
                'Na ACI, 1ª tentativa de TRM. TRM em fase de minuta'
            );
        }

        if (
            maisDeUmTrmNaAci &&
            !primeiraTentativaTrmNaAci
        ) {
            sinais.push(
                'Na ACI. Mais de 1 TRM na Árvore. TRM provavelmente sendo lapidado.'
            );
        }

        /*
         * REGRA DOMINANTE:
         *
         * Quando houver evidência de que a ACI indicou envio à SMF,
         * essa sinalização substitui as demais sinalizações anteriores
         * da árvore, inclusive a de mais de um TRM.
         */
        if (provavelIndicacaoEnvioSmf) {
            sinais.length = 0;

            sinais.push(
                'Provavelmente ACI indicou envio à SMF'
            );
        }

        if (
            pecaSlip &&
            !provavelIndicacaoEnvioSmf
        ) {
            sinais.push(
                'SLIP localizada — possível repasse à Tesouraria'
            );
        }

        /*
         * A sinalização de SLIP provável é subsidiária:
         * só aparece quando não foi encontrada uma SLIP expressa.
         */
        if (
            pecaPagamentoSmf &&
            !pecaSlip &&
            !provavelIndicacaoEnvioSmf
        ) {
            sinais.push(
                'SLIP provável pois há uma peça SMF com palavra pagamento — possível repasse à Tesouraria'
            );
        }

        /*
         * REGRA RESIDUAL DA PRESIDÊNCIA
         *
         * Quando o processo está aberto somente em ORG/PRESIDENCIA
         * e nenhuma sinalização anterior foi gerada, indica que
         * o processo está passando pela Presidência.
         */
        const abertoSomenteNaPres =
            unidadesAbertas.length > 0 &&
            unidadesAbertas.every(
                unidade => {
                    const sigla = String(unidade || '')
                        .split(/\s*\(/)[0]
                        .trim();

                    return normalizarUnidade(sigla) ===
                        normalizarUnidade(
                            'ORG/PRESIDENCIA'
                        );
                }
            );

        if (
            abertoSomenteNaPres &&
            sinais.length === 0
        ) {
            sinais.push(
                'Provavelmente ACI indicou envio à SMF'
            );
        }

        /*
         * REGRA RESIDUAL DA FAZENDA
         *
         * Quando o processo está aberto em qualquer unidade EXT/FIN/...
         * e nenhuma sinalização específica de SLIP/repasse foi encontrada,
         * indica apenas que ele está sendo trabalhado na Fazenda.
         *
         * Essa regra é subsidiária e não deve aparecer junto com:
         * - SLIP localizada;
         * - SLIP provável por peça da SMF com "pagamento";
         * - retorno da Fazenda;
         * - provável indicação de envio à SMF.
         */
        const abertoEmUnidadeSmf =
            unidadesAbertas.some(
                unidade => {
                    const sigla = String(unidade || '')
                        .split(/\s*\(/)[0]
                        .trim();

                    return normalizarUnidade(sigla)
                        .startsWith(
                            normalizarUnidade(
                                'EXT/FIN/'
                            )
                        );
                }
            );

        const temSinalEspecificoFazenda =
            Boolean(pecaSlip) ||
            Boolean(pecaPagamentoSmf) ||
            sinais.some(
                sinal =>
                    normalizar(sinal).includes(
                        normalizar(
                            'Retorno da Fazenda'
                        )
                    ) ||
                    normalizar(sinal).includes(
                        normalizar(
                            'Provavelmente ACI indicou envio à SMF'
                        )
                    )
            );

        if (
            abertoEmUnidadeSmf &&
            !temSinalEspecificoFazenda
        ) {
            sinais.push(
                'Na fazenda sendo trabalhado, ainda sem sinal de SLIP/repasse'
            );
        }

        console.debug(
            '[SEI][Árvore por ID]',
            {
                quantidadeDocumentos:
                    documentos.length,
                quantidadeUnidadesGeradoras:
                    unidadesGeradoras.size,
                pecasRecentes:
                    pecasRecentes.map(
                        peca => ({
                            idInterno:
                                peca.idInterno,
                            numeroSei:
                                peca.numeroSei,
                            titulo:
                                peca.titulo,
                            unidade:
                                peca.unidade
                        })
                    ),
                abertoSomenteNaAci,
                trmsNaArvore:
                    trmsNaArvore.map(
                        peca => ({
                            titulo: peca.titulo,
                            numeroSei: peca.numeroSei,
                            unidade: peca.unidade
                        })
                    ),
                maisDeUmTrmNaAci,
                indiceRelatorioRetencao,
                relatorioRetencao:
                    indiceRelatorioRetencao >= 0
                        ? pecasCronologicas[
                            indiceRelatorioRetencao
                        ]
                        : null,
                trmsAposRelatorio:
                    trmsAposRelatorio.map(
                        item => ({
                            indice: item.indice,
                            titulo:
                                item.peca.titulo,
                            numeroSei:
                                item.peca.numeroSei,
                            unidade:
                                item.peca.unidade
                        })
                    ),
                primeiraTentativaTrmNaAci,
                abertoEmPresOuAci,
                pecaIndicacaoSmf,
                provavelIndicacaoEnvioSmf,
                pecaSlip,
                pecaPagamentoSmf,
                pecaPagamentoDfTes,
                indiceUltimoPagamentoDfTes,
                pecaNovoCicloAposPagamentoDfTes,
                temNovoCicloAposPagamentoDfTes,
                abertoSomenteNaPres,
                abertoEmUnidadeSmf,
                temSinalEspecificoFazenda,
                unidadesAbertas
            }
        );

        return {
            texto:
                sinais.join(' · ') || '—',
            temSlip:
                Boolean(pecaSlip),
            temComprovantePagamentoSmf:
                Boolean(pecaPagamentoSmf),
            temPagamentoDfTes:
                Boolean(pecaPagamentoDfTes),
            indiceUltimoPagamentoDfTes,
            temNovoCicloAposPagamentoDfTes,
            pecaNovoCicloAposPagamentoDfTes,
            temArquivamento:
                Boolean(pecaArquivamento),
            temPagamentoNaArvore:
                Boolean(pecaPagamentoNaArvore),
            temAutorizacaoPagamento:
                Boolean(pecaAutorizacaoPagamento),
            temComprovanteNaArvore:
                Boolean(pecaComprovanteNaArvore),
            temDocumentoCobrancaRecente:
                Boolean(
                    pecaDocumentoCobrancaRecente
                ),
            temBoletoNaArvore:
                Boolean(
                    pecaBoletoNaArvore
                ),
            temTrmNaArvore:
                trmsNaArvore.length > 0,
            ultimaPecaDespachoMedicao:
                Boolean(
                    ultimaPecaDespachoMedicao
                ),
            ultimaPecaVerificacaoAliquota:
                Boolean(
                    ultimaPecaVerificacaoAliquota
                ),
            temVerificacaoAliquotaNaArvore:
                Boolean(
                    pecaVerificacaoAliquotaNaArvore
                ),
            temComprovanteSnNaArvore:
                Boolean(
                    pecaComprovanteSnNaArvore
                ),
            temRelatorioRetencaoNaArvore:
                Boolean(
                    pecaRelatorioRetencaoNaArvore
                ),
            temNotaTecnicaTributariaNaArvore:
                Boolean(
                    pecaNotaTecnicaTributariaNaArvore
                ),
            temGuiaIssNaArvore:
                Boolean(
                    pecaGuiaIssNaArvore
                ),
            temEvidenciaAliquotaAferida:
                Boolean(
                    evidenciaAliquotaAferida
                ),
            temFotograficoNaArvore:
                Boolean(
                    pecaFotograficoNaArvore
                ),
            temDiarioObraNaArvore:
                Boolean(
                    pecaDiarioObraNaArvore
                ),
            temPlanilhaMedicaoNaArvore:
                Boolean(
                    pecaPlanilhaMedicaoNaArvore
                ),
            temPecaDatiNaArvore,
            temContextoPagamentoDati,
            repasseConfirmadoPorContabilidade:
                Boolean(
                    repasseConfirmadoPorContabilidade
                ),
            quantidadeCategoriasDfContRepasse:
                pecasTipicasDfContRepasse.length,
            temMarcadorRepasseNaArvore:
                Boolean(
                    pecaMarcadorRepasseNaArvore
                ),
            temAliquotaOuAfericaoNaArvore:
                Boolean(
                    pecaAliquotaOuAfericaoNaArvore
                ),
            temPagamentoRecente:
                Boolean(pecaPagamentoRecente),
            temPagamentoCodoc:
                Boolean(pecaPagamentoCodoc),
            pecaPagamentoDfTes,
            pecaArquivamento,
            pecaPagamentoNaArvore,
            pecaAutorizacaoPagamento,
            pecaComprovanteNaArvore,
            pecaDocumentoCobrancaRecente,
            pecaBoletoNaArvore,
            evidenciaAliquotaAferida,
            pecaVerificacaoAliquotaNaArvore,
            pecaComprovanteSnNaArvore,
            pecaRelatorioRetencaoNaArvore,
            pecaNotaTecnicaTributariaNaArvore,
            pecaGuiaIssNaArvore,
            pecaFotograficoNaArvore,
            pecaDiarioObraNaArvore,
            pecaPlanilhaMedicaoNaArvore,
            pecaMarcadorRepasseNaArvore,
            pecaAliquotaOuAfericaoNaArvore,
            pecaPagamentoRecente,
            pecaPagamentoCodoc,
            primeiraPecaDgapProt,
            segundaPecaDespachoPres,
            fluxoDiretoDgapProtPres,
            arvoreIndicaRessarcimento,
            arvoreIndicaReajuste,
            triagemCorrespondenciaExterna,
            primeiraPecaTriagem:
                primeiraPecaCronologica?.titulo || '',
            segundaPecaTriagem:
                segundaPecaCronologica?.titulo || '',
            ultimaUnidade:
                pecasRecentes[0]?.unidade || '',
            ultimaPeca:
                pecasRecentes[0]?.titulo || ''
        };
    }


    function extrairUrlsDocumentosDaArvore(html) {
        const texto = decodificarJs(
            String(html || '')
                .replace(/&amp;/gi, '&')
        );

        const mapa = new Map();

        /*
         * Formato confirmado no SEI:
         *
         * Nos[n].src = 'controlador.php?acao=documento_visualizar
         *               &id_documento=9570&...&infra_hash=...';
         */
        const regex =
            /Nos\[\d+\]\.src\s*=\s*(['"])([\s\S]*?)\1\s*;/gi;

        let achado;

        while (
            (achado = regex.exec(texto)) !== null
        ) {
            const endereco =
                desescaparArgumentoJs(
                    achado[2]
                )
                    .replace(/&amp;/gi, '&')
                    .trim();

            if (
                !endereco ||
                !endereco.includes(
                    'acao=documento_visualizar'
                )
            ) {
                continue;
            }

            try {
                const urlTemporaria =
                    new URL(
                        endereco,
                        location.href
                    );

                const idDocumento =
                    urlTemporaria.searchParams.get(
                        'id_documento'
                    );

                if (idDocumento) {
                    mapa.set(
                        String(idDocumento),
                        endereco
                    );
                }
            } catch (_) {
                // Ignora URL incompleta ou inválida.
            }
        }

        return mapa;
    }

    function obterTituloPrimeiraPecaDaArvore(
        html
    ) {
        const documentos =
            extrairDocumentosDaArvore(html);

        const primeiraPeca =
            [...documentos]
                .sort(
                    (a, b) =>
                        Number(a.numeroSei || 0) -
                        Number(b.numeroSei || 0)
                )[0] || null;

        return primeiraPeca?.titulo || '';
    }

    function detectarProvavelProrrogacaoTituloPrimeiraPeca(
        html
    ) {
        const titulo =
            obterTituloPrimeiraPecaDaArvore(
                html
            );

        return {
            detectada:
                /\bprorroga[cç][aã]o\b/i.test(
                    titulo
                ) ||
                /prorroga[cç][aã]o\s+de\s+contrato/i.test(
                    titulo
                ) ||
                /solicita[\s\S]{0,80}autoriza[cç][aã]o[\s\S]{0,120}prorroga[cç][aã]o[\s\S]{0,80}contrato/i.test(
                    titulo
                ),
            titulo
        };
    }

    function detectarProvavelAditivoTituloPrimeiraPeca(
        html
    ) {
        const titulo =
            obterTituloPrimeiraPecaDaArvore(
                html
            );

        return {
            detectada:
                /\baditivo\s+contratual\b/i.test(
                    titulo
                ) ||
                /\baditivo\s+de\s+valor\b/i.test(
                    titulo
                ) ||
                /solicita[cç][aã]o[\s\S]{0,120}aditivo\s+de\s+valor/i.test(
                    titulo
                ) ||
                /\baditivo\b/i.test(
                    titulo
                ),
            titulo
        };
    }

    function detectarProvavelReequilibrioTituloPrimeiraPeca(
        html
    ) {
        const titulo =
            obterTituloPrimeiraPecaDaArvore(
                html
            );

        return {
            detectada:
                /reequil[ií]brio\s+econ[oô]mico[\s-]*financeiro/i.test(
                    titulo
                ) ||
                /\breequil[ií]brio\b/i.test(
                    titulo
                ) ||
                /repactua[cç][aã]o\s+de\s+contrato/i.test(
                    titulo
                ) ||
                /\brepactua[cç][aã]o\b/i.test(
                    titulo
                ),
            titulo
        };
    }


    function detectarProvavelReajusteTituloPrimeiraPeca(
        html
    ) {
        const documentos =
            extrairDocumentosDaArvore(html);

        const primeiraPeca =
            [...documentos]
                .sort(
                    (a, b) =>
                        Number(a.numeroSei || 0) -
                        Number(b.numeroSei || 0)
                )[0] || null;

        if (!primeiraPeca) {
            return {
                detectada: false,
                naoRepasseArtRrt: false,
                motivo: 'primeira peça não localizada'
            };
        }

        const titulo =
            primeiraPeca.titulo || '';

        /*
         * SEMENTE: PROVÁVEL REAJUSTE
         *
         * Nesta fase não tentamos abrir o PDF. A inferência usa
         * apenas o título da primeira peça, procurando expressões
         * fortes e típicas de solicitação de reajuste/reajustamento.
         */
        const detectada =
            /\breajust(?:e|amento)\b/i.test(
                titulo
            ) ||
            /solicita[cç][aã]o\s+de\s+reajust(?:e|amento)/i.test(
                titulo
            ) ||
            /solicita\s+reajust(?:e|amento)/i.test(
                titulo
            ) ||
            /solicita\s+reajuste\s+referente\s+ao\s+contrato/i.test(
                titulo
            );

        return {
            detectada,
            titulo
        };
    }


    async function detectarCredorPrimeiraPeca(
        html,
        base
    ) {
        const documentos =
            extrairDocumentosDaArvore(
                html
            );

        const urls =
            extrairUrlsDocumentosDaArvore(
                html
            );

        const primeiraPeca =
            documentos
                .map(
                    documento => ({
                        ...documento,
                        url:
                            urls.get(
                                String(
                                    documento.idInterno
                                )
                            ) || ''
                    })
                )
                .filter(
                    documento =>
                        Boolean(
                            documento.url
                        )
                )
                .sort(
                    (a, b) =>
                        Number(
                            a.numeroSei || 0
                        ) -
                        Number(
                            b.numeroSei || 0
                        )
                )[0] || null;

        if (!primeiraPeca) {
            return {
                nome: '',
                origem: '',
                rotulo: ''
            };
        }

        try {
            const url =
                new URL(
                    primeiraPeca.url,
                    base
                ).href;

            const resposta =
                await obterHtml(
                    url
                );

            verificarErroSei(
                resposta.html
            );

            const htmlDocumento =
                resposta.html || '';

            const conteudo =
                htmlParaTexto(
                    htmlDocumento
                )
                    .replace(
                        /\u00A0/g,
                        ' '
                    )
                    .replace(
                        /\r/g,
                        ''
                    )
                    .replace(
                        /[ \t]+/g,
                        ' '
                    )
                    .replace(
                        /\n{3,}/g,
                        '\n\n'
                    )
                    .trim();

            /*
             * 1ª TENTATIVA — TABELA DA PRIMEIRA PEÇA
             *
             * Os modelos mais comuns de CI trazem:
             *
             *   CONTRATADA: | NOME DO CREDOR
             *
             * Antes de achatar todo o documento em texto, lemos as células
             * da tabela diretamente. Isso é muito mais confiável quando o
             * rótulo e o nome estão em <td> diferentes.
             */
            const docCredor =
                new DOMParser().parseFromString(
                    htmlDocumento,
                    'text/html'
                );

            const rotulosTabela = [
                'EMPRESA CONTRATADA',
                'CONTRATADA',
                'CONTRATADO',
                'CREDOR',
                'CONCESSIONÁRIA',
                'CONCESSIONARIA',
                'FORNECEDOR'
            ];

            for (
                const linha of docCredor.querySelectorAll(
                    'tr'
                )
            ) {
                const celulas =
                    [
                        ...linha.querySelectorAll(
                            ':scope > td, :scope > th'
                        )
                    ]
                        .map(
                            celula =>
                                limpar(
                                    celula.textContent || ''
                                )
                        )
                        .filter(Boolean);

                if (!celulas.length) {
                    continue;
                }

                const primeiraCelula =
                    celulas[0]
                        .replace(
                            /[:：]\s*$/,
                            ''
                        )
                        .trim();

                const rotuloEncontrado =
                    rotulosTabela.find(
                        rotulo =>
                            normalizar(
                                primeiraCelula
                            ) ===
                            normalizar(
                                rotulo
                            )
                    );

                if (
                    rotuloEncontrado &&
                    celulas.length >= 2
                ) {
                    const nome =
                        limpar(
                            celulas
                                .slice(1)
                                .join(' ')
                        );

                    if (
                        nome &&
                        nome.length >= 2
                    ) {
                        return {
                            nome,
                            rotulo:
                                rotuloEncontrado,
                            origem:
                                `${rotuloEncontrado} — tabela da primeira peça`
                        };
                    }
                }
            }

            /*
             * 2ª TENTATIVA — TEXTO COM QUEBRAS PRESERVADAS
             *
             * Alguns modelos não usam uma tabela HTML real. Nesses casos,
             * o rótulo pode aparecer em uma linha e o nome logo abaixo.
             */
            const linhasTexto =
                conteudo
                    .split('\n')
                    .map(
                        linha =>
                            limpar(
                                linha
                            )
                    )
                    .filter(Boolean);

            for (
                let indice = 0;
                indice < linhasTexto.length;
                indice++
            ) {
                const linha =
                    linhasTexto[indice];

                const rotuloEncontrado =
                    rotulosTabela.find(
                        rotulo =>
                            normalizar(
                                linha.replace(
                                    /[:：]\s*$/,
                                    ''
                                )
                            ) ===
                            normalizar(
                                rotulo
                            )
                    );

                if (!rotuloEncontrado) {
                    continue;
                }

                const proximaLinha =
                    linhasTexto[
                        indice + 1
                    ] || '';

                if (
                    proximaLinha &&
                    proximaLinha.length >= 2
                ) {
                    return {
                        nome:
                            proximaLinha,
                        rotulo:
                            rotuloEncontrado,
                        origem:
                            `${rotuloEncontrado} — linha seguinte da primeira peça`
                    };
                }
            }

            const textoPlano =
                conteudo
                    .replace(
                        /\s*\n\s*/g,
                        ' '
                    )
                    .replace(
                        /\s{2,}/g,
                        ' '
                    )
                    .trim();

            /*
             * 3ª TENTATIVA — texto corrido.
             *
             * Mantemos o fallback original para modelos em que rótulo e
             * valor aparecem no mesmo parágrafo.
             */
            const candidatos = [
                {
                    rotulo:
                        'EMPRESA CONTRATADA',
                    regexRotulo:
                        'EMPRESA\\s+CONTRATADA'
                },
                {
                    rotulo:
                        'CONTRATADA',
                    regexRotulo:
                        'CONTRATADA'
                },
                {
                    rotulo:
                        'CONTRATADO',
                    regexRotulo:
                        'CONTRATADO'
                },
                {
                    rotulo:
                        'CREDOR',
                    regexRotulo:
                        'CREDOR'
                },
                {
                    rotulo:
                        'CONCESSIONÁRIA',
                    regexRotulo:
                        'CONCESSION[ÁA]RIA'
                },
                {
                    rotulo:
                        'FORNECEDOR',
                    regexRotulo:
                        'FORNECEDOR'
                },
                {
                    rotulo:
                        'EMPRESA',
                    regexRotulo:
                        'EMPRESA'
                }
            ];

            const camposPosteriores =
                [
                    'CONTRATO',
                    'PROCESSO',
                    'OBJETO',
                    'VALOR',
                    'PERÍODO',
                    'PERIODO',
                    'CNPJ',
                    'CPF',
                    'PRAZO',
                    'VIGÊNCIA',
                    'VIGENCIA',
                    'DATA',
                    'ORIGEM',
                    'DESTINO'
                ].join(
                    '|'
                );

            for (
                const candidato of candidatos
            ) {
                const exigeDoisPontos =
                    candidato.rotulo ===
                    'EMPRESA';

                const separador =
                    exigeDoisPontos
                        ? '\\s*:\\s*'
                        : '\\s*:?\\s*';

                const regex =
                    new RegExp(
                        `\\b${candidato.regexRotulo}\\b` +
                        separador +
                        `(.{2,220}?)` +
                        `(?=\\s+(?:${camposPosteriores})\\b\\s*:?|$)`,
                        'i'
                    );

                const match =
                    textoPlano.match(
                        regex
                    );

                if (!match) {
                    continue;
                }

                const nome =
                    String(
                        match[1] || ''
                    )
                        .replace(
                            /^[\-–—:;\s]+/,
                            ''
                        )
                        .replace(
                            /[\-–—:;\s]+$/,
                            ''
                        )
                        .replace(
                            /\s{2,}/g,
                            ' '
                        )
                        .trim();

                if (
                    nome.length < 2
                ) {
                    continue;
                }

                return {
                    nome,
                    rotulo:
                        candidato.rotulo,
                    origem:
                        `${candidato.rotulo} — primeira peça`
                };
            }

            return {
                nome: '',
                origem:
                    'Primeira peça lida; credor não identificado',
                rotulo: ''
            };
        } catch (erro) {
            console.warn(
                '[SEI][Credor] Falha ao ler a primeira peça:',
                erro
            );

            return {
                nome: '',
                origem:
                    'Falha ao ler primeira peça',
                rotulo: ''
            };
        }
    }


    async function detectarProvavelContratacaoPrimeiraPeca(
        html,
        base
    ) {
        const documentos =
            extrairDocumentosDaArvore(html);

        const urls =
            extrairUrlsDocumentosDaArvore(html);

        /*
         * SEMENTE: PROVÁVEL CONTRATAÇÃO
         *
         * Regra deliberadamente conservadora para não "sujar" os
         * fluxos já mapeados.
         *
         * 1. Localiza a peça mais antiga da árvore;
         * 2. só tenta abri-la se o título parecer uma peça inaugural
         *    administrativa (CI, Comunicação/Correspondência Interna
         *    ou Solicitação);
         * 3. lê o conteúdo real da primeira peça;
         * 4. exige expressão forte de contratação OU um conjunto de
         *    marcadores típicos de solicitação de contratação.
         *
         * A sinalização será usada apenas como fallback: nunca
         * substituirá uma regra operacional já reconhecida.
         */
        const primeiraPeca =
            documentos
                .map(documento => ({
                    ...documento,
                    url:
                        urls.get(
                            String(
                                documento.idInterno
                            )
                        ) || ''
                }))
                .filter(
                    documento =>
                        Boolean(documento.url)
                )
                .sort(
                    (a, b) =>
                        Number(a.numeroSei || 0) -
                        Number(b.numeroSei || 0)
                )[0] || null;

        if (!primeiraPeca) {
            return {
                detectada: false,
                darfFolhaValorExpressivo: false,
                valorDarfFolha: 0,
                motivo: 'primeira peça não localizada'
            };
        }

        const titulo =
            primeiraPeca.titulo || '';

        /*
         * CONTRATAÇÃO — v9.9.130
         *
         * Não confiamos mais no título digitado pelo usuário na árvore.
         * O documento inaugural pode chamar-se simplesmente "Despacho DO",
         * embora por dentro seja a CI padronizada de solicitação de obra.
         *
         * Os títulos da árvore são usados apenas como REFORÇO semântico,
         * por famílias flexíveis. A confirmação principal vem do conteúdo
         * real da primeira peça.
         */
        const titulosArvore =
            documentos.map(
                documento =>
                    normalizar(
                        documento.titulo || ''
                    )
            );

        const arvoreTem =
            regex =>
                titulosArvore.some(
                    tituloArvore =>
                        regex.test(
                            tituloArvore
                        )
                );

        const familiasArvoreContratacao = {
            corpoTecnico:
                arvoreTem(
                    /CORPO\s+TECNIC.*CONTRAT/
                ),
            termoReferencia:
                arvoreTem(
                    /TERMO.*REFER/
                ),
            projetoBasico:
                arvoreTem(
                    /PROJET.*BASIC/
                ),
            orcamento:
                arvoreTem(
                    /ORCAMENT|PLANILH.*QUANT|COMPOSI.*EMOP/
                ),
            cronograma:
                arvoreTem(
                    /CRONOGRAMA.*FISIC.*FINANC/
                ),
            bdi:
                arvoreTem(
                    /\bBDI\b/
                ),
            matrizRisco:
                arvoreTem(
                    /MATRIZ.*RISCO/
                ),
            memoriaCalculo:
                arvoreTem(
                    /MEMORIA.*CALCULO/
                )
        };

        const quantidadeFamiliasArvore =
            Object.values(
                familiasArvoreContratacao
            ).filter(Boolean).length;

        const assinaturaForteArvoreContratacao =
            (
                familiasArvoreContratacao.termoReferencia ||
                familiasArvoreContratacao.projetoBasico ||
                familiasArvoreContratacao.corpoTecnico
            ) &&
            familiasArvoreContratacao.orcamento &&
            quantidadeFamiliasArvore >= 4;

        const tituloCandidato =
            /\bCI\b|comunica[cç][aã]o\s+interna|correspond[eê]ncia\s+interna|solicita[cç][aã]o|despacho/i.test(
                titulo
            );

        /*
         * Só evitamos a leitura quando não há NENHUM indício:
         * nem título administrativo plausível, nem assinatura documental
         * de contratação na árvore.
         */
        if (
            !tituloCandidato &&
            !assinaturaForteArvoreContratacao
        ) {
            return {
                detectada: false,
                naoRepasseArtRrt: false,
                darfFolhaValorExpressivo: false,
                valorDarfFolha: 0,
                motivo: 'sem indício suficiente para ler primeira peça como contratação',
                titulo,
                quantidadeFamiliasArvore,
                familiasArvoreContratacao
            };
        }

        try {
            const url =
                new URL(
                    primeiraPeca.url,
                    base
                ).href;

            const resposta =
                await obterHtml(url);

            verificarErroSei(
                resposta.html
            );

            const conteudo =
                htmlParaTexto(
                    resposta.html || ''
                )
                    .replace(/\u00A0/g, ' ')
                    .replace(/[ \t]+/g, ' ')
                    .replace(/\s*\n\s*/g, ' ')
                    .replace(/\s{2,}/g, ' ')
                    .trim();

            /*
             * CONTEÚDO DA CI — v9.9.130
             *
             * Caso sintético de regressão PROCESSO_EXEMPLO_008:
             *   Resumo do Assunto: Solicitação de obras e serviços
             *   solicito autorizar [objeto]
             *   prazo de execução
             *   valor global
             *   medição
             *   planilha de quantitativo e preços unitários
             *
             * A palavra "contratação" NÃO é obrigatória.
             */
            const resumoSolicitacaoObrasServicos =
                /resumo\s+do\s+assunto\s*:\s*solicita[cç][aã]o\s+de\s+obras?\s+e\s+servi[cç]os?/i.test(
                    conteudo
                );

            const expressaoForte =
                /solicita[cç][aã]o\s+de\s+contrata[cç][aã]o/i.test(
                    conteudo
                ) ||
                /solicito\s+autorizar[\s\S]{0,500}\bcontrata[cç][aã]o\b/i.test(
                    conteudo
                );

            const marcadores = [
                /solicito\s+autorizar/i,
                /solicita[cç][aã]o\s+de\s+obras?\s+e\s+servi[cç]os?/i,
                /prazo\s+de\s+execu[cç][aã]o/i,
                /valor\s+global(?:\s+estimado)?/i,
                /\bmedi[cç][aã]o\b/i,
                /planilha[\s\S]{0,120}quantitativ/i,
                /pre[cç]os?\s+unit[aá]rios?/i,
                /projeto\s+(?:b[aá]sico|executivo)/i,
                /\bedital\b/i,
                /contrata[cç][aã]o\s+sem\s+licita[cç][aã]o/i
            ];

            const quantidadeMarcadores =
                marcadores.filter(
                    regex =>
                        regex.test(conteudo)
                ).length;

            const estruturaForteSolicitacaoObra =
                /solicito\s+autorizar/i.test(
                    conteudo
                ) &&
                /prazo\s+de\s+execu[cç][aã]o/i.test(
                    conteudo
                ) &&
                /valor\s+global(?:\s+estimado)?/i.test(
                    conteudo
                );

            const contratacaoConfirmadaPorConteudo =
                resumoSolicitacaoObrasServicos ||
                expressaoForte ||
                estruturaForteSolicitacaoObra ||
                (
                    quantidadeMarcadores >= 4 &&
                    assinaturaForteArvoreContratacao
                );

            /*
             * NÃO-REPASSE PRECOCE — ART / RRT
             *
             * A própria CI já costuma declarar expressamente que o objeto
             * é o pagamento de ART/RRT. Guardamos essa evidência aqui,
             * aproveitando a leitura da primeira peça que já ocorreu.
             */
            const referenciaArtRrtTecnica =
                detectarArtRrtTecnica(
                    conteudo
                );

            const naoRepasseArtRrt =
                referenciaArtRrtTecnica.detectada;

            /*
             * NÃO-REPASSE PRECOCE — FOLHA / DARF
             *
             * Padrão mensal de grande valor:
             * - contexto explícito de pagamento/DARF;
             * - Previdência Social / INSS;
             * - IRRF;
             * - valor total superior a R$ 100.000,00.
             *
             * O limite de valor é proposital: evita destacar pequenos DARFs
             * ou ajustes tributários pontuais com a mesma sinalização.
             */
            const contextoDarfFolha =
                /\bDARF\b/i.test(
                    conteudo
                ) &&
                /\b(?:INSS|PREVID[EÊ]NCIA\s+SOCIAL|CONTRIBUI[CÇ][AÃ]O\s+PREVIDENCI[AÁ]RIA)\b/i.test(
                    conteudo
                ) &&
                /\bIRRF\b/i.test(
                    conteudo
                );

            const candidatosValorDarf =
                [
                    ...conteudo.matchAll(
                        /(?:R\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2})/g
                    )
                ]
                    .map(
                        match =>
                            Number(
                                String(
                                    match[1] || ''
                                )
                                    .replace(
                                        /\./g,
                                        ''
                                    )
                                    .replace(
                                        ',',
                                        '.'
                                    )
                            )
                    )
                    .filter(
                        Number.isFinite
                    );

            const valorDarfFolha =
                candidatosValorDarf.length
                    ? Math.max(
                        ...candidatosValorDarf
                    )
                    : 0;

            const darfFolhaValorExpressivo =
                contextoDarfFolha &&
                valorDarfFolha >
                    100000;

            return {
                detectada:
                    contratacaoConfirmadaPorConteudo ||
                    assinaturaForteArvoreContratacao,
                titulo,
                quantidadeMarcadores,
                expressaoForte,
                resumoSolicitacaoObrasServicos,
                estruturaForteSolicitacaoObra,
                assinaturaForteArvoreContratacao,
                quantidadeFamiliasArvore,
                familiasArvoreContratacao,
                naoRepasseArtRrt,
                motivoNaoRepasseArtRrt:
                    naoRepasseArtRrt
                        ? `Primeira peça indica ${referenciaArtRrtTecnica.sigla} técnica`
                        : '',
                darfFolhaValorExpressivo,
                valorDarfFolha,
                motivoDarfFolha:
                    darfFolhaValorExpressivo
                        ? 'Primeira peça indica folha/DARF com INSS + IRRF e valor superior a R$ 100 mil'
                        : ''
            };
        } catch (erro) {
            console.warn(
                '[SEI] Não foi possível ler a primeira peça para a semente de provável contratação:',
                erro
            );

            return {
                detectada: false,
                naoRepasseArtRrt: false,
                darfFolhaValorExpressivo: false,
                valorDarfFolha: 0,
                motivo: 'falha ao ler primeira peça',
                titulo
            };
        }
    }


    async function detectarAciIndicouEnvioSmf(
        html,
        base
    ) {
        const documentos =
            extrairDocumentosDaArvore(
                html
            );

        const unidadesGeradoras =
            extrairUnidadesGeradorasDaArvore(
                html
            );

        const urls =
            extrairUrlsDocumentosDaArvore(
                html
            );

        /*
         * CASO EXTERNO — ACI INDICOU ENVIO À SMF
         *
         * Não inferimos esta situação pelo título da peça.
         * O conteúdo interno do Despacho da ACI precisa trazer
         * expressão forte indicando encaminhamento à SMF.
         *
         * Para evitar usar um despacho antigo da ACI:
         * - localizamos o TRM mais recente da árvore;
         * - somente lemos Despachos da ACI posteriores a esse TRM;
         * - limitamos a leitura aos 3 candidatos mais recentes.
         */
        const trms =
            documentos
                .filter(
                    documento =>
                        ehTituloTrm(
                            documento.titulo || ''
                        )
                )
                .map(
                    documento =>
                        Number(
                            documento.numeroSei || 0
                        )
                )
                .filter(Number.isFinite);

        const ultimoNumeroTrm =
            trms.length
                ? Math.max(...trms)
                : 0;

        const despachosPosTrm =
            documentos
                .map(documento => ({
                    ...documento,
                    unidade:
                        unidadesGeradoras.get(
                            String(
                                documento.idInterno
                            )
                        ) || '',
                    url:
                        urls.get(
                            String(
                                documento.idInterno
                            )
                        ) || ''
                }))
                .filter(
                    documento =>
                        Boolean(documento.url)
                )
                .filter(
                    documento =>
                        /despacho/i.test(
                            documento.titulo || ''
                        )
                )
                .filter(
                    documento =>
                        Number(
                            documento.numeroSei || 0
                        ) >
                        ultimoNumeroTrm
                )
                .sort(
                    (a, b) =>
                        Number(
                            b.numeroSei || 0
                        ) -
                        Number(
                            a.numeroSei || 0
                        )
                );

        /*
         * Primeiro priorizamos Despachos cuja unidade geradora foi
         * reconhecida como ORG/CONTROLE.
         *
         * FALLBACK IMPORTANTE:
         * em algumas árvores a ação UNIDADE_GERADORA não é associada
         * corretamente ao documento, embora o Despacho da ACI esteja
         * visível e sua URL seja válida.
         *
         * Para não perder esses casos, se nenhum Despacho pós-TRM for
         * identificado formalmente como ACI, lemos até os 3 Despachos
         * pós-TRM mais recentes, independentemente da unidade geradora.
         *
         * A segurança continua alta porque a classificação só ocorre
         * se o CONTEÚDO INTERNO trouxer expressão forte de envio à SMF.
         */
        const candidatosAci =
            despachosPosTrm.filter(
                documento =>
                    normalizarUnidade(
                        documento.unidade
                    ) ===
                    normalizarUnidade(
                        'ORG/CONTROLE'
                    )
            );

        const candidatos =
            (
                candidatosAci.length
                    ? candidatosAci
                    : despachosPosTrm
            )
                .slice(0, 3);

        console.debug(
            '[SEI][ACI→SMF] Candidatos pós-TRM:',
            {
                ultimoNumeroTrm,
                totalDespachosPosTrm:
                    despachosPosTrm.length,
                candidatosAci:
                    candidatosAci.map(
                        item => ({
                            numeroSei:
                                item.numeroSei,
                            titulo:
                                item.titulo,
                            unidade:
                                item.unidade
                        })
                    ),
                candidatosLidos:
                    candidatos.map(
                        item => ({
                            numeroSei:
                                item.numeroSei,
                            titulo:
                                item.titulo,
                            unidade:
                                item.unidade
                        })
                    )
            }
        );

        for (const documento of candidatos) {
            try {
                const url =
                    new URL(
                        documento.url,
                        base
                    ).href;

                const resposta =
                    await obterHtml(
                        url
                    );

                verificarErroSei(
                    resposta.html
                );

                const textoDocumento =
                    htmlParaTexto(
                        resposta.html || ''
                    )
                        .replace(/\u00A0/g, ' ')
                        .replace(/[ \t]+/g, ' ')
                        .replace(/\s*\n\s*/g, ' ')
                        .replace(/\s{2,}/g, ' ')
                        .trim();

                /*
                 * Expressões deliberadamente fortes.
                 * A simples presença da sigla "SMF" não basta.
                 */
                const expressaoEnvioSmf =
                    /(?:sugir(?:o|imos)?\s+(?:o\s+)?|recomend(?:o|amos)?\s+(?:o\s+)?)?(?:envio|encaminhamento)\s+(?:a|à|ao)\s+(?:SMF|Secretaria\s+Municipal\s+de\s+Fazenda)|(?:encaminhar|remeter)\s+(?:o\s+processo\s+)?(?:a|à|ao)\s+(?:SMF|Secretaria\s+Municipal\s+de\s+Fazenda)/i;

                const evidencia =
                    textoDocumento.match(
                        expressaoEnvioSmf
                    )?.[0] || '';

                if (!evidencia) {
                    console.debug(
                        '[SEI][ACI→SMF] Despacho lido sem expressão forte de envio à SMF:',
                        {
                            numeroSei:
                                documento.numeroSei,
                            titulo:
                                documento.titulo,
                            unidade:
                                documento.unidade,
                            contemSmf:
                                /\bSMF\b/i.test(
                                    textoDocumento
                                ),
                            contemEnvio:
                                /\benvio\b/i.test(
                                    textoDocumento
                                )
                        }
                    );
                }

                if (evidencia) {
                    return {
                        detectada: true,
                        idDocumento:
                            documento.idInterno,
                        numeroSei:
                            documento.numeroSei,
                        titulo:
                            documento.titulo,
                        evidencia
                    };
                }
            } catch (erroDocumento) {
                console.warn(
                    '[SEI] Não foi possível ler Despacho da ACI candidato a envio à SMF:',
                    {
                        idDocumento:
                            documento.idInterno,
                        numeroSei:
                            documento.numeroSei,
                        titulo:
                            documento.titulo,
                        erro:
                            String(
                                erroDocumento
                            )
                    }
                );
            }
        }

        return {
            detectada: false,
            idDocumento: '',
            numeroSei: '',
            titulo: '',
            evidencia: ''
        };
    }


    async function detectarMedicaoZeradaNaArvore(
        html,
        base
    ) {
        const documentos =
            extrairDocumentosDaArvore(html);

        const urls =
            extrairUrlsDocumentosDaArvore(html);

        /*
         * Evita abrir indiscriminadamente toda a árvore.
         * Priorizamos títulos normalmente usados em processos de
         * medição e limitamos a leitura às peças mais recentes.
         */
        const candidatos =
            documentos
                .map(documento => ({
                    ...documento,
                    url:
                        urls.get(
                            String(
                                documento.idInterno
                            )
                        ) || ''
                }))
                .filter(
                    documento =>
                        Boolean(documento.url)
                )
                .filter(
                    documento =>
                        /medi[cç][aã]o|despacho|controle|comunica[cç][aã]o|folha/i.test(
                            documento.titulo || ''
                        )
                )
                .sort(
                    (a, b) =>
                        Number(
                            b.numeroSei || 0
                        ) -
                        Number(
                            a.numeroSei || 0
                        )
                )
                .slice(0, 8);

        for (const documento of candidatos) {
            try {
                const url =
                    new URL(
                        documento.url,
                        base
                    ).href;

                const resposta =
                    await obterHtml(url);

                verificarErroSei(
                    resposta.html
                );

                const textoDocumento =
                    htmlParaTexto(
                        resposta.html || ''
                    )
                        .replace(/\u00A0/g, ' ')
                        .replace(/[ \t]+/g, ' ')
                        .replace(/\s*\n\s*/g, ' ')
                        .replace(/\s{2,}/g, ' ')
                        .trim();

                const contextoMedicao =
                    /\bmedi[cç][aã]o\b/i.test(
                        textoDocumento
                    );

                /*
                 * Exemplos já confirmados:
                 *
                 * VALOR R$:0,00 (Zero)
                 * Valor: 0,00 (Zero)
                 * Valor da Medição: R$ 0,00
                 */
                const valorPrincipalZero =
                    /(?:valor(?:\s+r\$)?|valor\s+da\s+medi[cç][aã]o)\s*:?\s*(?:r\$\s*)?0[.,]00(?:\s*\(\s*zero\s*\))?/i.test(
                        textoDocumento
                    );

                /*
                 * Evidência complementar, usada quando o formulário
                 * separa contrato e aditivo.
                 */
                const medicaoContratoZero =
                    /medi[cç][aã]o\s+do\s+contrato\s*:?\s*(?:r\$\s*)?0[.,]00/i.test(
                        textoDocumento
                    );

                const medicaoAditivoZero =
                    /medi[cç][aã]o\s+do\s+aditivo\s*:?\s*(?:r\$\s*)?0[.,]00/i.test(
                        textoDocumento
                    );

                const detectada =
                    contextoMedicao &&
                    (
                        valorPrincipalZero ||
                        (
                            medicaoContratoZero &&
                            medicaoAditivoZero
                        )
                    );

                if (detectada) {
                    return {
                        detectada: true,
                        idDocumento:
                            documento.idInterno,
                        numeroSei:
                            documento.numeroSei,
                        titulo:
                            documento.titulo,
                        evidencia:
                            textoDocumento.match(
                                /.{0,100}(?:valor(?:\s+r\$)?|valor\s+da\s+medi[cç][aã]o)\s*:?\s*(?:r\$\s*)?0[.,]00.{0,120}/i
                            )?.[0] ||
                            textoDocumento.match(
                                /.{0,100}medi[cç][aã]o\s+do\s+(?:contrato|aditivo)\s*:?\s*(?:r\$\s*)?0[.,]00.{0,120}/i
                            )?.[0] ||
                            ''
                    };
                }
            } catch (erroDocumento) {
                console.warn(
                    '[SEI] Não foi possível ler peça candidata a medição zerada:',
                    {
                        idDocumento:
                            documento.idInterno,
                        numeroSei:
                            documento.numeroSei,
                        titulo:
                            documento.titulo,
                        erro:
                            String(
                                erroDocumento
                            )
                    }
                );
            }
        }

        return {
            detectada: false,
            idDocumento: '',
            numeroSei: '',
            titulo: '',
            evidencia: ''
        };
    }

    function extrairDocumentosDaArvore(html) {
        const chamadas =
            extrairChamadasConstrutor(
                html,
                'infraArvoreNo'
            );

        const documentos = [];

        for (const chamada of chamadas) {
            const argumentos =
                separarArgumentosJavaScript(
                    chamada.argumentos
                );

            if (
                argumentos.length < 7 ||
                desescaparArgumentoJs(
                    argumentos[0]
                ).toUpperCase() !==
                    'DOCUMENTO'
            ) {
                continue;
            }

            const idInterno =
                desescaparArgumentoJs(
                    argumentos[1]
                );

            const titulo =
                desescaparArgumentoJs(
                    argumentos[5]
                ) ||
                desescaparArgumentoJs(
                    argumentos[6]
                );

            const urlArvore =
                desescaparArgumentoJs(
                    argumentos[3]
                );

            /*
             * O último argumento costuma trazer o número SEI.
             * Como segurança, também tenta extrair do título.
             */
            const ultimoArgumento =
                desescaparArgumentoJs(
                    argumentos.at(-1)
                );

            const numeroTitulo =
                String(titulo || '').match(
                    /\(\s*(\d{6,10})\s*\)/
                )?.[1] || '';

            const numeroSei =
                /^\d{6,10}$/.test(
                    ultimoArgumento
                )
                    ? ultimoArgumento
                    : numeroTitulo;

            if (
                !idInterno ||
                !titulo
            ) {
                continue;
            }

            documentos.push({
                indiceNo:
                    chamada.indice,
                idInterno,
                numeroSei,
                titulo:
                    limpar(titulo),
                urlArvore
            });
        }

        return documentos.filter(
            (item, posicao, lista) =>
                posicao ===
                lista.findIndex(
                    outro =>
                        outro.idInterno ===
                        item.idInterno
                )
        );
    }

    function extrairUnidadesGeradorasDaArvore(
        html
    ) {
        const chamadas =
            extrairChamadasConstrutor(
                html,
                'infraArvoreAcao'
            );

        const mapa = new Map();

        for (const chamada of chamadas) {
            const argumentos =
                separarArgumentosJavaScript(
                    chamada.argumentos
                );

            if (
                argumentos.length < 4 ||
                desescaparArgumentoJs(
                    argumentos[0]
                ).toUpperCase() !==
                    'UNIDADE_GERADORA'
            ) {
                continue;
            }

            const idInterno =
                desescaparArgumentoJs(
                    argumentos[2]
                );

            /*
             * A sigla da unidade normalmente é o último argumento,
             * mas a busca percorre todos para suportar variações.
             */
            const unidade =
                argumentos
                    .map(
                        desescaparArgumentoJs
                    )
                    .find(
                        valor =>
                            /^NIT\/[A-Z0-9._/-]+$/i.test(
                                valor
                            )
                    ) || '';

            if (
                idInterno &&
                unidade
            ) {
                mapa.set(
                    String(idInterno),
                    removerPontuacao(
                        unidade
                    )
                );
            }
        }

        return mapa;
    }

    function extrairChamadasConstrutor(
        html,
        nomeConstrutor
    ) {
        const texto =
            String(html || '');

        const marcador =
            `new ${nomeConstrutor}(`;

        const chamadas = [];
        let busca = 0;

        while (busca < texto.length) {
            const inicio =
                texto.indexOf(
                    marcador,
                    busca
                );

            if (inicio < 0) {
                break;
            }

            let posicao =
                inicio + marcador.length;

            let profundidade = 1;
            let aspas = '';
            let escapado = false;

            for (
                ;
                posicao < texto.length;
                posicao++
            ) {
                const caractere =
                    texto[posicao];

                if (aspas) {
                    if (escapado) {
                        escapado = false;
                    } else if (
                        caractere === '\\'
                    ) {
                        escapado = true;
                    } else if (
                        caractere === aspas
                    ) {
                        aspas = '';
                    }

                    continue;
                }

                if (
                    caractere === '"' ||
                    caractere === "'"
                ) {
                    aspas = caractere;
                    continue;
                }

                if (caractere === '(') {
                    profundidade++;
                } else if (
                    caractere === ')'
                ) {
                    profundidade--;

                    if (profundidade === 0) {
                        break;
                    }
                }
            }

            if (profundidade !== 0) {
                break;
            }

            chamadas.push({
                indice:
                    inicio,
                argumentos:
                    texto.slice(
                        inicio +
                            marcador.length,
                        posicao
                    )
            });

            busca = posicao + 1;
        }

        return chamadas;
    }

    function separarArgumentosJavaScript(texto) {
        const argumentos = [];

        let inicio = 0;
        let aspas = '';
        let escapado = false;
        let parenteses = 0;
        let colchetes = 0;
        let chaves = 0;

        for (
            let indice = 0;
            indice < texto.length;
            indice++
        ) {
            const caractere =
                texto[indice];

            if (aspas) {
                if (escapado) {
                    escapado = false;
                } else if (
                    caractere === '\\'
                ) {
                    escapado = true;
                } else if (
                    caractere === aspas
                ) {
                    aspas = '';
                }

                continue;
            }

            if (
                caractere === '"' ||
                caractere === "'"
            ) {
                aspas = caractere;
                continue;
            }

            if (caractere === '(') {
                parenteses++;
            } else if (
                caractere === ')'
            ) {
                parenteses--;
            } else if (
                caractere === '['
            ) {
                colchetes++;
            } else if (
                caractere === ']'
            ) {
                colchetes--;
            } else if (
                caractere === '{'
            ) {
                chaves++;
            } else if (
                caractere === '}'
            ) {
                chaves--;
            } else if (
                caractere === ',' &&
                parenteses === 0 &&
                colchetes === 0 &&
                chaves === 0
            ) {
                argumentos.push(
                    texto.slice(
                        inicio,
                        indice
                    ).trim()
                );

                inicio = indice + 1;
            }
        }

        argumentos.push(
            texto.slice(inicio).trim()
        );

        return argumentos;
    }

    function desescaparArgumentoJs(valor) {
        const texto =
            String(valor ?? '').trim();

        if (
            texto === 'null' ||
            texto === 'undefined'
        ) {
            return '';
        }

        if (
            (
                texto.startsWith('"') &&
                texto.endsWith('"')
            ) ||
            (
                texto.startsWith("'") &&
                texto.endsWith("'")
            )
        ) {
            return decodificarJs(
                texto.slice(1, -1)
            );
        }

        return texto;
    }

    function extrairItensArvore(html) {
        const itens = [];

        const regex =
            /Nos\[(\d+)\]\.html\s*=\s*(?:'((?:\\.|[^'\\])*)'|"((?:\\.|[^"\\])*)")\s*;/gi;

        let achado;

        while (
            (achado = regex.exec(
                String(html || '')
            )) !== null
        ) {
            const indice = Number(achado[1]);
            const bloco = achado[2] ?? achado[3] ?? '';

            const texto = htmlParaTexto(
                decodificarJs(bloco)
            );

            if (!texto) {
                continue;
            }

            const unidade = texto.match(
                /NIT\/[A-Z0-9._-]+(?:\/[A-Z0-9._-]+)*/i
            )?.[0] || '';

            const eDocumento =
                /\(\s*\d{6,10}\s*\)/.test(texto) ||
                /\b\d{8}\b/.test(texto);

            itens.push({
                indice,
                texto: limpar(texto),
                unidade:
                    removerPontuacao(unidade),
                eDocumento
            });
        }

        itens.sort(
            (a, b) => a.indice - b.indice
        );

        return itens;
    }

    function extrairItensArvoreDoHtml(html) {
        const doc = new DOMParser().parseFromString(
            String(html || '')
                .replace(/&amp;/gi, '&'),
            'text/html'
        );

        const itens = [];
        let indice = 0;

        /*
         * Elementos mais comuns usados pela árvore do SEI.
         * Também percorre linhas, links e contêineres com códigos
         * de unidade para suportar versões diferentes da interface.
         */
        const seletores = [
            'a',
            'li',
            'tr',
            'div',
            'span'
        ].join(',');

        for (
            const elemento of doc.querySelectorAll(
                seletores
            )
        ) {
            const texto = limpar(
                elemento.innerText ||
                elemento.textContent ||
                ''
            );

            if (
                !texto ||
                !/NIT\/(?:ORGAO_EXEMPLO|SMF)\//i.test(texto)
            ) {
                continue;
            }

            const unidade = texto.match(
                /NIT\/[A-Z0-9._-]+(?:\/[A-Z0-9._-]+)*/i
            )?.[0] || '';

            const eDocumento =
                /\(\s*\d{6,10}\s*\)/.test(texto) ||
                /\b\d{8}\b/.test(texto);

            /*
             * Evita capturar grandes contêineres que reúnem a página
             * inteira, pois eles não representam uma peça individual.
             */
            if (
                texto.length > 700 ||
                !eDocumento
            ) {
                continue;
            }

            itens.push({
                indice: indice++,
                texto,
                unidade:
                    removerPontuacao(unidade),
                eDocumento: true
            });
        }

        /*
         * Remove duplicatas causadas por elementos aninhados.
         */
        return itens.filter(
            (item, posicao, lista) =>
                posicao ===
                lista.findIndex(
                    outro =>
                        outro.texto === item.texto &&
                        normalizarUnidade(
                            outro.unidade
                        ) ===
                        normalizarUnidade(
                            item.unidade
                        )
                )
        );
    }

    function extrairPecasNumeradasComUnidade(html) {
        const bruto = decodificarJs(
            String(html || '')
                .replace(/&amp;/gi, '&')
        );

        const pecas = [];

        /*
         * Divide o conteúdo em janelas em torno de cada etiqueta de
         * unidade. Dentro de cada janela procura o número SEI mais
         * próximo, aceitando tanto:
         *
         *   Título (00019417) EXT/FIN/UNIDADE-D
         *
         * quanto:
         *
         *   00019417 ... EXT/FIN/UNIDADE-D
         */
        const regexUnidade =
            /NIT\/(?:ORGAO_EXEMPLO|SMF)\/[A-Z0-9._/-]+/gi;

        let unidadeMatch;

        while (
            (unidadeMatch = regexUnidade.exec(bruto)) !== null
        ) {
            const inicio = Math.max(
                0,
                unidadeMatch.index - 900
            );

            const fim = Math.min(
                bruto.length,
                unidadeMatch.index +
                    unidadeMatch[0].length +
                    250
            );

            const janela = bruto.slice(
                inicio,
                fim
            );

            const numeros = [
                ...janela.matchAll(
                    /\(\s*(\d{6,10})\s*\)|\b(\d{8})\b/g
                )
            ];

            if (!numeros.length) {
                continue;
            }

            /*
             * Escolhe o número cuja posição esteja mais próxima da
             * etiqueta da unidade.
             */
            const posicaoUnidadeNaJanela =
                unidadeMatch.index - inicio;

            const numeroMaisProximo =
                numeros
                    .map(item => {
                        const valor =
                            item[1] || item[2];

                        return {
                            valor,
                            numero: Number(valor),
                            distancia: Math.abs(
                                item.index -
                                posicaoUnidadeNaJanela
                            )
                        };
                    })
                    .filter(
                        item =>
                            Number.isFinite(
                                item.numero
                            )
                    )
                    .sort(
                        (a, b) =>
                            a.distancia -
                            b.distancia
                    )[0];

            if (!numeroMaisProximo) {
                continue;
            }

            const texto = htmlParaTexto(
                janela
            );

            pecas.push({
                numero:
                    numeroMaisProximo.numero,
                indice:
                    unidadeMatch.index,
                texto:
                    limpar(texto),
                unidade:
                    removerPontuacao(
                        unidadeMatch[0]
                    ),
                eDocumento: true
            });
        }

        /*
         * Remove duplicatas de uma mesma peça/unidade.
         */
        return pecas.filter(
            (item, posicao, lista) =>
                posicao ===
                lista.findIndex(
                    outro =>
                        outro.numero ===
                            item.numero &&
                        normalizarUnidade(
                            outro.unidade
                        ) ===
                        normalizarUnidade(
                            item.unidade
                        )
                )
        );
    }

    function localizarComprovantePagamentoSmf(
        html,
        pecasRecentes = []
    ) {
        /*
         * Regra conservadora para evitar falso positivo:
         *
         * - procura exatamente "Comprovante de pagamento";
         * - exige unidade EXT/FIN/... associada à mesma peça;
         * - exige número SEI da peça;
         * - aceita apenas se o número estiver entre as 8 peças
         *   mais recentes já identificadas na árvore.
         *
         * Não usa mais busca ampla apenas pela palavra "pagamento",
         * pois isso pode confundir despachos de autorização ou
         * outros documentos antigos.
         */

        const numerosRecentes = new Set(
            pecasRecentes
                .map(item => Number(item.numero || 0))
                .filter(Number.isFinite)
        );

        /*
         * Método 1: peça estruturada.
         */
        const estruturado = pecasRecentes.find(
            item =>
                normalizarUnidade(
                    item.unidade
                ).startsWith(
                    normalizarUnidade('EXT/FIN/')
                ) &&
                /\bcomprovante\s+de\s+pagamento\b/i.test(
                    item.texto || ''
                )
        );

        if (estruturado) {
            return estruturado;
        }

        const bruto = decodificarJs(
            String(html || '')
                .replace(/&amp;/gi, '&')
        );

        const candidatos = [];

        /*
         * Formato mais comum da linha da árvore:
         *
         * Comprovante de pagamento (00018941) ... EXT/FIN/UNIDADE-C
         *
         * O limite curto reduz associações com outras peças.
         */
        const padraoTituloPrimeiro =
            /comprovante\s+de\s+pagamento[\s\S]{0,900}?\(\s*(\d{6,10})\s*\)[\s\S]{0,900}?(NIT\/SMF\/[A-Z0-9._/-]+)/gi;

        let achado;

        while (
            (achado = padraoTituloPrimeiro.exec(bruto)) !== null
        ) {
            candidatos.push({
                numero: Number(achado[1]),
                unidade: removerPontuacao(
                    achado[2]
                ),
                texto: limpar(
                    htmlParaTexto(
                        achado[0]
                    )
                ),
                indice: achado.index,
                eDocumento: true
            });
        }

        /*
         * Variação em que a etiqueta da unidade aparece antes
         * do título no HTML serializado.
         */
        const padraoUnidadePrimeiro =
            /(NIT\/SMF\/[A-Z0-9._/-]+)[\s\S]{0,900}?comprovante\s+de\s+pagamento[\s\S]{0,900}?\(\s*(\d{6,10})\s*\)/gi;

        while (
            (achado = padraoUnidadePrimeiro.exec(bruto)) !== null
        ) {
            candidatos.push({
                numero: Number(achado[2]),
                unidade: removerPontuacao(
                    achado[1]
                ),
                texto: limpar(
                    htmlParaTexto(
                        achado[0]
                    )
                ),
                indice: achado.index,
                eDocumento: true
            });
        }

        const validos = candidatos
            .filter(
                item =>
                    Number.isFinite(item.numero) &&
                    normalizarUnidade(
                        item.unidade
                    ).startsWith(
                        normalizarUnidade('EXT/FIN/')
                    ) &&
                    (
                        numerosRecentes.size === 0 ||
                        numerosRecentes.has(
                            item.numero
                        )
                    )
            )
            .filter(
                (item, posicao, lista) =>
                    posicao ===
                    lista.findIndex(
                        outro =>
                            outro.numero ===
                                item.numero &&
                            normalizarUnidade(
                                outro.unidade
                            ) ===
                            normalizarUnidade(
                                item.unidade
                            )
                    )
            )
            .sort(
                (a, b) =>
                    b.numero - a.numero
            );

        return validos[0] || null;
    }

    function extrairUltimaPecaPorPosicao(html) {
        const bruto = decodificarJs(
            String(html || '')
                .replace(/&amp;/gi, '&')
        );

        const candidatos = [];

        /*
         * Procura um número de documento e, até 500 caracteres
         * depois, a etiqueta da unidade responsável pela peça.
         */
        const regex =
            /(?:\(\s*(\d{6,10})\s*\)|\b(\d{8})\b)[\s\S]{0,500}?(NIT\/(?:ORGAO_EXEMPLO|SMF)\/[A-Z0-9._/-]+)/gi;

        let achado;

        while (
            (achado = regex.exec(bruto)) !== null
        ) {
            const trecho = htmlParaTexto(
                achado[0]
            );

            candidatos.push({
                indice: achado.index,
                texto: limpar(trecho),
                unidade: removerPontuacao(
                    achado[3]
                ),
                eDocumento: true
            });
        }

        candidatos.sort(
            (a, b) => a.indice - b.indice
        );

        return candidatos.at(-1) || null;
    }

    function extrairUnidades(html) {
        /*
         * CARGA ATUAL COMO FONTE DE VERDADE — v9.9.140
         *
         * Primeiro tentamos ler a mensagem atual do próprio
         * procedimento_visualizar:
         *
         *   "Processo aberto somente na unidade ..."
         *   "Processo aberto nas unidades: ..."
         *
         * Só depois recorremos aos blocos Nos[].html.
         *
         * Isso evita que algum bloco auxiliar da árvore prevaleça sobre
         * a situação atual exibida pelo SEI.
         */
        const textoPagina =
            htmlParaTexto(
                decodificarJs(html)
            );

        const resultadoPagina =
            interpretarMensagemUnidades(
                textoPagina
            );

        if (resultadoPagina.unidades.length) {
            return resultadoPagina;
        }

        const blocos = extrairBlocosNos(html);

        for (const bloco of blocos) {
            const resultado =
                interpretarMensagemUnidades(
                    htmlParaTexto(
                        decodificarJs(bloco)
                    )
                );

            if (resultado.unidades.length) {
                return resultado;
            }
        }

        return {
            unidades: [],
            frase: ''
        };
    }

    function extrairBlocosNos(texto) {
        const blocos = [];
        let achado;

        const simples =
            /Nos\[\d+\]\.html\s*=\s*'((?:\\.|[^'\\])*)'\s*;/gi;

        while (
            (achado = simples.exec(texto)) !== null
        ) {
            blocos.push(achado[1]);
        }

        const duplas =
            /Nos\[\d+\]\.html\s*=\s*"((?:\\.|[^"\\])*)"\s*;/gi;

        while (
            (achado = duplas.exec(texto)) !== null
        ) {
            blocos.push(achado[1]);
        }

        return blocos;
    }

    function interpretarMensagemUnidades(texto) {
        const limpo = limparComQuebras(texto);

        /*
         * CASO 1 — unidade única
         *
         * Exemplo:
         * "Processo aberto somente na unidade ORG/FIN/PLANEJAMENTO."
         */
        const singular = limpo.match(
            /Processo\s+aberto\s+somente\s+na\s+unidade\s+([A-Z0-9À-Ü._-]+(?:\/[A-Z0-9À-Ü._-]+)+)(?:\s*\(([^)]*)\))?/i
        );

        if (singular) {
            const sigla = removerPontuacao(
                limpar(singular[1])
            );

            return {
                unidades: [sigla],
                frase: limpar(singular[0])
            };
        }

        /*
         * CASO 2 — várias unidades
         *
         * Exemplo:
         * "Processo aberto nas unidades:
         *  NIT/CGM/GABCGM
         *  NIT/CLIN/PRES
         *  ORG/FIN/PLANEJAMENTO
         *  ..."
         *
         * Lemos apenas a sequência contígua de linhas que contém siglas
         * NIT/... logo após o cabeçalho. Assim, outras siglas existentes
         * mais abaixo na árvore/documentos não contaminam a carga atual.
         */
        const linhas =
            limpo
                .split('\n')
                .map(linha => limpar(linha));

        let indiceCabecalho = -1;

        for (
            let i = 0;
            i < linhas.length;
            i++
        ) {
            if (
                /Processo\s+aberto\s+nas(?:\s+seguintes)?\s+unidades\s*:?/i.test(
                    linhas[i]
                )
            ) {
                indiceCabecalho = i;
                break;
            }
        }

        if (indiceCabecalho < 0) {
            return {
                unidades: [],
                frase: ''
            };
        }

        const unidades = [];

        /*
         * A própria linha do cabeçalho pode, em algumas versões do SEI,
         * já trazer a primeira unidade após os dois-pontos.
         */
        const trechoCabecalho =
            linhas[indiceCabecalho]
                .replace(
                    /^.*?Processo\s+aberto\s+nas(?:\s+seguintes)?\s+unidades\s*:?/i,
                    ''
                );

        const candidatos = [
            trechoCabecalho,
            ...linhas.slice(
                indiceCabecalho + 1
            )
        ];

        let iniciouLista = false;

        for (const linha of candidatos) {
            if (!linha) {
                if (iniciouLista) {
                    continue;
                }

                continue;
            }

            const siglas =
                linha.match(
                    /NIT\/[A-Z0-9._-]+(?:\/[A-Z0-9._-]+)+/gi
                ) || [];

            if (!siglas.length) {
                if (iniciouLista) {
                    break;
                }

                continue;
            }

            iniciouLista = true;

            for (const siglaBruta of siglas) {
                const unidade =
                    removerPontuacao(
                        siglaBruta
                    );

                if (
                    !unidades.some(
                        item =>
                            normalizarUnidade(item) ===
                            normalizarUnidade(unidade)
                    )
                ) {
                    unidades.push(unidade);
                }
            }
        }

        return {
            unidades,
            frase:
                unidades.length
                    ? 'Processo aberto nas unidades'
                    : ''
        };
    }


    /*
     * SEQUÊNCIA ACI -> PRES -> DF [-> DF-PO] — v9.9.118
     */
    function historicoTemSequenciaAciPresDfOuDfpo(
        html
    ) {
        const doc =
            new DOMParser().parseFromString(
                String(html || ''),
                'text/html'
            );

        const remessas = [];

        for (
            const linha of doc.querySelectorAll(
                '#tblHistorico tr, table tr'
            )
        ) {
            const celulas = [
                ...linha.children
            ].filter(
                elemento =>
                    elemento.tagName === 'TD'
            );

            if (celulas.length < 4) {
                continue;
            }

            const dataHora =
                limpar(
                    celulas[0].textContent || ''
                );

            const destino =
                removerPontuacao(
                    limpar(
                        celulas[1].textContent || ''
                    )
                );

            const descricao =
                limpar(
                    celulas[3].textContent || ''
                );

            const origem =
                descricao.match(
                    /Processo remetido pela unidade\s+([A-Z0-9._/-]+)/i
                )?.[1] || '';

            const data =
                interpretarDataBrasileira(
                    dataHora
                );

            if (!origem || !data) {
                continue;
            }

            remessas.push({
                data,
                origem:
                    removerPontuacao(
                        origem
                    ),
                destino
            });
        }

        remessas.sort(
            (a, b) =>
                a.data.getTime() -
                b.data.getTime()
        );

        for (
            let i = 0;
            i < remessas.length;
            i++
        ) {
            const r1 =
                remessas[i];

            const ehAciPres =
                normalizarUnidade(
                    r1.origem
                ) ===
                    normalizarUnidade(
                        'ORG/CONTROLE'
                    ) &&
                normalizarUnidade(
                    r1.destino
                ) ===
                    normalizarUnidade(
                        'ORG/PRESIDENCIA'
                    );

            if (!ehAciPres) {
                continue;
            }

            for (
                let j = i + 1;
                j < remessas.length;
                j++
            ) {
                const r2 =
                    remessas[j];

                const ehPresDf =
                    normalizarUnidade(
                        r2.origem
                    ) ===
                        normalizarUnidade(
                            'ORG/PRESIDENCIA'
                        ) &&
                    normalizarUnidade(
                        r2.destino
                    ) ===
                        normalizarUnidade(
                            'ORG/FIN'
                        );

                if (!ehPresDf) {
                    continue;
                }

                const r3 =
                    remessas
                        .slice(
                            j + 1
                        )
                        .find(
                            item =>
                                normalizarUnidade(
                                    item.origem
                                ) ===
                                    normalizarUnidade(
                                        'ORG/FIN'
                                    ) &&
                                normalizarUnidade(
                                    item.destino
                                ) ===
                                    normalizarUnidade(
                                        'ORG/FIN/PLANEJAMENTO'
                                    )
                        ) || null;

                return {
                    detectada: true,
                    chegouDfpo:
                        Boolean(r3),
                    aciPres: r1,
                    presDf: r2,
                    dfDfpo: r3
                };
            }
        }

        return {
            detectada: false,
            chegouDfpo: false,
            aciPres: null,
            presDf: null,
            dfDfpo: null
        };
    }


    function historicoIndicaRemessaPresParaDf(
        html
    ) {
        const doc =
            new DOMParser().parseFromString(
                String(html || ''),
                'text/html'
            );

        for (
            const linha of doc.querySelectorAll(
                '#tblHistorico tr, table tr'
            )
        ) {
            const celulas = [
                ...linha.children
            ].filter(
                elemento =>
                    elemento.tagName === 'TD'
            );

            if (celulas.length < 4) {
                continue;
            }

            const unidade =
                removerPontuacao(
                    limpar(
                        celulas[1].textContent || ''
                    )
                );

            const descricao =
                limpar(
                    celulas[3].textContent || ''
                );

            if (
                normalizarUnidade(unidade) ===
                    normalizarUnidade(
                        'ORG/FIN'
                    ) &&
                normalizar(descricao).includes(
                    normalizar(
                        'Processo remetido pela unidade ORG/PRESIDENCIA'
                    )
                )
            ) {
                return true;
            }
        }

        return false;
    }

    function historicoIndicaRemessaDaCodoc(
        html
    ) {
        const doc =
            new DOMParser().parseFromString(
                String(html || ''),
                'text/html'
            );

        const linhas = [
            ...doc.querySelectorAll(
                '#tblHistorico tr, table tr'
            )
        ];

        return linhas.some(
            linha => {
                const celulas = [
                    ...linha.children
                ].filter(
                    elemento =>
                        elemento.tagName === 'TD'
                );

                if (celulas.length < 4) {
                    return false;
                }

                const unidade =
                    removerPontuacao(
                        limpar(
                            celulas[1].textContent || ''
                        )
                    );

                const descricao =
                    limpar(
                        celulas[3].textContent || ''
                    );

                return (
                    normalizarUnidade(unidade) ===
                        normalizarUnidade(
                            'ORG/ADM/PROTOCOLO'
                        ) &&
                    normalizar(descricao).includes(
                        normalizar(
                            'Processo remetido pela unidade EXT/FIN/UNIDADE-D'
                        )
                    )
                );
            }
        );
    }

    function historicoIndicaPagamentoRecursosProprios(
        html
    ) {
        const doc =
            new DOMParser().parseFromString(
                String(html || ''),
                'text/html'
            );

        const linhas = [];

        for (
            const linha of doc.querySelectorAll(
                '#tblHistorico tr, table tr'
            )
        ) {
            const celulas = [
                ...linha.children
            ].filter(
                elemento =>
                    elemento.tagName === 'TD'
            );

            if (celulas.length < 4) {
                continue;
            }

            const item = {
                dataHora:
                    limpar(
                        celulas[0].textContent || ''
                    ),
                unidade:
                    removerPontuacao(
                        limpar(
                            celulas[1].textContent || ''
                        )
                    ),
                descricao:
                    limpar(
                        celulas[3].textContent || ''
                    )
            };

            if (
                interpretarDataBrasileira(
                    item.dataHora
                )
            ) {
                linhas.push(item);
            }
        }

        linhas.sort(
            (a, b) =>
                (
                    interpretarDataBrasileira(
                        b.dataHora
                    )?.getTime() || 0
                ) -
                (
                    interpretarDataBrasileira(
                        a.dataHora
                    )?.getTime() || 0
                )
        );

        /*
         * Analisa as 12 movimentações mais recentes.
         * Exige a passagem DF-PO -> DF-TES -> DF-CONT
         * e conclusão na DF-CONT.
         */
        const recentes =
            linhas.slice(0, 12);

        const passouPelaTesouraria =
            recentes.some(
                item =>
                    normalizarUnidade(
                        item.unidade
                    ) ===
                    normalizarUnidade(
                        'ORG/FIN/TESOURARIA'
                    )
            );

        const remessaDaTesourariaParaContabilidade =
            recentes.some(
                item =>
                    normalizarUnidade(
                        item.unidade
                    ) ===
                    normalizarUnidade(
                        'ORG/FIN/CONTABILIDADE'
                    ) &&
                    normalizar(
                        item.descricao
                    ).includes(
                        normalizar(
                            'Processo remetido pela unidade ORG/FIN/TESOURARIA'
                        )
                    )
            );

        const conclusaoNaContabilidade =
            recentes.some(
                item =>
                    normalizarUnidade(
                        item.unidade
                    ) ===
                    normalizarUnidade(
                        'ORG/FIN/CONTABILIDADE'
                    ) &&
                    normalizar(
                        item.descricao
                    ).includes(
                        normalizar(
                            'Conclusão do processo na unidade'
                        )
                    )
            );

        return (
            passouPelaTesouraria &&
            remessaDaTesourariaParaContabilidade &&
            conclusaoNaContabilidade
        );
    }

    function historicoTemPassagemPelaAci(
        html
    ) {
        const doc =
            new DOMParser().parseFromString(
                String(html || ''),
                'text/html'
            );

        for (
            const linha of doc.querySelectorAll(
                '#tblHistorico tr, table tr'
            )
        ) {
            const textoLinha =
                limpar(
                    linha.textContent || ''
                );

            if (
                normalizar(textoLinha).includes(
                    normalizar(
                        'ORG/CONTROLE'
                    )
                )
            ) {
                return true;
            }
        }

        /*
         * Fallback para variações estruturais do histórico.
         */
        return normalizar(
            htmlParaTexto(
                String(html || '')
            )
        ).includes(
            normalizar(
                'ORG/CONTROLE'
            )
        );
    }

    function extrairSinalizacaoHistorico(html) {
        const doc =
            new DOMParser().parseFromString(
                String(html || ''),
                'text/html'
            );

        const linhas = [];

        for (
            const linha of doc.querySelectorAll(
                '#tblHistorico tr, table tr'
            )
        ) {
            /*
             * Não usa :scope, porque algumas versões do navegador
             * podem falhar ao aplicá-lo em documento criado pelo
             * DOMParser.
             */
            const celulas = [
                ...linha.children
            ].filter(
                elemento =>
                    elemento.tagName === 'TD'
            );

            if (celulas.length < 4) {
                continue;
            }

            const item = {
                dataHora:
                    limpar(
                        celulas[0].textContent || ''
                    ),
                unidade:
                    removerPontuacao(
                        limpar(
                            celulas[1].textContent || ''
                        )
                    ),
                usuario:
                    limpar(
                        celulas[2].textContent || ''
                    ),
                descricao:
                    limpar(
                        celulas[3].textContent || ''
                    )
            };

            if (
                !interpretarDataBrasileira(
                    item.dataHora
                )
            ) {
                continue;
            }

            linhas.push(item);
        }

        linhas.sort(
            (a, b) =>
                (
                    interpretarDataBrasileira(
                        b.dataHora
                    )?.getTime() || 0
                ) -
                (
                    interpretarDataBrasileira(
                        a.dataHora
                    )?.getTime() || 0
                )
        );

        const ultimasOito =
            linhas.slice(0, 8);

        const temRecebimentoCodoc =
            ultimasOito.some(
                item =>
                    normalizarUnidade(
                        item.unidade
                    ) ===
                    normalizarUnidade(
                        'EXT/FIN/UNIDADE-D'
                    )
            );

        const temPassagemDgapProt =
            ultimasOito.some(
                item =>
                    normalizarUnidade(
                        item.unidade
                    ) ===
                    normalizarUnidade(
                        'ORG/ADM/PROTOCOLO'
                    )
            );

        const temRemessaCodocParaDgap =
            ultimasOito.some(
                item => {
                    const unidadeDgap =
                        normalizarUnidade(
                            item.unidade
                        ) ===
                        normalizarUnidade(
                            'ORG/ADM/PROTOCOLO'
                        );

                    const descricaoCodoc =
                        normalizar(
                            item.descricao
                        ).includes(
                            normalizar(
                                'EXT/FIN/UNIDADE-D'
                            )
                        ) &&
                        normalizar(
                            item.descricao
                        ).includes(
                            normalizar(
                                'Processo remetido pela unidade'
                            )
                        );

                    return (
                        unidadeDgap &&
                        descricaoCodoc
                    );
                }
            );

        /*
         * Fallback textual: caso a estrutura da tabela venha
         * diferente, analisa somente o texto concatenado das
         * oito linhas mais recentes já identificadas.
         */
        const textoUltimasOito =
            normalizar(
                ultimasOito
                    .map(
                        item =>
                            [
                                item.dataHora,
                                item.unidade,
                                item.usuario,
                                item.descricao
                            ].join(' ')
                    )
                    .join('\n')
            );

        const fallbackCodoc =
            textoUltimasOito.includes(
                normalizar(
                    'EXT/FIN/UNIDADE-D'
                )
            );

        const fallbackDgap =
            textoUltimasOito.includes(
                normalizar(
                    'ORG/ADM/PROTOCOLO'
                )
            );

        const fallbackRemessa =
            textoUltimasOito.includes(
                normalizar(
                    'Processo remetido pela unidade EXT/FIN/UNIDADE-D'
                )
            );

        /*
         * A pendência não pode depender apenas das oito linhas mais
         * recentes. Depois que o processo passa por PRES, ACI, DF-PO,
         * DF-CONT ou outra unidade da ORGAO_EXEMPLO, o retorno CODOC -> DGAP-PROT
         * pode sair dessa janela e a sinalização desapareceria.
         *
         * Por isso, a existência do retorno é procurada em todo o
         * histórico. As oito linhas continuam somente como diagnóstico
         * e fallback de compatibilidade.
         */
        const temRetornoCodocNoHistorico =
            linhas.some(
                item => {
                    const unidadeDgap =
                        normalizarUnidade(
                            item.unidade
                        ) ===
                        normalizarUnidade(
                            'ORG/ADM/PROTOCOLO'
                        );

                    const remetidoPelaCodoc =
                        normalizar(
                            item.descricao
                        ).includes(
                            normalizar(
                                'Processo remetido pela unidade EXT/FIN/UNIDADE-D'
                            )
                        );

                    return (
                        unidadeDgap &&
                        remetidoPelaCodoc
                    );
                }
            );

        const pendenciaDetectada =
            temRetornoCodocNoHistorico ||
            (
                temRecebimentoCodoc &&
                temPassagemDgapProt &&
                temRemessaCodocParaDgap
            ) ||
            (
                fallbackCodoc &&
                fallbackDgap &&
                fallbackRemessa
            );

        /*
         * A pendência deixa de prevalecer quando, depois do retorno
         * CODOC -> DGAP-PROT, aparece uma nova remessa da
         * ORG/PRESIDENCIA para a EXT/FIN/UNIDADE-B.
         *
         * Como "linhas" está em ordem decrescente, um índice menor
         * representa um andamento mais recente.
         */
        const indiceRetornoCodoc =
            linhas.findIndex(
                item => {
                    const unidadeDgap =
                        normalizarUnidade(
                            item.unidade
                        ) ===
                        normalizarUnidade(
                            'ORG/ADM/PROTOCOLO'
                        );

                    const remetidoPelaCodoc =
                        normalizar(
                            item.descricao
                        ).includes(
                            normalizar(
                                'Processo remetido pela unidade EXT/FIN/UNIDADE-D'
                            )
                        );

                    return (
                        unidadeDgap &&
                        remetidoPelaCodoc
                    );
                }
            );

        const indiceEnvioPresParaDefin =
            linhas.findIndex(
                item => {
                    const unidadeDefin =
                        normalizarUnidade(
                            item.unidade
                        ) ===
                        normalizarUnidade(
                            'EXT/FIN/UNIDADE-B'
                        );

                    const remetidoPelaPres =
                        normalizar(
                            item.descricao
                        ).includes(
                            normalizar(
                                'Processo remetido pela unidade ORG/PRESIDENCIA'
                            )
                        );

                    return (
                        unidadeDefin &&
                        remetidoPelaPres
                    );
                }
            );

        const pendenciaSanada =
            indiceRetornoCodoc >= 0 &&
            indiceEnvioPresParaDefin >= 0 &&
            indiceEnvioPresParaDefin <
                indiceRetornoCodoc;

        const pendenciaAtiva =
            pendenciaDetectada &&
            !pendenciaSanada;

        console.debug(
            '[SEI][Histórico CODOC]',
            {
                ultimasOito,
                temRecebimentoCodoc,
                temPassagemDgapProt,
                temRemessaCodocParaDgap,
                fallbackCodoc,
                fallbackDgap,
                fallbackRemessa,
                temRetornoCodocNoHistorico,
                pendenciaDetectada,
                indiceRetornoCodoc,
                indiceEnvioPresParaDefin,
                pendenciaSanada,
                pendenciaAtiva
            }
        );

        return pendenciaAtiva
            ? '⚠ Retorno da Fazenda - Providência pendente na ORGAO_EXEMPLO'
            : '—';
    }

    /*
     * RECONHECIMENTO DE TRM
     *
     * O SEI passou a utilizar também o título por extenso:
     * "Termo de Requisitos Mínimos para Repasse de Prestação de Serviços".
     *
     * Para as regras do relatório, esse novo modelo é equivalente às
     * peças cujo título contém a sigla "TRM".
     */
    function ehTituloTrm(
        titulo
    ) {
        const texto =
            String(
                titulo || ''
            );

        if (
            /\bTRM\b/i.test(
                texto
            )
        ) {
            return true;
        }

        return normalizar(
            texto
        ).includes(
            normalizar(
                'Termo de Requisitos Mínimos para Repasse de Prestação de Serviços'
            )
        );
    }


    function combinarSinalizacoes(
        sinalizacaoArvore,
        sinalizacaoHistorico,
        sinalizacaoTrm = '—'
    ) {
        /*
         * REGRA DOMINANTE:
         * enquanto houver retorno da CODOC pendente na ORGAO_EXEMPLO,
         * essa deve ser a única sinalização exibida.
         */
        if (
            normalizar(
                sinalizacaoHistorico || ''
            ).includes(
                normalizar(
                    'Retorno da Fazenda'
                )
            )
        ) {
            return (
                '⚠ Retorno da Fazenda - Providência pendente na ORGAO_EXEMPLO'
            );
        }

        const sinais = [];

        for (
            const sinal of [
                sinalizacaoHistorico,
                sinalizacaoArvore,
                sinalizacaoTrm
            ]
        ) {
            if (
                !sinal ||
                sinal === '—'
            ) {
                continue;
            }

            for (
                const parte of String(sinal)
                    .split(' · ')
                    .map(limpar)
                    .filter(Boolean)
            ) {
                if (!sinais.includes(parte)) {
                    sinais.push(parte);
                }
            }
        }

        return sinais.join(' · ') || '—';
    }

    function calcularTempoAcumuladoNasUnidades(
        html,
        unidadesAlvo
    ) {
        const doc =
            new DOMParser().parseFromString(
                String(html || ''),
                'text/html'
            );

        const alvos =
            unidadesAlvo.map(
                normalizarUnidade
            );

        const eventos = [];

        for (
            const linha of doc.querySelectorAll(
                '#tblHistorico tr, table tr'
            )
        ) {
            const celulas = [
                ...linha.children
            ].filter(
                elemento =>
                    elemento.tagName === 'TD'
            );

            if (celulas.length < 4) {
                continue;
            }

            const dataHora =
                limpar(
                    celulas[0].textContent || ''
                );

            const data =
                interpretarDataBrasileira(
                    dataHora
                );

            if (!data) {
                continue;
            }

            eventos.push({
                data,
                unidade:
                    removerPontuacao(
                        limpar(
                            celulas[1].textContent || ''
                        )
                    )
            });
        }

        /*
         * Em ordem cronológica, a unidade registrada em cada andamento
         * representa a unidade em que o processo permanece até o evento
         * seguinte. O último evento é contado até o momento atual.
         */
        eventos.sort(
            (a, b) =>
                a.data.getTime() -
                b.data.getTime()
        );

        let totalMs = 0;

        for (
            let indice = 0;
            indice < eventos.length;
            indice += 1
        ) {
            const atual =
                eventos[indice];

            const inicio =
                atual.data.getTime();

            const fim =
                indice + 1 < eventos.length
                    ? eventos[
                        indice + 1
                    ].data.getTime()
                    : Date.now();

            if (
                fim <= inicio ||
                !alvos.includes(
                    normalizarUnidade(
                        atual.unidade
                    )
                )
            ) {
                continue;
            }

            totalMs +=
                fim - inicio;
        }

        return totalMs;
    }

    /*
     * HISTÓRICO DE TEMPO v9.9.104
     *
     * Quando o processo já saiu de DF/DF-PO ou de todo o circuito DF,
     * as colunas de duração preservam a última passagem concluída:
     *
     *   2 dias e 19 horas
     *   (histórico)
     *
     * As colunas "desde" continuam vazias quando não há abertura atual.
     */

    /*
     * REGRESSÃO v9.9.103 — DF reaberta após remessa para DF-PO
     *
     * Exemplo PROCESSO_EXEMPLO_020:
     * 20/08 16:22 DF recebeu
     * 21/08 09:01 DF -> DF-PO
     * 21/08 10:37 DF reabriu
     * 21/08 10:37 DF concluiu
     *
     * Resultado esperado:
     * DF-PO continua aberta; "Em DF/DF-PO desde" não vira "—".
     */

    function extrairRodadaGerencialDfDfpoAtual(
        html
    ) {
        const doc =
            new DOMParser().parseFromString(
                String(html || ''),
                'text/html'
            );

        const eventos = [];

        for (
            const linha of doc.querySelectorAll(
                '#tblHistorico tr, table tr'
            )
        ) {
            const celulas = [
                ...linha.children
            ].filter(
                elemento =>
                    elemento.tagName === 'TD'
            );

            if (celulas.length < 4) {
                continue;
            }

            const dataHora =
                limpar(
                    celulas[0].textContent || ''
                );

            const data =
                interpretarDataBrasileira(
                    dataHora
                );

            if (!data) {
                continue;
            }

            eventos.push({
                dataHora,
                data,
                unidade:
                    removerPontuacao(
                        limpar(
                            celulas[1].textContent || ''
                        )
                    ),
                usuario:
                    limpar(
                        celulas[2].textContent || ''
                    ),
                descricao:
                    limpar(
                        celulas[3].textContent || ''
                    )
            });
        }

        eventos.sort(
            (a, b) =>
                a.data.getTime() -
                b.data.getTime()
        );

        /*
         * MICROABERTURA ADMINISTRATIVA DF/DF-PO — v9.9.123
         *
         * A coluna "Tempo em DF/DF-PO" usa esta função gerencial,
         * separada de extrairInicioCircuitoDfAtual(). Portanto, aplica-se
         * aqui o MESMO filtro simétrico da v9.9.122:
         *
         * - mesma unidade DF ou DF-PO;
         * - um evento é Reabertura e o outro Conclusão;
         * - até 15 minutos;
         * - nenhuma remessa envolvendo a unidade entre os dois;
         * - aceita Reabertura -> Conclusão e Conclusão -> Reabertura.
         */
        const LIMITE_MICROABERTURA_GERENCIAL_MS =
            15 * 60 * 1000;

        const indicesMicroaberturaGerencial =
            new Set();

        const ehUnidadeGerencialBruta =
            unidade =>
                [
                    'ORG/FIN',
                    'ORG/FIN/PLANEJAMENTO'
                ].some(
                    alvo =>
                        normalizarUnidade(
                            unidade
                        ) ===
                        normalizarUnidade(
                            alvo
                        )
                );

        for (
            let i = 0;
            i < eventos.length;
            i++
        ) {
            const eventoA =
                eventos[i];

            if (
                !ehUnidadeGerencialBruta(
                    eventoA.unidade
                )
            ) {
                continue;
            }

            const aEhReabertura =
                /Reabertura do processo na unidade/i.test(
                    eventoA.descricao || ''
                );

            const aEhConclusao =
                /Conclus[aã]o do processo na unidade/i.test(
                    eventoA.descricao || ''
                );

            if (
                !aEhReabertura &&
                !aEhConclusao
            ) {
                continue;
            }

            for (
                let j = i + 1;
                j < eventos.length;
                j++
            ) {
                const eventoB =
                    eventos[j];

                const intervalo =
                    eventoB.data.getTime() -
                    eventoA.data.getTime();

                if (
                    intervalo >
                    LIMITE_MICROABERTURA_GERENCIAL_MS
                ) {
                    break;
                }

                if (
                    !ehUnidadeGerencialBruta(
                        eventoB.unidade
                    )
                ) {
                    continue;
                }

                const mesmaUnidade =
                    normalizarUnidade(
                        eventoA.unidade
                    ) ===
                    normalizarUnidade(
                        eventoB.unidade
                    );

                if (!mesmaUnidade) {
                    continue;
                }

                const bEhReabertura =
                    /Reabertura do processo na unidade/i.test(
                        eventoB.descricao || ''
                    );

                const bEhConclusao =
                    /Conclus[aã]o do processo na unidade/i.test(
                        eventoB.descricao || ''
                    );

                const formamPar =
                    (
                        aEhReabertura &&
                        bEhConclusao
                    ) ||
                    (
                        aEhConclusao &&
                        bEhReabertura
                    );

                if (!formamPar) {
                    continue;
                }

                const remessaEntre =
                    eventos
                        .slice(
                            i + 1,
                            j
                        )
                        .some(
                            item => {
                                const origem =
                                    (item.descricao || '')
                                        .match(
                                            /Processo remetido pela unidade\s+([A-Z0-9._/-]+)/i
                                        )?.[1] || '';

                                if (!origem) {
                                    return false;
                                }

                                return (
                                    normalizarUnidade(
                                        origem
                                    ) ===
                                    normalizarUnidade(
                                        eventoA.unidade
                                    ) ||
                                    normalizarUnidade(
                                        item.unidade
                                    ) ===
                                    normalizarUnidade(
                                        eventoA.unidade
                                    )
                                );
                            }
                        );

                if (remessaEntre) {
                    continue;
                }

                indicesMicroaberturaGerencial.add(
                    i
                );
                indicesMicroaberturaGerencial.add(
                    j
                );

                break;
            }
        }

        const unidadesTrabalho = [
            'ORG/FIN',
            'ORG/FIN/PLANEJAMENTO'
        ];

        const unidadePausa =
            'ORG/FIN/CONTABILIDADE';

        const normalizarChave =
            unidade =>
                normalizarUnidade(
                    unidade
                );

        const ehTrabalho = unidade =>
            unidadesTrabalho.some(
                alvo =>
                    normalizarChave(
                        unidade
                    ) ===
                    normalizarChave(
                        alvo
                    )
            );

        const ehPausa = unidade =>
            normalizarChave(
                unidade
            ) ===
            normalizarChave(
                unidadePausa
            );

        /*
         * v9.9.103:
         * acompanha DF e DF-PO individualmente.
         *
         * Uma conclusão em DF NÃO encerra a rodada se DF-PO ainda
         * estiver aberta, e vice-versa.
         */
        const unidadesTrabalhoAbertas =
            new Set();

        let pausaDfContAberta = false;
        let rodadaAtiva = false;
        let inicioRodada = null;
        let inicioTrechoTrabalho = null;
        let tempoAcumuladoMs = 0;
        let maiorRodadaConcluidaMs = 0;

        const adicionarTrabalho = (
            unidade,
            evento
        ) => {
            const estavaSemTrabalho =
                unidadesTrabalhoAbertas.size === 0;

            unidadesTrabalhoAbertas.add(
                normalizarChave(
                    unidade
                )
            );

            if (
                estavaSemTrabalho &&
                unidadesTrabalhoAbertas.size > 0 &&
                !inicioTrechoTrabalho
            ) {
                inicioTrechoTrabalho =
                    evento;
            }
        };

        const removerTrabalho =
            unidade => {
                unidadesTrabalhoAbertas.delete(
                    normalizarChave(
                        unidade
                    )
                );
            };

        const encerrarTrechoTrabalho =
            instante => {
                if (!inicioTrechoTrabalho) {
                    return;
                }

                const fim =
                    instante instanceof Date
                        ? instante.getTime()
                        : Number(instante);

                const inicio =
                    inicioTrechoTrabalho.data.getTime();

                if (
                    Number.isFinite(fim) &&
                    fim > inicio
                ) {
                    tempoAcumuladoMs +=
                        fim - inicio;
                }

                inicioTrechoTrabalho = null;
            };

        const encerrarRodada = instante => {
            encerrarTrechoTrabalho(
                instante
            );

            /*
             * Guarda a MAIOR duração entre todas as rodadas completas
             * para exibição histórica quando o processo já não estiver
             * em DF/DF-PO. Uma micro/última rodada curta não substitui
             * uma rodada operacional anterior de vários dias.
             */
            if (
                inicioRodada &&
                Number.isFinite(
                    tempoAcumuladoMs
                ) &&
                tempoAcumuladoMs >= 0
            ) {
                maiorRodadaConcluidaMs =
                    Math.max(
                        maiorRodadaConcluidaMs,
                        tempoAcumuladoMs
                    );
            }

            unidadesTrabalhoAbertas.clear();
            pausaDfContAberta = false;
            rodadaAtiva = false;
            inicioRodada = null;
            tempoAcumuladoMs = 0;
        };

        const iniciarNovaRodada = evento => {
            unidadesTrabalhoAbertas.clear();
            pausaDfContAberta = false;
            rodadaAtiva = true;
            inicioRodada = evento;
            tempoAcumuladoMs = 0;
            inicioTrechoTrabalho = null;
        };

        for (
            let indiceEvento = 0;
            indiceEvento < eventos.length;
            indiceEvento++
        ) {
            if (
                indicesMicroaberturaGerencial.has(
                    indiceEvento
                )
            ) {
                continue;
            }

            const evento =
                eventos[indiceEvento];

            const descricao =
                evento.descricao || '';

            const origem =
                descricao.match(
                    /Processo remetido pela unidade\s+([A-Z0-9._/-]+)/i
                )?.[1] || '';

            if (origem) {
                const destino =
                    evento.unidade;

                const origemTrabalho =
                    ehTrabalho(
                        origem
                    );

                const destinoTrabalho =
                    ehTrabalho(
                        destino
                    );

                const origemPausa =
                    ehPausa(
                        origem
                    );

                const destinoPausa =
                    ehPausa(
                        destino
                    );

                /*
                 * Entrada de fora em DF/DF-PO:
                 * nova rodada.
                 */
                if (
                    destinoTrabalho &&
                    !origemTrabalho &&
                    !origemPausa
                ) {
                    iniciarNovaRodada(
                        evento
                    );

                    adicionarTrabalho(
                        destino,
                        evento
                    );

                    continue;
                }

                /*
                 * DF <-> DF-PO:
                 * destino abre, origem deixa de ser a unidade carregadora.
                 * A rodada e o relógio continuam sem reiniciar.
                 */
                if (
                    origemTrabalho &&
                    destinoTrabalho
                ) {
                    if (!rodadaAtiva) {
                        iniciarNovaRodada(
                            evento
                        );
                    }

                    removerTrabalho(
                        origem
                    );

                    adicionarTrabalho(
                        destino,
                        evento
                    );

                    continue;
                }

                /*
                 * DF/DF-PO -> DF-CONT:
                 * remove a unidade de trabalho de origem e pausa quando
                 * nenhuma outra DF/DF-PO continua aberta.
                 */
                if (
                    origemTrabalho &&
                    destinoPausa
                ) {
                    if (!rodadaAtiva) {
                        iniciarNovaRodada(
                            evento
                        );
                    }

                    removerTrabalho(
                        origem
                    );

                    pausaDfContAberta = true;

                    if (
                        unidadesTrabalhoAbertas.size === 0
                    ) {
                        encerrarTrechoTrabalho(
                            evento.data
                        );
                    }

                    continue;
                }

                /*
                 * DF-CONT -> DF/DF-PO:
                 * retoma a mesma rodada.
                 */
                if (
                    origemPausa &&
                    destinoTrabalho
                ) {
                    if (!rodadaAtiva) {
                        iniciarNovaRodada(
                            evento
                        );
                    }

                    pausaDfContAberta = false;

                    adicionarTrabalho(
                        destino,
                        evento
                    );

                    continue;
                }

                /*
                 * Saída real de uma unidade DF/DF-PO para fora do
                 * circuito gerencial. Remove somente a unidade de origem.
                 * A rodada termina apenas se não restar outra DF/DF-PO
                 * aberta nem a pausa DF-CONT.
                 */
                if (
                    rodadaAtiva &&
                    origemTrabalho &&
                    !destinoTrabalho &&
                    !destinoPausa
                ) {
                    removerTrabalho(
                        origem
                    );

                    if (
                        unidadesTrabalhoAbertas.size === 0
                    ) {
                        encerrarTrechoTrabalho(
                            evento.data
                        );

                        if (
                            !pausaDfContAberta
                        ) {
                            encerrarRodada(
                                evento.data
                            );
                        }
                    }

                    continue;
                }

                /*
                 * Saída de DF-CONT para fora da rodada.
                 */
                if (
                    rodadaAtiva &&
                    origemPausa &&
                    !destinoTrabalho &&
                    !destinoPausa
                ) {
                    pausaDfContAberta = false;

                    if (
                        unidadesTrabalhoAbertas.size === 0
                    ) {
                        encerrarRodada(
                            evento.data
                        );
                    }

                    continue;
                }

                continue;
            }

            /*
             * Recebimento serve como salvaguarda quando a remessa não
             * apareceu no histórico disponível.
             */
            if (
                ehTrabalho(
                    evento.unidade
                ) &&
                /Processo recebido na unidade/i.test(
                    descricao
                )
            ) {
                if (!rodadaAtiva) {
                    iniciarNovaRodada(
                        evento
                    );
                }

                adicionarTrabalho(
                    evento.unidade,
                    evento
                );

                continue;
            }

            /*
             * Reabertura explícita: abre SOMENTE aquela unidade.
             * Não reinicia a rodada se outra DF/DF-PO já estiver aberta.
             */
            if (
                ehTrabalho(
                    evento.unidade
                ) &&
                /Reabertura do processo na unidade/i.test(
                    descricao
                )
            ) {
                if (!rodadaAtiva) {
                    iniciarNovaRodada(
                        evento
                    );
                }

                adicionarTrabalho(
                    evento.unidade,
                    evento
                );

                continue;
            }

            /*
             * Conclusão explícita: fecha SOMENTE aquela unidade.
             *
             * Este é o ponto que corrige o caso:
             * DF-PO permanece aberta, DF é reaberta apenas para ajuste e
             * depois concluída. A conclusão da DF não pode matar a rodada.
             */
            if (
                ehTrabalho(
                    evento.unidade
                ) &&
                /Conclus[aã]o do processo na unidade/i.test(
                    descricao
                ) &&
                rodadaAtiva
            ) {
                removerTrabalho(
                    evento.unidade
                );

                if (
                    unidadesTrabalhoAbertas.size === 0
                ) {
                    encerrarTrechoTrabalho(
                        evento.data
                    );

                    if (
                        !pausaDfContAberta
                    ) {
                        encerrarRodada(
                            evento.data
                        );
                    }
                }

                continue;
            }

            /*
             * Mesma ideia para DF-CONT: conclusão encerra apenas a pausa,
             * sem apagar uma DF/DF-PO que eventualmente permaneça aberta.
             */
            if (
                ehPausa(
                    evento.unidade
                ) &&
                /Conclus[aã]o do processo na unidade/i.test(
                    descricao
                ) &&
                rodadaAtiva
            ) {
                pausaDfContAberta = false;

                if (
                    unidadesTrabalhoAbertas.size === 0
                ) {
                    encerrarRodada(
                        evento.data
                    );
                }
            }
        }

        if (
            rodadaAtiva &&
            inicioTrechoTrabalho &&
            unidadesTrabalhoAbertas.size > 0
        ) {
            encerrarTrechoTrabalho(
                Date.now()
            );
        }

        /*
         * MAIOR RODADA HISTÓRICA — v9.9.139
         *
         * Quando não existe rodada atualmente aberta, "Tempo em DF/DF-PO"
         * passa a mostrar a MAIOR rodada concluída do histórico, e não
         * simplesmente a última. Isso evita que uma passagem posterior de
         * poucos minutos esconda uma rodada operacional anterior de dias.
         */

        /*
         * v9.9.123:
         * Microaberturas administrativas ignoradas aqui não criam
         * nova rodada nem substituem o histórico de "Tempo em DF/DF-PO".
         */

        return {
            inicio:
                rodadaAtiva
                    ? inicioRodada
                    : null,
            tempoAcumuladoMs:
                rodadaAtiva
                    ? tempoAcumuladoMs
                    : 0,
            tempoHistoricoMs:
                maiorRodadaConcluidaMs
        };
    }

    function extrairInicioCircuitoDfAtual(
        html
    ) {
        const doc =
            new DOMParser().parseFromString(
                String(html || ''),
                'text/html'
            );

        const linhas = [];

        for (
            const linha of doc.querySelectorAll(
                '#tblHistorico tr, table tr'
            )
        ) {
            const celulas = [
                ...linha.children
            ].filter(
                elemento =>
                    elemento.tagName === 'TD'
            );

            if (celulas.length < 4) {
                continue;
            }

            const item = {
                dataHora:
                    limpar(
                        celulas[0].textContent || ''
                    ),
                unidade:
                    removerPontuacao(
                        limpar(
                            celulas[1].textContent || ''
                        )
                    ),
                usuario:
                    limpar(
                        celulas[2].textContent || ''
                    ),
                descricao:
                    limpar(
                        celulas[3].textContent || ''
                    )
            };

            const data =
                interpretarDataBrasileira(
                    item.dataHora
                );

            if (!data) {
                continue;
            }

            linhas.push({
                ...item,
                data
            });
        }

        linhas.sort(
            (a, b) =>
                a.data.getTime() -
                b.data.getTime()
        );

        /*
         * REABERTURA ADMINISTRATIVA CURTA — v9.9.122
         *
         * Algumas reaberturas são feitas apenas para marcador/etiqueta,
         * assinatura ou pequeno ajuste administrativo e logo em seguida
         * a mesma unidade é concluída.
         *
         * O SEI pode listar eventos com o MESMO timestamp em ordem
         * aparentemente invertida:
         *
         *   Conclusão
         *   Reabertura
         *
         * mesmo quando, operacionalmente, trata-se do mesmo microevento.
         *
         * Por isso, o detector agora é simétrico:
         * - mesma unidade DF;
         * - um evento é Reabertura;
         * - o outro é Conclusão;
         * - diferença de até 15 minutos;
         * - nenhuma remessa envolvendo a unidade entre os dois eventos.
         *
         * A ordem Reabertura -> Conclusão OU Conclusão -> Reabertura
         * é aceita como microabertura administrativa.
         */
        const LIMITE_REABERTURA_ADMIN_MS =
            15 * 60 * 1000;

        const indicesAdministrativos =
            new Set();

        for (
            let i = 0;
            i < linhas.length;
            i++
        ) {
            const eventoA =
                linhas[i];

            const aEhReabertura =
                /Reabertura do processo na unidade/i.test(
                    eventoA.descricao || ''
                );

            const aEhConclusao =
                /Conclus[aã]o do processo na unidade/i.test(
                    eventoA.descricao || ''
                );

            if (
                !aEhReabertura &&
                !aEhConclusao
            ) {
                continue;
            }

            for (
                let j = i + 1;
                j < linhas.length;
                j++
            ) {
                const eventoB =
                    linhas[j];

                const intervalo =
                    eventoB.data.getTime() -
                    eventoA.data.getTime();

                if (
                    intervalo >
                    LIMITE_REABERTURA_ADMIN_MS
                ) {
                    break;
                }

                const mesmaUnidade =
                    normalizarUnidade(
                        eventoA.unidade
                    ) ===
                    normalizarUnidade(
                        eventoB.unidade
                    );

                if (!mesmaUnidade) {
                    continue;
                }

                const bEhReabertura =
                    /Reabertura do processo na unidade/i.test(
                        eventoB.descricao || ''
                    );

                const bEhConclusao =
                    /Conclus[aã]o do processo na unidade/i.test(
                        eventoB.descricao || ''
                    );

                const formamParAdministrativo =
                    (
                        aEhReabertura &&
                        bEhConclusao
                    ) ||
                    (
                        aEhConclusao &&
                        bEhReabertura
                    );

                if (!formamParAdministrativo) {
                    continue;
                }

                const remessaEntre =
                    linhas
                        .slice(
                            i + 1,
                            j
                        )
                        .some(
                            item => {
                                const origem =
                                    (item.descricao || '')
                                        .match(
                                            /Processo remetido pela unidade\s+([A-Z0-9._/-]+)/i
                                        )?.[1] || '';

                                if (!origem) {
                                    return false;
                                }

                                return (
                                    normalizarUnidade(
                                        origem
                                    ) ===
                                    normalizarUnidade(
                                        eventoA.unidade
                                    ) ||
                                    normalizarUnidade(
                                        item.unidade
                                    ) ===
                                    normalizarUnidade(
                                        eventoA.unidade
                                    )
                                );
                            }
                        );

                if (remessaEntre) {
                    continue;
                }

                indicesAdministrativos.add(
                    i
                );

                indicesAdministrativos.add(
                    j
                );

                break;
            }
        }

        const unidadesDfAbertas =
            new Set();

        let inicioCircuito = null;
        let maiorDuracaoCircuitoMs = 0;

        const ehDf = unidade =>
            UNIDADES_DF.some(
                unidadeDf =>
                    normalizarUnidade(
                        unidade
                    ) ===
                    normalizarUnidade(
                        unidadeDf
                    )
            );

        const adicionarDf = (
            unidade,
            item
        ) => {
            const estavaVazio =
                unidadesDfAbertas.size === 0;

            unidadesDfAbertas.add(
                normalizarUnidade(
                    unidade
                )
            );

            if (
                estavaVazio &&
                unidadesDfAbertas.size > 0
            ) {
                inicioCircuito = item;
            }
        };

        const removerDf = (
            unidade,
            itemFim
        ) => {
            unidadesDfAbertas.delete(
                normalizarUnidade(
                    unidade
                )
            );

            if (
                unidadesDfAbertas.size === 0
            ) {
                if (
                    inicioCircuito?.data &&
                    itemFim?.data
                ) {
                    const duracao =
                        itemFim.data.getTime() -
                        inicioCircuito.data.getTime();

                    if (
                        Number.isFinite(
                            duracao
                        ) &&
                        duracao >= 0
                    ) {
                        maiorDuracaoCircuitoMs =
                            Math.max(
                                maiorDuracaoCircuitoMs,
                                duracao
                            );
                    }
                }

                inicioCircuito = null;
            }
        };

        for (
            let indiceLinha = 0;
            indiceLinha < linhas.length;
            indiceLinha++
        ) {
            if (
                indicesAdministrativos.has(
                    indiceLinha
                )
            ) {
                continue;
            }

            const item =
                linhas[indiceLinha];

            const unidadeDestino =
                item.unidade;

            const descricao =
                item.descricao || '';

            const origem =
                descricao.match(
                    /Processo remetido pela unidade\s+([A-Z0-9._/-]+)/i
                )?.[1] || '';

            /*
             * Remessa entre unidades:
             *
             * - remove a unidade de origem do conjunto aberto;
             * - adiciona a unidade de destino, se ela pertencer à DF;
             * - transferências internas DF -> DF preservam o início;
             * - somente quando nenhuma unidade DF permanece aberta
             *   o circuito é considerado encerrado.
             */
            if (origem) {
                const origemEhDf =
                    ehDf(origem);

                const destinoEhDf =
                    ehDf(unidadeDestino);

                /*
                 * TRANSFERÊNCIA INTERNA DF -> DF
                 *
                 * Precisa ser tratada de forma atômica.
                 *
                 * Se removermos a origem primeiro, o conjunto pode
                 * ficar momentaneamente vazio e apagar o início do
                 * circuito. Ao adicionar o destino logo depois, o
                 * relógio seria reiniciado de forma incorreta.
                 *
                 * Portanto, DF -> DF troca a unidade dentro do
                 * conjunto sem encerrar nem reiniciar o circuito.
                 */
                if (
                    origemEhDf &&
                    destinoEhDf
                ) {
                    unidadesDfAbertas.delete(
                        normalizarUnidade(
                            origem
                        )
                    );

                    unidadesDfAbertas.add(
                        normalizarUnidade(
                            unidadeDestino
                        )
                    );

                    if (!inicioCircuito) {
                        inicioCircuito = item;
                    }

                    continue;
                }

                /*
                 * Saída DF -> não-DF.
                 */
                if (
                    origemEhDf &&
                    !destinoEhDf
                ) {
                    removerDf(
                        origem,
                        item
                    );

                    continue;
                }

                /*
                 * Entrada não-DF -> DF.
                 *
                 * adicionarDf() já preserva o início quando alguma
                 * unidade DF continua aberta, importante para casos
                 * em que outra unidade externa remete o processo para
                 * a DF durante um circuito já em andamento.
                 */
                if (
                    !origemEhDf &&
                    destinoEhDf
                ) {
                    adicionarDf(
                        unidadeDestino,
                        item
                    );

                    continue;
                }

                continue;
            }

            /*
             * Recebimento/Reabertura pode aparecer sem a linha de
             * remessa correspondente no recorte do histórico.
             */
            if (
                ehDf(unidadeDestino) &&
                (
                    /Processo recebido na unidade/i.test(
                        descricao
                    ) ||
                    /Reabertura do processo na unidade/i.test(
                        descricao
                    )
                )
            ) {
                adicionarDf(
                    unidadeDestino,
                    item
                );

                continue;
            }

            /*
             * Conclusão fecha somente aquela unidade da DF.
             * Se houver outra DF ainda aberta, o circuito continua.
             */
            if (
                ehDf(unidadeDestino) &&
                /Conclus[aã]o do processo na unidade/i.test(
                    descricao
                )
            ) {
                removerDf(
                    unidadeDestino,
                    item
                );
            }
        }

        /*
         * Resultados esperados:
         * - Reabertura DF 10:06 + Conclusão DF 10:07 -> ignorar;
         * - Conclusão DF 11:45 + Reabertura DF 11:45 -> ignorar;
         * - sem remessa entre os dois eventos.
         *
         * Casos observados:
         * PROCESSO_EXEMPLO_019
         * PROCESSO_EXEMPLO_017
         * PROCESSO_EXEMPLO_013
         */

        /*
         * MAIOR CIRCUITO DF HISTÓRICO — v9.9.139
         *
         * Se o circuito já está encerrado, preservamos a maior duração
         * encontrada entre todos os circuitos completos. O circuito mais
         * recente só prevalece quando também for o maior.
         */
        return {
            inicio:
                inicioCircuito,
            tempoHistoricoMs:
                maiorDuracaoCircuitoMs
        };
    }


    function extrairUltimaRemessaParaUnidade(
        html,
        unidadeDestinoAlvo
    ) {
        const doc =
            new DOMParser().parseFromString(
                String(html || ''),
                'text/html'
            );

        const destinoAlvoNormalizado =
            normalizarUnidade(
                unidadeDestinoAlvo
            );

        const candidatos = [];

        for (
            const linha of doc.querySelectorAll(
                '#tblHistorico tr, table tr'
            )
        ) {
            const celulas = [
                ...linha.children
            ].filter(
                elemento =>
                    elemento.tagName === 'TD'
            );

            if (celulas.length < 4) {
                continue;
            }

            const dataHora =
                limpar(
                    celulas[0].textContent || ''
                );

            const unidadeDestino =
                removerPontuacao(
                    limpar(
                        celulas[1].textContent || ''
                    )
                );

            const descricao =
                limpar(
                    celulas[3].textContent || ''
                );

            if (
                normalizarUnidade(
                    unidadeDestino
                ) !==
                destinoAlvoNormalizado
            ) {
                continue;
            }

            const origem =
                descricao.match(
                    /Processo remetido pela unidade\s+([A-Z0-9._/-]+)/i
                )?.[1] || '';

            if (!origem) {
                continue;
            }

            const data =
                interpretarDataBrasileira(
                    dataHora
                );

            if (!data) {
                continue;
            }

            candidatos.push({
                dataHora,
                data,
                destino:
                    unidadeDestino,
                origem:
                    removerPontuacao(
                        origem
                    ),
                descricao
            });
        }

        candidatos.sort(
            (a, b) =>
                b.data.getTime() -
                a.data.getTime()
        );

        return candidatos[0] || null;
    }


    function extrairAndamentoAberto(
        html,
        unidadeAlvo
    ) {
        const doc =
            new DOMParser().parseFromString(
                html,
                'text/html'
            );

        const candidatos = [];

        for (
            const linha of doc.querySelectorAll(
                '#tblHistorico tr.andamentoAberto, tr.andamentoAberto'
            )
        ) {
            const celulas = [
                ...linha.querySelectorAll(
                    ':scope > td'
                )
            ];

            if (celulas.length < 4) {
                continue;
            }

            const dataHora =
                limpar(
                    celulas[0].textContent || ''
                );

            const unidade =
                removerPontuacao(
                    limpar(
                        celulas[1].textContent || ''
                    )
                );

            const usuario =
                limpar(
                    celulas[2].textContent || ''
                );

            const descricao =
                limpar(
                    celulas[3].textContent || ''
                );

            if (
                normalizarUnidade(unidade) !==
                normalizarUnidade(unidadeAlvo)
            ) {
                continue;
            }

            candidatos.push({
                dataHora,
                unidade,
                usuario,
                descricao,
                data:
                    interpretarDataBrasileira(
                        dataHora
                    )
            });
        }

        candidatos.sort(
            (a, b) =>
                (b.data?.getTime() || 0) -
                (a.data?.getTime() || 0)
        );

        return candidatos[0] || null;
    }

    function interpretarDataBrasileira(texto) {
        const m = String(texto || '').match(
            /(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})(?::(\d{2}))?/
        );

        if (!m) {
            return null;
        }

        const data = new Date(
            Number(m[3]),
            Number(m[2]) - 1,
            Number(m[1]),
            Number(m[4]),
            Number(m[5]),
            Number(m[6] || 0)
        );

        return Number.isNaN(data.getTime())
            ? null
            : data;
    }

    function formatarDuracao(ms) {
        if (
            !Number.isFinite(ms) ||
            ms < 0
        ) {
            return 'Data futura ou inválida';
        }

        const minutosTotais =
            Math.floor(ms / 60000);

        const dias =
            Math.floor(
                minutosTotais / 1440
            );

        const horas =
            Math.floor(
                (minutosTotais % 1440) / 60
            );

        const minutos =
            minutosTotais % 60;

        const partes = [];

        if (dias) {
            partes.push(
                `${dias} ${
                    dias === 1
                        ? 'dia'
                        : 'dias'
                }`
            );
        }

        if (horas) {
            partes.push(
                `${horas} ${
                    horas === 1
                        ? 'hora'
                        : 'horas'
                }`
            );
        }

        if (!dias) {
            partes.push(
                `${minutos} ${
                    minutos === 1
                        ? 'minuto'
                        : 'minutos'
                }`
            );
        }

        return partes.join(' e ') ||
            'menos de 1 minuto';
    }

    function verificarErroSei(html) {
        const texto = normalizar(html);

        if (
            texto.includes(
                'tamanho de hash invalido'
            )
        ) {
            throw new Error(
                'O SEI informou “Tamanho de hash inválido”. ' +
                'Atualize o Acompanhamento Especial.'
            );
        }

        if (
            texto.includes('acesso negado') ||
            texto.includes(
                'usuario nao possui acesso'
            ) ||
            texto.includes(
                'usuario nao autorizado'
            ) ||
            texto.includes(
                'permissao negada'
            )
        ) {
            throw new Error(
                'O usuário não possui acesso ao processo.'
            );
        }
    }

    function aplicarSinalizacaoCumprindoTrm(
        resultado
    ) {
        /*
         * Mantida apenas por compatibilidade.
         * A regra consolidada é calculada dentro de consultarProcesso:
         *
         * passou pela ORG/CONTROLE no histórico
         * E
         * está aberto exclusivamente nas unidades da DF.
         */
        return resultado;
    }

    function criarResultadoErro(
        processo,
        detalhe
    ) {
        return {
            processo: processo.numero,
            unidades: '',
            abertoDfpo: false,
            abertoFazenda: false,
            abertoDf: false,
            abertoIon: false,
            desdeDfpo: '',
            tempoDfpo: '',
            usuarioRecebimento: '',
            eventoAbertura: '',
            situacao: 'Erro',
            sinalizacao: '—',
            detalhe,
            url: processo.url
        };
    }

    /*
     * TRÊS TABELAS NO MESMO MODAL — v9.9.106
     *
     * A visualização é separada durante a própria montagem:
     * 1. ativos atualmente abertos em ORG/FIN/PLANEJAMENTO;
     * 2. demais processos ativos, fora da DF-PO;
     * 3. sinalizações iniciadas por "Arquivamento provável".
     *
     * As três usam as mesmas colunas e os mesmos agrupamentos visuais.
     * Exportação, XLSX, cópia e PDF continuam usando `resultados` completos;
     * esta alteração é apenas de organização visual do modal.
     */

    function criarModal(total) {
        document.getElementById(
            ID_MODAL
        )?.remove();

        const modal =
            document.createElement('div');

        modal.id = ID_MODAL;

        modal.innerHTML = `
            <div class="mv-caixa">
                <div class="mv-cabecalho">
                    <h2>
                        Relatório Scraping/RPA  (instável 🔥⚗️)
                    </h2>

                    <button
                        type="button"
                        id="mv-fechar-x"
                    >
                        ×
                    </button>
                </div>

                <div class="mv-conteudo">
                    <div class="mv-progresso">
                        <strong>Progresso:</strong>

                        <span id="mv-contador">
                            0 de ${total} — 0%
                        </span>
                    </div>

                    <div class="mv-barra-fundo">
                        <div id="mv-barra"></div>
                    </div>

                    <div id="mv-status">
                        Preparando consulta...
                    </div>

                    <div class="mv-secao-relatorio mv-secao-ativos mv-secao-dfpo">
                        <div class="mv-secao-titulo">
                            Ativos em DF-PO —
                            <span id="mv-total-dfpo">0</span>
                        </div>

                        <table>
                        <thead>
                            <tr class="mv-linha-grupos">
                                <th
                                    class="mv-grupo-vazio"
                                    colspan="${ATIVAR_COLUNA_CREDOR ? 6 : 5}"
                                ></th>
                                <th
                                    class="mv-grupo-tempo"
                                    colspan="2"
                                >
                                    Execução
                                </th>
                                <th
                                    class="mv-grupo-tempo"
                                    colspan="2"
                                >
                                    Diretoria Financeira
                                </th>
                            </tr>
                            <tr class="mv-linha-cabecalhos">
                                <th class="mv-n">#</th>
                                <th class="mv-processo">
                                    Processo
                                </th>
                                ${
                                    ATIVAR_COLUNA_CREDOR
                                        ? `
                                <th class="mv-credor">
                                    Credor
                                </th>`
                                        : ''
                                }
                                <th class="mv-unidades">
                                    Carga / Unidade(s) aberta(s)
                                </th>
                                <th class="mv-resultado">
                                    Diretoria
                                </th>
                                <th class="mv-sinalizacao">
                                    Sinalização (em desenvolvimento 👷‍♂️🔧)
                                </th>
                                <th class="mv-desde-gerencia">
                                    Em DF/DF-PO desde
                                </th>
                                <th class="mv-tempo-gerencia">
                                    Tempo em DF/DF-PO
                                </th>
                                <th class="mv-desde-circuito">
                                    Em unidade da DF desde
                                </th>
                                <th class="mv-tempo-circuito">
                                    Em trabalho por (circuito DF)
                                </th>
                            </tr>
                        </thead>

                        <tbody id="mv-resultados-dfpo"></tbody>
                    </table>
                    </div>

                    <div class="mv-separador-tabelas"></div>

<div class="mv-secao-relatorio mv-secao-ativos mv-secao-outros-ativos">
                        <div class="mv-secao-titulo">
                            Ativos fora da DF-PO —
                            <span id="mv-total-outros-ativos">0</span>
                        </div>

                        <table>
                        <thead>
                            <tr class="mv-linha-grupos">
                                <th
                                    class="mv-grupo-vazio"
                                    colspan="${ATIVAR_COLUNA_CREDOR ? 6 : 5}"
                                ></th>
                                <th
                                    class="mv-grupo-tempo"
                                    colspan="2"
                                >
                                    Execução
                                </th>
                                <th
                                    class="mv-grupo-tempo"
                                    colspan="2"
                                >
                                    Diretoria Financeira
                                </th>
                            </tr>
                            <tr class="mv-linha-cabecalhos">
                                <th class="mv-n">#</th>
                                <th class="mv-processo">
                                    Processo
                                </th>
                                ${
                                    ATIVAR_COLUNA_CREDOR
                                        ? `
                                <th class="mv-credor">
                                    Credor
                                </th>`
                                        : ''
                                }
                                <th class="mv-unidades">
                                    Carga / Unidade(s) aberta(s)
                                </th>
                                <th class="mv-resultado">
                                    Diretoria
                                </th>
                                <th class="mv-sinalizacao">
                                    Sinalização (em desenvolvimento 👷‍♂️🔧)
                                </th>
                                <th class="mv-desde-gerencia">
                                    Em DF/DF-PO desde
                                </th>
                                <th class="mv-tempo-gerencia">
                                    Tempo em DF/DF-PO
                                </th>
                                <th class="mv-desde-circuito">
                                    Em unidade da DF desde
                                </th>
                                <th class="mv-tempo-circuito">
                                    Em trabalho por (circuito DF)
                                </th>
                            </tr>
                        </thead>

                        <tbody id="mv-resultados-outros-ativos"></tbody>
                    </table>
                    </div>

                    <div class="mv-separador-tabelas"></div>

                    <div class="mv-secao-relatorio mv-secao-slip-final">
                        <div class="mv-secao-titulo mv-secao-titulo-slip-final">
                            🟢 Repasse em fase final / Tesouraria —
                            <span id="mv-total-slip-final">0</span>
                        </div>

                        <table>
                        <thead>
                            <tr class="mv-linha-grupos">
                                <th
                                    class="mv-grupo-vazio"
                                    colspan="${ATIVAR_COLUNA_CREDOR ? 6 : 5}"
                                ></th>
                                <th
                                    class="mv-grupo-tempo"
                                    colspan="2"
                                >
                                    Execução
                                </th>
                                <th
                                    class="mv-grupo-tempo"
                                    colspan="2"
                                >
                                    Diretoria Financeira
                                </th>
                            </tr>
                            <tr class="mv-linha-cabecalhos">
                                <th class="mv-n">#</th>
                                <th class="mv-processo">Processo</th>
                                ${
                                    ATIVAR_COLUNA_CREDOR
                                        ? `
                                <th class="mv-credor">Credor</th>`
                                        : ''
                                }
                                <th class="mv-unidades">
                                    Carga / Unidade(s) aberta(s)
                                </th>
                                <th class="mv-resultado">
                                    Diretoria
                                </th>
                                <th class="mv-sinalizacao">
                                    Sinalização (em desenvolvimento 👷‍♂️🔧)
                                </th>
                                <th class="mv-desde-gerencia">
                                    Em DF/DF-PO desde
                                </th>
                                <th class="mv-tempo-gerencia">
                                    Tempo em DF/DF-PO
                                </th>
                                <th class="mv-desde-circuito">
                                    Em unidade da DF desde
                                </th>
                                <th class="mv-tempo-circuito">
                                    Em trabalho por (circuito DF)
                                </th>
                            </tr>
                        </thead>

                        <tbody id="mv-resultados-slip-final"></tbody>
                    </table>
                    </div>

                    <div class="mv-separador-tabelas"></div>

                    <div class="mv-secao-relatorio mv-secao-arquivamento">
                        <div class="mv-secao-titulo mv-secao-titulo-arquivamento">
                            🗂️ Arquivamento provável —
                            <span id="mv-total-arquivamento">0</span>
                        </div>

                        <table>
                        <thead>
                            <tr class="mv-linha-grupos">
                                <th
                                    class="mv-grupo-vazio"
                                    colspan="${ATIVAR_COLUNA_CREDOR ? 6 : 5}"
                                ></th>
                                <th
                                    class="mv-grupo-tempo"
                                    colspan="2"
                                >
                                    Execução
                                </th>
                                <th
                                    class="mv-grupo-tempo"
                                    colspan="2"
                                >
                                    Diretoria Financeira
                                </th>
                            </tr>
                            <tr class="mv-linha-cabecalhos">
                                <th class="mv-n">#</th>
                                <th class="mv-processo">
                                    Processo
                                </th>
                                ${
                                    ATIVAR_COLUNA_CREDOR
                                        ? `
                                <th class="mv-credor">
                                    Credor
                                </th>`
                                        : ''
                                }
                                <th class="mv-unidades">
                                    Carga / Unidade(s) aberta(s)
                                </th>
                                <th class="mv-resultado">
                                    Diretoria
                                </th>
                                <th class="mv-sinalizacao">
                                    Sinalização (em desenvolvimento 👷‍♂️🔧)
                                </th>
                                <th class="mv-desde-gerencia">
                                    Em DF/DF-PO desde
                                </th>
                                <th class="mv-tempo-gerencia">
                                    Tempo em DF/DF-PO
                                </th>
                                <th class="mv-desde-circuito">
                                    Em unidade da DF desde
                                </th>
                                <th class="mv-tempo-circuito">
                                    Em trabalho por (circuito DF)
                                </th>
                            </tr>
                        </thead>

                        <tbody id="mv-resultados-arquivamento"></tbody>
                    </table>
                    </div>

                    <div class="mv-separador-tabelas"></div>

                    <div class="mv-secao-relatorio mv-secao-fora-grupo-dfpo">
                        <div class="mv-secao-titulo mv-secao-titulo-fora-grupo-dfpo">
                            Fora do grupo de acompanhamento selecionado. Aberto em DF-PO —
                            <span id="mv-total-fora-grupo-dfpo">0</span>
                        </div>

                        <table>
                        <thead>
                            <tr class="mv-linha-grupos">
                                <th
                                    class="mv-grupo-vazio"
                                    colspan="${ATIVAR_COLUNA_CREDOR ? 6 : 5}"
                                ></th>
                                <th
                                    class="mv-grupo-tempo"
                                    colspan="2"
                                >
                                    Execução
                                </th>
                                <th
                                    class="mv-grupo-tempo"
                                    colspan="2"
                                >
                                    Diretoria Financeira
                                </th>
                            </tr>
                            <tr class="mv-linha-cabecalhos">
                                <th class="mv-n">#</th>
                                <th class="mv-processo">
                                    Processo
                                </th>
                                ${
                                    ATIVAR_COLUNA_CREDOR
                                        ? `
                                <th class="mv-credor">
                                    Credor
                                </th>`
                                        : ''
                                }
                                <th class="mv-unidades">
                                    Carga / Unidade(s) aberta(s)
                                </th>
                                <th class="mv-resultado">
                                    Diretoria
                                </th>
                                <th class="mv-sinalizacao">
                                    Sinalização (em desenvolvimento 👷‍♂️🔧)
                                </th>
                                <th class="mv-desde-gerencia">
                                    Em DF/DF-PO desde
                                </th>
                                <th class="mv-tempo-gerencia">
                                    Tempo em DF/DF-PO
                                </th>
                                <th class="mv-desde-circuito">
                                    Em unidade da DF desde
                                </th>
                                <th class="mv-tempo-circuito">
                                    Em trabalho por (circuito DF)
                                </th>
                            </tr>
                        </thead>

                        <tbody id="mv-resultados-fora-grupo-dfpo"></tbody>
                    </table>
                    </div>
                </div>

                <div class="mv-rodape">
                    <button
                        type="button"
                        id="mv-interromper"
                    >
                        Interromper
                    </button>

                    <button
                        type="button"
                        id="mv-copiar"
                        disabled
                    >
                        Copiar tabela
                    </button>

                    <button
                        type="button"
                        id="mv-xlsx"
                        class="mv-principal"
                        disabled
                    >
                        Baixar XLSX
                    </button>

                    <button
                        type="button"
                        id="mv-pdf"
                        disabled
                    >
                        🖨️ Imprimir / Salvar PDF
                    </button>

                    <button
                        type="button"
                        id="mv-fechar"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document
            .getElementById('mv-fechar-x')
            ?.addEventListener(
                'click',
                fecharModal
            );

        document
            .getElementById('mv-fechar')
            ?.addEventListener(
                'click',
                fecharModal
            );

        document
            .getElementById('mv-interromper')
            ?.addEventListener(
                'click',
                () => {
                    cancelado = true;

                    atualizarStatus(
                        'Interrompendo após o processo atual...'
                    );
                }
            );

        document
            .getElementById('mv-copiar')
            ?.addEventListener(
                'click',
                copiarTabela
            );

        document
            .getElementById('mv-xlsx')
            ?.addEventListener(
                'click',
                baixarXLSX
            );

        document
            .getElementById('mv-pdf')
            ?.addEventListener(
                'click',
                imprimirRelatorio
            );
    }

    function sinalizacaoComDiagnostico(
        valor
    ) {
        const texto =
            limpar(
                String(valor || '')
            );

        if (
            !texto ||
            texto === '—' ||
            texto === '-'
        ) {
            return (
                'Caso externo ao dicionário. Contactar administrador.'
            );
        }

        /*
         * Arquivamento, inclusive enriquecido com NE/FR, já é um
         * diagnóstico completo. Nunca deve receber o fallback
         * "Caso externo a experiência".
         */
        if (
            normalizar(
                texto
            ).startsWith(
                normalizar(
                    'Arquivamento provável'
                )
            )
        ) {
            return texto;
        }

        const partes =
            texto
                .split(' · ')
                .map(limpar)
                .filter(Boolean);

        if (partes.length > 1) {
            return [
                ...partes,
                'Caso externo ao dicionário. Contactar administrador.'
            ].join(' · ');
        }

        return texto;
    }

    /*
     * COR DAS 3 CÉLULAS — v9.9.109
     *
     * A compactação do texto na v9.9.108 retirou a expressão
     * "correspondência NE", usada por uma regra visual antiga.
     * A detecção passa a usar a estrutura Pendente + NE + FR,
     * e a célula de Sinalização recebe explicitamente a mesma
     * classe visual de Carga/Unidade e Diretoria.
     */

    /*
     * REPASSE EM FASE FINAL / TESOURARIA — v9.9.137
     *
     * Roteamento exclusivamente visual.
     * O status original NÃO é alterado.
     *
     * Somente o status EXATO abaixo entra no bloco verde:
     * "SLIP localizada — possível repasse à Tesouraria"
     *
     * "SLIP provável..." e outros estados continuam nas tabelas normais.
     */
    function ehSlipLocalizadaFaseFinal(
        texto
    ) {
        return normalizar(
            texto || ''
        ) ===
            normalizar(
                'SLIP localizada — possível repasse à Tesouraria'
            );
    }

    function adicionarLinha(
        resultado,
        indice
    ) {
        const sinalizacaoExibida =
            sinalizacaoComDiagnostico(
                resultado.sinalizacao
            );

        const ehArquivamentoProvavel =
            normalizar(
                sinalizacaoExibida
            ).startsWith(
                normalizar(
                    'Arquivamento provável'
                )
            );

        const ehSlipFaseFinal =
            ehSlipLocalizadaFaseFinal(
                sinalizacaoExibida
            );

        const foraGrupoAbertoDfpo =
            Boolean(
                resultado.foraGrupoSelecionado &&
                resultado.abertoDfpo
            );

        const idTabelaDestino =
            foraGrupoAbertoDfpo
                ? 'mv-resultados-fora-grupo-dfpo'
                : ehArquivamentoProvavel
                    ? 'mv-resultados-arquivamento'
                    : ehSlipFaseFinal
                        ? 'mv-resultados-slip-final'
                        : resultado.abertoDfpo
                            ? 'mv-resultados-dfpo'
                            : 'mv-resultados-outros-ativos';

        const tbody =
            document.getElementById(
                idTabelaDestino
            );

        if (!tbody) {
            return;
        }

        const linha =
            document.createElement('tr');

        const classe =
            resultado.situacao === 'Erro'
                ? 'mv-erro'
                : resultado.situacao ===
                    'Sem unidade aberta'
                    ? 'mv-sem-unidade'
                    : resultado.abertoFazenda
                        ? 'mv-fazenda'
                        : resultado.abertoDf
                            ? 'mv-df'
                            : resultado.abertoIon
                                ? 'mv-ion'
                                : resultado.abertoDfpo
                                    ? 'mv-aberto'
                                    : 'mv-fora';

        linha.innerHTML = `
            <td class="mv-n"></td>
            <td class="mv-processo"></td>
            ${
                ATIVAR_COLUNA_CREDOR
                    ? '<td class="mv-credor"></td>'
                    : ''
            }
            <td class="mv-unidades"></td>
            <td class="${classe} mv-diretoria-celula"></td>
            <td class="mv-sinalizacao-celula"></td>
            <td class="mv-desde-gerencia"></td>
            <td class="mv-tempo-gerencia"></td>
            <td class="mv-desde-circuito"></td>
            <td class="mv-tempo-circuito"></td>
        `;

        /*
         * NUMERAÇÃO LOCAL POR TABELA — v9.9.143
         *
         * Cada tabela do modal começa em 1 e segue sua própria sequência.
         * A linha ainda não foi anexada ao tbody, então o próximo número
         * é a quantidade atual de linhas daquela tabela + 1.
         */
        linha.querySelector(
            '.mv-n'
        ).textContent =
            String(
                tbody.children.length + 1
            );

        const link =
            document.createElement('a');

        link.href = resultado.url;
        link.target = '_blank';
        link.textContent =
            resultado.processo;

        linha.querySelector(
            '.mv-processo'
        ).appendChild(
            link
        );

        if (
            ATIVAR_COLUNA_CREDOR
        ) {
            const celulaCredor =
                linha.querySelector(
                    '.mv-credor'
                );

            if (celulaCredor) {
                celulaCredor.textContent =
                    resultado.credor || '—';

                if (
                    resultado.credorOrigem
                ) {
                    celulaCredor.title =
                        resultado.credorOrigem;
                }
            }
        }

        const celulaUnidades =
            linha.querySelector(
                '.mv-unidades'
            );

        preencherCelulaUnidades(
            celulaUnidades,
            resultado.unidades ||
                'Concluído em todas unidades'
        );

        const celulaDiretoria =
            linha.querySelector(
                '.mv-diretoria-celula'
            );

        celulaDiretoria.textContent =
            resultado.situacao;

        preencherCelulaSinalizacao(
            linha.querySelector(
                '.mv-sinalizacao-celula'
            ),
            sinalizacaoExibida
        );

        linha.querySelector(
            '.mv-desde-gerencia'
        ).textContent =
            resultado.desdeDfDfpo || '—';

        linha.querySelector(
            '.mv-tempo-gerencia'
        ).textContent =
            resultado.tempoDfDfpo || '—';

        linha.querySelector(
            '.mv-desde-circuito'
        ).textContent =
            resultado.desdeDfpo || '—';

        linha.querySelector(
            '.mv-tempo-circuito'
        ).textContent =
            resultado.tempoDfpo || '—';

        aplicarCorResultadoPelaSinalizacao(
            celulaDiretoria,
            sinalizacaoExibida
        );

        aplicarCorResultadoPelaSinalizacao(
            celulaUnidades,
            sinalizacaoExibida
        );

        /*
         * v9.9.109:
         * preserva o padrão visual de 3 células coloridas:
         * Carga/Unidade + Diretoria + Sinalização.
         */
        aplicarCorResultadoPelaSinalizacao(
            linha.querySelector(
                '.mv-sinalizacao-celula'
            ),
            sinalizacaoExibida
        );

        if (resultado.eventoAberturaDfDfpo) {
            linha.querySelector(
                '.mv-desde-gerencia'
            ).title =
                resultado.eventoAberturaDfDfpo;
        }

        if (resultado.eventoAbertura) {
            linha.querySelector(
                '.mv-desde-circuito'
            ).title =
                resultado.eventoAbertura;
        }

        if (resultado.detalhe) {
            linha.title =
                resultado.detalhe;
        }

        if (
            normalizar(
                resultado.sinalizacao || ''
            ).includes(
                normalizar(
                    'Fluxo sem dicionário (>7 dias ⚠️)'
                )
            )
        ) {
            linha.classList.add(
                'mv-linha-complexidade'
            );
        }

        if (
            String(resultado.sinalizacao || '')
                .startsWith('⚠')
        ) {
            linha.children[6].classList.add(
                'mv-sinalizacao-alerta'
            );
        } else if (
            String(resultado.sinalizacao || '')
                .includes('SLIP')
        ) {
            linha.children[6].classList.add(
                'mv-sinalizacao-slip'
            );
        }

        if (resultado.eventoAberturaDfDfpo) {
            linha.children[5].title =
                resultado.eventoAberturaDfDfpo;
        }

        if (resultado.eventoAbertura) {
            linha.children[7].title =
                resultado.eventoAbertura;
        }

        if (resultado.detalhe) {
            linha.children[5].title =
                resultado.detalhe;
        }

        tbody.appendChild(linha);

        const totalDfpo =
            document.getElementById(
                'mv-resultados-dfpo'
            )?.children.length || 0;

        const totalOutrosAtivos =
            document.getElementById(
                'mv-resultados-outros-ativos'
            )?.children.length || 0;

        const totalSlipFinal =
            document.getElementById(
                'mv-resultados-slip-final'
            )?.children.length || 0;

        const totalArquivamento =
            document.getElementById(
                'mv-resultados-arquivamento'
            )?.children.length || 0;

        const totalForaGrupoDfpo =
            document.getElementById(
                'mv-resultados-fora-grupo-dfpo'
            )?.children.length || 0;

        const contadorDfpo =
            document.getElementById(
                'mv-total-dfpo'
            );

        const contadorOutrosAtivos =
            document.getElementById(
                'mv-total-outros-ativos'
            );

        const contadorSlipFinal =
            document.getElementById(
                'mv-total-slip-final'
            );

        const contadorArquivamento =
            document.getElementById(
                'mv-total-arquivamento'
            );

        const contadorForaGrupoDfpo =
            document.getElementById(
                'mv-total-fora-grupo-dfpo'
            );

        if (contadorDfpo) {
            contadorDfpo.textContent =
                String(totalDfpo);
        }

        if (contadorOutrosAtivos) {
            contadorOutrosAtivos.textContent =
                String(totalOutrosAtivos);
        }

        if (contadorSlipFinal) {
            contadorSlipFinal.textContent =
                String(totalSlipFinal);
        }

        if (contadorArquivamento) {
            contadorArquivamento.textContent =
                String(totalArquivamento);
        }

        if (contadorForaGrupoDfpo) {
            contadorForaGrupoDfpo.textContent =
                String(totalForaGrupoDfpo);
        }
    }

    /*
     * ESCOPO DAS CORES — v9.9.112
     *
     * As cores operacionais ficam restritas às três colunas:
     * - Carga / Unidade(s) aberta(s)
     * - Diretoria
     * - Sinalização
     *
     * Não colorir Processo, Credor ou as quatro colunas de tempo.
     */

    /*
     * PROVIDÊNCIA NA ÁREA TÉCNICA — v9.9.120
     * Cor abóbora (#E67E22) nas 3 colunas operacionais.
     */

    function aplicarCorResultadoPelaSinalizacao(
        celula,
        textoSinalizacao
    ) {
        if (!celula) {
            return;
        }

        celula.classList.remove(
            'mv-resultado-slip',
            'mv-resultado-alerta',
            'mv-resultado-trm',
            'mv-resultado-aci',
            'mv-resultado-aci-smf',
            'mv-resultado-fazenda-trabalho',
            'mv-resultado-pre-aci',
            'mv-resultado-despachar-aliquota',
            'mv-resultado-pendente-nao-repasse',
            'mv-resultado-pendente-nao-repasse-atrasado',
            'mv-resultado-ressarcimento-pdf',
            'mv-resultado-providencia-tecnica'
        );

        const texto =
            normalizar(
                textoSinalizacao || ''
            );

        if (
            texto.includes(
                normalizar(
                    'Provável Ressarcimento ou PDF sem dicionário'
                )
            )
        ) {
            celula.classList.add(
                'mv-resultado-ressarcimento-pdf'
            );
        } else if (
            texto.includes(
                normalizar(
                    'Pendente — folha/DARF (INSS + IRRF) - Valor expressivo'
                )
            )
        ) {
            celula.classList.add(
                'mv-resultado-pendente-nao-repasse-atrasado'
            );
        } else if (
            texto.includes(
                normalizar(
                    'Pendente —'
                )
            ) &&
            texto.includes(
                normalizar(
                    'NE '
                )
            ) &&
            texto.includes(
                normalizar(
                    'FR '
                )
            ) &&
            texto.includes(
                normalizar(
                    '⚠️'
                )
            )
        ) {
            celula.classList.add(
                'mv-resultado-pendente-nao-repasse-atrasado'
            );
        } else if (
            texto.includes(
                normalizar(
                    'Pendente —'
                )
            ) &&
            texto.includes(
                normalizar(
                    'NE '
                )
            ) &&
            texto.includes(
                normalizar(
                    'FR '
                )
            )
        ) {
            celula.classList.add(
                'mv-resultado-pendente-nao-repasse'
            );
        } else if (
            texto.includes(
                normalizar(
                    'Pré-ACI: NL, Ofício, TRM, assinaturas'
                )
            )
        ) {
            celula.classList.add(
                'mv-resultado-pre-aci'
            );
        } else if (
            texto.includes(
                normalizar(
                    'Despachar para aferir alíquota'
                )
            ) ||
            texto.includes(
                normalizar(
                    'Retomar aferição'
                )
            )
        ) {
            celula.classList.add(
                'mv-resultado-despachar-aliquota'
            );
        } else if (
            texto.includes(
                normalizar(
                    'Caso externo ao dicionário. Contactar administrador.'
                )
            ) ||
            texto.includes(
                normalizar(
                    'Provável Ressarcimento'
                )
            ) ||
            texto.includes(
                normalizar(
                    'Pagamento de restituição ou Pedido de contratação de Reajuste'
                )
            )
        ) {
            celula.classList.add(
                'mv-resultado-aci'
            );
        } else if (
            texto.includes(
                normalizar(
                    'SLIP localizada'
                )
            ) ||
            texto.includes(
                normalizar(
                    'SLIP provável'
                )
            ) ||
            texto.includes(
                normalizar(
                    'Palavra "pagamento/comprovante" identificada. Pagamento provável'
                )
            )
        ) {
            celula.classList.add(
                'mv-resultado-slip'
            );
        } else if (
            texto.includes(
                normalizar(
                    'Medição zerada'
                )
            ) ||
            texto.includes(
                normalizar(
                    'Provavelmente ACI indicou envio à SMF'
                )
            ) ||
            texto.includes(
                normalizar(
                    'trâmite ORG/FIN/TESOURARIA'
                )
            )
        ) {
            celula.classList.add(
                'mv-resultado-aci-smf'
            );
        } else if (
            texto.includes(
                normalizar(
                    'Providência na área técnica'
                )
            )
        ) {
            celula.classList.add(
                'mv-resultado-providencia-tecnica'
            );
        } else if (
            texto.includes(
                normalizar(
                    'Na ACI'
                )
            )
        ) {
            celula.classList.add(
                'mv-resultado-aci'
            );
        } else if (
            texto.includes(
                normalizar(
                    'Retorno da Fazenda'
                )
            ) ||
            texto.includes(
                normalizar(
                    'Pagamento pendente (<7 dias)'
                )
            )
        ) {
            celula.classList.add(
                'mv-resultado-alerta'
            );
        } else if (
            texto.includes(
                normalizar(
                    'Concluído sem comprovante de pagamento'
                )
            ) ||
            texto.includes(
                normalizar(
                    'Pagamento pendente'
                )
            ) ||
            texto.includes(
                normalizar(
                    'Cumprindo TRM'
                )
            ) ||
            texto.includes(
                normalizar(
                    'Capa impressa, sem movimento a +7 dias'
                )
            )
        ) {
            celula.classList.add(
                'mv-resultado-trm'
            );
        } else if (
            texto.includes(
                normalizar(
                    'Despachar para aferir alíquota'
                )
            ) ||
            texto.includes(
                normalizar(
                    'Aferindo alíquota'
                )
            ) ||
            texto.includes(
                normalizar(
                    'Aferir alíquota'
                )
            ) ||
            texto.includes(
                normalizar(
                    'Na fazenda sendo trabalhado'
                )
            )
        ) {
            celula.classList.add(
                'mv-resultado-fazenda-trabalho'
            );
        }
    }

    function preencherCelulaSinalizacao(
        celula,
        textoSinalizacao
    ) {
        celula.textContent = '';

        const partes = String(
            textoSinalizacao || '—'
        )
            .split(' · ')
            .map(limpar)
            .filter(Boolean);

        if (!partes.length) {
            celula.textContent = '—';
            return;
        }

        partes.forEach(
            (parte, indice) => {
                if (indice > 0) {
                    celula.appendChild(
                        document.createTextNode(
                            ' · '
                        )
                    );
                }

                const span =
                    document.createElement(
                        'span'
                    );

                span.textContent = parte;

                if (
                    normalizar(parte).includes(
                        normalizar(
                            'Provável Ressarcimento ou PDF sem dicionário'
                        )
                    )
                ) {
                    span.className =
                        'mv-sinal-ressarcimento-pdf';
                } else if (
                    normalizar(parte).includes(
                        normalizar(
                            'Pendente — folha/DARF (INSS + IRRF) - Valor expressivo'
                        )
                    )
                ) {
                    span.className =
                        'mv-sinal-pendente-nao-repasse-atrasado';
                } else if (
                    normalizar(parte).includes(
                        normalizar(
                            'Pendente —'
                        )
                    ) &&
                    normalizar(parte).includes(
                        normalizar(
                            'NE '
                        )
                    ) &&
                    normalizar(parte).includes(
                        normalizar(
                            'FR '
                        )
                    ) &&
                    normalizar(parte).includes(
                        normalizar(
                            '⚠️'
                        )
                    )
                ) {
                    span.className =
                        'mv-sinal-pendente-nao-repasse-atrasado';
                } else if (
                    normalizar(parte).includes(
                        normalizar(
                            'Pendente —'
                        )
                    ) &&
                    normalizar(parte).includes(
                        normalizar(
                            'NE '
                        )
                    ) &&
                    normalizar(parte).includes(
                        normalizar(
                            'FR '
                        )
                    )
                ) {
                    span.className =
                        'mv-sinal-pendente-nao-repasse';
                } else if (
                    normalizar(parte).includes(
                        normalizar(
                            'Pré-ACI: NL, Ofício, TRM, assinaturas'
                        )
                    )
                ) {
                    span.className =
                        'mv-sinal-pre-aci';
                } else if (
                    normalizar(parte).includes(
                        normalizar(
                            'Despachar para aferir alíquota'
                        )
                    ) ||
                    normalizar(parte).includes(
                        normalizar(
                            'Retomar aferição'
                        )
                    )
                ) {
                    span.className =
                        'mv-sinal-despachar-aliquota';
                } else if (
                    normalizar(parte) ===
                    normalizar(
                        'Caso externo ao dicionário. Contactar administrador.'
                    ) ||
                    normalizar(parte).includes(
                        normalizar(
                            'Provável Ressarcimento'
                        )
                    ) ||
                    normalizar(parte).includes(
                        normalizar(
                            'Na ACI, 1ª tentativa de TRM'
                        )
                    )
                ) {
                    span.className =
                        'mv-sinal-diagnostico';
                } else if (
                    normalizar(parte).includes(
                        normalizar(
                            'Providência na área técnica'
                        )
                    )
                ) {
                    span.className =
                        'mv-sinal-providencia-tecnica';
                } else if (
                    normalizar(parte) ===
                    normalizar(
                        'Pagamento pendente (<7 dias)'
                    )
                ) {
                    span.className =
                        'mv-sinal-alerta';
                } else if (
                    normalizar(parte).includes(
                        normalizar(
                            'Concluído sem comprovante de pagamento'
                        )
                    ) ||
                    normalizar(parte).startsWith(
                        normalizar('Pagamento pendente')
                    ) ||
                    normalizar(parte) ===
                    normalizar('Cumprindo TRM') ||
                    normalizar(parte).includes(
                        normalizar(
                            'Capa impressa, sem movimento a +7 dias'
                        )
                    )
                ) {
                    span.className =
                        'mv-sinal-trm';
                } else if (
                    normalizar(parte).includes(
                        normalizar(
                            'Na ACI, 1ª tentativa de TRM'
                        )
                    ) ||
                    normalizar(parte).includes(
                        normalizar(
                            'Na ACI. Mais de 1 TRM na Árvore'
                        )
                    )
                ) {
                    span.className =
                        'mv-sinal-aci';
                } else if (
                    normalizar(parte).includes(
                        normalizar(
                            'Medição zerada'
                        )
                    ) ||
                    normalizar(parte).includes(
                        normalizar(
                            'Provavelmente ACI indicou envio à SMF'
                        )
                    ) ||
                    normalizar(parte).includes(
                        normalizar(
                            'trâmite ORG/FIN/TESOURARIA'
                        )
                    )
                ) {
                    span.className =
                        'mv-sinal-aci-smf';
                } else if (
                    normalizar(parte).includes(
                        normalizar(
                            'Provavelmente ACI indicou envio à SMF'
                        )
                    )
                ) {
                    span.className =
                        'mv-sinal-presidencia';
                } else if (
                    normalizar(parte) ===
                    normalizar(
                        'Despachar para aferir alíquota'
                    ) ||
                    normalizar(parte) ===
                    normalizar(
                        'Aferindo alíquota'
                    ) ||
                    normalizar(parte) ===
                    normalizar(
                        'Aferir alíquota'
                    ) ||
                    normalizar(parte).includes(
                        normalizar(
                            'Na fazenda sendo trabalhado'
                        )
                    )
                ) {
                    span.className =
                        'mv-sinal-fazenda-trabalho';
                } else if (
                    parte.startsWith('⚠')
                ) {
                    span.className =
                        'mv-sinal-alerta';
                } else if (
                    normalizar(parte).includes(
                        normalizar('SLIP localizada')
                    ) ||
                    normalizar(parte).includes(
                        normalizar('SLIP provável pois há uma peça SMF com palavra pagamento')
                    ) ||
                    normalizar(parte).includes(
                        normalizar(
                            'Palavra "pagamento/comprovante" identificada. Pagamento provável'
                        )
                    )
                ) {
                    span.className =
                        'mv-sinal-slip';
                }

                celula.appendChild(span);
            }
        );
    }

    function atualizarProgresso(
        atual,
        total
    ) {
        const percentual = total
            ? Math.round(
                (atual / total) * 100
            )
            : 0;

        const contador =
            document.getElementById(
                'mv-contador'
            );

        const barra =
            document.getElementById(
                'mv-barra'
            );

        if (contador) {
            contador.textContent =
                `${atual} de ${total} — ${percentual}%`;
        }

        if (barra) {
            barra.style.width =
                `${percentual}%`;
        }
    }

    function atualizarStatus(texto) {
        const el =
            document.getElementById(
                'mv-status'
            );

        if (el) {
            el.textContent = texto;
        }
    }

    function habilitarBotoes() {
        const temDados =
            resultados.length > 0;

        for (
            const id of [
                'mv-copiar',
                'mv-xlsx',
                'mv-pdf'
            ]
        ) {
            const botao =
                document.getElementById(id);

            if (botao) {
                botao.disabled = !temDados;
            }
        }

        const interromper =
            document.getElementById(
                'mv-interromper'
            );

        if (interromper) {
            interromper.disabled = true;
        }
    }

    function linhasExportacao(
        incluirLink = false
    ) {
        const cabecalho = [
            'Processo',
            ...(ATIVAR_COLUNA_CREDOR
                ? ['Credor']
                : []),
            'Carga / Unidade(s) aberta(s)',
            'Diretoria',
            'Sinalização (em desenvolvimento 👷‍♂️🔧)',
            'Aberto na DF-PO',
            'Em DF/DF-PO desde',
            'Tempo em DF/DF-PO',
            'Em unidade da DF desde',
            'Em trabalho por (circuito DF)',
            'Evento de abertura do circuito DF',
            'Detalhe'
        ];

        if (incluirLink) {
            cabecalho.splice(
                1,
                0,
                'Nome do processo'
            );

            cabecalho.push('Link');
        }

        const linhas =
            resultados.map(item => {
                const linha = [
                    item.processo,
                    ...(ATIVAR_COLUNA_CREDOR
                        ? [item.credor || '—']
                        : []),
                    item.unidades.replace(
                        /\n/g,
                        ' | '
                    ),
                    item.situacao,
                    sinalizacaoComDiagnostico(
                        item.sinalizacao
                    ),
                    item.abertoDfpo
                        ? 'Sim'
                        : 'Não',
                    item.desdeDfDfpo,
                    item.tempoDfDfpo,
                    item.desdeDfpo,
                    item.tempoDfpo,
                    item.eventoAbertura,
                    item.detalhe
                ];

                if (incluirLink) {
                    linha.splice(
                        1,
                        0,
                        item.nomeProcesso || ''
                    );

                    linha.push(item.url);
                }

                return linha;
            });

        return [
            cabecalho,
            ...linhas
        ];
    }

    async function copiarTabela() {
        const texto =
            linhasExportacao()
                .map(
                    linha =>
                        linha.join('\t')
                )
                .join('\n');

        try {
            await navigator.clipboard
                .writeText(texto);
        } catch (_) {
            const area =
                document.createElement(
                    'textarea'
                );

            area.value = texto;
            area.style.position = 'fixed';
            area.style.left = '-10000px';

            document.body.appendChild(area);

            area.select();
            document.execCommand('copy');
            area.remove();
        }

        atualizarStatus(
            'Tabela copiada. Você pode colar diretamente no Excel.'
        );
    }

    let promessaSheetJs = null;

    function carregarSheetJsSobDemanda() {
        if (
            typeof XLSX !== 'undefined' &&
            XLSX?.utils
        ) {
            return Promise.resolve();
        }

        if (promessaSheetJs) {
            return promessaSheetJs;
        }

        promessaSheetJs =
            new Promise(
                (resolve, reject) => {
                    const script =
                        document.createElement(
                            'script'
                        );

                    script.src =
                        'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js';

                    script.async = true;

                    script.onload = () => {
                        if (
                            typeof XLSX !== 'undefined' &&
                            XLSX?.utils
                        ) {
                            resolve();
                            return;
                        }

                        reject(
                            new Error(
                                'SheetJS carregou, mas XLSX não ficou disponível.'
                            )
                        );
                    };

                    script.onerror = () => {
                        reject(
                            new Error(
                                'Falha ao carregar SheetJS.'
                            )
                        );
                    };

                    /*
                     * Só entra no DOM no momento do clique.
                     * Antes disso, a tela do SEI permanece intocada.
                     */
                    document.head.appendChild(
                        script
                    );
                }
            )
                .catch(erro => {
                    promessaSheetJs = null;
                    throw erro;
                });

        return promessaSheetJs;
    }


    async function baixarXLSX() {
        atualizarStatus(
            'Carregando gerador XLSX...'
        );

        try {
            await carregarSheetJsSobDemanda();
        } catch (erro) {
            console.error(
                '[SEI][XLSX] Falha ao carregar SheetJS:',
                erro
            );

            atualizarStatus(
                'Não foi possível carregar o gerador XLSX.'
            );

            alert(
                'Não foi possível carregar o gerador XLSX.\n\n' +
                'A tela do SEI não foi alterada. Tente novamente.'
            );

            return;
        }

        const linhas =
            linhasExportacao(true);

        const planilha =
            XLSX.utils.aoa_to_sheet(
                linhas
            );

        planilha['!cols'] = [
            { wch: 25 }, // Processo
            { wch: 55 }, // Nome do processo
            ...(ATIVAR_COLUNA_CREDOR
                ? [{ wch: 45 }] // Credor
                : []),
            { wch: 32 }, // Carga / unidades
            { wch: 22 }, // Diretoria
            { wch: 58 }, // Sinalização
            { wch: 15 }, // Aberto DF-PO
            { wch: 22 }, // Em DF/DF-PO desde
            { wch: 20 }, // Tempo em DF/DF-PO
            { wch: 22 }, // Em unidade da DF desde
            { wch: 22 }, // Em trabalho por (circuito DF)
            { wch: 48 }, // Evento do circuito DF
            { wch: 65 }, // Detalhe
            { wch: 70 }  // Link
        ];

        if (planilha['!ref']) {
            planilha['!autofilter'] = {
                ref: planilha['!ref']
            };
        }

        const indiceLink =
            linhas[0].indexOf(
                'Link'
            );

        if (indiceLink >= 0) {
            for (
                let linha = 1;
                linha < linhas.length;
                linha++
            ) {
                const endereco =
                    XLSX.utils.encode_cell({
                        r: linha,
                        c: indiceLink
                    });

                const url =
                    String(
                        linhas[linha][indiceLink] || ''
                    );

                if (
                    planilha[endereco] &&
                    url
                ) {
                    planilha[endereco].l = {
                        Target: url,
                        Tooltip:
                            'Abrir processo no SEI'
                    };
                }
            }
        }

        const arquivo =
            XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            arquivo,
            planilha,
            'Relatório SEI'
        );

        const agora =
            new Date();

        const nomeArquivo =
            `SEI_Unidades_Tempo_DFPO_` +
            `${agora.getFullYear()}` +
            `${String(
                agora.getMonth() + 1
            ).padStart(2, '0')}` +
            `${String(
                agora.getDate()
            ).padStart(2, '0')}_` +
            `${String(
                agora.getHours()
            ).padStart(2, '0')}` +
            `${String(
                agora.getMinutes()
            ).padStart(2, '0')}.xlsx`;

        XLSX.writeFile(
            arquivo,
            nomeArquivo,
            {
                compression: true
            }
        );

        atualizarStatus(
            'Planilha XLSX gerada.'
        );
    }

    function classeResultadoPelaSinalizacao(
        textoSinalizacao
    ) {
        const texto =
            normalizar(
                textoSinalizacao || ''
            );

        if (
            texto.includes(
                normalizar(
                    'Provável Ressarcimento ou PDF sem dicionário'
                )
            )
        ) {
            return 'resultado-ressarcimento-pdf';
        }

        if (
            texto.includes(
                normalizar(
                    'Pendente — folha/DARF (INSS + IRRF) - Valor expressivo'
                )
            )
        ) {
            return 'resultado-pendente-nao-repasse-atrasado';
        }

        if (
            texto.includes(
                normalizar(
                    'Pendente —'
                )
            ) &&
            texto.includes(
                normalizar(
                    '⚠️'
                )
            )
        ) {
            return 'resultado-pendente-nao-repasse-atrasado';
        }

        if (
            texto.includes(
                normalizar(
                    'Pendente —'
                )
            )
        ) {
            return 'resultado-pendente-nao-repasse';
        }

        if (
            texto.includes(
                normalizar(
                    'Pré-ACI: NL, Ofício, TRM, assinaturas'
                )
            )
        ) {
            return 'resultado-pre-aci';
        }

        if (
            texto.includes(
                normalizar(
                    'Despachar para aferir alíquota'
                )
            ) ||
            texto.includes(
                normalizar(
                    'Retomar aferição'
                )
            )
        ) {
            return 'resultado-despachar-aliquota';
        }

        if (
            texto.includes(
                normalizar(
                    'Providência na área técnica'
                )
            )
        ) {
            return 'resultado-providencia-tecnica';
        }

        if (
            texto.includes(
                normalizar(
                    'Caso externo ao dicionário. Contactar administrador.'
                )
            ) ||
            texto.includes(
                normalizar(
                    'Provável Ressarcimento'
                )
            ) ||
            texto.includes(
                normalizar(
                    'Na ACI'
                )
            )
        ) {
            return 'resultado-aci';
        }

        if (
            texto.includes(
                normalizar(
                    'SLIP localizada'
                )
            ) ||
            texto.includes(
                normalizar(
                    'SLIP provável'
                )
            ) ||
            texto.includes(
                normalizar(
                    'Palavra "pagamento/comprovante" identificada. Pagamento provável'
                )
            )
        ) {
            return 'resultado-slip';
        }

        if (
            texto.includes(
                normalizar(
                    'Medição zerada'
                )
            ) ||
            texto.includes(
                normalizar(
                    'Provavelmente ACI indicou envio à SMF'
                )
            ) ||
            texto.includes(
                normalizar(
                    'trâmite ORG/FIN/TESOURARIA'
                )
            )
        ) {
            return 'resultado-aci-smf';
        }

        if (
            texto.includes(
                normalizar(
                    'Na ACI'
                )
            )
        ) {
            return 'resultado-aci';
        }

        if (
            texto.includes(
                normalizar(
                    'Retorno da Fazenda'
                )
            ) ||
            texto.includes(
                normalizar(
                    'Pagamento pendente (<7 dias)'
                )
            )
        ) {
            return 'resultado-alerta';
        }

        if (
            texto.includes(
                normalizar(
                    'Concluído sem comprovante de pagamento'
                )
            ) ||
            texto.includes(
                normalizar(
                    'Pagamento pendente'
                )
            ) ||
            texto.includes(
                normalizar(
                    'Cumprindo TRM'
                )
            ) ||
            texto.includes(
                normalizar(
                    'Capa impressa, sem movimento a +7 dias'
                )
            )
        ) {
            return 'resultado-trm';
        }

        if (
            texto.includes(
                normalizar(
                    'Despachar para aferir alíquota'
                )
            ) ||
            texto.includes(
                normalizar(
                    'Aferindo alíquota'
                )
            ) ||
            texto.includes(
                normalizar(
                    'Aferir alíquota'
                )
            ) ||
            texto.includes(
                normalizar(
                    'Na fazenda sendo trabalhado'
                )
            )
        ) {
            return 'resultado-fazenda-trabalho';
        }

        return '';
    }

    function imprimirRelatorio() {
        /*
         * PDF OPERACIONAL — v9.9.125
         *
         * O XLSX continua exportando TODOS os resultados.
         * O PDF, por ser um relatório de trabalho, exclui linhas cujo
         * diagnóstico final começa por "Arquivamento provável".
         */
        const resultadosAtivosPdf =
            resultados.filter(
                item =>
                    !item.foraGrupoSelecionado &&
                    !normalizar(
                        sinalizacaoComDiagnostico(
                            item.sinalizacao
                        )
                    ).startsWith(
                        normalizar(
                            'Arquivamento provável'
                        )
                    )
            );

        if (!resultadosAtivosPdf.length) {
            alert(
                'Não há processos ativos para imprimir no PDF.'
            );
            return;
        }

        const janela = window.open(
            '',
            '_blank',
            'width=1400,height=900'
        );

        if (!janela) {
            alert(
                'O navegador bloqueou a janela de impressão.\n\n' +
                'Permita pop-ups para o SEI e tente novamente.'
            );
            return;
        }

        const agora = new Date();

        const totalDfpo =
            resultadosAtivosPdf.filter(
                item => item.abertoDfpo
            ).length;

        const totalFora =
            resultadosAtivosPdf.filter(
                item =>
                    !item.abertoDfpo &&
                    item.situacao !== 'Erro'
            ).length;

        const totalErros =
            resultadosAtivosPdf.filter(
                item =>
                    item.situacao === 'Erro'
            ).length;

        /*
         * PDF dividido em duas tabelas ativas — v9.9.127
         *
         * 1. Ativos em DF-PO
         * 2. Ativos fora da DF-PO
         *
         * Arquivamentos prováveis continuam excluídos do PDF.
         */
        const resultadosPdfSlipFinal =
            resultadosAtivosPdf.filter(
                item =>
                    ehSlipLocalizadaFaseFinal(
                        sinalizacaoComDiagnostico(
                            item.sinalizacao
                        )
                    )
            );

        const resultadosPdfDfpo =
            resultadosAtivosPdf.filter(
                item =>
                    !ehSlipLocalizadaFaseFinal(
                        sinalizacaoComDiagnostico(
                            item.sinalizacao
                        )
                    ) &&
                    item.abertoDfpo
            );

        const resultadosPdfForaDfpo =
            resultadosAtivosPdf.filter(
                item =>
                    !ehSlipLocalizadaFaseFinal(
                        sinalizacaoComDiagnostico(
                            item.sinalizacao
                        )
                    ) &&
                    !item.abertoDfpo
            );

        const gerarLinhasPdf =
            lista =>
                lista.map(
                (item, indice) => {
                    /*
                     * Mantém no relatório de impressão as mesmas
                     * categorias e cores exibidas no modal.
                     */
                    const classe =
                        classeResultadoPelaSinalizacao(
                            item.sinalizacao || '—'
                        ) ||
                        (
                            item.situacao === 'Erro'
                                ? 'resultado-erro'
                                : item.situacao ===
                                    'Sem unidade aberta'
                                    ? 'resultado-sem-unidade'
                                    : item.abertoFazenda
                                        ? 'resultado-fazenda'
                                        : item.abertoDf
                                            ? 'resultado-df'
                                            : item.abertoIon
                                                ? 'resultado-ion'
                                                : item.abertoDfpo
                                                    ? 'resultado-aberto'
                                                    : 'resultado-fora'
                        );

                    /*
                     * v9.9.128:
                     * a classe calculada pela sinalização também é aplicada
                     * diretamente à célula PDF de Sinalização. Assim, casos
                     * Pendente + NE/FR + ⚠️ mantêm o vermelho nas mesmas
                     * 3 células operacionais do modal.
                     */

                    const classeLinha =
                        normalizar(
                            item.sinalizacao || ''
                        ).includes(
                            normalizar(
                                'Fluxo sem dicionário (>7 dias ⚠️)'
                            )
                        )
                            ? ' class="linha-complexidade"'
                            : '';

                    return `
                        <tr${classeLinha}>
                            <td class="numero">
                                ${indice + 1}
                            </td>

                            <td class="processo">
                                ${escaparHtml(item.processo)}
                            </td>

                            ${
                                ATIVAR_COLUNA_CREDOR
                                    ? `
                            <td class="credor">
                                ${escaparHtml(
                                    item.credor || '—'
                                )}
                            </td>`
                                    : ''
                            }

                            <td class="pdf-unidades ${classe}">
                                ${formatarUnidadesHtml(
                                    item.unidades ||
                                    'Concluído em todas unidades'
                                )}
                            </td>

                            <td class="pdf-diretoria ${classe}">
                                ${escaparHtml(
                                    item.situacao
                                ).replace(
                                    /\n/g,
                                    '<br>'
                                )}
                            </td>

                            <td class="pdf-sinalizacao ${classe}">
                                ${formatarSinalizacaoHtml(
                                    sinalizacaoComDiagnostico(
                                        item.sinalizacao
                                    )
                                )}
                            </td>

                            <td>
                                ${escaparHtml(
                                    item.desdeDfDfpo || '—'
                                )}
                            </td>

                            <td>
                                ${escaparHtml(
                                    item.tempoDfDfpo || '—'
                                )}
                            </td>

                            <td>
                                ${escaparHtml(
                                    item.desdeDfpo || '—'
                                )}
                            </td>

                            <td>
                                ${escaparHtml(
                                    item.tempoDfpo || '—'
                                )}
                            </td>
                        </tr>
                    `;
                }
                )
                .join('');

        const linhasDfpo =
            gerarLinhasPdf(
                resultadosPdfDfpo
            );

        const linhasForaDfpo =
            gerarLinhasPdf(
                resultadosPdfForaDfpo
            );

        const linhasSlipFinal =
            gerarLinhasPdf(
                resultadosPdfSlipFinal
            );


        const htmlImpressao = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">

    <title>
        Relatório SEI - Unidades abertas e tempo na DF-PO
    </title>

    <style>
        @page {
            size: A4 landscape;
            margin: 10mm 10mm 25mm;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            color: #222;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 8.5pt;
            background: #fff;
        }

        .acoes {
            margin-bottom: 12px;
            text-align: right;
        }

        .acoes button {
            padding: 9px 15px;
            border: 1px solid #176f9f;
            border-radius: 4px;
            background: #176f9f;
            color: white;
            font-weight: bold;
            cursor: pointer;
        }

        .cabecalho {
            margin-bottom: 10px;
            padding: 13px 15px;
            border-radius: 5px;
            background: #176f9f;
            color: white;
        }

        .cabecalho h1 {
            margin: 0 0 4px;
            font-size: 17pt;
        }

        .cabecalho p {
            margin: 0;
        }

        .resumo {
            display: flex;
            gap: 8px;
            margin-bottom: 10px;
        }

        .resumo div {
            flex: 1;
            padding: 8px 10px;
            border: 1px solid #c4d4de;
            border-radius: 4px;
            background: #f4f8fa;
        }

        .resumo strong {
            display: block;
            color: #176f9f;
            font-size: 12pt;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        .bloco-tabela {
            margin-top: 14px;
        }

        .bloco-tabela:first-of-type {
            margin-top: 0;
        }

        .titulo-tabela {
            margin: 0 0 6px;
            padding: 7px 9px;
            border: 1px solid #b6cad6;
            border-radius: 4px;
            background: #eaf3f8;
            color: #176f9f;
            font-size: 11pt;
            font-weight: 700;
        }

        .bloco-tabela-slip-final {
            border: 1px solid #9ccc9c;
            border-radius: 4px;
            padding: 6px;
            background: #f4fbf4;
        }

        .titulo-tabela-slip-final {
            background: #dff2df !important;
            color: #216b2f !important;
            border-color: #9ccc9c !important;
        }


        thead {
            display: table-header-group;
        }

        tr {
            page-break-inside: avoid;
        }

        th {
            padding: 7px 6px;
            border: 1px solid #b6cad6;
            background: #176f9f;
            color: white;
            text-align: left;
        }

        td {
            padding: 7px 6px;
            border: 1px solid #cbd7de;
            vertical-align: top;
            overflow-wrap: anywhere;
            line-height: 1.25;
        }

        tbody tr:nth-child(even) {
            background: #edf4f8;
        }

        tbody tr:nth-child(odd) {
            background: #fff;
        }

        .numero {
            width: 3%;
            text-align: center;
        }

        .processo {
            width: 13%;
            white-space: nowrap;
        }

        .credor {
            width: 18%;
        }

        th:nth-child(3) {
            width: 18%;
        }

        th:nth-child(4) {
            width: 10%;
        }

        th:nth-child(5) {
            width: 10%;
        }

        th:nth-child(6) {
            width: 10%;
        }

        th:nth-child(7) {
            width: 18%;
        }

        th:nth-child(8) {
            width: 9%;
        }

        th:nth-child(9) {
            width: 9%;
        }

        /*
         * Cabeçalhos das quatro colunas de tempo em amarelo pastel.
         */
        th:nth-child(6),
        th:nth-child(7),
        th:nth-child(8),
        th:nth-child(9) {
            background: #FFF2B2;
            color: #5C4A00;
            border-color: #D9C66A;
        }

        tr.linha-complexidade > .pdf-unidades,
        tr.linha-complexidade > .pdf-diretoria,
        tr.linha-complexidade > .pdf-sinalizacao,
        tr.linha-complexidade > .pdf-unidades *,
        tr.linha-complexidade > .pdf-diretoria *,
        tr.linha-complexidade > .pdf-sinalizacao * {
            color: #c62828 !important;
            font-weight: bold !important;
        }

        /*
         * Cores da coluna Resultado iguais às exibidas no modal.
         */
        .resultado-slip {
            color: #00796b !important;
            font-weight: bold;
        }

        .resultado-alerta {
            color: #b26a00 !important;
            font-weight: bold;
        }

        .resultado-ressarcimento-pdf {
            color: #b58a00 !important;
            font-weight: bold;
        }

        .resultado-trm {
            color: #c62828 !important;
            font-weight: bold;
        }

        .resultado-aci {
            color: #6a1b9a !important;
            font-weight: bold;
        }

        .resultado-aci-smf {
            color: #1565c0 !important;
            font-weight: bold;
        }

        .resultado-fazenda-trabalho {
            color: #8d6e00 !important;
            font-weight: bold;
        }

        .resultado-pre-aci {
            color: #FF0049 !important;
            font-weight: bold;
        }

        .resultado-pendente-nao-repasse {
            color: #FF8300 !important;
            font-weight: bold;
        }

        .resultado-pendente-nao-repasse-atrasado {
            color: #c62828 !important;
            font-weight: bold;
        }

        .resultado-despachar-aliquota {
            color: #FF8300 !important;
            font-weight: bold;
        }

        .resultado-providencia-tecnica {
            color: #E67E22 !important;
            font-weight: bold;
        }

        .resultado-aberto {
            color: #136b2d !important;
            font-weight: bold;
        }

        .resultado-df,
        .unidade-dfpo {
            color: #c62828 !important;
            font-weight: bold;
        }

        .resultado-fazenda {
            color: #005a9c !important;
            font-weight: bold;
        }

        .resultado-ion {
            color: #6a3d9a !important;
            font-weight: bold;
        }

        .resultado-fora {
            color: #8a5800 !important;
            font-weight: bold;
        }

        .resultado-erro {
            color: #a21d1d !important;
            font-weight: bold;
        }

        .resultado-sem-unidade {
            color: #5D4037 !important;
            font-weight: bold;
        }


        .sinal-diagnostico {
            color: #6a1b9a !important;
            font-weight: bold !important;
        }

        .sinal-trm {
            color: #c62828;
            font-weight: bold;
        }

        .sinal-aci {
            color: #6a1b9a;
            font-weight: bold;
        }

        .sinal-aci-smf {
            color: #1565c0;
            font-weight: bold;
        }

        .sinal-fazenda-trabalho {
            color: #8d6e00;
            font-weight: bold;
        }

        .sinal-pre-aci {
            color: #FF0049;
            font-weight: bold;
        }

        .sinal-pendente-nao-repasse {
            color: #FF8300;
            font-weight: bold;
        }

        .sinal-pendente-nao-repasse-atrasado {
            color: #c62828;
            font-weight: bold;
        }

        .sinal-despachar-aliquota {
            color: #FF8300;
            font-weight: bold;
        }

        .sinal-providencia-tecnica {
            color: #E67E22;
            font-weight: bold;
        }

        .sinal-alerta {
            color: #b26a00;
            font-weight: bold;
        }

        .sinal-slip {
            color: #00796b;
            font-weight: bold;
        }

        .rodape-documento {
            display: grid;
            grid-template-columns: 1fr 1.35fr 0.65fr;
            align-items: end;
            gap: 12px;
            width: 100%;
            margin-top: 12px;
            padding-top: 5px;
            border-top: 0.5px solid #d4d4d4;
            color: #777;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 6.6pt;
            line-height: 1.22;
        }

        .rodape-documento p {
            margin: 0;
        }

        .rodape-documento .rodape-titulo {
            color: #555;
            font-size: 7pt;
            font-weight: 600;
        }

        .rodape-documento .rodape-secundario {
            margin-top: 2px;
            color: #888;
            font-size: 5.8pt;
        }

        .rodape-documento .rodape-centro {
            min-width: 0;
            text-align: center;
            overflow-wrap: anywhere;
        }

        .rodape-documento .rodape-centro a {
            color: #777;
            text-decoration: none;
            overflow-wrap: anywhere;
        }

        .rodape-documento .rodape-direita {
            color: #666;
            text-align: right;
            white-space: nowrap;
        }

        @media print {
            .acoes {
                display: none;
            }

            .rodape-documento {
                position: fixed;
                right: 0;
                bottom: 0;
                left: 0;
                margin-top: 0;
                background: #fff;
            }

            body,
            table,
            th,
            td,
            span,
            a {
                print-color-adjust: exact !important;
                -webkit-print-color-adjust: exact !important;
            }
        }
    </style>
</head>

<body>
    <div class="acoes">
        <button id="botao-imprimir">
            Imprimir / Salvar como PDF
        </button>
    </div>

    <header class="cabecalho">
        <h1>
            Unidades abertas e tempo na DF-PO
        </h1>

        <p>
            Relatório gerado em
            ${agora.toLocaleDateString('pt-BR')},
            às
            ${agora.toLocaleTimeString(
                'pt-BR',
                {
                    hour: '2-digit',
                    minute: '2-digit'
                }
            )}
        </p>
    </header>

    <section class="resumo">
        <div>
            <strong>
                ${resultadosAtivosPdf.length}
            </strong>

            Processos ativos no PDF
        </div>

        <div>
            <strong>
                ${totalDfpo}
            </strong>

            Abertos na DF-PO
        </div>

        <div>
            <strong>
                ${totalFora}
            </strong>

            Fora da DF-PO
        </div>

        <div>
            <strong>
                ${totalErros}
            </strong>

            Erros
        </div>
    </section>

    ${resultadosPdfDfpo.length ? `
    <section class="bloco-tabela">
        <h2 class="titulo-tabela">
            Ativos em DF-PO — ${resultadosPdfDfpo.length}
        </h2>

    <table>
        <thead>
            <tr>
                <th class="numero">#</th>
                <th class="processo">
                    Processo
                </th>
                ${
                    ATIVAR_COLUNA_CREDOR
                        ? `
                <th class="credor">
                    Credor
                </th>`
                        : ''
                }
                <th>
                    Carga / Unidade(s) aberta(s)
                </th>
                <th>
                    Diretoria
                </th>
                <th>
                    Sinalização (em desenvolvimento 👷‍♂️🔧)
                </th>
                <th>
                    Em DF/DF-PO desde
                </th>
                <th>
                    Tempo em DF/DF-PO
                </th>
                <th>
                    Em unidade da DF desde
                </th>
                <th>
                    Em trabalho por (circuito DF)
                </th>
            </tr>
        </thead>

        <tbody>
            ${linhasDfpo}
        </tbody>

    </table>
    </section>
    ` : ''}

    ${resultadosPdfForaDfpo.length ? `
    <section class="bloco-tabela">
        <h2 class="titulo-tabela">
            Ativos fora da DF-PO — ${resultadosPdfForaDfpo.length}
        </h2>

    <table>
        <thead>
            <tr>
                <th class="numero">#</th>
                <th class="processo">
                    Processo
                </th>
                ${
                    ATIVAR_COLUNA_CREDOR
                        ? `
                <th class="credor">
                    Credor
                </th>`
                        : ''
                }
                <th>
                    Carga / Unidade(s) aberta(s)
                </th>
                <th>
                    Diretoria
                </th>
                <th>
                    Sinalização (em desenvolvimento 👷‍♂️🔧)
                </th>
                <th>
                    Em DF/DF-PO desde
                </th>
                <th>
                    Tempo em DF/DF-PO
                </th>
                <th>
                    Em unidade da DF desde
                </th>
                <th>
                    Em trabalho por (circuito DF)
                </th>
            </tr>
        </thead>

        <tbody>
            ${linhasForaDfpo}
        </tbody>

    </table>
    </section>
    ` : ''}

    ${resultadosPdfSlipFinal.length ? `
    <section class="bloco-tabela bloco-tabela-slip-final">
        <h2 class="titulo-tabela titulo-tabela-slip-final">
            🟢 Repasse em fase final / Tesouraria — ${resultadosPdfSlipFinal.length}
        </h2>

<table>
        <thead>
            <tr>
                <th class="numero">#</th>
                <th class="processo">
                    Processo
                </th>
                ${
                    ATIVAR_COLUNA_CREDOR
                        ? `
                <th class="credor">
                    Credor
                </th>`
                        : ''
                }
                <th>
                    Carga / Unidade(s) aberta(s)
                </th>
                <th>
                    Diretoria
                </th>
                <th>
                    Sinalização (em desenvolvimento 👷‍♂️🔧)
                </th>
                <th>
                    Em DF/DF-PO desde
                </th>
                <th>
                    Tempo em DF/DF-PO
                </th>
                <th>
                    Em unidade da DF desde
                </th>
                <th>
                    Em trabalho por (circuito DF)
                </th>
            </tr>
        </thead>

        <tbody>
            ${linhasSlipFinal}
        </tbody>

    </table>
    </section>
    ` : ''}

    <footer class="rodape-documento">
        <div class="rodape-esquerda">
            <p class="rodape-titulo">
                Processo administrativo eletrônico
            </p>

            <p class="rodape-secundario">
                Os campos foram preenchidos automaticamente com as
                informações disponíveis no sistema.
            </p>
        </div>

        <div class="rodape-centro">
            <p>
                Versão 4.2.6, Licença CC BY 4.0, por
                Marcus Vinicius Roque - CIDADE_EXEMPLO (ORGAO_EXEMPLO/DF/PO)
            </p>

            <p class="rodape-secundario">
                Feedback/Demanda/Bug:
                <a
                    href="https://www.linkedin.com/in/marcusoregano/"
                    target="_blank"
                    rel="noopener noreferrer"
                >LinkedIn @marcusoregano</a>
            </p>
        </div>

        <div class="rodape-direita">
            <p>
                Impressão:
                ${agora.toLocaleDateString('pt-BR')}
            </p>
        </div>
    </footer>
</body>
</html>
        `;

        janela.document.open();
        janela.document.write(
            htmlImpressao
        );
        janela.document.close();

        janela.addEventListener(
            'load',
            async () => {
                const imprimirQuandoPronto =
                    async () => {
                        /*
                         * Aguarda o Chrome terminar de montar o relatório
                         * antes de abrir a pré-visualização de impressão.
                         * Isso reduz o risco de o botão "Salvar" ficar
                         * temporariamente travado na primeira tentativa.
                         */
                        try {
                            if (
                                janela.document.fonts &&
                                janela.document.fonts.ready
                            ) {
                                await janela.document.fonts.ready;
                            }
                        } catch (erro) {
                            console.debug(
                                '[SEI] Não foi possível aguardar as fontes:',
                                erro
                            );
                        }

                        const imagens =
                            [
                                ...janela.document.images
                            ];

                        await Promise.all(
                            imagens.map(
                                imagem =>
                                    imagem.complete
                                        ? Promise.resolve()
                                        : new Promise(
                                            resolver => {
                                                imagem.addEventListener(
                                                    'load',
                                                    resolver,
                                                    {
                                                        once: true
                                                    }
                                                );

                                                imagem.addEventListener(
                                                    'error',
                                                    resolver,
                                                    {
                                                        once: true
                                                    }
                                                );
                                            }
                                        )
                            )
                        );

                        await new Promise(
                            resolver =>
                                janela.requestAnimationFrame(
                                    () =>
                                        janela.requestAnimationFrame(
                                            resolver
                                        )
                                )
                        );

                        await new Promise(
                            resolver =>
                                setTimeout(
                                    resolver,
                                    1200
                                )
                        );

                        janela.focus();
                        janela.print();
                    };

                janela.document
                    .getElementById(
                        'botao-imprimir'
                    )
                    ?.addEventListener(
                        'click',
                        imprimirQuandoPronto
                    );

                imprimirQuandoPronto();
            }
        );
    }

    function fecharModal() {
        if (
            emAndamento &&
            !cancelado
        ) {
            const confirmar = confirm(
                'A consulta ainda está em andamento.\n\n' +
                'Deseja interromper e fechar?'
            );

            if (!confirmar) {
                return;
            }

            cancelado = true;
        }

        document
            .getElementById(ID_MODAL)
            ?.remove();
    }

    function criarEstilos() {
        if (
            document.getElementById(
                ID_ESTILO
            )
        ) {
            return;
        }

        const estilo =
            document.createElement('style');

        estilo.id = ID_ESTILO;

        estilo.textContent = `
            #${ID_BOTAO} {
                display: inline-flex;
                align-items: center;
                margin: 8px;
                padding: 8px 14px;
                border: 1px solid #075783;
                border-radius: 4px;
                background: #146fa8;
                color: white;
                font-family: Arial, sans-serif;
                font-size: 13px;
                font-weight: bold;
                line-height: 1.25;
                text-align: center;
                white-space: pre-line;
                cursor: pointer;
                box-shadow: 0 1px 2px rgba(0,0,0,.18);
            }

            #${ID_BOTAO}:hover {
                background: #095f93;
            }

            #${ID_BOTAO}:disabled {
                opacity: .6;
                cursor: wait;
            }

            #${ID_MODAL} {
                position: fixed;
                inset: 0;
                z-index: 9999999;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 15px;
                background: rgba(0,0,0,.50);
                font-family: Arial, sans-serif;
            }

            #${ID_MODAL} .mv-caixa {
                width: min(1550px, 98vw);
                max-height: 95vh;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                border-radius: 7px;
                background: white;
                box-shadow: 0 12px 38px rgba(0,0,0,.38);
            }

            #${ID_MODAL} .mv-cabecalho {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 13px 17px;
                background: #176a9e;
                color: white;
            }

            #${ID_MODAL} .mv-cabecalho h2 {
                margin: 0;
                font-size: 19px;
            }

            #mv-fechar-x {
                border: 0;
                background: transparent;
                color: white;
                font-size: 28px;
                cursor: pointer;
            }

            #${ID_MODAL} .mv-conteudo {
                padding: 15px 17px;
                overflow: auto;
            }

            #${ID_MODAL} .mv-progresso {
                margin-bottom: 7px;
                font-size: 13px;
            }

            #${ID_MODAL} .mv-barra-fundo {
                height: 16px;
                margin-bottom: 12px;
                overflow: hidden;
                border-radius: 10px;
                background: #e1e8ed;
            }

            #mv-barra {
                width: 0;
                height: 100%;
                background: #2787b9;
                transition: width .25s;
            }

            #mv-status {
                min-height: 22px;
                margin-bottom: 11px;
                font-size: 13px;
            }

            #${ID_MODAL} table {
                width: 100%;
                border-collapse: collapse;
                table-layout: fixed;
                font-size: 12px;
            }

            #${ID_MODAL} .mv-secao-relatorio {
                width: 100%;
            }

            #${ID_MODAL} .mv-secao-titulo {
                margin: 2px 0 7px;
                padding: 7px 10px;
                border-left: 4px solid #176a9e;
                background: #eef5f9;
                color: #174f70;
                font-size: 13px;
                font-weight: 700;
            }

            #${ID_MODAL} .mv-secao-titulo-arquivamento {
                border-left-color: #6f42a5;
                background: #f4eff9;
                color: #5a2f85;
            }

        .mv-secao-slip-final {
            border-color: #9ccc9c;
            background: #f4fbf4;
        }

        .mv-secao-titulo-slip-final {
            background: #dff2df !important;
            color: #216b2f !important;
            border-color: #9ccc9c !important;
        }


            #${ID_MODAL} .mv-secao-dfpo .mv-secao-titulo {
                border-left-color: #c62828;
                background: #fff1f1;
                color: #8d1d1d;
            }

            #${ID_MODAL} .mv-secao-outros-ativos .mv-secao-titulo {
                border-left-color: #176a9e;
                background: #eef5f9;
                color: #174f70;
            }

            /*
             * QUINTA TABELA DE AUDITORIA — v9.9.142
             *
             * Fica visualmente ao fundo do modal: discreta, cinza,
             * abaixo dos arquivamentos. Não é levada ao PDF.
             */
            #${ID_MODAL} .mv-secao-fora-grupo-dfpo {
                opacity: .92;
            }

            #${ID_MODAL} .mv-secao-fora-grupo-dfpo .mv-secao-titulo {
                border-left-color: #7a858d;
                background: #f2f4f5;
                color: #4f5960;
            }

            #${ID_MODAL} .mv-secao-fora-grupo-dfpo th {
                background: #66727a;
            }

            #${ID_MODAL} .mv-separador-tabelas {
                height: 1px;
                margin: 20px 0 16px;
                background: #b9c8d2;
            }

            #${ID_MODAL} th {
                position: sticky;
                top: 0;
                z-index: 2;
                padding: 8px;
                border: 1px solid #bdcbd4;
                background: #176a9e;
                color: white;
                text-align: left;
            }

            /*
             * Agrupamento visual simples das 4 últimas colunas.
             * É uma linha real da tabela com células mescladas:
             *   Execução             -> 2 colunas
             *   Diretoria Financeira -> 2 colunas
             *
             * Mantém o projeto original; não usa abas, pseudo-elementos
             * nem elementos flutuantes.
             */
            #${ID_MODAL} .mv-linha-grupos th {
                top: 0;
                height: 24px;
                padding: 5px 8px;
                z-index: 3;
                text-align: center;
                font-weight: 700;
                border-bottom: 1px solid #D9C66A;
            }

            #${ID_MODAL} .mv-linha-grupos .mv-grupo-vazio {
                background: #176a9e;
                border-color: #176a9e #bdcbd4 #bdcbd4 #bdcbd4;
            }

            #${ID_MODAL} .mv-linha-grupos .mv-grupo-tempo {
                background: #FFF2B2;
                color: #5C4A00;
                border-color: #D9C66A;
            }

            #${ID_MODAL} .mv-linha-cabecalhos th {
                top: 35px;
            }

            #${ID_MODAL} td {
                padding: 8px;
                border: 1px solid #d1dbe1;
                vertical-align: top;
                white-space: pre-line;
                overflow-wrap: anywhere;
            }

            #${ID_MODAL} tbody tr:nth-child(even) {
                background: #f4f7f9;
            }

            #${ID_MODAL} .mv-n {
                width: 38px;
                text-align: center;
            }

            #${ID_MODAL} .mv-processo {
                width: 185px;
            }

            #${ID_MODAL} .mv-credor {
                width: 285px;
            }

            #${ID_MODAL} .mv-unidades {
                width: 360px;
            }

            #${ID_MODAL} .mv-desde-gerencia,
            #${ID_MODAL} .mv-desde-circuito {
                width: 135px;
            }

            #${ID_MODAL} .mv-tempo-gerencia,
            #${ID_MODAL} .mv-tempo-circuito {
                width: 155px;
            }

            /*
             * Cabeçalhos das colunas de tempo:
             * amarelo pastel para diferenciá-las visualmente
             * dos demais rótulos azuis da tabela.
             */
            #${ID_MODAL} th.mv-desde-gerencia,
            #${ID_MODAL} th.mv-tempo-gerencia,
            #${ID_MODAL} th.mv-desde-circuito,
            #${ID_MODAL} th.mv-tempo-circuito {
                background: #FFF2B2;
                color: #5C4A00;
                border-color: #D9C66A;
            }

            #${ID_MODAL} .mv-resultado {
                width: 145px;
            }

            #${ID_MODAL} .mv-sinalizacao {
                width: 310px;
            }

            #${ID_MODAL} .mv-sinalizacao-celula {
                color: #444;
                font-weight: 600;
            }

            #${ID_MODAL} .mv-sinalizacao-alerta {
                color: #a33b00;
                font-weight: bold;
            }

            #${ID_MODAL} .mv-sinalizacao-slip {
                color: #006b56;
                font-weight: bold;
            }

            #${ID_MODAL} .mv-aberto {
                color: #136b2d;
                font-weight: bold;
            }

            #${ID_MODAL} .mv-fazenda {
                color: #005a9c;
                font-weight: bold;
            }

            #${ID_MODAL} .mv-df {
                color: #c62828;
                font-weight: bold;
            }

            #${ID_MODAL} .mv-unidade-dfpo {
                color: #c62828;
                font-weight: bold;
            }

            #${ID_MODAL} .mv-ion {
                color: #6a3d9a;
                font-weight: bold;
            }

            #${ID_MODAL} .mv-fora {
                color: #8a5800;
                font-weight: bold;
            }

            #${ID_MODAL} .mv-erro {
                color: #a21d1d;
                font-weight: bold;
            }

            #${ID_MODAL} .mv-sem-unidade {
                color: #5D4037 !important;
                font-weight: 700;
            }

            #${ID_MODAL} .mv-resultado-slip {
                color: #00796b !important;
                font-weight: 700;
            }

            #${ID_MODAL} .mv-resultado-alerta {
                color: #b26a00 !important;
                font-weight: 700;
            }

            #${ID_MODAL} .mv-resultado-ressarcimento-pdf {
                color: #b58a00 !important;
                font-weight: 700;
            }

            #${ID_MODAL} .mv-resultado-trm {
                color: #c62828 !important;
                font-weight: 700;
            }

            #${ID_MODAL} .mv-resultado-aci {
                color: #6a1b9a !important;
                font-weight: 700;
            }

            #${ID_MODAL} .mv-resultado-aci-smf {
                color: #1565c0 !important;
                font-weight: 700;
            }

            #${ID_MODAL} .mv-resultado-despachar-aliquota {
                color: #FF8300 !important;
                font-weight: 700;
            }

            #${ID_MODAL} .mv-resultado-providencia-tecnica {
                color: #E67E22 !important;
                font-weight: 700;
            }

            #${ID_MODAL} .mv-resultado-fazenda-trabalho {
                color: #8d6e00 !important;
                font-weight: 700;
            }

            #${ID_MODAL} .mv-resultado-pre-aci {
                color: #FF0049 !important;
                font-weight: 700;
            }

            #${ID_MODAL} .mv-resultado-pendente-nao-repasse {
                color: #FF8300 !important;
                font-weight: 700;
            }

            #${ID_MODAL} .mv-resultado-pendente-nao-repasse-atrasado {
                color: #c62828 !important;
                font-weight: 700;
            }

            /*
             * v9.9.112:
             * cores de status ficam restritas às 3 colunas operacionais:
             * Carga/Unidade + Diretoria + Sinalização.
             *
             * Processo, Credor e colunas de tempo permanecem neutros.
             */
            #${ID_MODAL} tr.mv-linha-complexidade > .mv-unidades,
            #${ID_MODAL} tr.mv-linha-complexidade > .mv-diretoria-celula,
            #${ID_MODAL} tr.mv-linha-complexidade > .mv-sinalizacao-celula,
            #${ID_MODAL} tr.mv-linha-complexidade > .mv-unidades *,
            #${ID_MODAL} tr.mv-linha-complexidade > .mv-diretoria-celula *,
            #${ID_MODAL} tr.mv-linha-complexidade > .mv-sinalizacao-celula * {
                color: #c62828 !important;
                font-weight: 700 !important;
            }

            #${ID_MODAL} .mv-sinal-diagnostico {
                color: #6a1b9a !important;
                font-weight: 700;
            }

            #${ID_MODAL} .mv-sinal-trm {
                color: #c62828;
                font-weight: bold;
            }

            #${ID_MODAL} .mv-sinal-aci-smf {
                color: #1565c0;
                font-weight: 700;
            }

            #${ID_MODAL} .mv-sinal-fazenda-trabalho {
                color: #8d6e00;
                font-weight: 700;
            }

            #${ID_MODAL} .mv-sinal-despachar-aliquota {
                color: #FF8300;
                font-weight: 700;
            }

            #${ID_MODAL} .mv-sinal-providencia-tecnica {
                color: #E67E22;
                font-weight: 700;
            }

            #${ID_MODAL} .mv-sinal-pre-aci {
                color: #FF0049;
                font-weight: 700;
            }

            #${ID_MODAL} .mv-sinal-pendente-nao-repasse {
                color: #FF8300;
                font-weight: 700;
            }

            #${ID_MODAL} .mv-sinal-pendente-nao-repasse-atrasado {
                color: #c62828;
                font-weight: 700;
            }

            #${ID_MODAL} .mv-sinal-alerta {
                color: #b26a00;
                font-weight: bold;
            }

            #${ID_MODAL} .mv-sinal-ressarcimento-pdf {
                color: #b58a00;
                font-weight: 700;
            }

            #${ID_MODAL} .mv-sinal-slip {
                color: #00796b;
                font-weight: bold;
            }

            #${ID_MODAL} .mv-rodape {
                display: flex;
                flex-wrap: wrap;
                justify-content: flex-end;
                gap: 8px;
                padding: 12px 17px;
                border-top: 1px solid #d2dce2;
                background: #f2f5f7;
            }

            #${ID_MODAL} .mv-rodape button {
                padding: 7px 13px;
                border: 1px solid #687d89;
                border-radius: 4px;
                background: white;
                color: #222;
                cursor: pointer;
            }

            #${ID_MODAL} .mv-rodape button:hover:not(:disabled) {
                background: #e8edf1;
            }

            #${ID_MODAL} .mv-rodape button:disabled {
                opacity: .5;
                cursor: not-allowed;
            }

            #${ID_MODAL} .mv-principal {
                border-color: #146fa8 !important;
                background: #146fa8 !important;
                color: white !important;
                font-weight: bold;
            }
        `;

        document.head.appendChild(estilo);
    }

    function preencherCelulaUnidades(
        celula,
        textoUnidades
    ) {
        celula.textContent = '';

        const linhas = String(
            textoUnidades || ''
        ).split(/\r?\n/);

        linhas.forEach(
            (linha, indice) => {
                if (indice > 0) {
                    celula.appendChild(
                        document.createElement('br')
                    );
                }

                const span =
                    document.createElement('span');

                span.textContent = linha;

                const sigla = String(linha)
                    .split(/\s*\(/)[0]
                    .trim();

                /*
                 * A cor da unidade não é mais definida pela sigla.
                 * A célula inteira acompanha a cor da sinalização,
                 * incluindo ORG/FIN, DF-PO, DF-CONT, DF-TES etc.
                 */
                celula.appendChild(span);
            }
        );
    }

    function formatarUnidadesHtml(
        textoUnidades
    ) {
        return String(
            textoUnidades || ''
        )
            .split(/\r?\n/)
            .map(
                linha => {
                    const sigla = String(linha)
                        .split(/\s*\(/)[0]
                        .trim();

                    return (
                        '<span>' +
                        `${escaparHtml(linha)}` +
                        '</span>'
                    );
                }
            )
            .join('<br>');
    }

    function formatarSinalizacaoHtml(
        textoSinalizacao
    ) {
        return String(
            textoSinalizacao || '—'
        )
            .split(' · ')
            .map(limpar)
            .filter(Boolean)
            .map(parte => {
                const conteudo =
                    escaparHtml(parte);

                if (
                    normalizar(parte).includes(
                        normalizar(
                            'Pendente — folha/DARF (INSS + IRRF) - Valor expressivo'
                        )
                    )
                ) {
                    return (
                        '<span class="sinal-pendente-nao-repasse-atrasado">' +
                        conteudo +
                        '</span>'
                    );
                }

                if (
                    normalizar(parte).includes(
                        normalizar(
                            'Pendente — correspondência NE'
                        )
                    ) &&
                    normalizar(parte).includes(
                        normalizar(
                            '⚠️'
                        )
                    )
                ) {
                    return (
                        '<span class="sinal-pendente-nao-repasse-atrasado">' +
                        conteudo +
                        '</span>'
                    );
                }

                if (
                    normalizar(parte).includes(
                        normalizar(
                            'Pendente — correspondência NE'
                        )
                    )
                ) {
                    return (
                        '<span class="sinal-pendente-nao-repasse">' +
                        conteudo +
                        '</span>'
                    );
                }

                if (
                    normalizar(parte).includes(
                        normalizar(
                            'Pré-ACI: NL, Ofício, TRM, assinaturas'
                        )
                    )
                ) {
                    return (
                        '<span class="sinal-pre-aci">' +
                        conteudo +
                        '</span>'
                    );
                }

                if (
                    normalizar(parte).includes(
                        normalizar(
                            'Despachar para aferir alíquota'
                        )
                    )
                ) {
                    return (
                        '<span class="sinal-despachar-aliquota">' +
                        conteudo +
                        '</span>'
                    );
                }

                if (
                    normalizar(parte) ===
                    normalizar(
                        'Caso externo ao dicionário. Contactar administrador.'
                    ) ||
                    normalizar(parte).includes(
                        normalizar(
                            'Na ACI, 1ª tentativa de TRM'
                        )
                    )
                ) {
                    return (
                        '<span class="sinal-diagnostico">' +
                        conteudo +
                        '</span>'
                    );
                }

                if (
                    normalizar(parte).includes(
                        normalizar(
                            'Providência na área técnica'
                        )
                    )
                ) {
                    return (
                        '<span class="sinal-providencia-tecnica">' +
                        conteudo +
                        '</span>'
                    );
                }

                if (
                    normalizar(parte) ===
                    normalizar(
                        'Pagamento pendente (<7 dias)'
                    )
                ) {
                    return (
                        '<span class="sinal-alerta">' +
                        conteudo +
                        '</span>'
                    );
                }

                if (
                    normalizar(parte).includes(
                        normalizar(
                            'Concluído sem comprovante de pagamento'
                        )
                    ) ||
                    normalizar(parte).startsWith(
                        normalizar('Pagamento pendente')
                    ) ||
                    normalizar(parte) ===
                    normalizar('Cumprindo TRM') ||
                    normalizar(parte).includes(
                        normalizar(
                            'Capa impressa, sem movimento a +7 dias'
                        )
                    )
                ) {
                    return (
                        '<span class="sinal-trm">' +
                        conteudo +
                        '</span>'
                    );
                }

                if (parte.startsWith('⚠')) {
                    return (
                        '<span class="sinal-alerta">' +
                        conteudo +
                        '</span>'
                    );
                }

                if (
                    normalizar(parte).includes(
                        normalizar(
                            'Medição zerada'
                        )
                    ) ||
                    normalizar(parte).includes(
                        normalizar(
                            'trâmite ORG/FIN/TESOURARIA'
                        )
                    )
                ) {
                    return (
                        '<span class="sinal-aci-smf">' +
                        conteudo +
                        '</span>'
                    );
                }

                if (
                    normalizar(parte) ===
                    normalizar(
                        'Despachar para aferir alíquota'
                    ) ||
                    normalizar(parte) ===
                    normalizar(
                        'Aferindo alíquota'
                    ) ||
                    normalizar(parte) ===
                    normalizar(
                        'Aferir alíquota'
                    )
                ) {
                    return (
                        '<span class="sinal-fazenda-trabalho">' +
                        conteudo +
                        '</span>'
                    );
                }

                if (
                    normalizar(parte).includes(
                        normalizar('SLIP localizada')
                    ) ||
                    normalizar(parte).includes(
                        normalizar('SLIP provável pois há uma peça SMF com palavra pagamento')
                    ) ||
                    normalizar(parte).includes(
                        normalizar(
                            'Palavra "pagamento/comprovante" identificada. Pagamento provável'
                        )
                    )
                ) {
                    return (
                        '<span class="sinal-slip">' +
                        conteudo +
                        '</span>'
                    );
                }

                return conteudo;
            })
            .join(' · ') || '—';
    }


    function escaparHtml(valor) {
        return String(valor ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function acaoDaUrl(url) {
        try {
            return new URL(
                url,
                location.href
            ).searchParams.get('acao');
        } catch (_) {
            return null;
        }
    }

    function normalizarUrl(url) {
        try {
            return new URL(
                url,
                location.href
            ).href;
        } catch (_) {
            return String(url || '');
        }
    }

    function decodificarUrl(texto) {
        return String(texto || '')
            .replace(/&amp;/gi, '&')
            .replace(/\\u0026/gi, '&')
            .replace(/\\x26/gi, '&')
            .replace(/\\\//g, '/');
    }

    function limparUrl(texto) {
        return decodificarUrl(texto)
            .replace(/\\'/g, "'")
            .replace(/\\"/g, '"')
            .replace(/[);,\]}]+$/g, '')
            .replace(/['"]+$/g, '')
            .trim();
    }

    function decodificarJs(texto) {
        return String(texto || '')
            .replace(/\\u0026/gi, '&')
            .replace(/\\x26/gi, '&')
            .replace(/\\'/g, "'")
            .replace(/\\"/g, '"')
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '')
            .replace(/\\t/g, ' ')
            .replace(/\\\//g, '/')
            .replace(/\\\\/g, '\\');
    }

    function htmlParaTexto(html) {
        const doc =
            new DOMParser().parseFromString(
                `<div>${html}</div>`,
                'text/html'
            );

        return limparComQuebras(
            doc.body?.innerText ||
            doc.body?.textContent ||
            ''
        );
    }

    function removerPontuacao(texto) {
        return String(texto || '')
            .replace(/[.,;:]+$/g, '')
            .trim();
    }

    function normalizarUnidade(texto) {
        return removerPontuacao(
            String(texto || '')
                .toUpperCase()
                .replace(/\s+/g, '')
        );
    }

    function limpar(texto) {
        return String(texto || '')
            .replace(/\u00A0/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function limparComQuebras(texto) {
        return String(texto || '')
            .replace(/\u00A0/g, ' ')
            .replace(/\r/g, '')
            .replace(/[ \t]+/g, ' ')
            .replace(/[ \t]*\n[ \t]*/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    function normalizar(texto) {
        return limpar(texto)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    }

    function esperar(ms) {
        return new Promise(
            resolve =>
                setTimeout(resolve, ms)
        );
    }
})();