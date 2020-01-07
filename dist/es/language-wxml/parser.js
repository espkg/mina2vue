import { DomHandler, Parser } from 'htmlparser2';
export default function parse(sourceCode) {
    return new Promise((resolve, reject) => {
        const handler = new DomHandler((err, dom) => {
            if (err) {
                reject(err);
            }
            resolve(dom);
        });
        const parser = new Parser(handler, {
            xmlMode: true,
            lowerCaseTags: false,
            recognizeSelfClosing: true
        });
        parser.write(sourceCode);
        parser.end();
    });
}
//# sourceMappingURL=parser.js.map