const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const FightRepository = require("./fight-repository");
const FightService = require("./fight-service");
const fightService = new FightService(new FightRepository());

const SERVER_PORT = process.env.SERVER_PORT || 3005;
const CONTEXT_PATH = process.env.CONTEXT_PATH || "/";

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
    asyncHandler(async (req, res) => {
        try {
            const result = await fightService.getFights();
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
    asyncHandler(async (req, res) => {
        try {
            const result = await fightService.createFight(req.body);
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
    asyncHandler(async (req, res) => {
        try {
            if (!req.body.fightId) {
                res.status(400).json({
                    message: "FightId required to update",
                });
            }
            const result = await fightService.updateFight(req.body);
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
    asyncHandler(async (req, res) => {
        try {
            const result = await fightService.deleteFight(req.body.fightId);
            res.status(200).json(result ?? {error: "no response"});
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
