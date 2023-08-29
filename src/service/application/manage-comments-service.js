const errorUtil = require("../../util/error-util");

class ManageCommentsService {
    constructor(fightService, accessService, commentRepository) {
        this.fightService = fightService;
        this.accessService = accessService;
        this.commentRepository = commentRepository;
    }

    createComment = async (authUser, req) => {
        await this.#ensureAuthUserIsAuthorized(authUser, req);
        const commentId = await this.commentRepository.create(
            authUser,
            req.fightId,
            req.message,
        );
        return {commentId};
    };

    /**
     * Delete the comment message but not the record so it shows as deleted with timestamp, only the owner of the comment can delete for now
     * @param authUser authenticated user
     * @param req request
     * @returns {Promise<void>} void
     */
    deleteComment = async (authUser, req) => {
        const comment = await this.commentRepository.findByCommentId(
            req.commentId,
        );
        if (!comment) {
            errorUtil.throwNotFound(req.commentId);
        }
        if (comment.createdBy.email !== authUser.email) {
            errorUtil.throwForbiddenEntity(req.commentId);
        }
        await this.commentRepository.archive(authUser, req.commentId);
    };

    async #ensureAuthUserIsAuthorized(authUser, req) {
        const fight = await this.fightService.getFightById(req.fightId);
        if (!fight) {
            errorUtil.throwNotFound(req.fightId);
        }
        if (fight.owner.id !== authUser.id) {
            const isAuthorizedToShare =
                await this.accessService.isResourceAuthorizedToView(
                    authUser,
                    req.fightId,
                );
            if (!isAuthorizedToShare) {
                errorUtil.throwForbiddenEntity(req.fightId);
            }
        }
    }
}

module.exports = ManageCommentsService;
