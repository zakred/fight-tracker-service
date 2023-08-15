const fs = require("fs");
const uuid = require("uuid");
const errorUtil = require("../util/errorUtil");

class FightRepository {
    db = {fights: []};

    constructor() {
        this.DB_FILENAME = process.env.DB_FILENAME || "db.json";
        this.#loadDB(this.DB_FILENAME);
    }

    #loadDB(dbFilename) {
        if (!fs.existsSync(dbFilename)) {
            return;
        }
        this.db = JSON.parse(fs.readFileSync(dbFilename, "utf8"));
    }

    #persistDB(obj) {
        fs.writeFileSync(this.DB_FILENAME, JSON.stringify(obj, undefined, 2));
    }

    findAll = async () => {
        return this.db.fights;
    };

    findAllOwnedAndInFightIdList = async (authUser, fightIdList) => {
        return this.db.fights.filter(
            (x) =>
                x.owner.id === authUser.id || fightIdList.includes(x.fightId),
        );
    };

    find = async (id) => {
        return this.db.fights.find((x) => x.fightId === id);
    };

    create = async (authUser, req) => {
        req.fightId = uuid.v4();
        req.createdAt = new Date().toISOString();
        req.createdBy = {
            id: authUser.id,
            email: authUser.email,
        };
        req.owner = {
            id: authUser.id,
            email: authUser.email,
        };
        this.db.fights.push(req);
        this.#persistDB(this.db);
        return 1;
    };

    save = async (authUser, req) => {
        let fight = await this.find(req.fightId);
        if (!fight) {
            errorUtil.throwNotFound(req.fightId);
        }
        req.updatedBy = {
            id: authUser.id,
            email: authUser.email,
        };
        req.updatedAt = new Date().toISOString();

        this.#updateEntityAndAddExtraProperties(fight, req);
        this.db.fights = this.db.fights.filter(
            (x) => x.fightId !== req.fightId,
        );
        this.db.fights.push(fight);
        this.#persistDB(this.db);
        return 1;
    };

    #updateEntityAndAddExtraProperties(existing, updatedAndExtraProperties) {
        Object.keys(updatedAndExtraProperties).forEach(
            (k) => (existing[k] = updatedAndExtraProperties[k]),
        );
    }

    delete = async (fightId) => {
        const fight = await this.find(fightId);
        if (!fight) {
            errorUtil.throwNotFound(fightId);
        }
        this.db.fights = this.db.fights.filter((x) => x.fightId !== fightId);
        this.#persistDB(this.db);
        return 1;
    };
}

module.exports = FightRepository;
