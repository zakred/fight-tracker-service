const {EMAIL_SUBSCRIPTION_DECISION, EMAIL_CATEGORY} = require("../../global");
const errorUtil = require("../../util/error-util");

class EmailService {
    constructor(
        HMACService,
        emailPreferenceRepository,
        timeService,
        templateService,
        azureEmailService,
        emailConfig,
    ) {
        this.HMACService = HMACService;
        this.emailPreferenceRepository = emailPreferenceRepository;
        this.timeService = timeService;
        this.templateService = templateService;
        this.azureEmailService = azureEmailService;
        this.emailConfig = emailConfig;
    }

    createUnsubscribeData(email, category) {
        const expiration = this.timeService.unixTimestampInTwoMonths();
        const result = this.HMACService.sign([email, category, expiration]);
        const payload = {
            email,
            category,
            expiration,
            nonce: result.nonce,
            signature: result.signature,
        };
        let base64url = Buffer.from(JSON.stringify(payload)).toString(
            "base64url",
        );
        return base64url;
    }

    updateEmailPreference(base64Url, decision) {
        const jsonString = Buffer.from(base64Url, "base64url").toString(
            "ascii",
        );
        const payload = JSON.parse(jsonString);
        let isExpired = this.timeService.isUnixTimestampBeforeNow(
            payload.expiration,
        );
        if (isExpired) {
            errorUtil.throwRequestExpired();
        }
        let isSignatureValid = this.HMACService.verifySignature(
            [payload.email, payload.category, payload.expiration],
            payload.nonce,
            payload.signature,
        );
        if (isSignatureValid) {
            this.emailPreferenceRepository.save(
                payload.email,
                payload.category,
                decision,
            );
        } else {
            errorUtil.throwForbiddenEntity();
        }
    }

    isEmailUnsubscribedFromCategory = async (email, category) => {
        const preference =
            await this.emailPreferenceRepository.findByEmailCategory(
                email,
                category,
            );
        if (!preference) {
            return false;
        }
        return preference.decision === EMAIL_SUBSCRIPTION_DECISION.UNSUBSCRIBED;
    };

    sendShareInvitationEmailBulk = async (emailsToNotify, issuer) => {
        if (!emailsToNotify || emailsToNotify.length < 1) {
            console.log("No emails to send");
            return;
        }

        for (const email of emailsToNotify) {
            const isUnsubscribed = await this.isEmailUnsubscribedFromCategory(
                email,
                EMAIL_CATEGORY.SHARED_RESOURCES,
            );
            if (isUnsubscribed) {
                console.log(
                    `Skipping notify email ${
                        email.charAt(0) + email.charAt(1) + "****"
                    } it's unsubscribed from this mailing`,
                );
                continue;
            }
            const unsubscribeData = this.createUnsubscribeData(
                email,
                EMAIL_CATEGORY.SHARED_RESOURCES,
            );
            const template = this.templateService.shareResourceTemplate(
                issuer,
                unsubscribeData,
            );
            this.azureEmailService
                .sendEmail(
                    this.emailConfig.EMAIL_SUBJECT_SHARE_RESOURCE,
                    email,
                    template,
                )
                .then();
        }
    };
}

module.exports = EmailService;
