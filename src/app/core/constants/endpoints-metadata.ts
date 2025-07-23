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
    docs: string; // We'll keep this for a general description
    usage?: string[]; // For bulleted "How it works" steps
    notes?: string;   // For special tips or warnings
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

/**
 * A shared set of common parameters for most Excel generation endpoints.
 */
export const GENERAL_XLS_PARAMS: EndpointParam[] = [
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
];

/**
 * The main metadata configuration object for the application.
 */
export const ENDPOINTS_METADATA: Record<string, EndpointMetadata> = {
    'interest-rate': {
        key: 'interest-rate',
        title: 'Interest Rate Generator',
        path: '/api/excel/interest-rate',
        shortDescription: 'Generate an Excel file filled with live or demo interest rates.',
        swaggerTag: 'Excel Generation',
        operationId: 'generateExcel',
        docs: 'This endpoint fills your Excel template with real or simulated interest rate data, validating columns and warning about any changes.',
        usage: [
            "Upload your Excel template (with headers matching your required format).",
            "Choose the target database.",
            "Enter the number of rows to generate.",
            "Optionally, enable 'Clear warnings' to reset template tracking info."
        ],
        notes: "All validation warnings are returned in the `X-Warnings` response header. Check this after each run!",
        params: GENERAL_XLS_PARAMS,
        sqlQueryKey: 'interest_rate',
        faq: GENERAL_FAQ_XLS
    },
    'fx-rates': {
        key: 'fx-rates',
        title: 'FX Rates Generator',
        path: '/api/excel/fx-rates',
        shortDescription: 'Create an Excel spreadsheet with real or simulated Foreign Exchange (FX) rates.',
        swaggerTag: 'Excel Generation',
        operationId: 'generateFXRatesExcel',
        docs: 'This endpoint samples currencies from your DB, generates random rates, and inserts them into your template.',
        usage: [
            "Upload your FX rates Excel template.",
            "Select the database connection.",
            "Choose how many FX rate rows you want.",
        ],
        notes: "The number of rows generated will be limited by the number of unique currencies available in your database.",
        params: GENERAL_XLS_PARAMS,
        sqlQueryKey: 'fx_rates',
        faq: [
            { q: 'How are currencies chosen?', a: 'Currencies are randomly sampled from your database’s available set.' },
            ...GENERAL_FAQ_XLS
        ]
    },
    'org-ratings': {
        key: 'org-ratings',
        title: 'Organisation Ratings Generator',
        path: '/api/excel/org-ratings',
        shortDescription: 'Download Excel sheets of simulated or real organisation ratings.',
        swaggerTag: 'Excel Generation',
        operationId: 'generateOrganisationRatings',
        docs: 'Fetches ratings from your DB, combines organisation parent names, and fills your template.',
        usage: [
            "Upload your organisation ratings Excel template.",
            "Select your database connection.",
            "Enter the desired number of rows.",
        ],
        params: GENERAL_XLS_PARAMS,
        sqlQueryKey: 'organisation_ratings',
        faq: [
            { q: 'How is the parent organisation shown?', a: 'The `parent` column is automatically created by combining the `parent_short_name` and `parent_long_name` columns from the database.' },
            ...GENERAL_FAQ_XLS
        ]
    },
    'org-contacts': {
        key: 'org-contacts',
        title: 'Organisation Contacts Generator',
        path: '/api/excel/org-contacts',
        shortDescription: 'Generate Excel files with synthetic or real organisation contact information.',
        swaggerTag: 'Excel Generation',
        operationId: 'generateOrganisationContacts',
        docs: 'Fills your template with contact data, auto-generating names, and combining parent organisation details.',
        usage: [
            "Upload your Excel template for organisation contacts.",
            "Choose your database connection.",
            "Specify the number of rows to generate.",
        ],
        notes: "If a `contact_name` column exists in your template, it will be populated with a randomly selected name.",
        params: GENERAL_XLS_PARAMS,
        sqlQueryKey: 'organisation_contacts',
        faq: [
            { q: 'How are contact names generated?', a: 'Contact names are randomly assigned from a preset list to simulate realistic user data.' },
            ...GENERAL_FAQ_XLS
        ]
    },
    'interest-amount': {
        key: 'interest-amount',
        title: 'Interest Amount Generator',
        path: '/api/excel/interest-amount',
        shortDescription: 'Produce Excel files with interest amount and event data for financial agreements.',
        swaggerTag: 'Excel Generation',
        operationId: 'generateInterestManagerExcel',
        docs: 'This endpoint populates your template with detailed interest event data, including agreement IDs, sources, and dates. It also transforms codes for `direction` (Pay/Receive) and `interestSource` (Net, VM, IM, etc.) into readable text.',
        usage: [
        "Upload your interest amount template.",
        "Select the database and number of rows.",
        "Optionally, bypass the template column validation for advanced use cases."
    ],
        notes: "If your template includes an `agreedAmount` column, it will be populated with a randomly generated number.",
        params: [
        ...GENERAL_XLS_PARAMS,
        { name: 'fieldTrackingBypass', label: 'Bypass Field Tracking', type: 'checkbox', required: false }
    ],
        sqlQueryKey: 'interest_amount',
        faq: GENERAL_FAQ_XLS
    },
    'asset-booking': {
        key: 'asset-booking',
        title: 'Asset Booking Generator',
        path: '/api/excel/asset-booking',
        shortDescription: 'Generate Excel files containing asset booking and settlement data.',
        swaggerTag: 'Excel Generation',
        operationId: 'generateAssetBookingExcel',
        docs: 'Fills your template with asset booking records, including settlement status, par amount, and instrument IDs.',
        usage: [
            "Upload your asset booking template.",
            "Select the database and number of rows.",
        ],
        params: GENERAL_XLS_PARAMS,
        sqlQueryKey: 'asset_booking',
        faq: GENERAL_FAQ_XLS
    },
    'security': {
        key: 'security',
        title: 'Security Data Generator',
        path: '/api/excel/security',
        shortDescription: 'Create sample Excel files with financial security data, including asset types and issuers.',
        swaggerTag: 'Excel Generation',
        operationId: 'generateSecurityExcel',
        docs: 'This endpoint uses two separate queries to gather asset and issuer information to populate your template.',
        usage: [
            "Upload your security data template.",
            "Select the database and number of rows.",
            "Optionally, bypass field tracking.",
        ],
        params: [
            ...GENERAL_XLS_PARAMS,
            { name: 'fieldTrackingBypass', label: 'Bypass Field Tracking', type: 'checkbox', required: false }
        ],
        sqlQueryKey: 'security',
        faq: GENERAL_FAQ_XLS
    },
    'mtm-feed': {
        key: 'mtm-feed',
        title: 'MTM Feed Generator',
        path: '/api/excel/mtm-feed',
        shortDescription: 'Generate a Mark-to-Market (MTM) feed file based on your template.',
        swaggerTag: 'Excel Generation',
        operationId: 'generateMTMFeedExcel',
        docs: 'Populates your template with MTM data, including trade references and product information from your database.',
        usage: [
            "Upload your MTM feed template.",
            "Select the database and number of rows.",
        ],
        params: GENERAL_XLS_PARAMS,
        sqlQueryKey: 'mtm_feed',
        faq: GENERAL_FAQ_XLS
    },
    'trade-data': {
        key: 'trade-data',
        title: 'Trade Data Feed Generator',
        path: '/api/excel/tradeData',
        shortDescription: 'Create a standard trade data feed file from your template.',
        swaggerTag: 'Excel Generation',
        operationId: 'generateTradeDataFeed',
        docs: 'Generates a trade data feed, including legal IDs, trade references, and product details.',
        usage: [
            "Upload your trade data template.",
            "Select the database and number of rows.",
        ],
        params: GENERAL_XLS_PARAMS,
        sqlQueryKey: 'trade_data_feed',
        faq: GENERAL_FAQ_XLS
    },
    'trade-data2': {
        key: 'trade-data2',
        title: 'Trade Data Feed V2 (Agreements)',
        path: '/api/excel/tradeData2',
        shortDescription: 'Generate a trade data feed with special logic for agreement relations.',
        swaggerTag: 'Excel Generation',
        operationId: 'generateTradeDataFeed2',
        docs: 'This version of the trade data feed includes enhanced logic for handling agreement relationships.',
        usage: [
            "Upload your trade data template.",
            "Select the database and number of rows.",
        ],
        params: GENERAL_XLS_PARAMS,
        sqlQueryKey: 'trade_data_feed_joined',
        faq: GENERAL_FAQ_XLS
    },
    'agreement-udf': {
        key: 'agreement-udf',
        title: 'Agreement UDF Generator',
        path: '/api/excel/agreement-udf',
        shortDescription: 'Populate a template with Agreement User-Defined Fields (UDFs).',
        swaggerTag: 'Excel Generation',
        operationId: 'generateAgreementUDFExcel',
        docs: 'This endpoint is designed to fill templates that require custom, user-defined fields associated with agreements.',
        usage: [
            "Upload your UDF template.",
            "Select the database and number of rows.",
        ],
        params: GENERAL_XLS_PARAMS,
        sqlQueryKey: 'udf_headers_defined',
        faq: GENERAL_FAQ_XLS
    },
    'counterparty-amount': {
        key: 'counterparty-amount',
        title: 'Counterparty Amount Generator',
        path: '/api/excel/counterparty-amount',
        shortDescription: 'Generate Excel files with counterparty amount and event data.',
        swaggerTag: 'Excel Generation',
        operationId: 'generateCounterpartyAmountExcel',
        docs: 'Fills your template with data related to counterparty amounts, including event types and agreement details.',
        usage: [
            "Upload your counterparty amount template.",
            "Select the database and number of rows.",
        ],
        params: GENERAL_XLS_PARAMS,
        sqlQueryKey: 'counterparty_amount',
        faq: GENERAL_FAQ_XLS
    }
};
