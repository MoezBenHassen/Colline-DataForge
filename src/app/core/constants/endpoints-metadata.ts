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
        shortDescription: 'Generate Excel files with dynamic asset booking and settlement data.',
        swaggerTag: 'Excel Generation',
        operationId: 'generateAssetBookingExcel',
        docs: 'Fills your template with asset booking records, including settlement status, par amount, and instrument IDs. This endpoint includes special logic to transform `settlementStatus` codes (e.g., \'127\' becomes \'Authorized\') and dynamically determines the `movement` type (e.g., Call, Delivery, Pay) based on the `assetClass` and the sign of the `parAmount`.',
        usage: [
            "Upload your asset booking template.",
            "Select the database and the number of rows to generate.",
            "The system automatically transforms status codes and generates movement data.",
            "Download the complete and formatted Excel file."
        ],
        notes: "The `movement` column's value is always generated by the system and will overwrite any data in that column in your template. Its value is determined by the `assetClass` ('CASH' or other) and whether the `parAmount` is positive or negative.",
        params: GENERAL_XLS_PARAMS,
        sqlQueryKey: 'asset_booking',
        faq: [
            { q: 'How is the "movement" column determined?', a: 'It is generated automatically based on the asset class and par amount. For example, a positive par amount for a non-cash asset will result in "Call" or "Recall". A negative amount for a cash asset could result in "Pay" or "Capitalize Pay".' },
            { q: 'What happens to the "settlementStatus" column?', a: 'Numeric codes from the database are automatically converted to human-readable text (e.g., 125 becomes "Pending").' },
            { q: 'Do I need to include "movement" in my template?', a: 'You can, but its value will be ignored and overwritten by the system\'s logic during generation.' },
            ...GENERAL_FAQ_XLS
        ]
    },
    'security': {
        key: 'security',
        title: 'Security Data Generator',
        path: '/api/excel/security',
        shortDescription: 'Create sample Excel files with financial security data, including asset types and issuers.',
        swaggerTag: 'Excel Generation',
        operationId: 'generateSecurityExcel',
        docs: 'Creates a financial security data file by combining asset information and issuer data from two separate database queries. This endpoint adds significant dynamic data, including randomized issue/maturity dates, instrument IDs, accrual bases, and frequencies. It also assigns issuers to securities cyclically from a fetched list.',
        usage: [
            "Upload your security data template.",
            "Select the database and number of rows to generate.",
            "The system fetches, combines, and randomizes data to populate the file.",
            "Optionally, bypass field tracking for new or modified templates.",
        ],
        notes: "This generator heavily augments your data. `issue_date` is always randomized. The `maty` (maturity date) is randomized only for non-equity/cash assets. `extisin` and `instrument` columns are synced with a random ID. `issuer` is assigned from a separate query, and `accrual_basis` and `frequency` are also randomized.",
        params: [
            ...GENERAL_XLS_PARAMS,
            { name: 'fieldTrackingBypass', label: 'Bypass Field Tracking', type: 'checkbox', required: false }
        ],
        sqlQueryKey: 'security',
        faq: [
            { q: 'Why is the "maty" (maturity date) column sometimes empty?', a: 'The maturity date is only generated for asset classes that are not "EQUITIES" or "CASH". For those types, the field is intentionally left blank.' },
            { q: 'Where does the "issuer" data come from?', a: 'The list of issuers is fetched from a separate database query and then randomly assigned to the security rows.' },
            { q: 'Are the "extisin" and "instrument" columns related?', a: 'Yes. For each row, the system generates one random instrument ID and uses it to populate both the `extisin` and `instrument` columns.' },
            { q: 'What does "Bypass Field Tracking" do?', a: 'This advanced option disables the validation of your template\'s column headers against the server\'s history. This is useful if you are intentionally using a new or modified template.' },
            ...GENERAL_FAQ_XLS
        ]
    },
    'mtm-feed': {
        key: 'mtm-feed',
        title: 'MTM Feed Generator',
        path: '/api/excel/mtm-feed',
        shortDescription: 'Generate a Mark-to-Market (MTM) feed file based on your template.',
        swaggerTag: 'Excel Generation',
        operationId: 'generateMTMFeedExcel',
        docs: 'Populates your template with Mark-to-Market (MTM) data using two database queries. The main query fetches trade references and product information, while a second query retrieves the system\'s base currency. This base currency is then used to populate the `mtmCcy` column for all rows.',
        usage: [
            "Upload your MTM feed template.",
            "Select the database and the number of rows to generate.",
            "The system automatically enriches the data with the base currency.",
            "Download the generated Excel file."
        ],
        notes: "If your template includes an `mtmCcy` column, its value will be **ignored** and **overwritten** with the system's base currency for all rows. Additionally, any prefixes like `CODES_` will be automatically removed from the `feedSystem` column.",
        params: GENERAL_XLS_PARAMS,
        sqlQueryKey: 'mtm_feed',
        faq: [
            { q: 'Where does the "mtmCcy" value come from?', a: 'The `mtmCcy` is automatically populated for all rows using the system\'s base currency, which is fetched from a separate database query (`system_base_ccy`).' },
            { q: 'What happens to the "feedSystem" column?', a: 'The service cleans up the `feedSystem` data by removing common prefixes like `CODES_` to provide a cleaner output.' },
            { q: 'Does this endpoint use more than one query?', a: 'Yes. It uses the main `mtm_feed` query for the trade data and a secondary `system_base_ccy` query to get the currency used in the `mtmCcy` column.' },
            ...GENERAL_FAQ_XLS
        ]
    },

    'tradeData': {
        key: 'tradeData',
        title: 'Trade Data Feed Generator',
        path: '/api/excel/tradeData',
        shortDescription: 'Create a standard trade data feed file from your template.',
        swaggerTag: 'Excel Generation',
        operationId: 'generateTradeDataFeed', // This maps to TradeDataFeedService2 in the controller
        docs: 'Generates a trade data feed using **two separate database queries**. The first fetches the main trade details, while the second retrieves a list of approved legal IDs. The endpoint ensures unique trade references and enriches the data by randomly assigning a `legal_id` and an `operation` type (e.g., \'NEW\', \'AMEND\') to each row. If the requested number of rows exceeds the available unique trades, it generates synthetic trades to fill the gap.',
        usage: [
            "Upload your trade data template.",
            "Select the database and the number of rows to generate.",
            "The system fetches data from both queries, ensures unique trades, and randomizes key fields.",
            "If needed, synthetic rows are added to meet the requested count."
        ],
        notes: "This endpoint has special logic: The `legal_id` for each trade is **randomly selected** from a list of approved IDs, not necessarily the trade's original ID. The `operation` column is always populated with a random value. If you request more rows than available unique trades, new rows with synthetic `traderef`s will be created.",
        params: GENERAL_XLS_PARAMS,
        // Since the component can handle an array, we can define the queries here directly.
        // The sqlQueryKey can be kept for reference or used as a primary lookup.
        sqlQueryKey: 'trade_data_feed',
        sqlQuery: `
-- Query 1: Fetches the primary trade data (using key 'trade_data_feed')
SELECT DISTINCT
  t.AGREEMENTID,
  h.EXTID AS legal_id,
  t.traderef AS "tradeRef",
  t.productid,
  p.refdatavalue AS "product",
  f.scheme AS "system",
  f.refdatavalue AS "colrefdata_refdatavalue"
FROM coltrades t
JOIN COLAGREEMENTHEADER h ON t.AGREEMENTID = h.ID
JOIN colrefdata p ON t.productid = p.id
JOIN colrefdata f ON p.refdatavalue = f.refdatavalue
WHERE ((h.STATUSID = 68 OR h.STATUSID = 67) AND businessline = 41 AND length(h.extid) <= 50)
  AND p.scheme LIKE 'Products'
  AND f.scheme IN (SELECT refdatavalue FROM colrefdata WHERE scheme = 'Scheme' AND refdatavalue LIKE 'CODES_%')
FETCH FIRST ? ROWS ONLY;

-- Query 2: Fetches the list of approved Legal IDs (using key 'trade_data_approved_extid')
SELECT extid AS "legal_id"
FROM COLAGREEMENTHEADER
WHERE statusid = 68
  AND businessline = 41
  AND LENGTH(extid) <= 50;
`,
        faq: [
            { q: 'Which SQL queries does this endpoint use?', a: 'It uses two: <code>trade_data_feed</code> to get the main trade data , and <code>trade_data_approved_extid</code> to get a list of valid legal IDs to choose from.' },
            { q: 'Why is the "legal_id" in my output file different from what I expect?', a: 'The `legal_id` is not taken directly from the trade record. Instead, it is randomly chosen from the list of approved legal IDs fetched by the second query.' },
            { q: 'Where does the "operation" column value come from?', a: 'The `operation` column is not from the database; it is automatically populated with a random value like "NEW", "AMEND", or "CANCEL" for each row.' },
            { q: 'What happens if I request 500 rows but only 100 unique trades exist?', a: 'The system will output the 100 unique trades and then generate 400 additional synthetic rows, each with a new unique `traderef`, to meet your request.' },
            ...GENERAL_FAQ_XLS
        ]
    },
    'agreement-udf': {
        key: 'agreement-udf',
        title: 'Agreement UDF Generator',
        path: '/api/excel/agreement-udf',
        shortDescription: 'Dynamically generate an Excel file with agreement IDs and database-defined custom fields (UDFs).',
        swaggerTag: 'Excel Generation',
        operationId: 'generateAgreementUDFExcel',
        docs: 'This powerful endpoint dynamically constructs an Excel file based on User-Defined Fields (UDFs) configured in your database. It fetches agreement IDs and UDF definitions, then generates a file with columns for `agreementId`, `legal_id` (empty), and every discovered UDF. The uploaded template is used as a base, but its columns are completely replaced by this dynamic structure.',
        usage: [
            "Upload a basic Excel template. The headers in your file will be replaced.",
            "Select your database and the number of agreement rows to generate.",
            "The system fetches all configured UDFs from the database to create new columns.",
            "Download the newly generated file containing agreement IDs and their corresponding UDF default values."
        ],
        notes: "This endpoint rebuilds the Excel file's columns. The headers in your uploaded template are ignored and replaced with `agreementId`, `legal_id`, and all UDFs found in the database. Each UDF column is filled with its default value for every row.",
        params: GENERAL_XLS_PARAMS,
        sqlQueryKey: 'udf_headers_defined',
        faq: [
            { q: 'What should my uploaded template contain?', a: 'Your template can be very simple. The system replaces the columns, so you can upload a nearly blank file or one with just placeholder headers.' },
            { q: 'Where do the UDF columns and values come from?', a: 'They are fetched directly from your database. The column headers and the default value for each row are determined by the system\'s UDF query.' },
            { q: 'Why is the "legal_id" column always empty?', a: 'This column is included as a placeholder for potential manual entry. The service does not populate it automatically.' },
            ...GENERAL_FAQ_XLS
        ]
    },
    'counterparty-amount': {
        key: 'counterparty-amount',
        title: 'Counterparty Amount Generator',
        path: '/api/excel/counterparty-amount',
        shortDescription: 'Generate Excel files with counterparty amount and event data.',
        swaggerTag: 'Excel Generation',
        operationId: 'generateCounterpartyAmountExcel',
        docs: 'This endpoint populates your Excel template with counterparty event data. It automatically transforms raw database codes for `action` (e.g., \'54\' becomes \'Return\') and `eventType` (e.g., \'1\' becomes \'VM\') into human-readable text, making the output clear and easy to understand.',
        usage: [
            "Upload your Excel template for counterparty amounts.",
            "Select the target database and specify the number of rows you need.",
            "The system will fetch data and apply the necessary transformations.",
            "Download the generated .xlsx file, ready for use."
        ],
        notes: "If your template includes a `counterpartyamount` column, it will be automatically populated with a randomly generated number. The `action` and `eventType` columns are translated from numeric codes to descriptive text based on predefined mappings.",
        params: GENERAL_XLS_PARAMS,
        sqlQueryKey: 'counterparty_amount',
        faq: [
            { q: 'How is the "action" column populated?', a: 'The action code from the database (e.g., 51, 54) is mapped to its corresponding text value (e.g., "Recall", "Return").' },
            { q: 'What happens to the "eventType" column?', a: 'Similar to action, the eventType code (e.g., 0, 1, 2) is converted to a readable format like "Net", "VM", or "IM".' },
            { q: 'Is the "counterpartyamount" column required?', a: 'No, but if you include it in your template, the system will fill it with a randomly generated numeric value to simulate real data.' },
            ...GENERAL_FAQ_XLS
        ]
    }
};
