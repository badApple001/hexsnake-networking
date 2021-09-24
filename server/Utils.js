


class Utils {

    static random(min, max) {
        return Math.random() * (max - min) + min;
    }

    static randomInt(min, max) {
        return Math.floor(Utils.random(min,max));
    }
}

module.exports = Utils