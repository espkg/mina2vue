import * as t from '@babel/types'

export default (api : any, options : any = {}) : babel.PluginObj => {
  return {
    visitor: {
      CallExpression (path : babel.NodePath<t.CallExpression>) {
        const { node } : { node : t.CallExpression } = path
        const callee = node.callee as t.MemberExpression

        // this.setData -> this.x = xxx
        if (t.isThisExpression(callee.object) && callee.property.name === 'setData') {
          // 如果 setData 有第二个参数
          if (node.arguments.length === 2) {
            const afterFunction = node.arguments[1] as t.FunctionExpression
            path.insertAfter(afterFunction.body.body)
          }

          const props = ((node.arguments[0] as t.ObjectExpression).properties as t.ObjectProperty[]).reverse() // 倒序插入
          props.forEach((prop : t.ObjectProperty) => {
            path.insertAfter(
              t.assignmentExpression('=', t.memberExpression(t.thisExpression(), prop.key), (prop.value as t.Identifier))
            )
          })

          path.remove()
        }
      },
      ThisExpression (path) {
        // this.data.foo -> this.foo
        const parentNode = path.parentPath.node
        if (t.isMemberExpression(parentNode) && parentNode.property.name === 'data') {
          path.parentPath.replaceWith(t.thisExpression())
        }
      }
    }
  }
}
