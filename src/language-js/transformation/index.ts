import traverse from '@babel/traverse'
import structureTransformer from './structure'
import apiTransformer from './api'

const codeMods : Array<Function> = [structureTransformer, apiTransformer]

export default (ast : babel.types.File, options : any) : babel.types.File => {
  // TODO: 更优雅的合并 plugins
  const distAst : any = codeMods.reduce((prev, curr) : any => {
    traverse(prev, curr(null, options).visitor)
    return prev
  }, ast)
  return distAst
}
