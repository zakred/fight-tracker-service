const fs = require("fs");
const uuid = require("uuid");

class EmailPreferenceRepository {
    db = {emailPreference: []};

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

    findByEmailCategory = async (email, category) => {
        return this.db.emailPreference.find(
            (x) => x.email === email && x.category === category,
        );
    };

    save = async (email, category, decision) => {
        let entity = {
            email,
            category,
            decision,
        };
        const existing = this.db.emailPreference.find(
            (x) => x.email === email && x.category === category,
        );
        if (existing) {
            existing.decision = decision;
            existing.updatedAt = new Date().toISOString();
        } else {
            entity.id = uuid.v4();
            entity.createdAt = new Date().toISOString();
            this.db.emailPreference.push(entity);
        }
        this.#persistDB(this.db);
        return 1;
    };
}

module.exports = EmailPreferenceRepository;
