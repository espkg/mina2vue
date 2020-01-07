function dynamicValue (value : any) {
  if (!value) return []
  return value.match(/{{(.*?)}}/g)
}

function tagTransformer (node : any) {
  switch (node.name) {
    case 'view':
      node.name = 'div'
      break

    case 'text':
      node.name = 'span'
      break

    case 'block':
      node.name = 'template'
      break

    case 'image':
      node.name = 'img'
      break

    case 'mf-page':
      node.name = 'div'
      break

    default:
  }
}

function handleClassAttribute (value : any, node : any) {
  const regValue = dynamicValue(value)

  if (regValue && regValue.length) {
    const dynamicClassValue = regValue.map((item : any) => item.replace(/{{(.*?)}}/, '$1'))
    node.attribs[':class'] = `[${dynamicClassValue}]`
    const restValue = regValue.reduce((accu : any, curr : any) => {
      return accu.replace(curr, '')
    }, value)
    node.attribs.class = restValue.trim()
  }
}

function handleStyleAttribute (value : any, node : any) {
  const styleList = value.split(';') // 拆分成每条 style
  const normalStyle : any = []
  const dynamicStyle : any = {}
  let finalDynamicStyle = ''

  styleList.forEach((style : any) => {
    const regValue = dynamicValue(style)

    if (regValue && regValue.length) {
      let [property, styleValue] = style.split(':')
      let finalStyleValue = ''

      // 属性切换成驼峰格式
      property = property.replace(/-(\w)/g, (all : any, letter : any) => letter.toUpperCase()).trim()

      // 处理样式的格式
      const firstSplit = styleValue.split('{{')
      let secondSplit : any = []
      firstSplit.forEach((item : any) => {
        secondSplit = secondSplit.concat(item.split('}}'))
      })
      secondSplit.forEach((part : any, index : any) => {
        if (!part) return
        if (finalStyleValue.length) finalStyleValue += (index > 0 && '+') || ''
        finalStyleValue += (index % 2 ? part : JSON.stringify(part.trim()))
      })
      const transferFinalStyleValue = finalStyleValue.replace(/([\d]+)rpx/g, (m, $1) => {
        const newPx = $1.replace(/(^:)|(:$)/g, '')
        return `${newPx * 0.5}px`
      })
      dynamicStyle[property] = transferFinalStyleValue

      // dynamicStyle[property] = finalStyleValue
    } else {
      // 静态 style 直接保存
      const css = style.trim()
      const transferFinalStyleValue = css.replace(
        /([\d]+)rpx/g,
        (m : any, $1 : any) => {
          const newPx = $1.replace(/(^:)|(:$)/g, '')
          return `${newPx * 0.5}px`
        }
      )
      normalStyle.push(transferFinalStyleValue)
    }
  })

  node.attribs.style = normalStyle.join(';')
  // 拼接成字符串
  if (Object.keys(dynamicStyle).length) {
    finalDynamicStyle = '{ '
    Object.keys(dynamicStyle).forEach((property) => {
      const value = dynamicStyle[property]
      finalDynamicStyle += property
      finalDynamicStyle += ': '
      finalDynamicStyle += value.replace(/"/g, "'")
      finalDynamicStyle += ';'
    })
    finalDynamicStyle += ' }'
    node.attribs[':style'] = finalDynamicStyle
  }
}

function handleBindAttribute (value : any, attribute : any, node : any) {
  let eventName = ''

  if (attribute.indexOf(':') !== -1) {
    eventName = attribute.split(':')[1]
  } else {
    eventName = attribute.substr(4)
  }

  if (eventName === 'tap') eventName = 'click'

  node.attribs[`@${eventName}`] = `${value}($event)`
  delete node.attribs[attribute]
}

function handleCatchAttribute (value : any, attribute : any, node : any) {
  let eventName = ''

  if (attribute.indexOf(':') !== -1) {
    eventName = attribute.split(':')[1]
  } else {
    eventName = attribute.substr(5)
  }

  if (eventName === 'tap') eventName = 'click'

  node.attribs[`@${eventName}.stop`] = value
  delete node.attribs[attribute]
}

function handleWXAttribute (value : any, attribute : any, node : any) {
  const attrName = attribute.split(':')[1]

  switch (attrName) {
    case 'if':
      node.attribs['v-if'] = value.replace(/{{(.*?)}}/, '$1').trim()
      delete node.attribs[attribute]
      break

    case 'else':
      node.attribs['v-else'] = '' // TODO: 此处会生成 v-else="" 需要修改 template generator
      delete node.attribs[attribute]
      break

    case 'elif':
      node.attribs['v-else-if'] = value.replace(/{{(.*?)}}/, '$1').trim()
      delete node.attribs[attribute]
      break

    case 'key':
      node.attribs[':key'] = value.replace(/{{(.*?)}}/, '$1').trim()
      delete node.attribs[attribute]
      break

    case 'for':
      /* eslint-disable */
      const forItem = node.attribs['wx:for-item']
      const forIndex = node.attribs['wx:for-index']
      const forContent = value.replace(/{{(.*?)}}/, '$1').trim()
      /* eslint-enable */
      node.attribs['v-for'] = `(${forItem || 'item'}, ${forIndex || 'index'}) in ${forContent}`
      delete node.attribs['wx:for-item']
      delete node.attribs['wx:for-index']
      delete node.attribs[attribute]
      break
  }
}

function handleElseAttribute (value : any, attribute : any, node : any) {
  if (dynamicValue(value) && dynamicValue(value).length) {
    node.attribs[`:${attribute}`] = value.replace(/{{(.*?)}}/, '$1').trim()
    delete node.attribs[attribute]
  }
}

function attributeTransformer (node : any) {
  Object.keys(node.attribs).forEach((attribute) => {
    const value = node.attribs[attribute]

    if (attribute === 'class') {
      handleClassAttribute(value, node)
    } else if (attribute === 'style') {
      handleStyleAttribute(value, node)
    } else if (attribute.match(/^bind/)) {
      handleBindAttribute(value, attribute, node)
    } else if (attribute.match(/^catch/)) {
      handleCatchAttribute(value, attribute, node)
    } else if (attribute.match(/^wx:/)) {
      handleWXAttribute(value, attribute, node)
    } else if (attribute === 'mfConfig') {
      delete node.attribs[attribute]
    } else {
      handleElseAttribute(value, attribute, node)
    }
  })
}

export default async function templateTransformer (ast : any, options : any) {
  for (let i = 0; i < ast.length; i++) {
    const node = ast[i]

    switch (node.type) {
      case 'tag':
        tagTransformer(node)
        attributeTransformer(node)
        break

      default:
    }

    if (node.children) {
      templateTransformer(node.children, options)
    }
  }

  return ast
}
