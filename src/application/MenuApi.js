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
exports.MenuApi = exports.ToolItem = exports.IndicatorItem = exports.MenuItem = void 0;
var EnvCheck_1 = require("../app-core/EnvCheck");
/*
- addMenu       // to page; add means append or insert
- addSubmenu    // to menu by id, returns submenu id
- removeMenu    // by id
- removeSubmenu // by id
- addMenuItem  // add means append or insert
- deleteMenuItem // by id
- clearMenu
- changeMenuItem // by id

binding example

<bind="menu-pageid-FILE">
    <item label={bound.FILE_SAVE.label}/>

*/
var MenuItem = /** @class */ (function () {
    function MenuItem() {
    }
    return MenuItem;
}());
exports.MenuItem = MenuItem;
var IndicatorItem = /** @class */ (function () {
    function IndicatorItem() {
    }
    return IndicatorItem;
}());
exports.IndicatorItem = IndicatorItem;
var ToolItem = /** @class */ (function (_super) {
    __extends(ToolItem, _super);
    function ToolItem() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ToolItem;
}(IndicatorItem));
exports.ToolItem = ToolItem;
var MenuApi = /** @class */ (function () {
    function MenuApi(app) {
        this.app = app;
        this.model = app.model;
    }
    /**
     * Add or insert an item to a menu list
     * item may be a submenu with children
     * Will create the menu if it does not already exist
     *
     * @param {string} menuId Identifier of menu
     * @param {MenuItem }item entry
     * @param {number} [position] insert position, appends if undefined.
     * @param {number} [recurseChild] leave undefined; used in recursion
     */
    MenuApi.prototype.addMenuItem = function (menuId, item, position) {
        var n = menuId.indexOf('-');
        if (n === -1)
            n = menuId.length;
        var menuName = menuId.substring(0, n);
        var topItem = this.model.getAtPath('menu.' + menuName);
        if (!topItem) {
            topItem = new MenuItem();
            topItem.label = topItem.id = menuName;
            topItem.children = [];
            this.model.setAtPath('menu.' + menuName, topItem, true);
        }
        var parentItem = this.getSubmenuFromId(menuId);
        var curMenu = parentItem.children;
        var kidclone = item.children && item.children.slice(); // copy
        if (this.limitTarget(item, "App")) {
            this.limitChildren(item, "App");
            if (position === undefined) {
                curMenu.push(item);
            }
            else {
                curMenu.splice(position, 0, item);
            }
            if (parentItem)
                parentItem.children = curMenu;
        }
        if (this.limitTarget(item, "Desktop")) {
            item.children = kidclone;
            this.limitChildren(item, "Desktop");
            this.app.MainApi.addMenuItem(menuId, item, position);
        }
        // update the full model
        this.model.setAtPath('menu.' + menuName, topItem, true);
    };
    MenuApi.prototype.getSubmenuFromId = function (menuId) {
        var n = menuId.indexOf('-');
        if (n === -1)
            n = menuId.length;
        var menuName = menuId.substring(0, n);
        var topItem = this.model.getAtPath('menu.' + menuName);
        if (!topItem) {
            console.error('menuId may not be complete ', menuId);
            throw Error('MENU NOT FOUND: ' + menuName);
        }
        var parts = menuId.split('-');
        if (!topItem.children)
            topItem.children = [];
        var curMenu = topItem.children;
        var parentItem = topItem;
        var pid = menuName;
        for (var i = 1; i < parts.length; i++) {
            pid = parts[i];
            for (var c = 0; c < curMenu.length; c++) {
                var cmitem = curMenu[c];
                if (cmitem.id === pid) {
                    parentItem = cmitem;
                    curMenu = cmitem.children;
                    break;
                }
            }
        }
        return parentItem;
    };
    /**
     * Returns true if item is targeted for this platform
     * @param item The item
     * @param dest names destination menu type: either 'App' or 'Desktop'
     */
    MenuApi.prototype.limitTarget = function (item, dest) {
        var target = item.targetCode || '';
        // limit to the target
        var isAppBar = (target.indexOf('A') !== -1); // specifically app bar only
        var isMenuBar = !isAppBar && (target.indexOf('D') !== -1); // goes to the menu bar, not the app menu
        if (isMenuBar && dest === 'App')
            return false;
        if (isAppBar && dest === 'Desktop')
            return false;
        if (!isAppBar && !isMenuBar) {
            isAppBar = isMenuBar = true; // mutually exclusive.  Neither targeted means put to both.
        }
        var included = true;
        for (var n = 0; n < target.length; n++) {
            var tc = target.charAt(n);
            included = false;
            if (!tc.match(/[mwuai]/)) {
                included = true; // if it's none of these, all are good
            }
            if (tc === 'm') {
                included = EnvCheck_1.environment.platform.name === 'darwin';
                break;
            }
            if (tc === 'w') {
                included = EnvCheck_1.environment.platform.name === 'win32';
                break;
            }
            if (tc === 'u') {
                included = EnvCheck_1.environment.platform.name === 'linux';
                break;
            }
            if (tc === 'a') {
                included = EnvCheck_1.environment.platform.name === 'android';
                break;
            }
            if (tc === 'i') {
                included = EnvCheck_1.environment.platform.name === 'ios';
                break;
            }
        }
        return dest === 'Desktop' ? isMenuBar && included : isAppBar && included;
    };
    MenuApi.prototype.limitChildren = function (item, dest) {
        var children = item.children || [];
        var dirty = true;
        while (dirty) {
            dirty = false;
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                if (!this.limitTarget(child, dest)) {
                    children.splice(i, 1);
                    dirty = true;
                    break;
                }
            }
        }
    };
    /**
     * Remove an item from a menu list
     *
     * @param menuId
     * @param itemId
     */
    MenuApi.prototype.deleteMenuItem = function (menuId, itemId) {
        var n = menuId.indexOf('-');
        if (n === -1)
            n = menuId.length;
        var menuName = menuId.substring(0, n);
        var topModel = this.model.getAtPath('menu.' + menuName);
        if (!topModel) {
            console.error('menuId may not be complete ', menuId);
            throw Error('MENU NOT FOUND: ' + menuName);
        }
        var parentItem = this.getSubmenuFromId(menuId);
        var children = parentItem.children || [];
        for (var i = 0; i < children.length; i++) {
            if (children[i].id === itemId) {
                children.splice(i, 1);
                break;
            }
        }
        parentItem.children = children;
        // update the full model
        this.model.setAtPath('menu.' + menuName, topModel, true);
        this.app.MainApi.deleteMenuItem(menuId, itemId);
    };
    /**
     * Replace an item in the menu list
     *
     * @param menuId
     * @param itemId
     * @param updatedItem
     */
    MenuApi.prototype.changeMenuItem = function (menuId, itemId, updatedItem) {
        var n = menuId.indexOf('-');
        if (n === -1)
            n = menuId.length;
        var menuName = menuId.substring(0, n);
        var topModel = this.model.getAtPath('menu.' + menuName);
        if (!topModel) {
            console.error('menuId may not be complete ', menuId);
            throw Error('MENU NOT FOUND: ' + menuName);
        }
        var parentItem = this.getSubmenuFromId(menuId);
        var children = parentItem.children || [];
        for (var i = 0; i < children.length; i++) {
            if (children[i].id === itemId) {
                children.splice(i, 1, updatedItem);
                break;
            }
        }
        parentItem.children = children;
        // update the full model
        this.model.setAtPath('menu.' + menuName, topModel, true);
        this.app.MainApi.changeMenuItem(menuId, itemId, updatedItem);
    };
    MenuApi.prototype.enableMenuItem = function (menuId, itemId, enabled) {
        var n = menuId.indexOf('-');
        if (n === -1)
            n = menuId.length;
        var menuName = menuId.substring(0, n);
        var topModel = this.model.getAtPath('menu.' + menuName);
        if (!topModel) {
            console.error('menuId may not be complete ', menuId);
            throw Error('MENU NOT FOUND: ' + menuName);
        }
        var parentItem = this.getSubmenuFromId(menuId);
        var children = parentItem.children || [];
        for (var i = 0; i < children.length; i++) {
            if (children[i].id === itemId) {
                children[i].disabled = !enabled;
                break;
            }
        }
        parentItem.children = children;
        // update the full model
        this.model.setAtPath('menu.' + menuName, topModel, true);
        this.app.MainApi.enableMenuItem(menuId, itemId, enabled);
    };
    /**
     * Clear the menu of all its items
     *
     * @param menuId
     */
    MenuApi.prototype.clearMenu = function (menuId) {
        var n = menuId.indexOf('-');
        if (n === -1)
            n = menuId.length;
        var menuName = menuId.substring(0, n);
        var topModel = this.model.getAtPath('menu.' + menuName);
        if (!topModel) {
            console.error('menuId may not be complete ', menuId);
            throw Error('MENU NOT FOUND: ' + menuName);
        }
        var parentItem = this.getSubmenuFromId(menuId);
        parentItem.children = [];
        // update the full model
        this.model.setAtPath('menu.' + menuName, topModel, true);
        this.app.MainApi.clearMenu(menuId);
    };
    MenuApi.prototype.addToolbarItems = function (name, items) {
        var _this = this;
        try {
            this.app.model.setAtPath('toolbar.' + name, items);
        }
        catch (e) {
            var props = {};
            props[name] = items;
            this.app.model.addSection('toolbar', props);
        }
        try {
            items.forEach(function (tool) {
                // can theoretically bind to any of these,
                // but only 'state' is bound by the default implementation
                var props = {
                    state: tool.state,
                    label: tool.label,
                    className: tool.className,
                    type: tool.type,
                    tooltip: tool.tooltip
                };
                _this.app.model.addSection('toolbar-' + tool.id, props);
            });
        }
        catch (e) {
            console.error(e);
        }
    };
    MenuApi.prototype.addIndicatorItems = function (name, items) {
        var _this = this;
        try {
            this.app.model.setAtPath('indicators.' + name, items);
        }
        catch (e) {
            var props = {};
            props[name] = items;
            this.app.model.addSection('indicators', props);
        }
        try {
            items.forEach(function (indicator) {
                // can theoretically bind to any of these,
                // but only 'state' is bound by the default implementation
                var props = {
                    state: indicator.state,
                    label: indicator.label,
                    className: indicator.className,
                    type: indicator.type,
                    tooltip: indicator.tooltip
                };
                _this.app.model.addSection('indicator-' + indicator.id, props);
            });
        }
        catch (e) {
            console.error(e);
        }
    };
    return MenuApi;
}());
exports.MenuApi = MenuApi;
// -------------
