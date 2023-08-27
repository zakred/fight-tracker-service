const global = require("../../global");
const errorUtil = require("../../util/error-util");
const {EMAIL_CATEGORY} = require("../../global");

class ShareService {
    constructor(
        fightService,
        accessService,
        awsEmailService,
        notificationService,
        emailService,
        fightOverviewPath,
    ) {
        this.fightService = fightService;
        this.accessService = accessService;
        this.awsEmailService = awsEmailService;
        this.notificationService = notificationService;
        this.emailService = emailService;
        this.fightOverviewPath = fightOverviewPath;
    }

    create = async (authUser, req) => {
        switch (req.type) {
            case global.ACCESS_TYPE.FIGHT:
                await this.#ensureAuthUserIsAuthorized(req, authUser);
                await this.accessService.createAccess(authUser, req);
                const emailsToNotify = req.persons.map((x) => x.email);
                const fight = await this.fightService.getFightById(
                    req.resourceId,
                );
                for (const email of emailsToNotify) {
                    await this.notificationService.notifyShare(
                        authUser,
                        fight.fightName,
                        "fight",
                        email,
                    );
                }
                const emailSubscribed = emailsToNotify.filter((email) =>
                    this.emailService.isEmailUnsubscribedFromCategory(
                        email,
                        EMAIL_CATEGORY.SHARED_RESOURCES,
                    ),
                );
                const emailsData = emailSubscribed.map((email) => {
                    const unsubscribeData =
                        this.emailService.createUnsubscribeData(
                            email,
                            EMAIL_CATEGORY.SHARED_RESOURCES,
                        );
                    return {
                        email,
                        unsubscribeData,
                        acceptLink:
                            this.fightOverviewPath + "/" + req.resourceId,
                    };
                });
                this.awsEmailService.sendShareInvitationEmailBulk(
                    emailsData,
                    authUser.name,
                );
                break;
            case global.ACCESS_TYPE.LIST:
                break;
            default:
                errorUtil.throwTypeNotSupported(req.type);
        }
    };

    updateRole = async (authUser, req) => {
        switch (req.type) {
            case global.ACCESS_TYPE.FIGHT:
                await this.#ensureAuthUserIsAuthorized(req, authUser);
                await this.accessService.updateRole(authUser, req);
                break;
            case global.ACCESS_TYPE.LIST:
                break;
            default:
                errorUtil.throwTypeNotSupported(req.type);
        }
    };

    delete = async (authUser, req) => {
        switch (req.type) {
            case global.ACCESS_TYPE.FIGHT:
                await this.#ensureAuthUserIsAuthorized(req, authUser);
                await this.accessService.deleteAccess(req);
                const emailsToNotify = req.persons.map((x) => x.email);
                //TODO template for deletion
                // this.emailService.sendShareInvitationEmailBulk(
                //     emailsToNotify,
                //     authUser.name,
                // );
                break;
            case global.ACCESS_TYPE.LIST:
                break;
            default:
                errorUtil.throwTypeNotSupported(req.type);
        }
    };

    async #ensureAuthUserIsAuthorized(req, authUser) {
        const fight = await this.fightService.getFightById(req.resourceId);
        if (!fight) {
            errorUtil.throwNotFound(req.resourceId);
        }
        if (fight.owner.id !== authUser.id) {
            const isAuthorizedToShare =
                await this.accessService.isResourceAuthorizedToShare(
                    authUser,
                    req.resourceId,
                );
            if (!isAuthorizedToShare) {
                errorUtil.throwForbiddenEntity(req.resourceId);
            }
        }
    }
}

module.exports = ShareService;
