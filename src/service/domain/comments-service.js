const {COMMENT_STATUS} = require("../../global");

class CommentsService {
    constructor(commentRepository) {
        this.repo = commentRepository;
    }

    setCommentsToFight = async (authUser, fight) => {
        const result = [];
        const comments = await this.repo.findAllByFightId(fight.fightId);
        comments.sort((a, b) => new Date(b.date) - new Date(a.date));
        let previousPerson;
        let side = true;
        const sortedComments = comments.map((comment) => {
            if (previousPerson === undefined) {
                previousPerson = comment.createdBy.id;
            } else if (previousPerson !== comment.createdBy.id) {
                previousPerson = comment.createdBy.id;
                side = !side;
            }
            comment.side = side ? "right" : "left";
            return comment;
        });
        sortedComments.map((comment) => {
            result.push({
                commentId: comment.commentId,
                name:
                    comment.createdBy.nickname ||
                    comment.createdBy.name ||
                    "User",
                avatarUrl: comment.createdBy.picture,
                side: comment.side,
                message: comment.message,
                createdAt: comment.createdAt,
                canDelete: authUser.id === comment.createdBy.id,
                isDeleted: comment.status === COMMENT_STATUS.DELETED,
            });
        });
        fight.comments = result;
    };
}

module.exports = CommentsService;
