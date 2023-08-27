crypto = require("crypto");
class HMACService {
    constructor(secretKey) {
        this.secretKey = secretKey;
    }

    sign(params) {
        const nonce = crypto.randomBytes(16).toString("base64");
        const message = [...params, nonce].join("");
        const signature = crypto
            .createHmac("sha256", this.secretKey)
            .update(message)
            .digest("hex");
        return {
            nonce,
            signature,
        };
    }

    verifySignature(params, nonce, signature) {
        const message = [...params, nonce].join("");
        const verifiedSignature = crypto
            .createHmac("sha256", this.secretKey)
            .update(message)
            .digest("hex");
        try {
            return crypto.timingSafeEqual(
                Buffer.from(verifiedSignature),
                Buffer.from(signature),
            );
        } catch (e) {
            console.error("Failed to compare verified signature ", signature);
            return false;
        }
    }
}

module.exports = HMACService;
