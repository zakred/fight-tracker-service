const jest = require("jest-mock");
const expect = require("@jest/expect");
const timeService =
    new (require("../../../src/service/infrastructure/time-service"))();
const HMACService =
    new (require("../../../src/service/infrastructure/hmac-service"))("123456");
const emailPreferenceRepository =
    new (require("../../../src/repository/email-preference-repository"))();
let sut;

suite("EmailService", async function () {
    suiteSetup(function () {
        sut =
            new (require("../../../src/service/infrastructure/email-service"))(
                HMACService,
                emailPreferenceRepository,
                timeService,
            );
    });

    suite("Create and verify unsubscribe", async function () {
        test("should create data for unsubscribe email and then verify it", async function () {
            const email = "email@example.com";
            const category = "category";
            const decision = "UNSUBSCRIBED";
            let sign = jest
                .spyOn(HMACService, HMACService.sign.name)
                .mockImplementation(() => {
                    return {nonce: "nonce", signature: "signature"};
                });
            let verifySignature = jest
                .spyOn(HMACService, HMACService.verifySignature.name)
                .mockImplementation(() => {
                    return {nonce: "nonce", signature: "signature"};
                });
            let timeGetTimeStamp = jest
                .spyOn(timeService, timeService.unixTimestampInTwoMonths.name)
                .mockImplementation(() => 1000);
            let isUnixTimestampBeforeNow = jest
                .spyOn(timeService, timeService.isUnixTimestampBeforeNow.name)
                .mockImplementation(() => false);
            let emailPreferenceRepoSave = jest
                .spyOn(
                    emailPreferenceRepository,
                    emailPreferenceRepository.save.name,
                )
                .mockImplementation(() => 1);

            const base64Url = sut.createUnsubscribeData(email, category);
            sut.updateEmailPreference(base64Url, decision);

            expect.jestExpect(sign).toBeCalledWith([email, category, 1000]);

            expect
                .jestExpect(base64Url)
                .toBe(
                    "eyJlbWFpbCI6ImVtYWlsQGV4YW1wbGUuY29tIiwiY2F0ZWdvcnkiOiJjYXRlZ29yeSIsImV4cGlyYXRpb24iOjEwMDAsIm5vbmNlIjoibm9uY2UiLCJzaWduYXR1cmUiOiJzaWduYXR1cmUifQ",
                );
            expect.jestExpect(verifySignature).toBeCalledTimes(1);
            expect
                .jestExpect(verifySignature)
                .toBeCalledWith([email, category, 1000], "nonce", "signature");

            expect
                .jestExpect(emailPreferenceRepoSave)
                .toBeCalledWith(email, category, decision);
        });
    });

    suite("Verify if email is unsubscribed", async function () {
        test("Email is unsubscribed from category", async function () {
            const email = "email@example.com";
            const category = "category";
            let emailPreferenceRepoFindByEmailCategory = jest
                .spyOn(
                    emailPreferenceRepository,
                    emailPreferenceRepository.findByEmailCategory.name,
                )
                .mockImplementation(() => true);

            const result = sut.isEmailUnsubscribedFromCategory(email, category);

            expect.jestExpect(result).toBeTruthy();
            expect
                .jestExpect(emailPreferenceRepoFindByEmailCategory)
                .toBeCalledTimes(1);
            expect
                .jestExpect(emailPreferenceRepoFindByEmailCategory)
                .toBeCalledWith(email, category);
        });
    });
});
