const fs = require("fs");
const uuid = require("uuid");
const errorUtil = require("../util/error-util");
const entityUtil = require("../util/entity-util");

class FightRepository {
    db = {fights: []};

    constructor(dbFilename) {
        this.DB_FILENAME = dbFilename;
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
        entityUtil.addCreateAuditWithOwner(authUser, req);
        this.db.fights.push(req);
        this.#persistDB(this.db);
        return 1;
    };

    save = async (authUser, req) => {
        let fight = await this.find(req.fightId);
        if (!fight) {
            errorUtil.throwNotFound(req.fightId);
        }
        entityUtil.updateEntityAndAddExtraProperties(fight, req);
        this.db.fights = this.db.fights.filter(
            (x) => x.fightId !== req.fightId,
        );
        this.db.fights.push(fight);
        this.#persistDB(this.db);
        return 1;
    };

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
