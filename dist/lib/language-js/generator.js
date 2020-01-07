"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const generator_1 = __importDefault(require("@babel/generator"));
function default_1(ast) {
    return generator_1.default(ast).code;
}
exports.default = default_1;
//# sourceMappingURL=generator.js.map