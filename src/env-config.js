const SERVER_PORT = getOrDefault("SERVER_PORT", 3005);
const CONTEXT_PATH = getOrDefault("CONTEXT_PATH", "/");
const AUTH_AUD = getRequired("AUTH_AUD");
const AUTH_ISSUER = getRequired("AUTH_ISSUER");
const ACCESS_DB_FILENAME = getOrDefault("ACCESS_DB_FILENAME", "access-db.json");
const DB_FILENAME = getOrDefault("DB_FILENAME", "db.json");
const LIST_DB_FILENAME = getOrDefault("LIST_DB_FILENAME", "lists-db.json");

const AWS_ACCESS_KEY_ID = getRequired("AWS_ACCESS_KEY_ID");
const AWS_SECRET_ACCESS_KEY = getRequired("AWS_SECRET_ACCESS_KEY");
const AWS_REGION = getOrDefault("AWS_REGION", "us-east-1");

const FQDN_EMAIL_TPL = getRequired("FQDN_EMAIL_TPL");
const email = {
    EMAIL_FROM: getRequired("EMAIL_FROM"),
    SES_API_VERSION: getOrDefault("SES_API_VERSION", "2019-09-27"),
    PRIVACY_POLICY_URL: getOrDefault(
        "PRIVACY_POLICY_URL",
        FQDN_EMAIL_TPL + "/privacy",
    ),
    TERMS_OF_USE_URL: getOrDefault(
        "TERMS_OF_USE_URL",
        FQDN_EMAIL_TPL + "/terms",
    ),
    UNSUBSCRIBE_URL: getOrDefault(
        "UNSUBSCRIBE_URL",
        FQDN_EMAIL_TPL + "/mail-unsubscribe",
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
    AWS_REGION,
    email,
};
