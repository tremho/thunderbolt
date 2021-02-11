"use strict";
// here we want to put the binding code
exports.__esModule = true;
exports.ComBinder = void 0;
/**
 * Portable handling for bindings to the component layer.
 */
var ComBinder = /** @class */ (function () {
    /**
     * Construct ComBinder instance by passing the appModel
     * @param {AppModel} model The app model to bind to
     *
     * @example
     *      let cb = new ComBinder(appCore.model)
     */
    function ComBinder(model) {
        this.model = model;
    }
    /**
     * Breaks a statement down into `section`, `prop` and the optional `alias` and `updateAlways`
     * and returns as an object with these properties.
     * @param {string} stmt the binding statement
     * @return {object} statement parts deconstructed.
     */
    ComBinder.prototype.deconstructBindStatement = function (stmt) {
        var parts = stmt.split(' as ');
        var path = parts[0];
        var updateAlways = (path.charAt(0) === '!');
        if (updateAlways) {
            path = path.substring(1); // skip the !
        }
        var alias = parts[1];
        var ldi = path.lastIndexOf('.');
        var prop = path.substring(ldi + 1);
        var section = path.substring(0, ldi);
        return { section: section, prop: prop, alias: alias, updateAlways: updateAlways };
    };
    /**
     * Process a comma-separated list of binding directives, binding as specified
     * to the local bind set, and calling component update to reflect this initial value
     *
     * @param {string} directive the comma-delimited binding directive string
     * @param {function} bindFunction function that sets a local property with a value (name, value, updateAlways)
     */
    ComBinder.prototype.applyComponentBindings = function (component, directive, bindFunction) {
        var stmts = directive.split(',');
        var _loop_1 = function (i) {
            var _a = this_1.deconstructBindStatement(stmts[i]), section = _a.section, prop = _a.prop, alias = _a.alias, updateAlways = _a.updateAlways;
            this_1.model.bind(component, section, prop, function (comp, prop, value) {
                bindFunction(comp, alias || prop, value, updateAlways);
            });
        };
        var this_1 = this;
        for (var i = 0; i < stmts.length; i++) {
            _loop_1(i);
        }
    };
    return ComBinder;
}());
exports.ComBinder = ComBinder;
