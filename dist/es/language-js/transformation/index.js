import traverse from '@babel/traverse';
import structureTransformer from './structure';
import apiTransformer from './api';
const codeMods = [structureTransformer, apiTransformer];
export default (ast, options) => {
    const distAst = codeMods.reduce((prev, curr) => {
        traverse(prev, curr(null, options).visitor);
        return prev;
    }, ast);
    return distAst;
};
//# sourceMappingURL=index.js.map