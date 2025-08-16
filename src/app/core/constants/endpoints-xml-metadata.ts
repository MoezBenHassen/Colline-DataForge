import { EndpointMetadata, EndpointParam } from './endpoints-metadata';

/**
 * A shared set of common parameters for XML generation endpoints that require a template file.
 */
export const GENERAL_XML_TEMPLATE_PARAMS: EndpointParam[] = [
    {
        name: 'database', // Note: your controller uses 'database'
        label: 'Database Type',
        type: 'select',
        required: true,
        options: ['ORACLE', 'POSTGRESQL', 'MSSQL']
    },
    {
        name: 'count', // Generic name for number of items
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
        shortDescription: 'Duplicates the <agreement> node in a template and populates it with unique legal IDs.',
        swaggerTag: 'XML Generation',
        operationId: 'modifyXml',
        docs: "Takes a template XML file, duplicates the `<agreement>` node a specified number of times, and populates each new node with a unique legal ID fetched from the selected database.",
        usage: [
            "Upload your XML template containing an `<agreement>` node.",
            "Select the database to source legal IDs from.",
            "Specify the number of agreements to generate.",
            "Download the resulting XML file."
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
                name: 'numAgreements', // Specific parameter name for this endpoint
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
        sqlQueryKey: 'agreement_legal_ids'
    },
    'generate-complex-eligibility-rules': {
        key: 'generate-complex-eligibility-rules',
        title: 'Generate COMPLEX Eligibility Rules XML',
        path: '/api/xml/generate-complex-eligibility-rules',
        shortDescription: 'For complex templates only. Duplicates <eligibilityTemplate> nodes N times.',
        swaggerTag: 'XML Generation',
        operationId: 'generateEligibilityCXml',
        docs: "This endpoint is designed for templates with intricate internal dependencies. It duplicates the main `<eligibilityTemplate>` node and populates each instance with a unique name from the database.",
        usage: [
            "Upload your complex XML template.",
            "Select the database to source unique names.",
            "Enter the number of rules to create."
        ],
        params: GENERAL_XML_TEMPLATE_PARAMS,
        sqlQueryKey: 'complex_eligibility_names'
    },
    'generate-normal-eligibility-rules': {
        key: 'generate-normal-eligibility-rules',
        title: 'Generate NORMAL Eligibility Rules XML',
        path: '/api/xml/generate-normal-eligibility-rules',
        shortDescription: 'For simple templates. Duplicates <eligibilityTemplate> nodes N times.',
        swaggerTag: 'XML Generation',
        operationId: 'generateEligibilityNXml',
        docs: "Handles simple, self-contained templates. It will return an error if a complex template is provided, guiding the user to the correct endpoint.",
        notes: "If you upload a complex template here, the API will return a 400 Bad Request error with a suggestion to use the correct endpoint.",
        usage: [
            "Upload your simple XML template.",
            "Enter the number of rules to create."
        ],
        params: [
            {
                name: 'count',
                label: 'Number of Rules',
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
        // No database or SQL needed for this one
    },
    'generate-etd-balances': {
        key: 'generate-etd-balances',
        title: 'Generate ETD Balances XML',
        path: '/api/xml/generate-etd-balances-extid',
        shortDescription: 'Generates a complete ETD Balances XML file from database data.',
        swaggerTag: 'XML Generation',
        operationId: 'generateETDBalancesXml_ext',
        docs: "Constructs the XML file from scratch, sourcing all necessary data from the specified database. It does not require a template file upload.",
        usage: [
            "Select the database to source data from.",
            "Enter the number of balance records to generate."
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
        sqlQueryKey: 'etd_balances'
    }
};
