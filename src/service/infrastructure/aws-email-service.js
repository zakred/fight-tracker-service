const AWS = require("aws-sdk");
const fs = require("fs");

const sharedInvitationHtml = fs.readFileSync(
    "src/email-templates/ft-fight-shared-invitation.html",
    "utf8",
);

class AwsEmailService {
    constructor(awsRegion, emailConfig) {
        this.emailConfig = emailConfig;

        AWS.config.update({
            region: awsRegion,
        });

        //this.deleteTemplate('FIGHT_SHARED_INVITATION')
        //this.createTemplate('FIGHT_SHARED_INVITATION', 'A fight has been shared!', sharedInvitationHtml);
    }

    deleteTemplate = (name) => {
        const sesv2 = new AWS.SESV2({
            apiVersion: this.emailConfig.SES_API_VERSION,
        });
        sesv2.deleteEmailTemplate({TemplateName: name}, function (err, data) {
            if (err) console.log(err, err.stack);
            else console.log(data);
        });
    };
    createTemplate(name, subject, html) {
        try {
            const sesv2 = new AWS.SESV2({
                apiVersion: this.emailConfig.SES_API_VERSION,
            });
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

    sendShareInvitationEmailBulk = (emailsData, issuer) => {
        const sesv2 = new AWS.SESV2({
            apiVersion: this.emailConfig.SES_API_VERSION,
        });

        const defaultData = {
            issuer: this.emailConfig.DEFAULT_ISSUER,
            "privacy-policy": this.emailConfig.PRIVACY_POLICY_URL,
            "terms-of-use": this.emailConfig.TERMS_OF_USE_URL,
            unsubscribe: this.emailConfig.UNSUBSCRIBE_URL,
            "accept-link": this.emailConfig.DEFAULT_ACCEPT_LINK,
        };

        const data = {
            issuer: issuer,
        };

        const params = {
            BulkEmailEntries: [],
            DefaultContent: {
                Template: {
                    TemplateData: JSON.stringify(defaultData),
                    TemplateName:
                        this.emailConfig.SHARED_INVITATION_TEMPLATE_NAME,
                },
            },
            FromEmailAddress: this.emailConfig.EMAIL_FROM,
        };

        for (const emailData of emailsData) {
            data.unsubscribe =
                this.emailConfig.UNSUBSCRIBE_URL +
                "?data=" +
                emailData.unsubscribeData;
            data["accept-link"] = emailData.acceptLink;
            const to = {
                Destination: {
                    ToAddresses: [emailData.email],
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

module.exports = AwsEmailService;
