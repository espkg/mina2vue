function dynamicValue (value) {
  if (!value) return []
  return value.match(/{{(.*?)}}/g)
}

function tagTransformer (node) {
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

function handleClassAttribute (value, node) {
  const regValue = dynamicValue(value)

  if (regValue && regValue.length) {
    const dynamicClassValue = regValue.map((item) => item.replace(/{{(.*?)}}/, '$1'))
    node.attribs[':class'] = `[${dynamicClassValue}]`
    const restValue = regValue.reduce((accu, curr) => {
      return accu.replace(curr, '')
    }, value)
    node.attribs.class = restValue.trim()
  }
}

function handleStyleAttribute (value, node) {
  const styleList = value.split(';') // 拆分成每条 style
  const normalStyle = []
  const dynamicStyle = {}
  let finalDynamicStyle = ''

  styleList.forEach((style) => {
    const regValue = dynamicValue(style)

    if (regValue && regValue.length) {
      let [property, styleValue] = style.split(':')
      let finalStyleValue = ''

      // 属性切换成驼峰格式
      property = property.replace(/-(\w)/g, (all, letter) => letter.toUpperCase()).trim()

      // 处理样式的格式
      const firstSplit = styleValue.split('{{')
      let secondSplit = []
      firstSplit.forEach((item) => {
        secondSplit = secondSplit.concat(item.split('}}'))
      })
      secondSplit.forEach((part, index) => {
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
        (m, $1) => {
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

function handleBindAttribute (value, attribute, node) {
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

function handleCatchAttribute (value, attribute, node) {
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

function handleWXAttribute (value, attribute, node) {
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

function handleElseAttribute (value, attribute, node) {
  if (dynamicValue(value) && dynamicValue(value).length) {
    node.attribs[`:${attribute}`] = value.replace(/{{(.*?)}}/, '$1').trim()
    delete node.attribs[attribute]
  }
}

function attributeTransformer (node) {
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

export default async function templateTransformer (ast) {
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
      templateTransformer(node.children)
    }
  }

  return ast
}
