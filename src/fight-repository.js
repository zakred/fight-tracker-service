const fs = require("fs");
const uuid = require("uuid");

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

    find = async (id) => {
        return this.db.fights.find((x) => x.fightId === id);
    };

    save = async (req) => {
        if (!req.fightId) {
            req.fightId = uuid.v4();
        } else {
            const fight = await this.find(req.fightId);
            if (!fight) {
                throw new Error("Fight not found");
            }
            this.db.fights = this.db.fights.filter(
                (x) => x.fightId !== req.fightId,
            );
        }
        this.db.fights.push(req);
        this.#persistDB(this.db);
        return 1;
    };

    delete = async (fightId) => {
        const fight = await this.find(fightId);
        if (!fight) {
            throw new Error("Fight not found");
        }
        this.db.fights = this.db.fights.filter((x) => x.fightId !== fightId);
        this.#persistDB(this.db);
        return 1;
    };
}

module.exports = FightRepository;
