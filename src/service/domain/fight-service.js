const errorUtil = require("../../util/error-util");

class FightService {
    constructor(fightRepository, accessService, commentsService) {
        this.repo = fightRepository;
        this.accessService = accessService;
        this.commentsService = commentsService;
    }

    getFightById = async (fightId) => {
        return this.repo.find(fightId);
    };

    getFights = async (authUser) => {
        const access = this.accessService.getAccessGranted(authUser);
        const fightIdsShared = this.accessService.getFightIdsShared(access);
        const allFights = await this.repo.findAllOwnedAndInFightIdList(
            authUser,
            fightIdsShared,
        );
        const fightsWithMetaData =
            await this.accessService.setFightsAccessMetaData(
                authUser,
                allFights,
            );
        for (const fight of fightsWithMetaData) {
            await this.commentsService.setCommentsToFight(authUser, fight);
        }
        fightsWithMetaData.map(this.#deleteInternalFightProperties);

        return fightsWithMetaData;
    };

    #deleteInternalFightProperties = (fight) => {
        delete fight.owner;
        delete fight.createdBy;
        delete fight.updatedBy;
        delete fight.createdAt;
        delete fight.updatedAt;
    };

    createFight = async (authUser, req) => {
        await this.repo.create(authUser, req);
        return {fightId: req.fightId};
    };

    updateFightEnsureAccess = async (authUser, req) => {
        await this.#ensureAuthUserIsAuthorizedEdit(req.fightId, authUser);

        await this.repo.save(authUser, req);
        return {message: "success"};
    };

    async #ensureAuthUserIsAuthorized(fightId, authUser, shareType) {
        let fight = await this.getFightById(fightId);
        if (!fight) {
            errorUtil.throwNotFound(fightId);
        }
        if (fight.owner.id !== authUser.id) {
            const isAuthorizedToShare =
                await this.accessService.isResourceAuthorized(
                    authUser,
                    fightId,
                    shareType,
                );
            if (!isAuthorizedToShare) {
                errorUtil.throwForbiddenEntity(fightId);
            }
        }
    }

    async #ensureAuthUserIsAuthorizedShare(fightId, authUser) {
        return await this.#ensureAuthUserIsAuthorized(
            fightId,
            authUser,
            "SHARE",
        );
    }

    async #ensureAuthUserIsAuthorizedEdit(fightId, authUser) {
        return await this.#ensureAuthUserIsAuthorized(
            fightId,
            authUser,
            "EDIT",
        );
    }

    deleteFight = async (authUser, fightId) => {
        // only the owner ID can delete the fight
        let fight = await this.getFightById(fightId);
        if (!fight) {
            errorUtil.throwNotFound(fightId);
        }
        if (fight.owner.id !== authUser.id) {
            errorUtil.throwForbiddenEntity(fightId);
        }

        await this.repo.delete(fightId);
        await this.accessService.deleteAllFor(fightId);
        return {message: "success"};
    };
}

module.exports = FightService;
