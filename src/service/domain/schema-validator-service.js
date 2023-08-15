const createShareRequestSchema = require("../../schemas/create-share-request-schema");
const createFightRequestSchema = require("../../schemas/create-fight-request-schema");
const updateFightRequestSchema = require("../../schemas/update-fight-request-schema");

class SchemaValidatorService {
    constructor() {}

    mwCreateShareRequest = (req, res, next) => {
        return this.#createSchemaValidator(
            createShareRequestSchema.schema,
            req.body,
            req,
            res,
            next,
        );
    };

    mwCreateFightRequest = (req, res, next) => {
        return this.#createSchemaValidator(
            createFightRequestSchema.schema,
            req.body,
            req,
            res,
            next,
        );
    };

    mwUpdateFightRequest = (req, res, next) => {
        return this.#createSchemaValidator(
            updateFightRequestSchema.schema,
            req.body,
            req,
            res,
            next,
        );
    };

    #createSchemaValidator = (schema, data, req, res, next) => {
        const middleware = (req, res, next) => {
            try {
                const result = schema.validate(data, {abortEarly: false});
                if (result.error) {
                    res.status(400).json(result.error);
                    console.error("Bad request payload error:");
                    console.error(result.error.details.map((x) => x.message));
                    return;
                }
                next();
            } catch (e) {
                res.status(400).json(e);
            }
        };
        return middleware(req, res, next);
    };
}

module.exports = SchemaValidatorService;
