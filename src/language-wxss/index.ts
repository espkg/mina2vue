import transformer from './transformer'

// TODO: 默认 options
export default function (sourceCode : string, options : any = { type: 'page' }) : string {
  const distCode = transformer(sourceCode, options)

  return distCode
}
