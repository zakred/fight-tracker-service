const fs = require("fs");

const sharedInvitationHtml = fs.readFileSync(
    "src/email-templates/ft-fight-shared-invitation.html",
    "utf8",
);

class TemplateService {
    REPLACE_TEMPLATE_PATTERN = /{{\w+(?:-\w+)*}}/g;
    constructor(emailConfig) {
        this.emailConfig = emailConfig;
    }

    #replaceTemplate = (template, data) => {
        return template.replace(
            this.REPLACE_TEMPLATE_PATTERN,
            (all) => data[all] || all,
        );
    };

    shareResourceTemplate(issuer, unsubscribeData) {
        const data = {
            "{{issuer}}": issuer || this.emailConfig.DEFAULT_ISSUER,
            "{{privacy-policy}}": this.emailConfig.PRIVACY_POLICY_URL,
            "{{terms-of-use}}": this.emailConfig.TERMS_OF_USE_URL,
            "{{accept-link}}": this.emailConfig.DEFAULT_ACCEPT_LINK,
        };
        data["{{unsubscribe}}"] =
            this.emailConfig.UNSUBSCRIBE_URL + "?data=" + unsubscribeData;
        return this.#replaceTemplate(sharedInvitationHtml, data);
    }
}

module.exports = TemplateService;
