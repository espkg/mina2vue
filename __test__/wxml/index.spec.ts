import { wxmlConverter } from '../../src'

it('should print HTML', async () => {
  const input = '<html></html>'
  const output = await wxmlConverter(input)

  expect(output).toMatchSnapshot()
})

it('should convert less than sign correctly', async () => {
  const input = '<view>{{a<1?2:0}}<text>{{chigua}}</text></view>'
  const output = await wxmlConverter(input)

  expect(output).toMatchSnapshot()
})
