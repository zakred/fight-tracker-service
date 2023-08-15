const AWS = require("aws-sdk");
const fs = require("fs");

AWS.config.update({
    region: process.env.AWS_REGION || "us-east-1",
});

const sharedInvitationHtml = fs.readFileSync(
    "src/email-templates/ft-fight-shared-invitation.html",
    "utf8",
);

class EmailService {
    apiVersion = process.env.SES_API_VERSION || "2019-09-27";
    privacyPolicyUrl =
        process.env.PRIVACY_POLICY_URL || "https://fight-tracker.com/privacy";
    termsOfUseUrl =
        process.env.TERMS_OF_USE_URL || "https://fight-tracker.com/terms";
    unsubscribeUrl =
        process.env.UNSUBSCRIBE_URL ||
        "https://fight-tracker.com/mail-unsubscribe";
    defaultAcceptLink =
        process.env.DEFAULT_ACCEPT_LINK || "https://fight-tracker.com";
    defaultIssuer = process.env.DEFAULT_ISSUER || "Someone";
    sharedInvitationTemplateName =
        process.env.SHARED_INVITATION_TEMPLATE_NAME ||
        "FIGHT_SHARED_INVITATION";
    constructor(emailFrom) {
        this.emailFrom = emailFrom;
        //this.deleteTemplate('FIGHT_SHARED_INVITATION')
        //this.createTemplate('FIGHT_SHARED_INVITATION', 'A fight has been shared!', sharedInvitationHtml);
    }

    deleteTemplate = (name) => {
        const sesv2 = new AWS.SESV2({apiVersion: this.apiVersion});
        sesv2.deleteEmailTemplate({TemplateName: name}, function (err, data) {
            if (err) console.log(err, err.stack);
            else console.log(data);
        });
    };
    createTemplate(name, subject, html) {
        try {
            const sesv2 = new AWS.SESV2({apiVersion: this.apiVersion});
            var params = {
                TemplateContent: {
                    Html: html,
                    Subject: subject,
                },
                TemplateName: name,
            };

            sesv2.createEmailTemplate(params, function (err, data) {
                if (err) console.log(err, err.stack);
                else console.log(data);
            });
        } catch (e) {
            console.log(e);
        }
    }

    sendShareInvitationEmailBulk = (emails, issuer) => {
        const sesv2 = new AWS.SESV2({apiVersion: this.apiVersion});

        const defaultData = {
            issuer: this.defaultIssuer,
            "privacy-policy": this.privacyPolicyUrl,
            "terms-of-use": this.termsOfUseUrl,
            unsubscribe: this.unsubscribeUrl,
            "accept-link": this.defaultAcceptLink,
        };

        const data = {
            issuer: issuer,
        };

        const params = {
            BulkEmailEntries: [],
            DefaultContent: {
                Template: {
                    TemplateData: JSON.stringify(defaultData),
                    TemplateName: this.sharedInvitationTemplateName,
                },
            },
            FromEmailAddress: this.emailFrom,
        };

        for (let i = 0; i < emails.length; i++) {
            const to = {
                Destination: {
                    ToAddresses: [emails[i]],
                },
                ReplacementEmailContent: {
                    ReplacementTemplate: {
                        ReplacementTemplateData: JSON.stringify(data),
                    },
                },
            };
            params.BulkEmailEntries.push(to);
        }

        sesv2.sendBulkEmail(params, function (err, data) {
            if (err) console.log(err, err.stack);
            else console.log(data);
        });
    };
}

module.exports = EmailService;
