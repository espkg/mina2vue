import * as t from '@babel/types'

function handleProperty (path : babel.NodePath<t.ObjectProperty>, rootPath : babel.NodePath<t.ObjectProperty>[]) {
  const { node } : { node : t.ObjectProperty } = path

  if (t.isObjectExpression(node.value)) {
    const propsPath = (path.get('value.properties') as babel.NodePath<t.ObjectProperty>[])
    const propTypePath = propsPath.filter((propPath) => t.isNodesEquivalent(propPath.node.key, t.identifier('type')))[0]
    const typeNode = propTypePath.node.value
    let watchPropNode : t.ObjectProperty = t.objectProperty(node.key, t.nullLiteral())

    propsPath.forEach((propPath) => {
      const propNode = propPath.node
      const keyName = propNode.key.name
      const watchPropIndex = rootPath.findIndex((propPath) => t.isNodesEquivalent(propPath.node.key, t.identifier('watch')))

      switch (keyName) {
        case 'value':
          if (t.isNodesEquivalent(typeNode, t.identifier('Object'))) {
            propPath.replaceWith(
              t.objectProperty(
                t.identifier('default'),
                t.arrowFunctionExpression([], (propNode.value as t.ObjectExpression))
              )
            )
          } else if (t.isNodesEquivalent(typeNode, t.identifier('Array'))) {
            propPath.replaceWith(
              t.objectProperty(
                t.identifier('default'),
                t.arrowFunctionExpression([], (propNode.value as t.ArrayExpression))
              )
            )
          } else {
            propPath.replaceWith(
              t.objectProperty(
                t.identifier('default'),
                propNode.value
              )
            )
          }
          break
        case 'observer':
          if (t.isNodesEquivalent(typeNode, t.identifier('Object')) || t.isNodesEquivalent(typeNode, t.identifier('Array'))) {
            // 引用类型换成深度监听
            watchPropNode = t.objectProperty(
              node.key,
              t.objectExpression([
                t.objectMethod('method', t.identifier('handler'), (propNode.value as t.FunctionExpression).params, (propNode.value as t.FunctionExpression).body),
                t.objectProperty(t.identifier('deep'), t.booleanLiteral(true))
              ])
            )
          } else {
            watchPropNode = t.objectProperty(
              node.key,
              t.arrowFunctionExpression((propNode.value as t.FunctionExpression).params, (propNode.value as t.FunctionExpression).body)
            )
          }

          if (watchPropIndex === -1) { // 如果没有 watch 属性则添加一个
            rootPath[rootPath.length - 1].insertAfter(
              t.objectProperty(
                t.identifier('watch'),
                t.objectExpression([watchPropNode])
              )
            )
          } else {
            // eslint-disable-next-line
            const propsPath = (rootPath[watchPropIndex].get('value.properties') as babel.NodePath<t.ObjectProperty>[])
            if (propsPath.length) {
              propsPath[propsPath.length - 1].insertAfter(watchPropNode)
            } else { // watch 属性为空对象
              rootPath[watchPropIndex].replaceWith(
                t.objectProperty(
                  t.identifier('watch'),
                  t.objectExpression([watchPropNode])
                )
              )
            }
          }

          propPath.remove()
          break
      }
    })
  }
}

function handleProperties (path : babel.NodePath<t.ObjectProperty>, rootPath : babel.NodePath<t.ObjectProperty>[]) {
  const { node } : { node : t.ObjectProperty } = path
  const propsPath = (path.get('value.properties') as babel.NodePath<t.ObjectProperty>[])

  propsPath.forEach((propPath) => {
    handleProperty(propPath, rootPath)
  })

  path.replaceWith(
    t.objectProperty(
      t.identifier('props'),
      node.value
    )
  )
}

function handleData (path : babel.NodePath<t.ObjectProperty>) {
  const { node } : { node : t.ObjectProperty } = path

  path.replaceWith(
    t.objectProperty(
      t.identifier('data'),
      t.arrowFunctionExpression([], (node.value as t.ObjectExpression))
    )
  )
}

