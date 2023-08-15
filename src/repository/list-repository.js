const fs = require("fs");
const uuid = require("uuid");

class AccessRepository {
    db = {lists: []};

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

    find = async (id) => {
        return this.db.lists.find((x) => x.listId === id);
    };

    findAllWithAccess = async (accessArr, owner) => {
        const allowedListIds = accessArr.map((x) => x.resourceId);
        return this.db.lists.filter(
            (x) => allowedListIds.includes(x.listId) || x.owner.id === owner.id,
        );
    };

    save = async (req) => {
        if (!req.listId) {
            req.listId = uuid.v4();
        } else {
            const list = await this.find(req.listId);
            if (!list) {
                throw new Error(`Resource ${req.listId} not found`);
            }
            this.db.lists = this.db.lists.filter(
                (x) => x.listId !== req.listId,
            );
        }
        this.db.lists.push(req);
        this.#persistDB(this.db);
        return 1;
    };

    delete = async (listId) => {
        const list = await this.find(listId);
        if (!list) {
            throw new Error(`Resource ${req.listId} not found`);
        }
        this.db.lists = this.db.lists.filter((x) => x.listId !== listId);
        this.#persistDB(this.db);
        return 1;
    };
}

module.exports = AccessRepository;
