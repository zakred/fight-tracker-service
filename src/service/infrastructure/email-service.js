const {EMAIL_SUBSCRIPTION_DECISION} = require("../../global");
const errorUtil = require("../../util/error-util");

class EmailService {
    constructor(HMACService, emailPreferenceRepository, timeService) {
        this.HMACService = HMACService;
        this.emailPreferenceRepository = emailPreferenceRepository;
        this.timeService = timeService;
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
}

module.exports = EmailService;
