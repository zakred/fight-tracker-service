const errorUtil = require("../../util/error-util");
const {textShortener} = require("../../global");
const moment = require("moment");

class NotificationService {
    constructor(notificationRepository) {
        this.repo = notificationRepository;
    }

    retrieveAllAuthenticated = async (authUser) => {
        const notifications = await this.repo.findAllAuthenticatedUser(
            authUser,
        );
        const result = notifications.map((x) => {
            return {
                notificationId: x.notificationId,
                iconImageUrl: x.iconImageUrl,
                iconClass: x.iconClass,
                title: x.title,
                message: x.message,
                createdAtRelative: moment(x.createdAt).fromNow(),
            };
        });
        return result;
    };
    notifyShare = async (authUser, resourceName, type, subjectEmail) => {
        const issuer = authUser.name || authUser.email;
        const title = "New Share!";
        const msg = `${issuer} has shared with you a ${type}!, join now the: ${textShortener(
            resourceName,
            25,
        )}`;
        const entity = {
            iconClass: "mdi mdi-share-variant",
            title: title,
            message: msg,
            issuer: authUser.email,
        };
        this.repo.create(entity, subjectEmail);
    };

    deleteNotifications = async (authUser, notifications) => {
        for (const notification of notifications) {
            await this.repo.deleteById(authUser, notification.notificationId);
        }
    };
}

module.exports = NotificationService;
