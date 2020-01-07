import { DomHandler, Parser } from 'htmlparser2'

export default function parse (sourceCode : string) {
  return new Promise((resolve, reject) => {
    const handler = new DomHandler((err, dom) => {
      if (err) {
        reject(err)
      }

      resolve(dom)
    })

    const parser = new Parser(handler, {
      xmlMode: true,
      lowerCaseTags: false,
      recognizeSelfClosing: true
    })
    parser.write(sourceCode)
    parser.end()
  })
}
