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
exports.ExampleIndicator = void 0;
var ToolExtension_1 = require("./ToolExtension");
var ExampleIndicator = /** @class */ (function (_super) {
    __extends(ExampleIndicator, _super);
    function ExampleIndicator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ExampleIndicator;
}(ToolExtension_1.ToolExtension));
exports.ExampleIndicator = ExampleIndicator;
