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

    // When change < to <>, htmlparser2 reads as part of same text node.
    const hackyFix = sourceCode.replace(/(>[^<]*)<(.*<)/g, (m, $1, $2) => {
    return `${$1}<>${$2}`
    })

    parser.write(hackyFix)
    parser.end()
  })
}
