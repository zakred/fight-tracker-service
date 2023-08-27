class TimeService {
    constructor() {}

    unixTimestampInTwoMonths() {
        const now = new Date();
        const inTwoMonths = new Date(now.setMonth(now.getMonth() + 2));
        return inTwoMonths.valueOf();
    }

    isUnixTimestampBeforeNow(timestamp) {
        const target = new Date(timestamp);
        return target < new Date();
    }
}

module.exports = TimeService;
