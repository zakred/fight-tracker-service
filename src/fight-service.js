const uuid = require("uuid");

class FightService {
    constructor(fightRepository) {
        this.repo = fightRepository;
    }

    getFights = async () => {
        return this.repo.findAll();
    };

    createFight = async (req) => {
        this.repo.save(req);
        return {fightId: req.fightId};
    };

    updateFight = async (req) => {
        const fight = await this.repo.find(req.fightId);
        if (!fight) {
            throw new Error(`Fight ${req.fightId} not found`);
        }
        this.repo.save(req);
        return {message: "success"};
    };

    deleteFight = async (fightId) => {
        await this.repo.delete(fightId);

        return {message: "success"};
    };
}

module.exports = FightService;
