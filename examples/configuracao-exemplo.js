// Synthetic configuration example.
// All identifiers in this file are fictitious.

const EXAMPLE_CONFIG = {

    organization: {
        name: 'Example Public Organization',
        acronym: 'EPO'
    },

    sei: {
        baseUrl: 'https://sei.example.gov/',
        targetUnit: 'ORG/FIN/PLANNING'
    },

    units: {
        finance: [
            'ORG/FIN',
            'ORG/FIN/ACCOUNTING',
            'ORG/FIN/PLANNING',
            'ORG/FIN/TREASURY'
        ],

        externalFinance: [
            'ORG/TREASURY/UNIT-A',
            'ORG/TREASURY/UNIT-B'
        ],

        technical: [
            'ORG/TECH/UNIT-A',
            'ORG/TECH/UNIT-B'
        ]
    },

    syntheticMappings: [
        {
            commitmentId: 'SYNTHETIC_NE_001',
            fundingSource: 'SOURCE_EXAMPLE_A',
            creditor: 'SYNTHETIC_SUPPLIER_A',
            contract: 'SYNTHETIC_CONTRACT_001',
            process: 'PROCESS_EXAMPLE_001',
            family: 'example_service',
            object: 'Synthetic service used only to demonstrate matching logic.',
            distinctiveTerms: [
                'SYNTHETIC_TERM_A',
                'SYNTHETIC_TERM_B'
            ]
        }
    ]
};
