const jwt = require("jsonwebtoken");

module.exports.randomRange = function (min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

module.exports.checkPercentage = function (percent) {
    return Math.random() * 100 < percent;
};

module.exports.takeRandomEleInArray = function (arr, n) {
    let len = arr.length;
    let result = new Array(n);
    let taken = new Array(len);
    if (n > len) throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        const x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
};

module.exports.promisePool = async function (items, concurrency, transformer) {
    const _items = [...items];
    const result = [];

    while (_items.length > 0) {
        const slice = _items.splice(0, concurrency);
        const ps = await Promise.all(slice.map(transformer));
        result.push(...ps);
    }
    return result;
};

module.exports.parseTokens = function (tokens) {
    return tokens.map((token) => jwt.decode(token));
};
