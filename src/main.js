const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const {auth, requiredScopes} = require("express-oauth2-jwt-bearer");
const envConfig = require("./env-config");
const errorUtil = require("./util/error-util");
const {SCOPES} = require("./global");
const timeService = new (require("./service/infrastructure/time-service"))();
const HMACService = new (require("./service/infrastructure/hmac-service"))(
    envConfig.SERVER_SIGNING_SECRET_KEY,
);
const AccessRepository = require("./repository/access-repository");
const accessService = new (require("./service/domain/access-service"))(
    new AccessRepository(envConfig.ACCESS_DB_FILENAME),
);
const commentRepository = new (require("./repository/comment-repository"))(
    envConfig.COMMENTS_DB_FILENAME,
);
const commentsService = new (require("./service/domain/comments-service"))(
    commentRepository,
);
const FightRepository = require("./repository/fight-repository");
const FightService = require("./service/domain/fight-service");
const fightService = new FightService(
    new FightRepository(envConfig.DB_FILENAME),
    accessService,
    commentsService,
);
const manageCommentsService =
    new (require("./service/application/manage-comments-service"))(
        fightService,
        accessService,
        commentRepository,
    );
const validatorSchema =
    new (require("./service/domain/schema-validator-service"))();
const templateService = new (require("./service/domain/template-service"))(
    envConfig.email,
);
const emailPreferenceRepository =
    new (require("./repository/email-preference-repository"))(
        envConfig.EMAIL_PREFERENCES_DB_FILENAME,
    );
const azureEmailService =
    new (require("./service/infrastructure/azure-email-service"))(
        envConfig.email,
        envConfig.AZURE_COMMUNICATION_CONNECTION_STRING,
    );
const emailService = new (require("./service/infrastructure/email-service"))(
    HMACService,
    emailPreferenceRepository,
    timeService,
    templateService,
    azureEmailService,
    envConfig.email,
);
const notificationRepository =
    new (require("./repository/notification-repository"))(
        envConfig.NOTIFICATIONS_DB_FILENAME,
    );
const notificationService =
    new (require("./service/domain/notification-service"))(
        notificationRepository,
    );
const shareService = new (require("./service/application/share-service"))(
    fightService,
    accessService,
    notificationService,
    emailService,
);

const checkJwt = auth({
    audience: envConfig.AUTH_AUD.split(","),
    issuerBaseURL: envConfig.AUTH_ISSUER,
});

const getAuthUser = (auth) => {
    return {
        id: auth.payload.user_id,
        email: auth.payload.email,
        name: auth.payload.name,
        nickname: auth.payload.nickname,
        picture: auth.payload.picture,
    };
};

const asyncHandler = (fn) => (req, res, next) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
};

const app = express();
const router = express.Router();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(envConfig.CONTEXT_PATH, router);
app.use(errorUtil.mwError);

router.get(
    "/fight/retrieve",
    checkJwt,
    requiredScopes(SCOPES.FIGHTS_READ),
    asyncHandler(async (req, res) => {
        const authUser = getAuthUser(req.auth);
        const result = await fightService.getFights(authUser);
        res.status(200).json(result ?? {error: "no response"});
    }),
);

router.post(
    "/fight/create",
    checkJwt,
    requiredScopes(SCOPES.FIGHTS_CREATE),
    validatorSchema.mwCreateFightRequest,
    asyncHandler(async (req, res) => {
        const authUser = getAuthUser(req.auth);
        const result = await fightService.createFight(
            authUser,
            req.validatedBody,
        );
        res.status(201).json(result ?? {error: "no response"});
    }),
);

router.put(
    "/fight/update",
    checkJwt,
    requiredScopes(SCOPES.FIGHTS_UPDATE),
    validatorSchema.mwUpdateFightRequest,
    asyncHandler(async (req, res) => {
        const authUser = getAuthUser(req.auth);
        const result = await fightService.updateFightEnsureAccess(
            authUser,
            req.validatedBody,
        );
        res.status(204).end();
    }),
);

router.post(
    "/fight/delete",
    checkJwt,
    requiredScopes(SCOPES.FIGHTS_DELETE),
    asyncHandler(async (req, res) => {
        const authUser = getAuthUser(req.auth);
        const result = await fightService.deleteFight(
            authUser,
            req.body.fightId,
        );
        res.status(204).end();
    }),
);

router.post(
    "/fight/comment/create",
    checkJwt,
    requiredScopes(SCOPES.COMMENTS_CREATE),
    validatorSchema.mwCreateCommentRequest,
    asyncHandler(async (req, res) => {
        const authUser = getAuthUser(req.auth);
        const result = await manageCommentsService.createComment(
            authUser,
            req.validatedBody,
        );
        res.status(201).json(result ?? {message: "success"});
    }),
);

router.post(
    "/fight/comment/delete",
    checkJwt,
    requiredScopes(SCOPES.COMMENTS_DELETE),
    validatorSchema.mwDeleteCommentRequest,
    asyncHandler(async (req, res) => {
        const authUser = getAuthUser(req.auth);
        await manageCommentsService.deleteComment(authUser, req.validatedBody);
        res.status(204).end();
    }),
);

router.post(
    "/share/create",
    checkJwt,
    requiredScopes(SCOPES.SHARE_RESOURCE_CREATE),
    validatorSchema.mwCreateShareRequest,
    asyncHandler(async (req, res) => {
        const authUser = getAuthUser(req.auth);
        const result = await shareService.create(authUser, req.validatedBody);
        res.status(201).json(result ?? {message: "success"});
    }),
);

router.put(
    "/share/update-role",
    checkJwt,
    requiredScopes(SCOPES.SHARE_RESOURCE_UPDATE_ROLE),
    validatorSchema.mwUpdateRoleShareRequest,
    asyncHandler(async (req, res) => {
        const authUser = getAuthUser(req.auth);
        const result = await shareService.updateRole(
            authUser,
            req.validatedBody,
        );
        res.status(204).end();
    }),
);

router.post(
    "/share/delete",
    checkJwt,
    requiredScopes(SCOPES.SHARE_RESOURCE_DELETE),
    validatorSchema.mwDeleteShareRequest,
    asyncHandler(async (req, res) => {
        const authUser = getAuthUser(req.auth);
        const result = await shareService.delete(authUser, req.validatedBody);
        res.status(204).end();
    }),
);

router.get(
    "/notifications/retrieve",
    checkJwt,
    requiredScopes(SCOPES.NOTIFICATIONS_READ),
    asyncHandler(async (req, res) => {
        const authUser = getAuthUser(req.auth);
        const result = await notificationService.retrieveAllAuthenticated(
            authUser,
        );
        res.status(200).json(result ?? {error: "no response"});
    }),
);

router.post(
    "/notifications/delete",
    checkJwt,
    requiredScopes(SCOPES.NOTIFICATIONS_DELETE),
    validatorSchema.mwDeleteNotificationsRequest,
    asyncHandler(async (req, res) => {
        const authUser = getAuthUser(req.auth);
        const result = await notificationService.deleteNotifications(
            authUser,
            req.validatedBody.notifications,
        );
        res.status(204).end();
    }),
);

router.put(
    "/email-subscription/update",
    validatorSchema.mwUpdateEmailSubscriptionRequest,
    asyncHandler(async (req, res) => {
        await emailService.updateEmailPreference(
            req.validatedBody.data,
            req.validatedBody.decision,
        );
        res.status(204).end();
    }),
);

app.listen(envConfig.SERVER_PORT, () => {
    console.log(`Server listening on port ${envConfig.SERVER_PORT}`);
});
