"use strict";
exports.__esModule = true;
exports.ToolExtension = void 0;
var ToolExtension = /** @class */ (function () {
    function ToolExtension() {
    }
    /**
     * When component is first mounted into layout, not yet rendered.
     * @param component
     */
    ToolExtension.prototype.onSetToPage = function (component) {
        console.log('onSetToPage', component);
    };
    /**
     * When there has been a change in state
     * @param component
     * @param state
     */
    ToolExtension.prototype.onStateChange = function (component, state) {
        console.log('onStateChange', component, state);
    };
    /**
     * When the component has been pressed
     * (mousedown, or touch event)
     * @param component
     * @return {boolean} return true to prevent propagation / click handling
     */
    ToolExtension.prototype.onPress = function (component) {
        console.log('onPress', component);
    };
    /**
     * WHen the component has been released
     * (mouseup or touch release)
     * @param component
     */
    ToolExtension.prototype.onRelease = function (component) {
        console.log('onRelease', component);
    };
    return ToolExtension;
}());
exports.ToolExtension = ToolExtension;
