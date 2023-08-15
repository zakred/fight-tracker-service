const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const {auth, requiredScopes} = require("express-oauth2-jwt-bearer");
const AccessRepository = require("./repository/access-repository");
const accessService = new (require("./service/domain/access-service"))(
    new AccessRepository(),
);
const FightRepository = require("./repository/fight-repository");
const FightService = require("./service/domain/fight-service");
const fightService = new FightService(new FightRepository(), accessService);
const validatorSchema =
    new (require("./service/domain/schema-validator-service"))();
const emailFrom = process.env.EMAIL_FROM;
const emailService = new (require("./service/infrastructure/email-service"))(
    emailFrom,
);

const SERVER_PORT = process.env.SERVER_PORT || 3005;
const CONTEXT_PATH = process.env.CONTEXT_PATH || "/";

const AUTH_AUD =
    process.env.AUTH_AUD ||
    "https://api.fight-tracker.com,https://fight-tracker.us.auth0.com/userinfo";
const AUTH_ISSUER =
    process.env.AUTH_ISSUER || "https://fight-tracker.us.auth0.com/";

const checkJwt = auth({
    audience: AUTH_AUD.split(","),
    issuerBaseURL: AUTH_ISSUER,
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
app.use(CONTEXT_PATH, router);

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

router.put(
    "/share/create",
    checkJwt,
    requiredScopes("fight-tracker-service.share"),
    validatorSchema.mwCreateShareRequest,
    asyncHandler(async (req, res) => {
        try {
            const authUser = getAuthUser(req.auth);
            const result = await accessService.createAccess(authUser, req.body);
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

app.listen(SERVER_PORT, () => {
    console.log(`Server listening on port ${SERVER_PORT}`);
});
