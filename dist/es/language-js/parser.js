import { parse } from '@babel/parser';
export default function (sourceCode) {
    return parse(sourceCode, {
        sourceType: 'module'
    });
}
//# sourceMappingURL=parser.js.map