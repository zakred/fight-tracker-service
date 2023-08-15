const Joi = require("joi");

const schema = Joi.object({
    resourceId: Joi.string()
        .guid({
            version: ["uuidv4", "uuidv5"],
        })
        .required(),
    type: Joi.string().pattern(new RegExp("^FIGHT$|^LIST$")).required(),

    persons: Joi.array().items({
        email: Joi.string().email(),
        role: Joi.string()
            .pattern(new RegExp("^VIEW$|^EDIT$|^EDIT_INVITE$"))
            .required(),
    }),
});

module.exports = {
    schema,
};
