const global = require("../../global");
const errorUtil = require("../../util/error-util");
const {ACCESS_ROLE, ACCESS_STATUS} = require("../../global");

class CommentsService {
    constructor(commentRepository) {
        this.repo = commentRepository;
    }

    setCommentsToFight = async (authUser, fight) => {
        const result = [];
        const comments = await this.repo.findAllByFightId(fight.fightId);
        comments.map((comment) => {
            result.push({
                commentId: comment.commentId,
                name:
                    comment.createdBy.nickname ||
                    comment.createdBy.name ||
                    "User",
                avatarUrl: comment.createdBy.picture,
                message: comment.message,
                createdAt: comment.createdAt,
                canDelete: authUser.id === comment.createdBy.id,
            });
        });
        fight.comments = result;
    };
}

module.exports = CommentsService;
