import { wxmlConverter } from '../../src'

it('should print HTML', async () => {
  const input = '<html></html>'
  const output = await wxmlConverter(input)

  expect(output).toMatchSnapshot()
})
