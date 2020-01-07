import generator from '@babel/generator';
export default function (ast) {
    return generator(ast).code;
}
//# sourceMappingURL=generator.js.map