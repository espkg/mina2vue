import { parse } from '@babel/parser'

export default function (sourceCode : string) : babel.types.File {
  return parse(sourceCode, {
    sourceType: 'module'
  })
}
