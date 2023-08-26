const Joi = require("joi");

const schema = Joi.object({
    notifications: Joi.array()
        .required()
        .items({
            notificationId: Joi.string()
                .guid({
                    version: ["uuidv4", "uuidv5"],
                })
                .required(),
        }),
});

module.exports = {
    schema,
};
