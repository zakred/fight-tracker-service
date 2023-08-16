const errors = {
    RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
    ENTITY_ALREADY_EXISTS: "ENTITY_ALREADY_EXISTS",
    FORBIDDEN_ENTITY_ACCESS: "FORBIDDEN_ENTITY_ACCESS",
    OWN_SHARING_DISABLED: "OWN_SHARING_DISABLED",
    TYPE_NOT_SUPPORTED: "TYPE_NOT_SUPPORTED",
};

const authErrors = {
    InsufficientScopeError: "InsufficientScopeError",
    InvalidRequestError: "InvalidRequestError",
    InvalidTokenError: "InvalidTokenError",
    UnauthorizedError: "UnauthorizedError",
};
const throwNotFound = (resource = "") => {
    throw {
        name: errors.RESOURCE_NOT_FOUND,
        status: 400,
        message: `Resource ${resource} not found`,
    };
};

const throwEntityAlreadyExists = (resource = "") => {
    throw {
        name: errors.ENTITY_ALREADY_EXISTS,
        status: 409,
        message: `Resource ${resource} already exists`,
    };
};

const throwForbiddenEntity = (resource = "") => {
    throw {
        name: errors.FORBIDDEN_ENTITY_ACCESS,
        status: 403,
        message: `You don't have access to ${resource}`,
    };
};

const throwCantShareWithYourself = () => {
    throw {
        name: errors.OWN_SHARING_DISABLED,
        status: 409,
        message: `You can't share with yourself your own resource`,
    };
};

const throwTypeNotSupported = (type = "") => {
    throw {
        name: errors.TYPE_NOT_SUPPORTED,
        status: 400,
        message: `Type "${type}" not supported`,
    };
};

const mwError = (err, req, res, next) => {
    if (err.name in errors) {
        let statusCode = err.status;
        if (!err.status) {
            statusCode = 500;
        }
        res.status(statusCode).json({
            name: err.name,
            message: err.message,
        });
    } else if (err.name in authErrors) {
        next(err);
    } else {
        res.status(500).json({
            message: err.message ?? "Error",
            data: err.data ?? "",
        });
    }
};

module.exports = {
    errors,
    mwError,
    throwNotFound,
    throwEntityAlreadyExists,
    throwForbiddenEntity,
    throwTypeNotSupported,
    throwCantShareWithYourself,
};
