"use strict";
exports.__esModule = true;
exports.environment = exports.check = void 0;
var environment;
exports.environment = environment;
try {
    exports.environment = environment = require('../BuildEnvironment.json');
}
catch (e) {
    console.error('Unable to ready BuildEnvironment');
    exports.environment = environment = {};
}
// the 'global' object is named in Node, but not native script
if (typeof global === 'object') {
    var lookGlobal = global;
    if (typeof lookGlobal.android === 'object' || typeof lookGlobal.ios === 'object') {
        if (!lookGlobal.__snapshot)
            console.log('{N} detected, version ' + lookGlobal.__runtimeVersion);
        environment.framework.nativeScript = lookGlobal.__runtimeVersion;
        // TODO: Get platform versions for android / ios
    }
    else {
        if (typeof global.process === 'object') {
            // todo: change platform to have build and runtime sections, and put these values at runtime
            environment.platform.name = global.process.platform;
            environment.platform.version = global.process.versions[environment.platform.name];
            console.log('NODE detected on a ' + environment.platform.name + ' system, version ' + environment.platform.version);
        }
    }
}
var Check = /** @class */ (function () {
    function Check() {
    }
    Object.defineProperty(Check.prototype, "riot", {
        get: function () {
            return environment.framework.riot !== undefined;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Check.prototype, "mobile", {
        get: function () {
            return environment.framework.nativeScript !== undefined;
        },
        enumerable: false,
        configurable: true
    });
    return Check;
}());
exports.check = new Check();
