const fs = require("fs");
const errorUtil = require("../util/error-util");
const global = require("../global");
const uuid = require("uuid");
const entityUtil = require("../util/entity-util");
const {ACCESS_STATUS, ACCESS_TYPE} = require("../global");

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
        return this.db.access.filter((x) => x.email === authUser.email);
    }

    findAllForResource = async (resourceId) => {
        return this.db.access.filter((x) => x.resourceId === resourceId);
    };

    create = async (authUser, person, resourceId, type) => {
        const reqAccess = {
            issuerId: authUser.id,
            type: type,
            resourceId: resourceId,
            role: person.role,
            email: person.email,
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

    updateRole = async (authUser, person, resourceId) => {
        const access = await this.db.access.find(
            (x) => x.resourceId === resourceId && x.email === person.email,
        );
        if (!access) {
            errorUtil.throwNotFound(resourceId);
        }
        access.role = person.role;
        entityUtil.addUpdateAudit(authUser, access);
        this.#persistDB(this.db);
        return 1;
    };

    async deleteById(accessId) {
        const access = await this.db.access.find(accessId);
        if (!access) {
            errorUtil.throwNotFound(accessId);
        }
        this.db.fights = this.db.fights.filter((x) => x.accessId !== accessId);
        this.#persistDB(this.db);
        return 1;
    }

    async deleteByResourceIdAndEmail(resourceId, email) {
        const entity = await this.findByResourceIdAndEmail(resourceId, email);
        if (!entity) {
            errorUtil.throwNotFound(resourceId);
        }
        this.db.access = this.db.access.filter(
            (x) => x.accessId !== entity.accessId,
        );
        this.#persistDB(this.db);
        return 1;
    }
    deleteAllFor = async (resourceId) => {
        const access = this.db.access.filter(
            (x) => x.resourceId === resourceId,
        );
        if (!access || access.length === 0) {
            return;
        }
        const accessIds = access.map((x) => x.accessId);
        this.db.access = this.db.access.filter(
            (x) => !accessIds.includes(x.accessId),
        );
        this.#persistDB(this.db);
        return 1;
    };
}

module.exports = AccessRepository;
