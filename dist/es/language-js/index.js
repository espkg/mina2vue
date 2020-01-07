import parser from './parser';
import transformer from './transformation';
import generator from './generator';
export default function (sourceCode, options = { type: 'page' }) {
    const ast = parser(sourceCode);
    const distAst = transformer(ast, options);
    const distCode = generator(distAst);
    return distCode;
}
//# sourceMappingURL=index.js.map