import htmlparser from 'htmlparser2'

export default class WXMLParser {
  parse (sourceCode) {
    return new Promise((resolve, reject) => {
      const handler = new htmlparser.DomHandler((err, dom) => {
        if (err) {
          reject(err)
        }

        resolve(dom)
      })

      const parser = new htmlparser.Parser(handler, {
        xmlMode: true,
        lowerCaseTags: false,
        recognizeSelfClosing: true
      })
      parser.write(sourceCode)
      parser.end()
    })
  }
}
