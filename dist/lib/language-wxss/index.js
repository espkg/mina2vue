"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const transformer_1 = __importDefault(require("./transformer"));
function default_1(sourceCode, options = { type: 'page' }) {
    const distCode = transformer_1.default(sourceCode, options);
    return distCode;
}
exports.default = default_1;
//# sourceMappingURL=index.js.map