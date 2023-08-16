const Joi = require("joi");

const schema = Joi.object({
    resourceId: Joi.string()
        .guid({
            version: ["uuidv4", "uuidv5"],
        })
        .required(),
});

module.exports = {
    schema,
};
