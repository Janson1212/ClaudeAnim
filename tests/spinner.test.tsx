import { expect, test } from 'claude-code/testing'

// What the app hands a mod for the thinking row.
const SPINNER = {
  plugin: 'typing-girl',
  component: 'Spinner',
  requestId: 'main',
  props: { word: 'Working', message: null, suffix: '…', mode: 'thinking' },
} as const

test('desktop and vscode draw the girl with the status beside her', async $ => {
  for (const surface of ['desktop', 'vscode'] as const) {
    const ui = await $.ui.mount({ ...SPINNER, surface })

    const svg = await ui.find({ type: 'Svg' })
    const source = String(svg?.props.source)
    expect(source.startsWith('<svg')).toBe(true)
    expect(source.length).toBeLessThan(131072) // the Svg element's limit
    expect(source).toMatch(/<animateTransform/) // she moves
    // Nothing an image may not hold: no script, link, embedded file or handler.
    expect(/<script|<image|<foreignObject|\son\w+=|href=/i.test(source)).toBe(false)
    expect(String(svg?.props.alt)).toMatch(/typing/)
    expect(Number(svg?.props.width)).toBeGreaterThan(0)
    expect(Number(svg?.props.height)).toBeGreaterThan(0)

    // The status words stay, without the "…" she replaces.
    expect((await ui.find({ type: 'Text' }))?.text).toBe('Working')
    await ui.unmount()
  }
})

test('a message overrides the word, and loses its trailing dots', async $ => {
  for (const [message, shown] of [
    ['Compacting conversation', 'Compacting conversation'],
    ['Compacting conversation…', 'Compacting conversation'],
    ['Compacting conversation...', 'Compacting conversation'],
  ] as const) {
    const ui = await $.ui.mount({
      ...SPINNER,
      surface: 'desktop',
      props: { ...SPINNER.props, message },
    })

    expect((await ui.find({ type: 'Text' }))?.text).toBe(shown)
    await ui.unmount()
  }
})

test('the terminal keeps its own spinner', async ($, on) => {
  // This hook stands for the engine: what is drawn when the mod steps aside.
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)

    return <Text>engine</Text>
  })

  const ui = await $.ui.mount({ ...SPINNER, surface: 'terminal' })

  expect((await ui.find({ type: 'Text' }))?.text).toBe('engine')
  await ui.unmount()
})
