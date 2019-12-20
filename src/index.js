import parser from '@babel/parser'
import generator from '@babel/generator'
import WXMLParser from './wxml-parser.js'
import templateTransformer from './template-transformer.js'
import minaScriptTransformer from './mina-script-transformer'
import MFScriptTransformer from './mf-script-transformer'
import vueGenerator from './vue-generator'
import styleTransformer from './style-transformer'
import HTMLGenerator from './html-generator'

const wxmlParser = new WXMLParser()

async function handleWXML (templateStr) {
  const templateAST = await wxmlParser.parse(templateStr)
  const distAST = await templateTransformer(templateAST)
  HTMLGenerator.configure({
    disableAttribEscape: true
  })
  const distCode = HTMLGenerator(distAST)

  return distCode
}

function handleWXSS (styleStr) {
  return styleTransformer(styleStr)
}

function handleJS (scriptStr) {
  const scriptAST = parser.parse(scriptStr, {
    sourceType: 'module'
  })
  let distAST = minaScriptTransformer(scriptAST)
  distAST = MFScriptTransformer(distAST)
  const distCode = generator.default(distAST).code

  return distCode
}

export default async function YG (template, style, scripts) {
  const distTemplate = await handleWXML(template)
  return vueGenerator(
    distTemplate,
    handleWXSS(style),
    handleJS(scripts)
  )
}
