import { jsConverter } from '../../../src'

it('should output vue structure', () => {
  const input = `Page({
  })`
  const output = jsConverter(input)

  expect(output).toMatchSnapshot()
})

it('should output component to vue structure', () => {
  const input = `Component({
  })`
  const output = jsConverter(input, {
    type: 'component'
  })

  expect(output).toMatchSnapshot()
})

it('should convert components\' properties to vue props', () => {
  const input = `Component({
    properties: {}
  })`
  const output = jsConverter(input, {
    type: 'component'
  })

  expect(output).toMatchSnapshot()
})

it('convert simple property definition', () => {
  const input = `Component({
    properties: {
      foo1: Boolean
    }
  })`
  const output = jsConverter(input, {
    type: 'component'
  })

  expect(output).toMatchSnapshot()
})

it('convert property definition with default value', () => {
  const input = `Component({
    properties: {
      foo2: {
        type: Number,
        value: 0
      }
    }
  })`
  const output = jsConverter(input, {
    type: 'component'
  })

  expect(output).toMatchSnapshot()
})

it('convert property definition with default value on reference types', () => {
  const input = `Component({
    properties: {
      foo3: {
        type: Object,
        value: {
          bar: 1
        }
      },
      foo4: {
        type: Array,
        value: [1, 2, 3]
      }
    }
  })`
  const output = jsConverter(input, {
    type: 'component'
  })

  expect(output).toMatchSnapshot()
})

it('convert property definition with Observer', () => {
  const input = `Component({
    properties: {
      foo5: {
        type: Number,
        value: 0,
        observer: function (newVal, oldVal) {
          // 属性值变化时执行
        }
      }
    }
  })`
  const output = jsConverter(input, {
    type: 'component'
  })

  expect(output).toMatchSnapshot()
})

it('convert property definition with Observer on reference types', () => {
  const input = `Component({
    properties: {
      foo6: {
        type: Object,
        value: {
          bar: 1
        },
        observer: function (newVal, oldVal) {
          // 属性值变化时执行
        }
      }
    }
  })`
  const output = jsConverter(input, {
    type: 'component'
  })

  expect(output).toMatchSnapshot()
})

it('should avoid add additional watch property', () => {
  const input = `Component({
    properties: {
      foo7: {
        type: Number,
        value: 0,
        observer: function (newVal, oldVal) {
          // 属性值变化时执行
        }
      }
    },
    watch: {}
  })`
  const output = jsConverter(input, {
    type: 'component'
  })

  expect(output).toMatchSnapshot()
})

it('should insert a watch property after existing properties', () => {
  const input = `Component({
    properties: {
      foo8: {
        type: Number,
        value: 0,
        observer: function (newVal, oldVal) {
          // 属性值变化时执行
        }
      }
    },
    watch: {
      foo: () => {}
    }
  })`
  const output = jsConverter(input, {
    type: 'component'
  })

  expect(output).toMatchSnapshot()
})

it('should convert page data to vue format', () => {
  const input = `Page({
    data: {}
  })`
  const output = jsConverter(input)

  expect(output).toMatchSnapshot()
})

it('should convert component data to vue format', () => {
  const input = `Component({
    data: {}
  })`
  const output = jsConverter(input, {
    type: 'component'
  })

  expect(output).toMatchSnapshot()
})

it('convert lifecycle methods to vue name properly', () => {
  const input = `Component({
    behaviors: ['watch'],
    attached: () => {},
    detached: function () {},
    ready () {}
  })`
  const output = jsConverter(input, {
    type: 'component'
  })

  expect(output).toMatchSnapshot()
})

it('convert page lifecycle methods to vue name properly', () => {
  const input = `Page({
    onLoad: () => {},
    onReady: function () {},
    onUnload () {}
  })`
  const output = jsConverter(input)

  expect(output).toMatchSnapshot()
})

it('put other page methods & properties in vue methods property', () => {
  const input = `Page({
    _data: {},
    initPage: () => {},
    handleClick (e) {}
  })`
  const output = jsConverter(input)

  expect(output).toMatchSnapshot()
})

it('should put other methods & properties in vue methods properly', () => {
  const input = `Page({
    _data: {},
    initPage: () => {},
    methods: {},
    handleClick (e) {}
  })`
  const output = jsConverter(input)

  expect(output).toMatchSnapshot()
})
