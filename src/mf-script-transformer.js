import t from '@babel/types'
import traverseModule from '@babel/traverse'
const traverse = traverseModule.default

const H5ActivityModuleMap = {
  MFPAGE: '@/components/base/mf-page'
}
const needAddMixin = new Set([])
const alreadyAddMixin = new Set([])

export default function MFScriptTransformer (ast) {
  traverse(ast, {
    ImportDeclaration (path) {
      const { node } = path
      const { specifiers } = node
      // 寻找 H5 公共包，未来改成用 get 方法实现，比较优雅
      // console.log(path.get('MFPage'))
      for (let i = 0; i < specifiers.length; i++) {
        const specifier = specifiers[i]
        const moduleName = specifier.local.name
        if (H5ActivityModuleMap[moduleName.toUpperCase()]) {
          node.source = t.stringLiteral(H5ActivityModuleMap[moduleName.toUpperCase()])
        }
      }
    },
    CallExpression (path) {
      const { node } = path
      if (t.isMemberExpression(node.callee)) {
        const { callee } = node
        if (t.isThisExpression(callee.object) && callee.property.name === 'hideMFLoading') {
          // 需判断是否已经添加，或重复添加
          needAddMixin.add('MFPageMixin')
        }
      }
    }
  })

  traverse(ast, {
    ImportDeclaration (path) {
      if (needAddMixin.has('MFPageMixin') && !alreadyAddMixin.has('MFPageMixin')) {
        path.insertAfter([
          t.importDeclaration([
            t.importDefaultSpecifier(t.identifier('MFPageMixin'))
          ], t.stringLiteral('@/mixins/MFPage.mixins'))
        ])
        alreadyAddMixin.add('MFPageMixin')
      }
    },
    ExportDefaultDeclaration (path) {
      const { node } = path
      const elements = Array.from(needAddMixin).map((mixin) => {
        return t.identifier(mixin)
      })
      node.declaration.properties.push(
        t.objectProperty(t.identifier('mixins'), t.arrayExpression(elements))
      )
    }
  })

  return ast
}
