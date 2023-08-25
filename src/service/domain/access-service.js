const global = require("../../global");
const errorUtil = require("../../util/error-util");
const {ACCESS_ROLE, ACCESS_STATUS} = require("../../global");

class AccessService {
    constructor(accessRepository) {
        this.repo = accessRepository;
    }

    getAccessGranted(authUser) {
        return this.repo.findAllAuthenticatedUser(authUser);
    }

    isResourceAuthorizedToShare = async (authUser, resourceId) => {
        const resources = await this.repo.findAllForResource(resourceId);
        if (!resources) {
            return false;
        }
        return resources.find(
            (x) =>
                x.email === authUser.email &&
                x.role === ACCESS_ROLE.EDIT_INVITE,
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

    setFightsAccessMetaData = async (fights) => {
        const result = [];
        for (const f of fights) {
            const auths = await this.repo.findAllForResource(f.fightId);
            const sharedWith = [];
            for (const auth of auths) {
                sharedWith.push({
                    email: auth.email,
                    role: auth.role,
                    status: auth.status,
                });
            }
            const meta = {
                sharePermissions: {
                    sharedWith: sharedWith,
                },
            };
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
