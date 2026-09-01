// Configuração pública de exemplo.
// Todos os identificadores abaixo são fictícios.

const CONFIGURACAO_EXEMPLO = {
    organizacao: {
        nome: 'Órgão Público de Exemplo',
        sigla: 'OPE'
    },

    sei: {
        urlBase: 'https://sei.exemplo.invalid/',
        unidadeAlvo: 'ORG/FIN/PLANEJAMENTO'
    },

    unidades: {
        financeiras: [
            'ORG/FIN',
            'ORG/FIN/PLANEJAMENTO',
            'ORG/FIN/CONTABILIDADE',
            'ORG/FIN/TESOURARIA'
        ],

        tecnicas: [
            'ORG/TEC/UNIDADE-A',
            'ORG/TEC/UNIDADE-B'
        ],

        externas: [
            'EXT/FIN/UNIDADE-A',
            'EXT/FIN/UNIDADE-B'
        ]
    },

    exemplosDeterministicos: [
        {
            identificador: 'EXEMPLO_001',
            empenho: 'NE_FICTICIA_001',
            fonte: 'FONTE_EXEMPLO_A',
            credor: 'FORNECEDOR_FICTICIO_A',
            contrato: 'CONTRATO_EXEMPLO_001',
            processo: 'PROCESSO_EXEMPLO_001',
            familia: 'servico_exemplo',
            objeto: 'Objeto fictício utilizado apenas para demonstrar a estrutura.',
            palavrasDistintivas: [
                'TERMO FICTICIO A',
                'TERMO FICTICIO B'
            ]
        }
    ]
};
