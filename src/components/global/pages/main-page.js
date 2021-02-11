"use strict";
exports.__esModule = true;
exports.onMenuAction = exports.onToolAction = exports.onIndTest = exports.onClick = exports.appStart = void 0;
var MenuApi_1 = require("../../../application/MenuApi");
function appStart(app) {
    console.log('appStart MainPage');
    var model = app.model;
    model.setAtPath('testValues.mainLabel', 'Hello, World from Main Activity!');
    setTimeout(function () {
        model.setAtPath('testValues.mainLabel', 'Main Activity after a second!');
    }, 1000);
    setMenuHandlers(app);
}
exports.appStart = appStart;
function onClick(ed) {
    console.log('We got clicked! ');
    ed.app.navigateToPage('next');
}
exports.onClick = onClick;
function onIndTest(ed) {
    console.log('toggle indicator');
    var current = ed.app.model.getAtPath('indicator-IN3.state');
    var next = (current !== 'on') ? 'on' : '';
    ed.app.model.setAtPath('indicator-IN3.state', next, true);
}
exports.onIndTest = onIndTest;
function onToolAction(toolEvent) {
    console.log('tool action', toolEvent);
}
exports.onToolAction = onToolAction;
function onMenuAction(menuEvent) {
    console.log('main sees a menu action for ', menuEvent.id);
    var app = menuEvent.app;
    var menuApi = app.MenuApi;
    if (menuEvent.id === 'TEST_NEWITEM') {
        var newMenuItem = new MenuApi_1.MenuItem();
        newMenuItem.label = 'Newly Added Item';
        newMenuItem.id = 'TEST_ADDEDITEM';
        menuApi.addMenuItem("main-OPTIONS-TEST", newMenuItem);
    }
    if (menuEvent.id === 'TEST_ADDEDITEM') {
        menuApi.deleteMenuItem("main-OPTIONS-TEST", menuEvent.id);
    }
    if (menuEvent.id === 'TEST_DISABLE') {
        menuApi.enableMenuItem("main-OPTIONS-TEST", 'TEST_NEWITEM', false);
        menuApi.enableMenuItem("main-OPTIONS-TEST", 'TEST_ADDEDITEM', false);
        menuApi.enableMenuItem("main-OPTIONS-TEST", 'TEST_DISABLE', false);
        menuApi.enableMenuItem("main-OPTIONS-TEST", 'TEST_ENABLE', true);
    }
    if (menuEvent.id === 'TEST_ENABLE') {
        menuApi.enableMenuItem("main-OPTIONS-TEST", 'TEST_NEWITEM', true);
        menuApi.enableMenuItem("main-OPTIONS-TEST", 'TEST_ADDEDITEM', true);
        menuApi.enableMenuItem("main-OPTIONS-TEST", 'TEST_DISABLE', true);
        menuApi.enableMenuItem("main-OPTIONS-TEST", 'TEST_ENABLE', false);
    }
}
exports.onMenuAction = onMenuAction;
function setMenuHandlers(app) {
    app.registerMenuHandler('VERTICAL_STACK', function (menuEvent) {
        app.navigateToPage('stack-test', { type: 'vertical' });
    });
    app.registerMenuHandler('HORIZONTAL_STACK', function (menuEvent) {
        app.navigateToPage('stack-test', { type: 'horizontal' });
    });
    app.registerMenuHandler('VERTICAL_STACK_ALIGNED', function (menuEvent) {
        app.navigateToPage('stack-test', { type: 'vertical-spaced' });
    });
    app.registerMenuHandler('HORIZONTAL_STACK_ALIGNED', function (menuEvent) {
        app.navigateToPage('stack-test', { type: 'horizontal-spaced' });
    });
}