function handleLifeCycles (path : babel.NodePath<t.ObjectProperty | t.ObjectMethod>) {
  const { node } : { node : t.ObjectProperty | t.ObjectMethod } = path
  const keyName : string = node.key.name
  const keyNameMap : { [key : string] : string } = {
    ready: 'mounted',
    attached: 'beforeMount',
    detached: 'destroyed',
    behaviors: 'mixins',
    onLoad: 'created',
    onReady: 'mounted',
    onUnload: 'destroyed'
  }

  if (t.isObjectMethod(node)) {
    path.replaceWith(
      t.objectMethod('method', t.identifier(keyNameMap[keyName]), node.params, node.body)
    )
  } else if (t.isObjectProperty(node)) {
    const { value } = (node as t.ObjectProperty)
    if (t.isFunctionExpression(value) || t.isArrowFunctionExpression(value)) {
      path.replaceWith(
        t.objectMethod('method', t.identifier(keyNameMap[keyName]), value.params,
          (value as t.FunctionExpression).body
        )
      )
    } else {
      path.replaceWith(
        t.objectProperty(t.identifier(keyNameMap[keyName]), value)
      )
    }
  }
}

function handleOtherProperties (path : babel.NodePath<t.ObjectProperty | t.ObjectMethod>, rootPath : babel.NodePath<t.CallExpression>) {
  const { node } : { node : t.ObjectProperty | t.ObjectMethod } = path
  const rootPropsPath = (rootPath.get('arguments.0.properties') as babel.NodePath<t.ObjectProperty>[])
  const methodsPropIndex = rootPropsPath.findIndex((propPath) => propPath.node && t.isNodesEquivalent(propPath.node.key, t.identifier('methods')))

  if (t.isObjectMethod(node) || (t.isArrowFunctionExpression(node.value) || t.isFunctionExpression(node.value))) {
    if (methodsPropIndex === -1) { // 如果没有 methods 属性则添加一个
      rootPropsPath[rootPropsPath.length - 1].insertAfter(
        t.objectProperty(
          t.identifier('methods'),
          t.objectExpression([node])
        )
      )
    } else {
      const propsPath = (rootPropsPath[methodsPropIndex].get('value.properties') as babel.NodePath<t.ObjectProperty>[])
      if (propsPath.length) {
        propsPath[propsPath.length - 1].insertAfter(node)
      } else { // methods 属性为空对象
        rootPropsPath[methodsPropIndex].replaceWith(
          t.objectProperty(t.identifier('methods'), t.objectExpression([node]))
        )
      }
    }

    path.remove()
  }
}

export default (api : any, options : any = {}) : babel.PluginObj => {
  return {
    visitor: {
      CallExpression (path : babel.NodePath<t.CallExpression>) {
        const { node } : { node : t.CallExpression } = path
        const { callee } = node

        // TODO: options.type 改为枚举
        const rootName : string = options.rootName || (options.type === 'page' ? 'Page' : 'Component')

        if (options.type === 'page') {
          if ((callee as t.V8IntrinsicIdentifier).name === rootName) {
            // pageArgNode 页面顶层属性
            const pageArgNode : t.ObjectExpression = (node.arguments[0] as t.ObjectExpression)
            const propsPath = (path.get('arguments.0.properties') as babel.NodePath<t.ObjectProperty>[])

            // 处理页面顶层属性
            propsPath.forEach((propPath) => {
              const { name } = propPath.node.key

              switch (name) {
                case 'data':
                  handleData(propPath)
                  break
                // case 'watch':
                // case 'observers':
                //   // 平移进 watch 属性，优先级不高
                //   break
                case 'onLoad':
                case 'onReady':
                case 'onUnload':
                  handleLifeCycles(propPath)
                  break
                default:
                  handleOtherProperties(propPath, path)
              }
            })

            path.parentPath.replaceWith(
              t.exportDefaultDeclaration(pageArgNode)
            )
          }
        } else if (options.type === 'component') {
          if ((callee as t.V8IntrinsicIdentifier).name === rootName) {
            // componentArgNode 组件顶层属性
            const componentArgNode : t.ObjectExpression = (node.arguments[0] as t.ObjectExpression)
            const propsPath = (path.get('arguments.0.properties') as babel.NodePath<t.ObjectProperty>[])

            // 处理组件顶层属性
            propsPath.forEach((propPath) => {
              const { name } = propPath.node.key

              switch (name) {
                case 'properties':
                  handleProperties(propPath, propsPath)
                  break
                case 'data':
                  handleData(propPath)
                  break
                // case 'watch':
                // case 'observers':
                //   // 平移进 watch 属性，优先级不高
                //   break
                case 'attached':
                case 'detached':
                case 'behaviors':
                case 'ready':
                  handleLifeCycles(propPath)
                  break
                default:
                  handleOtherProperties(propPath, path)
              }
            })

            path.parentPath.replaceWith(
              t.exportDefaultDeclaration(componentArgNode)
            )
          }
        }
      }
    }
  }
}
