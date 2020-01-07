"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const htmlparser2_1 = require("htmlparser2");
function parse(sourceCode) {
    return new Promise((resolve, reject) => {
        const handler = new htmlparser2_1.DomHandler((err, dom) => {
            if (err) {
                reject(err);
            }
            resolve(dom);
        });
        const parser = new htmlparser2_1.Parser(handler, {
            xmlMode: true,
            lowerCaseTags: false,
            recognizeSelfClosing: true
        });
        parser.write(sourceCode);
        parser.end();
    });
}
exports.default = parse;
//# sourceMappingURL=parser.js.map