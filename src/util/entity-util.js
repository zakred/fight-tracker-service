const updateEntityAndAddExtraProperties = (
    existing,
    updatedAndExtraProperties,
) => {
    Object.keys(updatedAndExtraProperties).forEach(
        (k) => (existing[k] = updatedAndExtraProperties[k]),
    );
};

const addUpdateAudit = (authUser, req) => {
    req.updatedBy = {
        id: authUser.id,
        email: authUser.email,
    };
    req.updatedAt = new Date().toISOString();
};

const addCreateAudit = (authUser, req) => {
    req.createdAt = new Date().toISOString();
    req.createdBy = {
        id: authUser.id,
        email: authUser.email,
    };
};
const addCreateAuditWithOwner = (authUser, req) => {
    addCreateAudit(authUser, req);
    req.owner = {
        id: authUser.id,
        email: authUser.email,
    };
};

module.exports = {
    updateEntityAndAddExtraProperties,
    addCreateAudit,
    addUpdateAudit,
};
