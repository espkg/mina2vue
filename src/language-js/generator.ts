import generator from '@babel/generator'

export default function (ast : babel.types.Node) : string {
  return generator(ast).code
}
