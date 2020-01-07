import { wxmlConverter } from '../../src'

it('should convert <view> to <div>', async () => {
  const input = '<view></view>'
  const output = await wxmlConverter(input)

  expect(output).toMatchSnapshot()
})

it('should convert <text> to <span>', async () => {
  const input = '<text></text>'
  const output = await wxmlConverter(input)

  expect(output).toMatchSnapshot()
})
