const Joi = require("joi");

const schema = Joi.object({
    commentId: Joi.string()
        .guid({
            version: ["uuidv4", "uuidv5"],
        })
        .required(),
});

module.exports = {
    schema,
};
