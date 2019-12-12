import t from '@babel/types'
import traverseModule from '@babel/traverse'
const traverse = traverseModule.default

const watchMethods = t.objectProperty(
  t.identifier('watch'),
  t.objectExpression([])
)

function solveOtherProps (parent, prop) {
  parent.properties.push(prop)
}

function solveData (parent, prop) {
  const oldData = prop.value.properties
  const vueData = t.objectProperty(
    t.identifier('data'),
    t.arrowFunctionExpression([], t.objectExpression(oldData))
  )
  parent.properties.push(vueData)
}

function solveProps (parent, prop) {
  const oldProps = prop.value.properties

  oldProps.forEach((p) => {
    const pProps = p.value.properties
    pProps && pProps.forEach((pProp, i) => {
      if (pProp.key.name === 'observer') {
        // observer 转 watch
        watchMethods.value.properties.push(
          t.objectMethod('method',
            p.key,
            pProp.params,
            pProp.body
          )
        )
        pProps.splice(i, i)
      }
    })
  })

  const vueProps = t.objectProperty(
    t.identifier('props'),
    t.objectExpression(oldProps)
  )

  parent.properties.push(vueProps)
}

export default function minaScriptTransformer (ast) {
  traverse(ast, {
    CallExpression (path) {
      if (path.node.callee.name === 'MFPage') {
        const rootProps = path.node.arguments[0].properties
        const vueProps = t.objectExpression([])
        const vueMethods = t.objectExpression([])

        rootProps.forEach((prop) => {
          if (t.isObjectMethod(prop) || (t.isObjectProperty(prop) && t.isFunctionExpression(prop.value))) {
            // 成员方法
            switch (prop.key.name) {
              case 'onLoad':
                vueProps.properties.push(t.objectMethod(
                  'method',
                  t.identifier('mounted'),
                  prop.value.params,
                  prop.value.body
                ))
                break
              case 'onReady':
                vueProps.properties.push(t.objectMethod(
                  'method',
                  t.identifier('created'),
                  prop.value.params,
                  prop.value.body
                ))
                break
              case 'onShow':
                // solveReady()
                break
              case 'onHide':
                // solveReady()
                break
              case 'onUnload':
                vueProps.properties.push(t.objectMethod(
                  'method',
                  t.identifier('destroyed'),
                  prop.value.params,
                  prop.value.body
                ))
                break
              case 'onShareAppMessage':
                // solveReady()
                break
              default:
                vueMethods.properties.push(prop)
            }
          } else if (t.isObjectProperty(prop)) {
            // 成员属性
            switch (prop.key.name) {
              case 'data':
                solveData(vueProps, prop)
                break

              case 'properties':
                solveProps(vueProps, prop)
                break

              default:
                solveOtherProps(vueProps, prop)
            }
          }
        })

        // 插入 methods
        vueProps.properties.push(t.objectProperty(
          t.identifier('methods'),
          vueMethods
        ))

        // 插入 watch
        vueProps.properties.push(watchMethods)

        path.insertAfter(
          t.exportDefaultDeclaration(vueProps)
        )

        path.remove()
      }
    }
  })

  traverse(ast, {
    CallExpression (path) {
      const { node } = path
      // this.setData -> this.x = xxx
      if (t.isThisExpression(node.callee.object) && node.callee.property.name === 'setData') {
        // 如果 setData 有第二个参数
        if (node.arguments.length === 2) {
          const afterFunction = node.arguments[1]
          path.insertAfter(afterFunction.body.body)
        }

        const props = node.arguments[0].properties.reverse() // 倒序插入
        props.forEach((prop) => {
          path.insertAfter(
            t.assignmentExpression('=', t.memberExpression(t.thisExpression(), prop.key), prop.value)
          )
        })

        path.remove()
      }
    },
    MemberExpression (path) {
      const { node } = path
      // this.data.foo -> this.foo
      if (t.isMemberExpression(node.object) &&
        t.isThisExpression(node.object.object) &&
        node.object.property.name === 'data'
      ) {
        path.replaceWith(
          t.memberExpression(
            t.thisExpression(),
            t.identifier(node.property.name)
          )
        )
      }
    }
  })

  return ast
}
