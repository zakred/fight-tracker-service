const {
    EmailClient,
    KnownEmailSendStatus,
} = require("@azure/communication-email");

class AzureEmailService {
    POLLER_WAIT_TIME = 10;

    constructor(emailConfig, azureConnString) {
        this.emailConfig = emailConfig;
        this.azureEmailClient = new EmailClient(azureConnString);
    }

    sendEmail = async (subject, email, html) => {
        try {
            const emailMasked = email.charAt(0) + email.charAt(1) + "****";
            const message = {
                senderAddress: this.emailConfig.EMAIL_FROM,
                content: {
                    subject: subject,
                    html: html,
                },
                recipients: {
                    to: [
                        {
                            address: email,
                            displayName: this.emailConfig.EMAIL_TO_DISPLAY_NAME,
                        },
                    ],
                },
            };

            const poller = await this.azureEmailClient.beginSend(message);

            if (!poller.getOperationState().isStarted) {
                throw "Poller was not started for: " + emailMasked;
            }

            let timeElapsed = 0;
            while (!poller.isDone()) {
                poller.poll();
                console.log(
                    "Email send polling in progress for: " + emailMasked,
                );

                await new Promise((resolve) =>
                    setTimeout(resolve, this.POLLER_WAIT_TIME * 1000),
                );
                timeElapsed += 10;

                if (timeElapsed > 18 * this.POLLER_WAIT_TIME) {
                    throw "Polling timed out for: " + emailMasked;
                }
            }

            if (poller.getResult().status === KnownEmailSendStatus.Succeeded) {
                console.log(
                    `Successfully sent the email (operation id: ${
                        poller.getResult().id
                    }) to: ${emailMasked}`,
                );
            } else {
                throw poller.getResult().error;
            }
        } catch (e) {
            console.log(e);
        } finally {
            html = undefined;
        }
    };
}

module.exports = AzureEmailService;
