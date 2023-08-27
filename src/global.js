const ACCESS_TYPE = {
    FIGHT: "FIGHT",
    LIST: "LIST",
};

const ACCESS_ROLE = {
    VIEW: "VIEW",
    EDIT: "EDIT",
    EDIT_INVITE: "EDIT_INVITE",
};

const SCOPES = {
    FIGHTS_READ: "fights.read",
    FIGHTS_UPDATE: "fights.update",
    FIGHTS_CREATE: "fights.create",
    FIGHTS_DELETE: "fights.delete",
    SHARE_RESOURCE_CREATE: "share_resource.create",
    SHARE_RESOURCE_DELETE: "share_resource.delete",
    SHARE_RESOURCE_UPDATE_ROLE: "share_resource.update_role",
    NOTIFICATIONS_READ: "notifications.read",
    NOTIFICATIONS_DELETE: "notifications.delete",
};

const EMAIL_CATEGORY = {
    SHARED_RESOURCES: "Shared Resources",
};

const EMAIL_SUBSCRIPTION_DECISION = {
    SUBSCRIBED: "SUBSCRIBED",
    UNSUBSCRIBED: "UNSUBSCRIBED",
};

const textShortener = (txt, targetLength = 80) => {
    if (!txt) {
        return txt;
    }
    if (txt.length > targetLength) {
        return txt.slice(0, targetLength - 1) + "...";
    }
    return txt;
};

module.exports = {
    ACCESS_ROLE,
    ACCESS_TYPE,
    SCOPES,
    EMAIL_SUBSCRIPTION_DECISION,
    EMAIL_CATEGORY,
    textShortener,
};
