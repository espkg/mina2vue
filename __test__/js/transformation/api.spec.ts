import { jsConverter } from '../../../src'

it('convert setData to assignment', () => {
  const input = `Page({
    init () {
      this.setData({
        foo: 'bar'
      })
    }
  })`
  const output = jsConverter(input)

  expect(output).toMatchSnapshot()
})

it('execute setData callback function after convert', () => {
  const input = `Page({
    init () {
      this.setData({
        foo: 'bar'
      }, () => {
        this.callback()
      })
    }
  })`
  const output = jsConverter(input)

  expect(output).toMatchSnapshot()
})

it('convert this.data.x to this.x', () => {
  const input = `Page({
    init () {
      const { foo } = this.data
      const foo2 = this.data.foo2
    }
  })`
  const output = jsConverter(input)

  expect(output).toMatchSnapshot()
})
