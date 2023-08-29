const SERVER_PORT = getOrDefault("SERVER_PORT", 3005);
const CONTEXT_PATH = getOrDefault("CONTEXT_PATH", "/");
const AUTH_AUD = getRequired("AUTH_AUD");
const AUTH_ISSUER = getRequired("AUTH_ISSUER");
const ACCESS_DB_FILENAME = getOrDefault("ACCESS_DB_FILENAME", "access-db.json");
const DB_FILENAME = getOrDefault("DB_FILENAME", "db.json");
const LIST_DB_FILENAME = getOrDefault("LIST_DB_FILENAME", "lists-db.json");
const NOTIFICATIONS_DB_FILENAME = getOrDefault(
    "NOTIFICATIONS_DB_FILENAME",
    "notifications-db.json",
);
const EMAIL_PREFERENCES_DB_FILENAME = getOrDefault(
    "EMAIL_PREFERENCES_DB_FILENAME",
    "email-preferences-db.json",
);
const COMMENTS_DB_FILENAME = getOrDefault(
    "COMMENTS_DB_FILENAME",
    "comments-db.json",
);

const SERVER_SIGNING_SECRET_KEY = getRequired("SERVER_SIGNING_SECRET_KEY");
const AZURE_COMMUNICATION_CONNECTION_STRING = getRequired(
    "AZURE_COMMUNICATION_CONNECTION_STRING",
);

const FQDN_EMAIL_TPL = getRequired("FQDN_EMAIL_TPL");
const email = {
    EMAIL_FROM: getRequired("EMAIL_FROM"),
    EMAIL_TO_DISPLAY_NAME: getOrDefault("EMAIL_TO_DISPLAY_NAME", "Fighter"),
    EMAIL_SUBJECT_SHARE_RESOURCE: getOrDefault(
        "EMAIL_SUBJECT",
        "A fight has been shared!",
    ),
    PRIVACY_POLICY_URL: getOrDefault(
        "PRIVACY_POLICY_URL",
        FQDN_EMAIL_TPL + "/privacy",
    ),
    TERMS_OF_USE_URL: getOrDefault(
        "TERMS_OF_USE_URL",
        FQDN_EMAIL_TPL + "/terms",
    ),
    FIGHT_OVERVIEW_PATH: getOrDefault(
        "FIGHT_OVERVIEW_PATH",
        FQDN_EMAIL_TPL + "/fights-overview",
    ),
    UNSUBSCRIBE_URL: getOrDefault(
        "UNSUBSCRIBE_URL",
        FQDN_EMAIL_TPL + "/email-subscription",
    ),
    DEFAULT_ACCEPT_LINK: getOrDefault("DEFAULT_ACCEPT_LINK", FQDN_EMAIL_TPL),
    DEFAULT_ISSUER: getOrDefault("DEFAULT_ISSUER", "Someone"),
    SHARED_INVITATION_TEMPLATE_NAME: getOrDefault(
        "SHARED_INVITATION_TEMPLATE_NAME",
        "FIGHT_SHARED_INVITATION",
    ),
};
function getRequired(envName) {
    const v = process.env[envName];
    if (!v) {
        throw {
            name: "ENV_CONFIG_MISSING",
            message: `Provide the ENV "${envName}" to start the server`,
        };
    }
    return v;
}

function getOrDefault(envName, defaultValue) {
    return process.env[envName] || defaultValue;
}

module.exports = {
    SERVER_PORT,
    CONTEXT_PATH,
    AUTH_AUD,
    AUTH_ISSUER,
    DB_FILENAME,
    ACCESS_DB_FILENAME,
    LIST_DB_FILENAME,
    EMAIL_PREFERENCES_DB_FILENAME,
    NOTIFICATIONS_DB_FILENAME,
    email,
    COMMENTS_DB_FILENAME,
    SERVER_SIGNING_SECRET_KEY,
    AZURE_COMMUNICATION_CONNECTION_STRING,
};
