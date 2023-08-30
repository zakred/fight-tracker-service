const global = require("../../global");
const errorUtil = require("../../util/error-util");
const {ACCESS_ROLE} = require("../../global");

class AccessService {
    constructor(accessRepository) {
        this.repo = accessRepository;
    }

    getAccessGranted(authUser) {
        return this.repo.findAllAuthenticatedUser(authUser);
    }

    isResourceAuthorized = async (authUser, resourceId, accessRoleType) => {
        const resources = await this.repo.findAllForResource(resourceId);
        let isRole = (x) => x.role === ACCESS_ROLE.EDIT_INVITE;
        if (accessRoleType === ACCESS_ROLE.EDIT) {
            // Higher role has access too
            isRole = (x) =>
                x.role === ACCESS_ROLE.EDIT ||
                x.role === ACCESS_ROLE.EDIT_INVITE;
        }
        if (accessRoleType === ACCESS_ROLE.VIEW) {
            // If we want to check if it has view access, then any existing role will have access
            isRole = () => true;
        }
        if (!resources) {
            return false;
        }
        return resources.find((x) => x.email === authUser.email && isRole(x));
    };
    isResourceAuthorizedToShare = async (authUser, resourceId) => {
        return await this.isResourceAuthorized(
            authUser,
            resourceId,
            ACCESS_ROLE.EDIT_INVITE,
        );
    };
    isResourceAuthorizedToEdit = async (authUser, resourceId) => {
        return await this.isResourceAuthorized(
            authUser,
            resourceId,
            ACCESS_ROLE.EDIT,
        );
    };

    isResourceAuthorizedToView = async (authUser, resourceId) => {
        return await this.isResourceAuthorized(
            authUser,
            resourceId,
            ACCESS_ROLE.VIEW,
        );
    };
    getFightIdsShared = (accessArray) => {
        if (!accessArray) {
            return [];
        }
        return accessArray
            .filter((x) => x.type === global.ACCESS_TYPE.FIGHT)
            .map((a) => a.resourceId);
    };

    setFightsAccessMetaData = async (authUser, fights) => {
        const result = [];
        for (const f of fights) {
            const auths = await this.repo.findAllForResource(f.fightId);
            const sharedWith = [];
            let currentAccess = {};
            for (const auth of auths) {
                if (auth.email === authUser.email) {
                    currentAccess = auth;
                }
                sharedWith.push({
                    email: auth.email,
                    role: auth.role,
                });
            }
            const meta = {
                // If currentAccess is not set then it means the user is the owner so the other conditions won't be evaluated
                attributes: {
                    isShared: f.owner.id !== authUser.id,
                    canEdit:
                        f.owner.id === authUser.id ||
                        currentAccess.role === ACCESS_ROLE.EDIT ||
                        currentAccess.role === ACCESS_ROLE.EDIT_INVITE,
                    canShare:
                        f.owner.id === authUser.id ||
                        currentAccess.role === ACCESS_ROLE.EDIT_INVITE,
                    canDelete: f.owner.id === authUser.id,
                },
                accessControl: {
                    sharedWith: sharedWith,
                },
            };
            if (!meta.attributes.canShare) {
                delete meta.accessControl;
            }
            result.push({...f, ...meta});
        }
        return result;
    };

    createAccess = async (authUser, req) => {
        if (req.persons.some((x) => authUser.email === x.email)) {
            errorUtil.throwCantShareWithYourself();
        }
        for (const i in req.persons) {
            await this.repo.create(
                authUser,
                req.persons[i],
                req.resourceId,
                req.type,
            );
        }
        return req.persons.length;
    };

    updateRole = async (authUser, req) => {
        for (const i in req.persons) {
            await this.repo.updateRole(
                authUser,
                req.persons[i],
                req.resourceId,
            );
        }
        return req.persons.length;
    };

    deleteAccess = async (req) => {
        for (const person of req.persons) {
            await this.repo.deleteByResourceIdAndEmail(
                req.resourceId,
                person.email,
            );
        }
        return req.persons.length;
    };

    deleteAllFor = async (resourceId) => {
        return this.repo.deleteAllFor(resourceId);
    };
}

module.exports = AccessService;
