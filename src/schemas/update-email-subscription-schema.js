const Joi = require("joi");
const {Base64Options} = require("joi");

const schema = Joi.object({
    data: Joi.string()
        .base64({paddingRequired: false, urlSafe: true})
        .max(1000)
        .required(),
    decision: Joi.string()
        .pattern(new RegExp("^$|^SUBSCRIBED$|^UNSUBSCRIBED$"))
        .required(),
});

module.exports = {
    schema,
};
