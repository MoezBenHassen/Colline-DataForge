/**
 * Centralized API endpoints for the FileGen app.
 * Update only here if backend routes change!
 */

export const API = {
    AUTH: {
        LOGIN: '/auth/login'
        // Add logout/register/etc if you add them
    },

    DATABASE: {
        BASE: '/database-management',
        RELOAD_QUERIES: '/database-management/reload-queries',
        CONFIGURED: '/database-management/configured',
        PING_ALL: '/database-management/ping',
        PING: (databaseType: string) => `/database-management/ping/${databaseType}`,
        QUERIES: (databaseType: string) => `/database-management/queries/${databaseType}`,
        QUERY_KEYS: (databaseType: string) => `/database-management/query-keys/${databaseType}`,
        QUERY: (databaseType: string, key: string) =>
            `/database-management/queries/${databaseType}/${key}`
    },

    DISCOVERY: {
        ENDPOINTS: '/endpoints'
    },

    EXCEL: {
        BASE: '/excel',
        INTEREST_RATE: '/excel/interest-rate',
        INTEREST_AMOUNT: '/excel/interest-amount',
        ASSET_BOOKING: '/excel/asset-booking',
        SECURITY: '/excel/security',
        FX_RATES: '/excel/fx-rates',
        ORG_RATINGS: '/excel/org-ratings',
        ORG_CONTACTS: '/excel/org-contacts',
        MTM_FEED: '/excel/mtm-feed',
        TRADE_DATA: '/excel/tradeData',
        TRADE_DATA2: '/excel/tradeData2',
        AGREEMENT_UDF: '/excel/agreement-udf',
        COUNTERPARTY_AMOUNT: '/excel/counterparty-amount'
    },

    FIELD_TRACKING_ADMIN: {
        BASE: '/field-tracking-admin',
        LIST: '/field-tracking-admin/list',
        TRUNCATE: '/field-tracking-admin/truncate',
        DROP: '/field-tracking-admin/drop'
    },

    QRY_JSON: {
        BASE: '/qry/json'
        // Add sub-endpoints as you implement them
    },

    XML: {
        BASE: '/xml',
        GENERATE_AGREEMENTS: '/xml/generate-agreements',
        GENERATE_COMPLEX_ELIGIBILITY: '/xml/generate-complex-eligibility-rules',
        GENERATE_NORMAL_ELIGIBILITY: '/xml/generate-normal-eligibility-rules',
        GENERATE_ETD_BALANCES_EXTID: '/xml/generate-etd-balances-extid'
        // If you ever enable the commented endpoint, add here too
        // GENERATE_ETD_BALANCES: '/xml/generate-etd-balances'
    }
};
