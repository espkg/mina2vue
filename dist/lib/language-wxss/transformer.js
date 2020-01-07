"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function styleTransformer(sourceCode, options) {
    const css = sourceCode.replace(/([\d]+)rpx/g, (m, $1) => {
        const newPx = $1.replace(/(^:)|(:$)/g, '');
        return `${newPx * 0.5}px`;
    });
    return css;
}
exports.default = styleTransformer;
//# sourceMappingURL=transformer.js.map