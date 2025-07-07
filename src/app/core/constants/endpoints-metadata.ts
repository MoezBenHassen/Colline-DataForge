export interface EndpointParam {
    name: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'file' | 'checkbox';
    required?: boolean;
    options?: string[]; // for select fields
    placeholder?: string;
}

export interface EndpointMetadata {
    key: string;
    title: string;
    path: string;
    shortDescription: string;
    docs: string;
    params: EndpointParam[];
    swaggerTag: string;      // The 'name' from the @Tag annotation in Spring Boot
    operationId: string;     // The controller method name, used by Swagger as an ID
    sampleFiles?: string[];  // URLs to sample files/screenshots
    sqlQuery?: string;
    sqlQueryKey?: string;
    faq?: { q: string; a: string }[];
    docSection?: string; // Section in the documentation where this endpoint is described
}

export const ENDPOINTS_METADATA: Record<string, EndpointMetadata> = {
    'interest-rate': {
        key: 'interest-rate',
        title: 'Interest Rate Generator',
        path: '/api/excel/interest-rate',
        shortDescription: 'Generate an Excel file with sample interest rates using live data.',
        swaggerTag: 'Excel Generation',
        operationId: 'generateExcel',
        docs: `
            **How it works:**
            - Select the database.
            - Choose number of rows.
            - (Optional) Download the Excel template.

            _This endpoint will generate an Excel file with random or real interest rates based on selected database._
        `,
        params: [
            {
                name: 'databaseType',
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
                placeholder: 'Enter number of rows'
            },
            {
                name: 'clearWarnings',
                type: 'checkbox', // <-- CHANGE from 'select' to 'checkbox'
                label: 'Clear warnings',
                required: false
            },
            {
                name: 'file',
                label: 'Excel Template',
                type: 'file',
                required: true
            }

        ],
        sampleFiles: ['/assets/screenshots/interest-rate-example.png'],
        sqlQuery: `SELECT ... FROM ... WHERE ... FETCH FIRST ? ROWS ONLY`,
        sqlQueryKey: 'interest_rate',
        faq: [
            { q: 'What is the Excel format?', a: 'The output is a .xlsx file. You can open it in Excel or LibreOffice.' },
            { q: 'What databases are supported?', a: 'Oracle, PostgreSQL, and MSSQL.' }
        ],
        docSection: "chose",

    },
    'fx-rates': {
        key: 'fx-rates',
        title: 'FX Rates Generator',
        path: '/api/excel/fx-rates',
        shortDescription: 'Generate an Excel file with sample interest rates using live data.',
        swaggerTag: 'Excel Generation',
        operationId: 'generateFXRatesExcel',
        docs: `
            **How it works:**
            - Select the database.
            - Choose number of rows.
            - (Optional) Download the Excel template.

            _This endpoint will generate an Excel file with random or real interest rates based on selected database._
        `,
        params: [
            {
                name: 'databaseType',
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
                placeholder: 'Enter number of rows'
            },
            {
                name: 'clearWarnings',
                type: 'checkbox', // <-- CHANGE from 'select' to 'checkbox'
                label: 'Clear warnings',
                required: false
            },
            {
                name: 'file',
                label: 'Excel Template',
                type: 'file',
                required: true
            }

        ],
        sampleFiles: ['/assets/screenshots/interest-rate-example.png'],
        sqlQuery: `SELECT ... FROM ... WHERE ... FETCH FIRST ? ROWS ONLY`,
        sqlQueryKey: 'fx_rates',
        faq: [
            { q: 'What is the Excel format?', a: 'The output is a .xlsx file. You can open it in Excel or LibreOffice.' },
            { q: 'What databases are supported?', a: 'Oracle, PostgreSQL, and MSSQL.' }
        ],
        docSection: "chose",

    }
    // ... Add more endpoints here!
};
