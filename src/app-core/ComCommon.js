"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.newCommon = exports.ComCommon = void 0;
var EnvCheck_1 = require("./EnvCheck");
var ComBinder_1 = require("./ComBinder");
var AppCore_1 = require("./AppCore");
var View = /** @class */ (function () {
    function View() {
    }
    return View;
}());
var Observable = /** @class */ (function () {
    function Observable() {
    }
    return Observable;
}());
var NotCommon;
if (EnvCheck_1.check.mobile) {
    NotCommon = /** @class */ (function () {
        function class_1(arg) {
            this.rootComponent = arg;
        }
        return class_1;
    }());
    try {
        View = require('@nativescript/core').View;
        Observable = require('@nativescript/core').Observable;
    }
    catch (e) { }
}
else {
    NotCommon = /** @class */ (function () {
        function class_2(arg) {
            this.riot = arg;
        }
        return class_2;
    }());
}
var ComCommon = /** @class */ (function (_super) {
    __extends(ComCommon, _super);
    function ComCommon(arg) {
        var _this = _super.call(this, arg) || this;
        _this.fits = [];
        _this.fitNum = 0;
        _this._app = _this.getApp();
        _this._model = _this._app.model;
        _this.comBinder = new ComBinder_1.ComBinder(_this.model);
        return _this;
    }
    Object.defineProperty(ComCommon.prototype, "app", {
        get: function () {
            return this.getApp();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ComCommon.prototype, "model", {
        get: function () {
            return this._model;
        },
        enumerable: false,
        configurable: true
    });
    // -------------------------------------------------------------------------------------------------------
    /**
     * return the instance of the Presentation class that has been exposed as a property in the app root
     * (in other words, the app of the Page)
     * @returns {AppCore}
     */
    ComCommon.prototype.getApp = function () {
        if (EnvCheck_1.check.mobile) {
            return AppCore_1.getTheApp();
        }
        else if (EnvCheck_1.check.riot) {
            var boundTag = document.body.querySelector('[is="app"]');
            if (!boundTag) {
                throw Error('riot app not bound to page');
            }
            var rootComp = this.getComponent(boundTag);
            return rootComp.props.app;
        }
        else {
            throw Error('Invalid configuration: Not Mobile and not Riot');
        }
    };
    ComCommon.prototype.getCombinder = function () {
        return this.comBinder;
    };
    /**
     * Call to wait for model to be ready before binding
     */
    ComCommon.prototype.waitForModel = function () {
        return this.getApp().waitForModel();
    };
    /**
     * Call to announce the component is created and bound to model
     */
    ComCommon.prototype.componentIsReady = function () {
        return this.getApp().componentIsReady();
    };
    /**
     * gets the Riot Component instance that the given DOM element belongs to
     *
     * @param {HTMLElement} el
     * @returns Riot component
     */
    ComCommon.prototype.getComponent = function (arg) {
        if (EnvCheck_1.check.mobile)
            return arg; // returns ourselves: TODO: a more refined version would look at parents to find something from ComponentBase
        var el = arg;
        if (!el)
            el = this.riot.root;
        try {
            var syms = void 0;
            do {
                if (el) {
                    syms = Object.getOwnPropertySymbols(el);
                    if (syms.length === 0) {
                        el = el.parentElement;
                    }
                }
                else {
                    return null;
                }
            } while (syms && syms.length === 0);
            return el[syms[0]];
        }
        catch (e) {
            console.warn(e);
            return null;
        }
    };
    /**
     * Returns the component that is the optionally named ancestor of the given component
     * @param {*} comp - component that is child of parent sought
     * @param {string} [tag]  - optional tag to find in ancestry tree, or immediate parent if not given.
     * @returns {*} riot-component
     */
    ComCommon.prototype.getComponentParent = function (comp, tag) {
        if (!comp)
            return null;
        if (EnvCheck_1.check.riot) {
            tag = (tag && tag.toUpperCase());
            while (comp) {
                comp = this.getComponent(comp.root.parentElement);
                if (!tag || comp.root.tagName === tag) {
                    return comp;
                }
            }
        }
        else {
            if (EnvCheck_1.check.mobile) {
                if (!comp)
                    comp = this.rootComponent;
                var view = comp; // View
                return (view && view.parent);
            }
        }
        return null; // not found.
    };
    /**
     * returns the component that is the child of the given component of the given tag,
     * optionally the given ordinal occurrence.
     * @param {*} comp - component that has the child we seek
     * @param {string} tag - tag name of child, or other selector string (e.g. '#child-id')
     * @param ordinal - optional  ordinal (starting with 1) to choose if there are multiple children with this tag
     * @returns {*} riot-component
     */
    ComCommon.prototype.getComponentChild = function (comp, tag, ordinal) {
        if (tag === void 0) { tag = ''; }
        if (ordinal === void 0) { ordinal = 1; }
        if (EnvCheck_1.check.mobile) {
            throw Error('Not Implemented: ComCommon.getComponentChild');
        }
        var results = comp.$$(tag);
        var pick = ordinal - 1;
        return this.getComponent(results[pick]);
    };
    /**
     * Find the child component that owns the given element
     * @param {*} containingComp - component that we are searching within
     * @param {HTMLElement} element - element we are searching for
     * @returns {number} the index of the child in the parent, or -1 if not found
     */
    ComCommon.prototype.findChildIndexWithElement = function (containingComp, element) {
        if (EnvCheck_1.check.mobile) {
            throw Error('Not Implemented: ComCommon.findChildIndexWithElement');
        }
        var p = containingComp.root;
        while (p.firstElementChild.tagName === 'DIV') {
            p = p.firstElementChild;
        }
        var children = p.children;
        var index = -1;
        for (var i = 0; i < children.length; i++) {
            if (children[i] === element) {
                index = i;
                break;
            }
        }
        return index;
    };
    /**
     * return the DOM element of the <div> container that all of our Riot components consist of
     * as their container.
     * @param {*} [riot] // if not passed, uses the one that created this class
     * @returns {HTMLElement}
     */
    ComCommon.prototype.getContainer = function (riot) {
        if (EnvCheck_1.check.mobile) {
            throw Error('Not Implemented: ComCommon.getContainer');
        }
        if (!riot)
            riot = this.riot;
        return riot.root.firstElementChild;
    };
    /**
     * Returns the value of an attribute in the component markup.
     * @param component
     * @param attName
     * @return {*|string}
     */
    ComCommon.prototype.getComponentAttribute = function (component, attName) {
        if (EnvCheck_1.check.riot) {
            var value = component.props && component.props[attName];
            if (value)
                return value;
            var el = this.getContainer(component);
            return el && el.getAttribute(attName);
        }
        else {
            if (!component)
                component = this.rootComponent;
            var view = component; // view
            var attVal = view && view.get(attName);
            if (typeof attVal !== 'string')
                return '';
            return attVal;
        }
    };
    // -------------------------------------------------------------------------------------------------------
    /**
     * parses the *'fit' property* into width/height sizes and applies them
     * (the *'orientation' property* (horizontal/vertical) determines whether the values are applied to children width
     * or height.
     *
     * `fit` is a series of expressions (separated by spaces) describing the sizing to apply to
     * the children, in order.  If there are more children than expressions, the last expression used is used for all
     * subsequent children.
     * Format is <n><unit> where <n> is number and <unit> is the CSS unit to apply.
     * example expressions:  100px  30%  12em
     *
     *
     * #### Special unit values:
     *
     * - "*" == one fractional amount (number of children divided evenly)
     * - "**" == use natural size of child element (equivalent to "100%")
     *
     * example: `"* 2* 3* *"` in a 5 item list
     *
     * would translate to the equivalent of (20% 40% 60% 20% 20%) among the 5 items (although computed px values rather
     * than % notation is applied)
     *
     * @param {object} props the Riot props object that holds the component properties
     */
    ComCommon.prototype.parseFits = function (props) {
        if (!props || !props.fit)
            return;
        var keepGoing = true;
        var app = this.getApp();
        var sp = app.makeStringParser(props.fit);
        while (keepGoing) {
            try {
                var exp = sp.readNext();
                var unit = void 0, val = void 0;
                if (exp.substring(exp.length - 2) === "()") {
                    // a function callback named
                    this.fits.push(exp);
                }
                else {
                    if (exp === '*' || exp === '**') {
                        unit = exp;
                        val = 1;
                    }
                    else {
                        var re = /[\d.]+/;
                        var match = re.exec(exp)[0];
                        unit = exp.substring(match.length);
                        val = Number.parseFloat(match);
                    }
                    var numKids = this.getContainer().children.length;
                    var cdim = this.getContainer().getBoundingClientRect();
                    var fullSize = props.orientation === 'horizontal' ? cdim.width : cdim.height;
                    var even = fullSize / numKids;
                    var size = void 0;
                    if (unit === '**') {
                        size = 100;
                        unit = "%";
                    }
                    else if (unit === '*') {
                        size = val * even;
                        unit = 'px';
                    }
                    else {
                        size = val;
                    }
                    this.fits.push("" + size + unit);
                }
                keepGoing = sp.getRemaining().length > 0;
            }
            catch (e) {
                console.error(e);
                keepGoing = false;
            }
        }
        // console.log('fits', this.fits)
        this.applyFits(props.orientation === 'horizontal');
    };
    /**
     * Applies the sizes parsed in 'fits' to the container children
     * @param {boolean} isHorizontal
     */
    ComCommon.prototype.applyFits = function (isHorizontal) {
        if (EnvCheck_1.check.mobile) {
            throw Error('Not Implemented: ComCommon.applyFits');
        }
        var children = this.getContainer().children;
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            child.style.display = isHorizontal ? 'inline-block' : 'inline';
            child.style.verticalAlign = 'top';
            var innerChild = child.firstElementChild;
            var fitSize = this.nextFit();
            if (isHorizontal) {
                innerChild.style.width = fitSize;
            }
            else
                innerChild.style.height = fitSize;
        }
    };
    /** picks the next parsed fit value, or the last one if list was exhausted */
    ComCommon.prototype.nextFit = function () {
        return this.fits[this.fitNum++] || this.fits[this.fits.length - 1];
    };
    // -------------------------------------------------------------------------------------------------------
    /**
     * commute from markup common values like width, height, and background, backgroundColor
     *
     * @param {HTMLElement} el Element to set props on
     * @param {object} props properties with values to set
     * @param {object} defaults defaults to use if props not specified
     */
    ComCommon.prototype.setCommonProps = function (el, props, defaults) {
        if (EnvCheck_1.check.mobile) {
            throw Error('Not Implemented: ComCommon.setCommonProps');
        }
        if (!defaults)
            defaults = {
                width: '100%',
                height: '100%'
            };
        var width = (props.width || defaults.width);
        var height = (props.height || defaults.height);
        if (typeof width === 'number')
            width = width + 'px';
        if (typeof height === 'number')
            height = height + 'px';
        el.style.width = width;
        el.style.height = height;
        el.style.background = props.background || defaults.background;
        el.style.backgroundColor = props.backgroundColor || defaults.backgroundColor;
    };
    /**
     * Applies a 'style' line of css values to the given container element
     *
     * @param div
     * @param styleText
     */
    ComCommon.prototype.applyContainerStyles = function (div, styleText) {
        if (EnvCheck_1.check.mobile) {
            throw Error('Not Implemented: ComCommon.applyContainerStyles');
        }
        if (!div || !div.style || !styleText)
            return;
        var statements = styleText.split(';');
        statements.forEach(function (statement) {
            var kv = statement.split(':');
            var key = kv[0].trim().toLowerCase();
            var value = kv[1].trim().toLowerCase();
            var kcp = key.split('-');
            key = kcp[0] + kcp[1].charAt(0).toUpperCase() + kcp[1].substring(1);
            div.style[key] = value;
        });
    };
    // -------------------------------------------------------------------------------------------------------
    /**
     * Set up the binding for this component
     * Inherit bindings of parent scope(s) and append/modify locally.
     */
    ComCommon.prototype.bindComponent = function () {
        var component;
        if (EnvCheck_1.check.mobile) {
            component = this.rootComponent;
            if (!component.bound) {
                component.bound = new Observable();
            }
        }
        else {
            component = this.riot;
            if (!component.bound)
                component.bound = {};
        }
        var scopeComp = component;
        // walk up from here until we lose parentage (page scope)
        // and gather the bind directives
        var directives = [];
        var directive;
        while (scopeComp) {
            directive = this.getComponentAttribute(scopeComp, 'bind');
            if (directive)
                directives.push(directive);
            scopeComp = this.getComponentParent(scopeComp);
        }
        // Now process all the directives that affect us
        for (var i = 0; i < directives.length; i++) {
            directive = directives[i];
            // create a property in the local observable the markup implementation looks at
            var _a = this.comBinder.deconstructBindStatement(directive), section = _a.section, prop = _a.prop, alias = _a.alias;
            var startValue = this.model.getAtPath(section + '.' + prop);
            var name_1 = alias || prop;
            if (EnvCheck_1.check.mobile) {
                component.bindingContext = component.bound;
                component.bound.set(name_1, startValue);
            }
            else {
                component.bound[name_1] = startValue;
            }
            this.comBinder.applyComponentBindings(component, directive, function (component, name, value, updateAlways) {
                // Handle the update to the component itself
                if (EnvCheck_1.check.riot) {
                    var doUpdate = updateAlways || value != component.bound[name];
                    if (doUpdate) {
                        try {
                            component.bound[name] = value;
                            component.update();
                        }
                        catch (e) { }
                    }
                }
                else {
                    component.bound.set(name, value);
                }
            });
        }
    };
    /**
     * Used by mobile side ComponentBase to bind to inner views
     * @param localBinds Array of view/name/prop values (in an array) that bind the prop of the view to the local name
     */
    ComCommon.prototype.setLocalBinds = function (localBinds) {
        if (EnvCheck_1.check.riot)
            return;
        var component = this.rootComponent;
        if (!component.bound) {
            component.bound = new Observable();
        }
        for (var n = 0; n < localBinds.length; n++) {
            var lb = localBinds[n];
            var view = lb[0];
            var name_2 = lb[1];
            var viewProp = lb[2];
            view.bindingContext = component.bound;
            view.bind({ sourceProperty: name_2, targetProperty: viewProp });
        }
    };
    return ComCommon;
}(NotCommon));
exports.ComCommon = ComCommon;
function newCommon(component) {
    return new ComCommon(component);
}
exports.newCommon = newCommon;
