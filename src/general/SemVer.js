"use strict";
/*
Todo: look into the SemVer class I did for OpenCar
 */
exports.__esModule = true;
exports.SemVer = void 0;
var SemVer = /** @class */ (function () {
    function SemVer(stringOrMaj, min, rev, patch, release, comment) {
        if (typeof stringOrMaj === 'string') {
            return SemVer.fromString(stringOrMaj);
        }
        this.major = stringOrMaj;
        this.minor = min;
        this.revision = rev;
        this.release = release;
        this.comment = comment;
    }
    SemVer.fromString = function (svString) {
        try {
            var parts = svString.split('.', 4);
            var maj = parseInt(parts[0]);
            var min = parseInt(parts[1]);
            var rev = parseInt(parts[2]);
            var patch = parts[3];
            var release = void 0, comment = void 0;
            var ci = patch.indexOf('+');
            if (ci !== -1) {
                comment = patch.substring(ci + 1);
                patch = patch.substring(0, ci);
            }
            var ri = patch.indexOf('-');
            if (ri !== -1) {
                release = patch.substring(ri + 1);
                patch = patch.substring(0, ri);
            }
            var patchNum = parseInt(patch);
            return new SemVer(maj, min, rev, patchNum, release, comment);
        }
        catch (e) {
            console.error("Error parsing SemVer string " + svString, e);
        }
    };
    return SemVer;
}());
exports.SemVer = SemVer;
exports["default"] = SemVer;
