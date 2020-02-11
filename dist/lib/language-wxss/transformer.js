"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function styleTransformer(sourceCode, options) {
    const css = sourceCode.replace(/([\d]+\s*)r(px|em)/g, (m, $1, $2) => {
        const newPx = $1.replace(/(^:)|(:$)/g, '');
        return `${newPx * 0.5}${$2}`;
    });
    return css;
}
exports.default = styleTransformer;
//# sourceMappingURL=transformer.js.map
