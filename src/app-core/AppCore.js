"use strict";
exports.__esModule = true;
exports.AppCore = exports.getTheApp = exports.setTheApp = exports.HistoryRecord = exports.EventData = void 0;
var EnvCheck_1 = require("./EnvCheck");
var AppModel_1 = require("./AppModel");
var MenuDef_1 = require("../application/MenuDef");
var MenuApi_1 = require("../application/MenuApi");
var StringParser, riot, ComBinder;
var getInfoMessageRecorder, InfoMessageRecorder;
if (!EnvCheck_1.check.mobile) {
    try {
        StringParser = require('../general/StringParser');
        var Imr = require('./InfoMessageRecorder');
        getInfoMessageRecorder = Imr.getInfoMessageRecorder;
        InfoMessageRecorder = Imr.InfoMessageRecorder;
        riot = require('riot');
        ComBinder = require('./ComBinder').ComBinder;
    }
    catch (e) { }
}
// TODO: dynamically build this mapping with a config or an enumerating tool.
var ExampleIndicator_1 = require("../extension/ExampleIndicator");
var extensionTypes = {
    Example: ExampleIndicator_1.ExampleIndicator
};
var imrSingleton;
if (getInfoMessageRecorder) {
    imrSingleton = getInfoMessageRecorder();
}
function writeMessage(subject, message) {
    imrSingleton.write(subject, message);
}
var mainApi = EnvCheck_1.check.mobile ? null : window.api;
var EventData = /** @class */ (function () {
    function EventData() {
    }
    return EventData;
}());
exports.EventData = EventData;
var HistoryRecord = /** @class */ (function () {
    function HistoryRecord() {
    }
    return HistoryRecord;
}());
exports.HistoryRecord = HistoryRecord;
// Singleton (used only by mobile side)
var theApp;
var theFrame;
function setTheApp(app, frame) {
    theApp = app;
    theFrame = frame;
    // console.log('app and frame set', theApp, theFrame)
}
exports.setTheApp = setTheApp;
function getTheApp() {
    return theApp;
}
exports.getTheApp = getTheApp;
var componentGateCleared;
var keyListenerBind;
/**
 *  Core object of the application.  Contains the app model and gateway functions for actions, which are
 *  mostly handled by action modules.
 */
