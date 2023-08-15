const throwNotFound = (resource = "") => {
    throw {
        name: "RESOURCE_NOT_FOUND",
        message: `Resource ${resource} not found`,
    };
};

const throwEntityAlreadyExists = (resource = "") => {
    throw {
        name: "ENTITY_ALREADY_EXISTS",
        message: `Resource ${resource} already exists`,
    };
};

module.exports = {
    throwNotFound,
    throwEntityAlreadyExists,
};
