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
            .filter((x) => x.type === "FIGHT")
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
}

module.exports = AccessService;
