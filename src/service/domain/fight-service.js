const uuid = require("uuid");

class FightService {
    constructor(fightRepository, accessService) {
        this.repo = fightRepository;
        this.accessService = accessService;
    }

    getFights = async (authUser) => {
        const access = this.accessService.getAccessGranted(authUser);
        const fightIdsShared = this.accessService.getFightIdsShared(access);
        const allFights = await this.repo.findAllOwnedAndInFightIdList(
            authUser,
            fightIdsShared,
        );
        return this.accessService.setFightsAccessMetaData(allFights);
    };

    createFight = async (authUser, req) => {
        await this.repo.create(authUser, req);
        return {fightId: req.fightId};
    };

    updateFight = async (authUser, req) => {
        await this.repo.save(authUser, req);
        return {message: "success"};
    };

    deleteFight = async (fightId) => {
        await this.repo.delete(fightId);

        return {message: "success"};
    };
}

module.exports = FightService;
