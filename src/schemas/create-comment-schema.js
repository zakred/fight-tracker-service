const Joi = require("joi");

const schema = Joi.object({
    fightId: Joi.string()
        .guid({
            version: ["uuidv4", "uuidv5"],
        })
        .required(),
    message: Joi.string().max(300).required(),
});

module.exports = {
    schema,
};
