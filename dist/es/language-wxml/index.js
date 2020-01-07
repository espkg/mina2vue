import parser from './parser';
import transformer from './transformer';
import generator from './generator';
export default async function (sourceCode, options = {}) {
    const ast = await parser(sourceCode);
    const distAst = await transformer(ast, options);
    generator.configure({
        disableAttribEscape: true
    });
    const distCode = generator(distAst);
    return distCode;
}
//# sourceMappingURL=index.js.map