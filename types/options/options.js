"use strict";
exports.__esModule = true;
exports.Options = void 0;
var options_paths_1 = require("./options.paths");
var options_configs_1 = require("./options.configs");
var Options = /** @class */ (function () {
    function Options(paths) {
        this.configs = new options_configs_1.ConfigsObject();
        if (paths) {
            this.paths = paths;
        }
        else {
            this.paths = new options_paths_1.Paths();
        }
    }
    return Options;
}());
exports.Options = Options;
