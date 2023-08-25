const global = require("../../global");
const errorUtil = require("../../util/error-util");

class ShareService {
    constructor(fightService, accessService, emailService) {
        this.fightService = fightService;
        this.accessService = accessService;
        this.emailService = emailService;
    }

    create = async (authUser, req) => {
        switch (req.type) {
            case global.ACCESS_TYPE.FIGHT:
                await this.#ensureAuthUserIsAuthorized(req, authUser);
                await this.accessService.createAccess(authUser, req);
                const emailsToNotify = req.persons.map((x) => x.email);
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
