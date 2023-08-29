const global = require("../../global");
const errorUtil = require("../../util/error-util");
const {ACCESS_TYPE} = require("../../global");

class ShareService {
    constructor(
        fightService,
        accessService,
        notificationService,
        emailService,
    ) {
        this.fightService = fightService;
        this.accessService = accessService;
        this.notificationService = notificationService;
        this.emailService = emailService;
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
                        ACCESS_TYPE.FIGHT.toLowerCase(),
                        email,
                    );
                }
                this.emailService.sendShareInvitationEmailBulk(
                    emailsToNotify,
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
