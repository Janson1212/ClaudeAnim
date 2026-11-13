import { expect, test } from 'claude-code/testing'

const PANEL = {
  plugin: 'typing-girl',
  component: 'Pane',
  requestId: 'claude-panel',
  props: {
    title: 'Claude',
    isFocused: false,
    bodyColumns: 40,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 20 },
    view: {},
  },
} as const

test('the side panel shows a sticker, and the button swaps it for another', async ($, on) => {
  on('ui.invalidate', () => ({ value: undefined }))

  const ui = await $.ui.mount({ ...PANEL, surface: 'desktop' })
  const first = await ui.find({ type: 'Svg' })
  expect(String(first?.props.source)).toMatch(/^<svg/)
  expect(String(first?.props.source)).toMatch(/href="data:image\/webp;base64,/)
  expect(String(first?.props.source).length).toBeLessThan(131072)

  await ui.press({ key: 'another' })
  const second = await ui.find({ type: 'Svg' })
  expect(second?.props.alt).not.toBe(first?.props.alt)
  await ui.unmount()
})

test('the /claude-panel command opens the panel', async ($, on) => {
  const opened: string[] = []
  on('ui.open', (_, e) => {
    opened.push(e.id)

    return { value: { isPlaced: true } }
  })

  const answer = await $.command.run({ command: 'claude-panel', args: '' })
  expect(opened).toContain('claude-panel')
  expect(String(answer.text)).toMatch(/panel/i)
})