var AppCore = /** @class */ (function () {
    function AppCore() {
        var _this = this;
        this.appModel = new AppModel_1.AppModel();
        this.currentActivity = null;
        this.history = [];
        this.menuHandlers = {};
        this.menuApi = new MenuApi_1.MenuApi(this);
        this.modelGate = new Promise(function (resolve) {
            _this.modelGateResolver = resolve;
        });
        this.componentGate = new Promise(function (resolve) {
            _this.componentGateResolver = resolve;
        });
    }
    Object.defineProperty(AppCore.prototype, "model", {
        /**
         * get the model used for binding to the UI.
         */
        get: function () {
            return this.appModel;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AppCore.prototype, "MenuApi", {
        get: function () {
            return this.menuApi;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AppCore.prototype, "MainApi", {
        get: function () {
            return mainApi;
        },
        enumerable: false,
        configurable: true
    });
    AppCore.prototype.waitForModel = function () {
        return this.modelGate;
    };
    AppCore.prototype.componentIsReady = function () {
        this.componentGateResolver();
        componentGateCleared = true;
    };
    AppCore.prototype.waitReady = function () {
        // console.log('waiting for ready...')
        if (componentGateCleared)
            return this.modelGate;
        return Promise.all([this.componentGate, this.modelGate]);
    };
    AppCore.prototype.setupUIElements = function () {
        // console.log('>>> setupUIElements >>>')
        var _this = this;
        // set the infomessage log handling
        if (!EnvCheck_1.check.mobile) {
            this.componentIsReady(); // not used in riot, so clear the gate
            mainApi.messageInit().then(function () {
                // console.log('messages wired')
                _this.model.addSection('infoMessage', { messages: [] });
                mainApi.addMessageListener('IM', function (data) {
                    writeMessage(data.subject, data.message);
                });
                mainApi.addMessageListener('EV', function (data) {
                    // console.log('event info incoming:', data)
                    var evName = data.subject;
                    var evData = data.data;
                    if (evName === 'resize') {
                        var env = _this.model.getAtPath('environment');
                        if (!env.screen)
                            env.screen = {};
                        env.screen.width = evData[0];
                        env.screen.height = evData[1];
                        _this.model.setAtPath('environment', env);
                    }
                    if (evName === 'menuAction') {
                        _this.onMenuAction({ id: evData });
                    }
                });
                imrSingleton.subscribe(function (msgArray) {
                    _this.model.setAtPath('infoMessage.messages', msgArray);
                });
            });
        }
        this.model.addSection('navigation', { pageId: '', context: {} });
        // Set environment items
        // this will allow us to do platform branching and so on
        this.model.addSection('environment', EnvCheck_1.environment);
        // Set up menus
        this.model.addSection('menu', {});
        MenuDef_1.setupMenu(this).then(function () {
            _this.modelGateResolver();
        });
        // Set up our app display
        // TODO: remove when done with initial setup testing
        this.model.addSection('testValues', { mainLabel: 'Hello, World! This is ThunderBolt!' });
        // console.log('<<<setupUIElements<<<')
        // console.log('model gate cleared')
        return this.waitReady();
    };
    // public setupDesktopMenu(desktopMenu) {
    //     for(let i=0; i<desktopMenu.length; i++) {
    //         mainApi.addMenuItem(null, desktopMenu[i])
    //     }
    //     mainApi.realiseMenu()
    //
    // }
    AppCore.prototype.setActiveMenu = function (menuComp) {
        this.activeMenu = menuComp;
    };
    AppCore.prototype.onMenuAction = function (props) {
        var menuEvent = {
            id: props.id,
            app: this
        };
        if (this.activeMenu) {
            this.activeMenu.update({ open: false });
        }
        // TODO: Handle anything global here
        // dispatch to current activity.  include app instance in props
        if (this.currentActivity) {
            if (typeof this.currentActivity.onMenuAction === 'function') {
                this.currentActivity.onMenuAction(menuEvent);
            }
        }
        var handler = this.menuHandlers[props.id];
        if (handler) {
            handler(menuEvent);
        }
    };
    AppCore.prototype.onToolAction = function (props) {
        var menuEvent = {
            id: props.id,
            app: this
        };
        // dispatch to current activity.  include app instance in props
        if (this.currentActivity) {
            if (typeof this.currentActivity.onToolAction === 'function') {
                this.currentActivity.onToolAction(menuEvent);
            }
        }
        var handler = this.menuHandlers[props.id];
        if (handler) {
            handler(menuEvent);
        }
    };
    /**
     * Register a global-scope handler for a menu or a tool action
     * or pass null instead of the handler function to clear it
     * @param menuId  menu action identifier
     * @param handler function to handle menu event
     */
    AppCore.prototype.registerMenuHandler = function (menuId, handler) {
        if (handler)
            this.menuHandlers[menuId] = handler;
        else
            delete this.menuHandlers[menuId];
    };
    // TODO: make part of a more defined util section
    AppCore.prototype.makeStringParser = function (string) {
        return StringParser && new StringParser(string);
    };
    AppCore.prototype.keyListener = function (event) {
        // console.log('key event seen '+event.key)
        if (event.isComposing || event.code === "229") {
            return;
        }
        if (event.key === "Backspace" || event.key === "Delete") {
            event.stopPropagation();
            event.preventDefault();
            this.navigateBack();
        }
    };
    AppCore.prototype.attachPageKeyListener = function () {
        if (!keyListenerBind) {
            keyListenerBind = this.keyListener.bind(this);
        }
        document.addEventListener('keydown', keyListenerBind);
    };
    AppCore.prototype.removePageKeyListener = function () {
        document.removeEventListener('keydown', keyListenerBind);
    };
    /**
     * Replaces the currently mounted page markup with the markup of the named page
     * and starts the associated activity.
     *
     * @param {string} pageId
     * @param {object} [context]
     */
    AppCore.prototype.navigateToPage = function (pageId, context, skipHistory) {
        // set the page in the model.  For Riot, this forces the page to change on update
        // for mobile, we need to do that through native navigation, but we still want the model to be the same
        this.model.setAtPath('navigation.context', context || {});
        // this next line is what actually triggers the display of the page
        this.model.setAtPath('navigation.pageId', pageId || '', true);
        // note that this isn't used on the mobile side, but we record it anyway.
        // this may be useful later if we have any history-related functionality in common.
        var curActivityId = this.currentActivity && this.currentActivity.activityId;
        var curContext = this.currentActivity && this.currentActivity.context;
        if (!skipHistory) {
            this.history.push({
                pageId: curActivityId,
                context: curContext
            });
        }
        if (EnvCheck_1.check.mobile) {
            var pageref = '~/pages/' + pageId;
            var navigationEntry = {
                moduleName: pageref,
                backstackVisible: !skipHistory
            };
            theFrame && theFrame.navigate(navigationEntry);
            // apparently, we can pass a function instead of a navigationEntry to construct a Page
            // which might be something to look at later if we want to work from our own common page definition
            // instead of writing out {N} syntax files.
            // Function needs to build full page including the layout stack and any event handlers.
            // not sure what effect this has on back history, since there's nothing passed for that.
        }
        else {
            var pageComponent = findPageComponent(pageId);
            var activity = pageComponent.activity;
            activity.context = context;
            this.startPageLogic(pageId, activity, context);
        }
    };
    /**
     * Called by mobile side to start the first activity only ('main')
     *
     * @param activity
     * @param context
     */
    AppCore.prototype.startPageLogic = function (id, activity, context) {
        var _this = this;
        activity.activityId = id;
        this.currentActivity = activity;
        if (!EnvCheck_1.check.mobile) {
            activity.onBeforeUpdate = function (props, state) {
                console.log('Announcement that the page will update', _this, activity, props, state);
            };
            this.attachPageKeyListener();
        }
        activity.appStart(this, context);
    };
    AppCore.prototype.navigateBack = function () {
        var popBack = this.history.pop();
        if (popBack) {
            // console.log(popBack)
            this.navigateToPage(popBack.pageId, popBack.context, true);
        }
    };
    /**
     * Dispatch an event to the current activity by name
     *
     * @param name
     * @param domEvent
     */
    AppCore.prototype.callEventHandler = function (tag, platEvent) {
        var act = this.currentActivity;
        var ed = new EventData();
        ed.app = this;
        ed.platEvent = platEvent;
        ed.sourceComponent = this.getComponent(platEvent.target);
        ed.eventType = platEvent.type;
        ed.tag = tag;
        var name = ed.sourceComponent.state[tag];
        if (typeof act[name] === 'function') {
            act[name](ed);
        }
        else {
            console.error(name + " is not a function exposed on current activity " + act.activityId);
        }
    };
    // same as the one in ComCommon, but duplicated here for use with eventData
    AppCore.prototype.getComponent = function (el) {
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
    // ----------------- File API access --------------------------
    // todo: Put into separate API space
    AppCore.prototype.readFileText = function (filePath) {
        if (!EnvCheck_1.check.mobile) {
            return mainApi.readFileText(filePath);
        }
        else {
            throw Error("File APIs not implemented for mobile yet");
        }
    };
    // ------- Extension for indicators / tools
    AppCore.prototype.createExtensionType = function (name) {
        var EType = extensionTypes[name];
        if (EType) {
            return new EType();
        }
    };
    return AppCore;
}());
exports.AppCore = AppCore;
// as it is from ComCommon
function getComponent(el) {
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
}
function findPageComponent(pageId) {
    var tag = pageId + '-page';
    var el = document.getElementById('root');
    var appComp = getComponent(el);
    var pageCompEl = appComp.$$(tag)[0];
    var pageComp = getComponent(pageCompEl);
    // console.log('found page', pageComp)
    return pageComp;
}
