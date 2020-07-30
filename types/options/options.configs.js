"use strict";
exports.__esModule = true;
exports.ConfigsObject = void 0;
var ConfigsObject = /** @class */ (function () {
    function ConfigsObject() {
        this.routes = {};
        this.controllers = {};
        this.middlewares = {};
        this.sql = {
            bindings: {},
            loose: {},
            handlers: {},
            bases: {}
        };
    }
    return ConfigsObject;
}());
exports.ConfigsObject = ConfigsObject;
