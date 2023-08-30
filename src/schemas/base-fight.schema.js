const Joi = require("joi");

const schema = Joi.object({
    fightName: Joi.string().max(120).required(),
    description: Joi.string().max(5000).required(),
    fightImageUrl: Joi.string().uri().max(200000).optional().allow(""),
    initiatorName: Joi.string().max(30),
    severity: Joi.string()
        .pattern(new RegExp("^HIGH$|^MEDIUM$|^LOW$"))
        .required(),
    status: Joi.string()
        .pattern(new RegExp("^NOT_STARTED$|^IN_PROGRESS$|^COMPLETED$"))
        .required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().allow("").optional(),
    expectedEndDate: Joi.date().required(),
    isRemediable: Joi.bool().required(),
    possibleResolutions: Joi.array().items(Joi.string().max(150)).optional(),
    personsInvolved: Joi.array()
        .optional()
        .items({
            name: Joi.string().max(30).required(),
            avatarUrl: Joi.string().uri().allow("").max(2000).optional(),
            label1: Joi.string().max(10).allow("").optional(),
            label2: Joi.string().max(10).allow("").optional(),
        }),
    evidence: Joi.array()
        .optional()
        .items({
            name: Joi.string().max(30).required(),
            url: Joi.string().uri().max(2000).required(),
            type: Joi.string().pattern(new RegExp("^IMAGE$|^FILE$")).required(),
            size: Joi.string().allow("").max(20).optional(),
        }),
    listId: Joi.string()
        .allow("")
        .optional()
        .guid({
            version: ["uuidv4", "uuidv5"],
        }),
});

module.exports = {
    schema,
};
