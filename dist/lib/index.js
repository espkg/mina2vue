"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const language_wxml_1 = __importDefault(require("./language-wxml"));
exports.wxmlConverter = language_wxml_1.default;
const language_wxss_1 = __importDefault(require("./language-wxss"));
exports.wxssConverter = language_wxss_1.default;
const index_1 = __importDefault(require("./language-js/index"));
exports.jsConverter = index_1.default;
function default_1(sourceCodes, options) {
}
exports.default = default_1;
//# sourceMappingURL=index.js.map