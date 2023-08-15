const Joi = require("joi");
const baseFight = require("./base-fight.schema");

const schema = baseFight.schema.keys({
    fightId: Joi.string()
        .required()
        .guid({
            version: ["uuidv4", "uuidv5"],
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
