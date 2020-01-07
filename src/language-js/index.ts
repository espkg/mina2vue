import parser from './parser'
import transformer from './transformation'
import generator from './generator'

// TODO: 默认 options
export default function (sourceCode : string, options : any = { type: 'page' }) : string {
  const ast : babel.types.File = parser(sourceCode)

  const distAst = transformer(ast, options)

  const distCode : string = generator(distAst)

  return distCode
}
