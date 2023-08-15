const Joi = require("joi");

const schema = Joi.object({
    fightName: Joi.string().alphanum().required(),
    description: Joi.string().required(),
    fightImageUrl: Joi.string().uri().required(),
    initiatorName: Joi.string().required(),
    severity: Joi.string()
        .pattern(new RegExp("^HIGH$|^MEDIUM$|^LOW$"))
        .required(),
    status: Joi.string()
        .pattern(new RegExp("^NOT_STARTED$|^IN_PROGRESS$|^COMPLETED$"))
        .required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().optional(),
    expectedEndDate: Joi.date().required(),
    isRemediable: Joi.bool().required(),
    possibleResolutions: Joi.array().optional(),
    personsInvolved: Joi.array().required().items({
        name: Joi.string().required(),
        avatarUrl: Joi.string().uri().optional(),
        label1: Joi.string().optional(),
        label2: Joi.string().optional(),
    }),
    evidence: Joi.array()
        .optional()
        .items({
            name: Joi.string().required(),
            url: Joi.string().uri().required(),
            type: Joi.string().pattern(new RegExp("^IMAGE$|^FILE$")).required(),
            size: Joi.string().optional(),
        }),
    comments: Joi.array()
        .required()
        .items({
            name: Joi.string().required(),
            avatarUrl: Joi.string().uri().optional(),
            message: Joi.string().required(),
            createdAt: Joi.string()
                .required()
                .pattern(new RegExp("^(0|[1-9][0-9]*)$")),
        }),
    listId: Joi.string()
        .optional()
        .guid({
            version: ["uuidv4", "uuidv5"],
        }),
});

module.exports = {
    schema,
};
