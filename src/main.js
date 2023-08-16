const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const {auth, requiredScopes} = require("express-oauth2-jwt-bearer");
const envConfig = require("./env-config");
const AccessRepository = require("./repository/access-repository");
const accessService = new (require("./service/domain/access-service"))(
    new AccessRepository(envConfig.ACCESS_DB_FILENAME),
);
const FightRepository = require("./repository/fight-repository");
const FightService = require("./service/domain/fight-service");
const fightService = new FightService(
    new FightRepository(envConfig.DB_FILENAME),
    accessService,
);
const validatorSchema =
    new (require("./service/domain/schema-validator-service"))();
const emailService = new (require("./service/infrastructure/email-service"))(
    envConfig.AWS_REGION,
    envConfig.email,
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

router.get(
    "/fight/retrieve",
    checkJwt,
    requiredScopes("fight-tracker-service.read"),
    asyncHandler(async (req, res) => {
        try {
            const authUser = getAuthUser(req.auth);
            const result = await fightService.getFights(authUser);
            res.status(200).json(result ?? {error: "no response"});
        } catch (e) {
            res.status(500).json({
                message: e.message ?? "Error",
                data: e.data ?? "",
            });
        }
    }),
);

router.post(
    "/fight/create",
    checkJwt,
    requiredScopes("fight-tracker-service.write"),
    validatorSchema.mwCreateFightRequest,
    asyncHandler(async (req, res) => {
        try {
            const authUser = getAuthUser(req.auth);
            const result = await fightService.createFight(authUser, req.body);
            res.status(200).json(result ?? {error: "no response"});
        } catch (e) {
            res.status(500).json({
                message: e.message ?? "Error",
                data: e.data ?? "",
            });
        }
    }),
);

router.put(
    "/fight/update",
    checkJwt,
    requiredScopes("fight-tracker-service.write"),
    validatorSchema.mwUpdateFightRequest,
    asyncHandler(async (req, res) => {
        try {
            if (!req.body.fightId) {
                res.status(400).json({
                    message: "FightId required to update",
                });
            }
            const authUser = getAuthUser(req.auth);
            const result = await fightService.updateFight(authUser, req.body);
            res.status(200).json(result ?? {error: "no response"});
        } catch (e) {
            res.status(500).json({
                message: e.message ?? "Error",
                data: e.data ?? "",
            });
        }
    }),
);

router.post(
    "/fight/delete",
    checkJwt,
    requiredScopes("fight-tracker-service.write"),
    asyncHandler(async (req, res) => {
        try {
            const authUser = getAuthUser(req.auth);
            const result = await fightService.deleteFight(
                req.body.fightId,
                authUser,
            );
            res.status(200).json(result ?? {error: "no response"});
        } catch (e) {
            res.status(500).json({
                message: e.message ?? "Error",
                data: e.data ?? "",
            });
        }
    }),
);

router.post(
    "/share/create",
    checkJwt,
    requiredScopes("fight-tracker-service.share"),
    validatorSchema.mwCreateShareRequest,
    asyncHandler(async (req, res) => {
        try {
            const authUser = getAuthUser(req.auth);
            const result = await accessService.createAccess(
                authUser,
                req.validatedBody,
            );
            const emailsToNotify = req.body.persons.map((x) => x.email);
            emailService.sendShareInvitationEmailBulk(
                emailsToNotify,
                authUser.name,
            );
            res.status(201).json(result ?? {message: "success"});
        } catch (e) {
            res.status(500).json({
                message: e.message ?? "Error",
                data: e.data ?? "",
            });
        }
    }),
);

router.post(
    "/share/accept",
    checkJwt,
    requiredScopes("fight-tracker-service.share"),
    validatorSchema.mwAcceptShareRequest,
    asyncHandler(async (req, res) => {
        try {
            const authUser = getAuthUser(req.auth);
            const result = await accessService.acceptSharedResource(
                authUser,
                req.body,
            );
            res.status(201).json(result ?? {message: "success"});
        } catch (e) {
            res.status(500).json({
                message: e.message ?? "Error",
                data: e.data ?? "",
            });
        }
    }),
);

app.listen(envConfig.SERVER_PORT, () => {
    console.log(`Server listening on port ${envConfig.SERVER_PORT}`);
});
