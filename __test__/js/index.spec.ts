import { jsConverter } from '../../src'

it('should output js', () => {
  const input = 'const foo = "bar"'
  const output = jsConverter(input)

  expect(output).toMatchSnapshot()
})
