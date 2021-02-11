"use strict";
exports.__esModule = true;
var ComCommon_1 = require("./ComCommon");
var cm;
exports["default"] = {
    onBeforeMount: function (props, state) {
        console.log(this.root.tagName, 'onBeforeMount', props, state);
        var addBind = Object.assign({ bind: 'navigation.context' }, props);
        Object.defineProperty(this, 'props', {
            value: addBind
        });
        this.bound = new Object();
        cm = ComCommon_1.newCommon(this);
        cm.bindComponent();
    },
    onMounted: function (props, state) {
        console.log(this.root.tagName, 'onMounted', props, state);
    },
    onBeforeUpdate: function (props, state) {
        console.log(this.root.tagName, 'onBeforeUpdate', props, state);
    },
    onUpdated: function (props, state) {
        console.log(this.root.tagName, 'onUpdated', props, state);
    },
    onBeforeUnmount: function (props, state) {
        console.log(this.root.tagName, 'onBeforeUnmount', props, state);
    },
    onUnmounted: function (props, state) {
        console.log(this.root.tagName, 'onUnmounted', props, state);
    }
};
