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

const throwForbiddenEntity = (resource = "") => {
    throw {
        name: "FORBIDDEN_ENTITY_ACCESS",
        message: `You don't have access to ${resource}`,
    };
};

const throwCantShareWithYourself = (resource = "") => {
    throw {
        name: "OWN_SHARING_DISABLED",
        message: `You can't share with yourself your own resource`,
    };
};

module.exports = {
    throwNotFound,
    throwEntityAlreadyExists,
    throwForbiddenEntity,
    throwCantShareWithYourself,
};
