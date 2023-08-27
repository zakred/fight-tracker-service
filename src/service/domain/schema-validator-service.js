const createShareRequestSchema = require("../../schemas/create-share-request-schema");
const updateRoleShareRequestSchema = require("../../schemas/update-role-share-request-schema");
const createFightRequestSchema = require("../../schemas/create-fight-request-schema");
const updateFightRequestSchema = require("../../schemas/update-fight-request-schema");
const deleteShareRequestSchema = require("../../schemas/delete-share-request-schema");
const deleteNotificationsRequestSchema = require("../../schemas/delete-notifications-request-schema");
const updateEmailSubscriptionSchema = require("../../schemas/update-email-subscription-schema");

class SchemaValidatorService {
    constructor() {}

    mwDeleteShareRequest = (req, res, next) => {
        return this.#createSchemaValidator(
            deleteShareRequestSchema.schema,
            req.body,
            req,
            res,
            next,
        );
    };
    mwCreateShareRequest = (req, res, next) => {
        return this.#createSchemaValidator(
            createShareRequestSchema.schema,
            req.body,
            req,
            res,
            next,
        );
    };
    mwUpdateRoleShareRequest = (req, res, next) => {
        return this.#createSchemaValidator(
            updateRoleShareRequestSchema.schema,
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

    mwDeleteNotificationsRequest = (req, res, next) => {
        return this.#createSchemaValidator(
            deleteNotificationsRequestSchema.schema,
            req.body,
            req,
            res,
            next,
        );
    };

    mwUpdateEmailSubscriptionRequest = (req, res, next) => {
        return this.#createSchemaValidator(
            updateEmailSubscriptionSchema.schema,
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
                req.validatedBody = result.value;
                next();
            } catch (e) {
                res.status(400).json(e);
            }
        };
        return middleware(req, res, next);
    };
}

module.exports = SchemaValidatorService;
