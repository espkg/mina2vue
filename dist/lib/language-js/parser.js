"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("@babel/parser");
function default_1(sourceCode) {
    return parser_1.parse(sourceCode, {
        sourceType: 'module'
    });
}
exports.default = default_1;
//# sourceMappingURL=parser.js.map