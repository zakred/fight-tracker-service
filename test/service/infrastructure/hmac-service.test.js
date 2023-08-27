const sut = new (require("../../../src/service/infrastructure/hmac-service"))(
    "secret",
);
const assert = require("assert");

suite("HMACService", async function () {
    suite("HMAC Signature", async function () {
        test("should sign, return a nonce and then validate it", async function () {
            const message = "dummy";
            const message2 = "dummy";

            const result = sut.sign([message, message2]);
            const isValid = sut.verifySignature(
                [message, message2],
                result.nonce,
                result.signature,
            );

            assert.ok(isValid);
        });
    });
});
