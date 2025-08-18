import { EndpointMetadata, EndpointParam } from './endpoints-metadata';

/**
 * Shared FAQ for XML generators.
 */
export const GENERAL_FAQ_XML = [
    { q: 'What is the output format?', a: 'You will get a downloadable .xml file.' },
    { q: 'Do I need to upload a template?', a: 'Only for endpoints that duplicate nodes (agreements / eligibility rules). ETD Balances builds XML from scratch.' },
    { q: 'Why do I sometimes see a JSON error?', a: 'If validation fails (e.g., wrong template type), the backend returns a JSON body with details even though the request is a file download.' }
];

/**
 * A shared set of common parameters for XML generation endpoints that require a template file.
 * (Used by: generate-complex-eligibility-rules)
 */
export const GENERAL_XML_TEMPLATE_PARAMS: EndpointParam[] = [
    {
        name: 'database', // Controller expects 'database'
        label: 'Database Type',
        type: 'select',
        required: true,
        options: ['ORACLE', 'POSTGRESQL', 'MSSQL']
    },
    {
        name: 'count', // Generic count for template-driven duplication
        label: 'Number of Items',
        type: 'number',
        required: true,
        placeholder: 'Enter number of items'
    },
    {
        name: 'file',
        label: 'XML Template',
        type: 'file',
        required: true
    }
];

/**
 * The main metadata configuration for XML endpoints.
 */
export const ENDPOINTS_XML_METADATA: Record<string, EndpointMetadata> = {
    'generate-agreements': {
        key: 'generate-agreements',
        title: 'Generate XML with Multiple Agreements',
        path: '/api/xml/generate-agreements',
        shortDescription: 'Duplicates the <agreement> node in a template and populates each with a unique legal ID.',
        swaggerTag: 'XML Generation',
        operationId: 'modifyXml',
        docs:
            'Upload a template containing a single `<agreement>` node. The service clones it N times and injects unique `legal_id` values fetched from the selected database.',
        usage: [
            'Upload your XML template containing one `<agreement>` node.',
            'Select the database to source legal IDs from.',
            'Specify the number of agreements to generate.',
            'Run and download the resulting XML file.'
        ],
        notes:
            'If your template contains multiple `<agreement>` nodes, only the first one is used as the base.',
        params: [
            {
                name: 'database',
                label: 'Database Type',
                type: 'select',
                required: true,
                options: ['ORACLE', 'POSTGRESQL', 'MSSQL']
            },
            {
                name: 'numAgreements', // exact backend name
                label: 'Number of Agreements',
                type: 'number',
                required: true,
                placeholder: 'e.g., 50'
            },
            {
                name: 'file',
                label: 'XML Template',
                type: 'file',
                required: true
            }
        ],
        sqlQueryKey: 'agreements_legal-ids',
        faq: [
            { q: 'How are legal IDs selected?', a: 'They are fetched from the selected database to ensure uniqueness per cloned node.' },
            ...GENERAL_FAQ_XML
        ],
        docSection: 'xml'
    },

    'generate-complex-eligibility-rules': {
        key: 'generate-complex-eligibility-rules',
        title: 'Generate COMPLEX Eligibility Rules XML',
        path: '/api/xml/generate-complex-eligibility-rules',
        shortDescription: 'For complex templates only. Duplicates <eligibilityTemplate> N times with unique names from DB.',
        swaggerTag: 'XML Generation',
        operationId: 'generateEligibilityCXml',
        docs:
            'Use this when your template has nested dependencies/refs inside `<eligibilityTemplate>`. The service duplicates the node N times and injects unique names from the selected database.',
        usage: [
            'Upload your complex eligibility template.',
            'Select the database to source unique names.',
            'Enter the number of templates to create.',
            'Run and download.'
        ],
        notes:
            'Choose this endpoint if the simple (NORMAL) one returns an error indicating a complex template.',
        params: GENERAL_XML_TEMPLATE_PARAMS,
        sqlQueryKey: 'eligibility_template',
        faq: [
            { q: 'How are template names generated?', a: 'They are queried from the selected database to avoid duplicates.' },
            ...GENERAL_FAQ_XML
        ],
        docSection: 'xml'
    },

    'generate-normal-eligibility-rules': {
        key: 'generate-normal-eligibility-rules',
        title: 'Generate NORMAL Eligibility Rules XML',
        path: '/api/xml/generate-normal-eligibility-rules',
        shortDescription: 'For simple templates. Duplicates <eligibilityTemplate> N times.',
        swaggerTag: 'XML Generation',
        operationId: 'generateEligibilityNXml',
        docs:
            'Handles simple, self-contained templates. If a complex template is provided, the API returns 400 with a suggestion to use the complex endpoint.',
        notes:
            'If you upload a complex template here, you will receive `{ "message": "complex file inputted", "suggestion": "Use /api/xml/generate-complex-eligibility-rules endpoint instead." }`.',
        usage: [
            'Upload your simple XML template.',
            'Enter the number of templates to create.',
            'Run and download.'
        ],
        params: [
            {
                name: 'count',
                label: 'Number of Templates',
                type: 'number',
                required: true,
                placeholder: 'e.g., 20'
            },
            {
                name: 'file',
                label: 'XML Template',
                type: 'file',
                required: true
            }
        ],
        faq: [
            { q: 'Why did I get a 400 error about a complex file?', a: 'Switch to the COMPLEX endpoint; your template has dependencies that require it.' },
            ...GENERAL_FAQ_XML
        ],
        docSection: 'xml'
    },

    'generate-etd-balances': {
        key: 'generate-etd-balances',
        title: 'Generate ETD Balances XML',
        path: '/api/xml/generate-etd-balances-extid',
        shortDescription: 'Builds a complete ETD Balances XML from DB data (no template required).',
        swaggerTag: 'XML Generation',
        operationId: 'generateETDBalancesXml_ext',
        docs:
            'Constructs the ETD Balances XML from scratch (Tier1 → Tier2 → Tier3) using the selected database. Legal IDs (extid) mapping logic is handled in the backend.',
        usage: [
            'Select the database to source data from.',
            'Enter the number of balance records to generate.',
            'Run and download the XML.'
        ],
        params: [
            {
                name: 'database',
                label: 'Database Type',
                type: 'select',
                required: true,
                options: ['ORACLE', 'POSTGRESQL', 'MSSQL']
            },
            {
                name: 'numRows',
                label: 'Number of Rows',
                type: 'number',
                required: true,
                placeholder: 'e.g., 500'
            }
        ],
        sqlQueryKey: 'etd_balance_udf_data2',
        faq: [
            { q: 'Why is there no template upload?', a: 'The XML is generated entirely by the backend from database queries.' },
            ...GENERAL_FAQ_XML
        ],
        docSection: 'xml'
    }
};
