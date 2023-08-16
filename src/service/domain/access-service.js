const global = require("../../global");
const errorUtil = require("../../util/error-util");

class AccessService {
    constructor(accessRepository) {
        this.repo = accessRepository;
    }

    getAccessGranted(authUser) {
        return this.repo.findAllAuthenticatedUser(authUser);
    }
    getFightIdsShared = (accessArray) => {
        if (!accessArray) {
            return [];
        }
        return accessArray
            .filter((x) => x.type === global.ACCESS_TYPE.FIGHT)
            .map((a) => a.resourceId);
    };

    setFightsAccessMetaData = (fights) => {
        return fights.map((f) => {
            const auths = this.repo.findAllForFight(f.fightId);
            const sharedWith = [];
            for (const auth in auths) {
                sharedWith.push({
                    email: auth.email,
                    role: auth.role,
                });
            }
            const meta = {
                sharePermissions: {
                    sharedWith: sharedWith,
                },
            };
            return {...f, ...meta};
        });
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
        access.status = global.ACCESS_STATUS.ACCEPTED;
        await this.repo.save(authUser, access);
        return 0;
    }
}

module.exports = AccessService;
