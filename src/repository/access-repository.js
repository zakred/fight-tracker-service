const fs = require("fs");
const errorUtil = require("../util/errorUtil");
const global = require("../global");

class AccessRepository {
    db = {access: []};

    constructor() {
        this.DB_FILENAME = process.env.ACCESS_DB_FILENAME || "access-db.json";
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

    find = async (id) => {
        return this.db.access.find((x) => x.accessId === id);
    };

    findAllAuthenticatedUser(authUser) {
        return this.db.access.find((x) => x.subjectId === authUser.id);
    }

    findAllForFight(fightId) {
        return this.db.access.find(
            (x) => x.type === "FIGHT" && x.resourceId === fightId,
        );
    }

    create = async (authUser, person, resourceId, type) => {
        const reqAccess = {
            issuerId: authUser.id,
            type: type,
            resourceId: resourceId,
            role: person.role,
            email: person.email,
            status: global.ACCESS_STATUS.INVITED,
        };

        const access = await this.db.access.find(
            (x) =>
                x.type === reqAccess.type &&
                x.resourceId === reqAccess.resourceId &&
                x.email === reqAccess.email,
        );
        if (access) {
            errorUtil.throwEntityAlreadyExists(resourceId);
        }

        this.db.access.push(reqAccess);
        this.#persistDB(this.db);
        return 1;
    };

    delete = async (accessId) => {
        const access = await this.find(accessId);
        if (!access) {
            errorUtil.throwNotFound(accessId);
        }
        this.db.access = this.db.access.filter((x) => x.accessId !== accessId);
        this.#persistDB(this.db);
        return 1;
    };
}

module.exports = AccessRepository;
