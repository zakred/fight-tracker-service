const fs = require("fs");
const errorUtil = require("../util/error-util");
const uuid = require("uuid");

class NotificationRepository {
    db = {notifications: []};

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

    findAllAuthenticatedUser(authUser) {
        return this.db.notifications.filter(
            (x) => x.owner.email === authUser.email,
        );
    }

    create = async (req, ownerEmail) => {
        req.notificationId = uuid.v4();
        req.owner = {
            email: ownerEmail,
        };
        req.createdAt = new Date().toISOString();
        this.db.notifications.push(req);
        this.#persistDB(this.db);
        return 1;
    };

    async deleteById(authUser, notificationId) {
        const entity = await this.db.notifications.find(
            (x) => x.notificationId === notificationId,
        );
        if (!entity) {
            errorUtil.throwNotFound(notificationId);
        }
        if (entity.owner.email !== authUser.email) {
            errorUtil.throwForbiddenEntity(notificationId);
        }
        this.db.notifications = this.db.notifications.filter(
            (x) => x.notificationId !== notificationId,
        );
        this.#persistDB(this.db);
        return 1;
    }
}

module.exports = NotificationRepository;
