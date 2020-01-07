"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = __importDefault(require("./parser"));
const transformer_1 = __importDefault(require("./transformer"));
const generator_1 = __importDefault(require("./generator"));
async function default_1(sourceCode, options = {}) {
    const ast = await parser_1.default(sourceCode);
    const distAst = await transformer_1.default(ast, options);
    generator_1.default.configure({
        disableAttribEscape: true
    });
    const distCode = generator_1.default(distAst);
    return distCode;
}
exports.default = default_1;
//# sourceMappingURL=index.js.map