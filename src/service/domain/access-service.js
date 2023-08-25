const global = require("../../global");
const errorUtil = require("../../util/error-util");
const {ACCESS_ROLE, ACCESS_STATUS} = require("../../global");

class AccessService {
    constructor(accessRepository) {
        this.repo = accessRepository;
    }

    getAccessGranted(authUser) {
        const all = this.repo.findAllAuthenticatedUser(authUser);
        all.filter((x) => x.status === ACCESS_STATUS.ACCEPTED);
        return all;
    }

    isResourceAuthorizedToShare = async (authUser, resourceId) => {
        const resources = await this.repo.findAllForResource(resourceId);
        if (!resources) {
            errorUtil.throwNotFound(resourceId);
        }
        return resources.find(
            (x) =>
                x.subjectId === authUser.id &&
                x.role === ACCESS_ROLE.EDIT_INVITE &&
                x.status === ACCESS_STATUS.ACCEPTED,
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

    async acceptSharedResource(authUser, req) {
        const access = await this.repo.findByResourceIdAndEmail(
            req.resourceId,
            authUser.email,
        );
        if (!access) {
            errorUtil.throwNotFound(req.resourceId);
        }
        if (authUser.email !== access.email) {
            errorUtil.throwForbiddenEntity(req.resourceId);
        }
        access.status = global.ACCESS_STATUS.ACCEPTED;
        await this.repo.save(authUser, access);
        return 0;
    }

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
