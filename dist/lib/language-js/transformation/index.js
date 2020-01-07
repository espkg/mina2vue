"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const traverse_1 = __importDefault(require("@babel/traverse"));
const structure_1 = __importDefault(require("./structure"));
const api_1 = __importDefault(require("./api"));
const codeMods = [structure_1.default, api_1.default];
exports.default = (ast, options) => {
    const distAst = codeMods.reduce((prev, curr) => {
        traverse_1.default(prev, curr(null, options).visitor);
        return prev;
    }, ast);
    return distAst;
};
//# sourceMappingURL=index.js.map