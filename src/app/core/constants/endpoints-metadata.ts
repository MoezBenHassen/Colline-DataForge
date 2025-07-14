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

export const GENERAL_FAQ_XLS = [
    { q: 'Which databases are supported?', a: 'Oracle, PostgreSQL, and MSSQL.' },
    { q: 'How do I clear template warnings?', a: 'Enable the "Clear warnings" option. This resets column and data tracking for your template.' },
    { q: 'Can I change the Excel column order?', a: 'Yes, the system dynamically maps your template columns, but will warn if columns are missing or renamed.' },
    { q: 'What happens if my DB has no data?', a: 'You’ll get a warning or the file will be empty. Populate your DB or try with randomized data.' },
    { q: 'What should my template include?', a: 'Include all columns you want to fill—missing or mismatched columns will be flagged in warnings.' },
    { q: 'What is the output file format?', a: 'You receive a downloadable .xlsx file with all data filled and formatted.' },
    { q: 'What if the template columns change?', a: 'Column changes are detected and you’ll get a warning in the X-Warnings header and the UI.' },
    { q: 'What should my template include?', a: 'Include all columns you want to fill—missing or mismatched columns will be flagged in warnings.' },
];

export const ENDPOINTS_METADATA: Record<string, EndpointMetadata> = {
    'interest-rate': {
        key: 'interest-rate',
        title: 'Interest Rate Generator',
        path: '/api/excel/interest-rate',
        shortDescription: 'Generate an Excel file filled with live or demo interest rates, tailored for your business needs. Upload a template and get back a ready-to-use .xlsx file.',
        swaggerTag: 'Excel Generation',
        operationId: 'generateExcel',
        docs: `
            **How it works:**
            - Upload your Excel template (with headers matching your required format).
            - Choose the target database (Oracle, PostgreSQL, or MSSQL).
            - Enter the number of rows to generate.
            - (Optional) Enable "Clear warnings" to reset template tracking info.

            This endpoint fills your Excel template with real or simulated interest rate data, validating columns and warning about any changes via the \`X-Warnings\` response header.

            _Use cases: test data generation, integration validation, Excel template onboarding._
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
                type: 'checkbox',
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
        ],
        docSection: 'interest-rates',
    },

    'fx-rates': {
        key: 'fx-rates',
        title: 'FX Rates Generator',
        path: '/api/excel/fx-rates',
        shortDescription: 'Create an Excel spreadsheet with real or simulated Foreign Exchange (FX) rates, using your template and live data from Oracle, PostgreSQL, or MSSQL.',
        swaggerTag: 'Excel Generation',
        operationId: 'generateFXRatesExcel',
        docs: `
            **How it works:**
            - Upload your FX rates Excel template.
            - Select the database connection.
            - Choose how many FX rate rows you want.
            - Optionally, enable "Clear warnings".

            This endpoint samples currencies from your DB, generates rates, and inserts them into your template. You’ll be alerted to missing data or header mismatches through the \`X-Warnings\` header.

            _Use cases: back-office FX testing, pricing tool demos, rapid Excel sample creation._
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
                type: 'checkbox',
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
        sampleFiles: ['/assets/screenshots/fx-rates-example.png'],
        sqlQuery: `SELECT ... FROM ... WHERE ... FETCH FIRST ? ROWS ONLY`,
        sqlQueryKey: 'fx_rates',
        faq: [
            { q: 'What fields are included?', a: 'Each row will include FX market set, currency, FX rate, and any columns required by your template.' },
            { q: 'How are currencies chosen?', a: 'Currencies are randomly sampled from your database’s available set.' },
            ...GENERAL_FAQ_XLS
        ],
        docSection: 'fx-rates',
    },

    'org-ratings': {
        key: 'org-ratings',
        title: 'Organisation Ratings Generator',
        path: '/api/excel/org-ratings',
        shortDescription: 'Download Excel sheets of simulated or real organisation ratings. Just upload your template and choose how many sample rows you need.',
        swaggerTag: 'Excel Generation',
        operationId: 'generateOrganisationRatings',
        docs: `
            **How it works:**
            - Upload your organisation ratings Excel template.
            - Select your database connection.
            - Enter the desired number of rows.
            - "Clear warnings" is optional.

            This endpoint fetches ratings from your DB, combines organisation parent names, and fills your template, while tracking any changes in columns. All warnings are returned in the \`X-Warnings\` response header.

            _Use cases: mock regulatory reports, analytics demos, QA data provisioning._
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
                type: 'checkbox',
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
        sampleFiles: ['/assets/screenshots/org-ratings-example.png'],
        sqlQuery: `SELECT ... FROM ... WHERE ... FETCH FIRST ? ROWS ONLY`,
        sqlQueryKey: 'organisation_ratings',
        faq: [
            { q: 'How is the parent organisation shown?', a: 'The parent organisation is formed by combining parent_short_name and parent_long_name columns.' },
            ...GENERAL_FAQ_XLS
        ],
        docSection: 'org-ratings',
    },

    'org-contacts': {
        key: 'org-contacts',
        title: 'Organisation Contacts Generator',
        path: '/api/excel/org-contacts',
        shortDescription: 'Generate Excel files with synthetic or real organisation contact information, formatted according to your template and chosen database.',
        swaggerTag: 'Excel Generation',
        operationId: 'generateOrganisationContacts',
        docs: `
            **How it works:**
            - Upload your Excel template for organisation contacts.
            - Choose your database connection.
            - Specify the number of rows to generate.
            - (Optional) Enable "Clear warnings" to reset template validation.

            This endpoint fills your template with contact data, auto-generating names, and combining parent organisation details. It tracks column changes and highlights issues in the X-Warnings header.

            _Use cases: test data for CRM integration, mass import dry runs, demo environments._
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
                type: 'checkbox',
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
        sampleFiles: ['/assets/screenshots/org-contacts-example.png'],
        sqlQuery: `SELECT ... FROM ... WHERE ... FETCH FIRST ? ROWS ONLY`,
        sqlQueryKey: 'organisation_contacts',
        faq: [
            { q: 'How are contact names generated?', a: 'Contact names are randomly assigned from a preset list to simulate realistic user data.' },
            { q: 'Are parent organisation names shown?', a: 'Yes, parent_short_name and parent_long_name are combined into a "parent" column.' },
            ...GENERAL_FAQ_XLS
        ],
        docSection: '',
    },
};
