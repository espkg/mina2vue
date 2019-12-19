export default function styleTransformer (sourceCode) {
  // const reg = /([\d\s]+)*rpx/g
  // const dpx = 0.5
  // let css = sourceCode
  // while ((res = reg.exec(css))) {
  //   css = res.input
  //   const index = res.index
  //   const rpxPix = res[0]
  //   const num = rpxPix.replace('rpx', '').trim().replace(/(^:)|(:$)/g, '')
  //   const remPix = `${dpx * num}px`
  //   css = `${css.slice(0, index)} ${remPix}${css.slice(index + rpxPix.length, css.length)}`
  // }
  const css = sourceCode.replace(/([\d]+)rpx/g, (m, $1) => {
    const newPx = $1.replace(/(^:)|(:$)/g, '')
    return `${newPx * 0.5}px`
  })
  return css
}
