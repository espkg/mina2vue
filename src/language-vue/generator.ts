export default function vueGenerator (template = '', style = '', scripts = '') {
  let result = ''
  if (template.length) {
    result += `<template>
${template}
</template>`
  }
  if (scripts.length) {
    result += `
`
    result += `<script>
${scripts}
</script>`
  }
  if (style.length) {
    result += `
`
    result += `<style scoped>
${style}
</style>`
  }

  return result
}
