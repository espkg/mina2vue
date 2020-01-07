"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = __importDefault(require("./parser"));
const transformation_1 = __importDefault(require("./transformation"));
const generator_1 = __importDefault(require("./generator"));
function default_1(sourceCode, options = { type: 'page' }) {
    const ast = parser_1.default(sourceCode);
    const distAst = transformation_1.default(ast, options);
    const distCode = generator_1.default(distAst);
    return distCode;
}
exports.default = default_1;
//# sourceMappingURL=index.js.map