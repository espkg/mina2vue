import parser from './parser'
import transformer from './transformer'
import generator from './generator'

// TODO: 默认 options
export default async function (sourceCode : string, options : any = { }) {
  const ast = await parser(sourceCode)

  const distAst = await transformer(ast, options)

  generator.configure({
    disableAttribEscape: true
  })
  const distCode : string = generator(distAst)

  // Undo the hacky fix from parser
  return distCode.replace(/<>/g, (m) => {
    return `<`
  })
}
