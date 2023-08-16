const fs = require("fs");
const errorUtil = require("../util/error-util");
const global = require("../global");
const uuid = require("uuid");
const entityUtil = require("../util/entity-util");
const {auth} = require("express-oauth2-jwt-bearer");

class AccessRepository {
    db = {access: []};

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

    findByResourceIdAndEmail = async (resourceId, email) => {
        return this.db.access.find(
            (x) => x.resourceId === resourceId && x.email === email,
        );
    };

    findAllAuthenticatedUser(authUser) {
        return this.db.access.find((x) => x.subjectId === authUser.id);
    }

    findAllForFight(fightId) {
        return this.db.access.find(
            (x) =>
                x.type === global.ACCESS_TYPE.FIGHT && x.resourceId === fightId,
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

        reqAccess.accessId = uuid.v4();
        entityUtil.addCreateAudit(authUser, reqAccess);
        this.db.access.push(reqAccess);
        this.#persistDB(this.db);
        return 1;
    };

    save = async (authUser, req) => {
        let entity = this.db.access.find((x) => x.accessId === req.accessId);
        if (!entity) {
            errorUtil.throwNotFound(req.accessId);
        }
        entityUtil.addUpdateAudit(authUser, req);
        entityUtil.updateEntityAndAddExtraProperties(entity, req);
        this.db.access = this.db.access.filter(
            (x) => x.accessId !== req.accessId,
        );
        this.db.access.push(entity);
        this.#persistDB(this.db);
        return 1;
    };

    delete = async (accessId) => {
        const access = await this.db.access.find(accessId);
        if (!access) {
            errorUtil.throwNotFound(accessId);
        }
        this.db.access = this.db.access.filter((x) => x.accessId !== accessId);
        this.#persistDB(this.db);
        return 1;
    };
}

module.exports = AccessRepository;
