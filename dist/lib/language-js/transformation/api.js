"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const t = __importStar(require("@babel/types"));
exports.default = (api, options = {}) => {
    return {
        visitor: {
            CallExpression(path) {
                const { node } = path;
                const callee = node.callee;
                if (t.isThisExpression(callee.object) && callee.property.name === 'setData') {
                    if (node.arguments.length === 2) {
                        const afterFunction = node.arguments[1];
                        path.insertAfter(afterFunction.body.body);
                    }
                    const props = node.arguments[0].properties.reverse();
                    props.forEach((prop) => {
                        path.insertAfter(t.assignmentExpression('=', t.memberExpression(t.thisExpression(), prop.key), prop.value));
                    });
                    path.remove();
                }
            },
            ThisExpression(path) {
                const parentNode = path.parentPath.node;
                if (t.isMemberExpression(parentNode) && parentNode.property.name === 'data') {
                    path.parentPath.replaceWith(t.thisExpression());
                }
            }
        }
    };
};
//# sourceMappingURL=api.js.map