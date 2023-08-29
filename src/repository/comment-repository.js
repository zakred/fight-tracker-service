const fs = require("fs");
const errorUtil = require("../util/error-util");
const uuid = require("uuid");
const entityUtil = require("../util/entity-util");
const {COMMENT_STATUS} = require("../global");

class CommentRepository {
    db = {comments: []};

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

    findByCommentId = async (commentId) => {
        return this.db.comments.find((x) => (x.commentId = commentId));
    };

    findAllByFightId = async (fightId) => {
        return this.db.comments.filter((x) => x.fightId === fightId);
    };
    create = async (authUser, fightId, message) => {
        const entity = {
            commentId: uuid.v4(),
            fightId: fightId,
            status: COMMENT_STATUS.CREATED,
            message: message,
        };
        entityUtil.addCreateAudit(authUser, entity);
        this.db.comments.push(entity);
        this.#persistDB(this.db);
        return entity.commentId;
    };

    archive = async (authUser, commentId) => {
        let entity = await this.db.comments.find(
            (x) => x.commentId === commentId,
        );
        if (!entity) {
            errorUtil.throwNotFound(commentId);
        }
        entity.status = COMMENT_STATUS.DELETED;
        entity.message = "<message deleted>";
        entityUtil.addUpdateAudit(authUser, entity);
        this.#persistDB(this.db);
        return 1;
    };
}

module.exports = CommentRepository;
