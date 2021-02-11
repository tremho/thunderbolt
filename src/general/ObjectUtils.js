"use strict";
exports.__esModule = true;
exports.flatten = void 0;
function flatten(obj) {
    var _this = this;
    var flatObj = {};
    Object.getOwnPropertyNames(obj).forEach(function (prop) {
        var value = obj[prop];
        if (typeof value === 'object') {
            if (!Array.isArray(value)) {
                value = _this.flatten(value);
            }
        }
        flatObj[prop] = value;
    });
    return flatObj;
}
exports.flatten = flatten;
