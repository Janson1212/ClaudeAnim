import { expect, test } from 'claude-code/testing'
import type { On } from 'claude-code'

// What the app hands a mod for the thinking row (the row with the dots).
const SPINNER = {
  plugin: 'typing-girl',
  component: 'Spinner',
  requestId: 'main',
  props: { word: 'Working', message: null, suffix: '…', mode: 'thinking' },
} as const

// What the app hands a mod for one of your message rows in the chat.
const message = (requestId: string, text: string) =>
  ({
    plugin: 'typing-girl',
    component: 'UserMessage',
    requestId,
    surface: 'desktop',
    props: { text, origin: { kind: 'sdk' }, isExpanded: true },
  }) as const

const TURN_DONE = { answer: '', durationMs: 1, isAborted: false, reason: 'answer' } as const

// A drawing must be a moving SVG that an image may hold: no script, handler
// or outside file (its pictures are embedded data), within the size limit.
const expectSafeMovingSvg = (source: string): void => {
  expect(source.startsWith('<svg')).toBe(true)
  expect(source.length).toBeLessThan(131072)
  expect(source).toMatch(/<animate/)
  expect(/<script|<foreignObject|\son\w+=/i.test(source)).toBe(false)
  const links = source.match(/href="[^"]*"/g) ?? []
  expect(links.length).toBeGreaterThan(0)
  expect(links.every(link => link.startsWith('href="data:image/'))).toBe(true)
}

// These hooks stand for the engine: they answer what the mod asks of it, and
// draw the word "engine" for every row (the row as the app itself draws it).
const engine = (on: On): void => {
  on('ui.invalidate', () => ({ value: undefined }))
  on('turn.start', (_, e) => ({ turnId: e.turnId }))
  on('turn.complete', () => ({ text: '' }))
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)

    return <Text>engine</Text>
  })
}

test('the dots row gets a small runner and the status words', async $ => {
  for (const surface of ['desktop', 'vscode'] as const) {
    const ui = await $.ui.mount({ ...SPINNER, surface })

    const svg = await ui.find({ type: 'Svg' })
    expectSafeMovingSvg(String(svg?.props.source))
    expect(String(svg?.props.alt)).toMatch(/running/)
    // The app gives this row one line of height, so the runner is drawn small.
    expect(Number(svg?.props.height)).toBeGreaterThan(0)
    expect(Number(svg?.props.height)).toBeLessThanOrEqual(24)

    // The status words stay, without the trailing dots.
    expect((await ui.find({ type: 'Text' }))?.text).toBe('Working')
    await ui.unmount()
  }
})

test('a message overrides the word, and loses its trailing dots', async $ => {
  for (const [text, shown] of [
    ['Compacting conversation', 'Compacting conversation'],
    ['Compacting conversation…', 'Compacting conversation'],
    ['Compacting conversation...', 'Compacting conversation'],
  ] as const) {
    const ui = await $.ui.mount({
      ...SPINNER,
      surface: 'desktop',
      props: { ...SPINNER.props, message: text },
    })

    expect((await ui.find({ type: 'Text' }))?.text).toBe(shown)
    await ui.unmount()
  }
})

test('she types under your newest message while a turn runs, then leaves', async ($, on) => {
  engine(on)

  // The app shows your message, then the turn starts.
  let ui = await $.ui.mount(message('m1', 'hello'))
  expect(await ui.find({ type: 'Svg' })).toBeUndefined()
  await ui.unmount()
  await $.turn.start({ text: 'hello', turnId: 't1' })

  // While the turn runs: your message as the app draws it, and her under it,
  // at a size between the first two versions.
  ui = await $.ui.mount(message('m1', 'hello'))
  const svg = await ui.find({ type: 'Svg' })
  expectSafeMovingSvg(String(svg?.props.source))
  expect(String(svg?.props.alt)).toMatch(/typing/)
  expect(Number(svg?.props.height)).toBe(128)
  expect((await ui.find({ type: 'Text' }))?.text).toBe('engine')
  await ui.unmount()

  // Once the turn is over the row is the app's own again.
  await $.turn.complete({ ...TURN_DONE, turnId: 't1' })
  ui = await $.ui.mount(message('m1', 'hello'))
  expect(await ui.find({ type: 'Svg' })).toBeUndefined()
  await ui.unmount()
})

test('she follows the newest message, even when the same words were sent before', async ($, on) => {
  engine(on)

  const before = await $.ui.mount(message('m1', 'testing'))
  await before.unmount()

  // This time the turn starts before the app shows the new message.
  await $.turn.start({ text: 'testing', turnId: 't2' })
  const newest = await $.ui.mount(message('m2', 'testing'))
  expect(await newest.find({ type: 'Svg' })).toBeDefined()
  await newest.unmount()

  const older = await $.ui.mount(message('m1', 'testing'))
  expect(await older.find({ type: 'Svg' })).toBeUndefined()
  await older.unmount()
})

test('the mod steps aside where it has nothing to draw', async ($, on) => {
  engine(on)

  for (const target of [message('m0', 'earlier'), message('m1', 'hello')]) {
    const shown = await $.ui.mount(target)
    await shown.unmount()
  }

  await $.turn.start({ text: 'hello', turnId: 't1' })
  // A helper agent starting its own turn changes nothing.
  await $.turn.start({ text: 'earlier', turnId: 't1a', agentId: 'a1' })

  for (const target of [
    { ...SPINNER, surface: 'terminal' },
    { ...message('m1', 'hello'), surface: 'terminal' },
    message('m0', 'earlier'),
    {
      plugin: 'typing-girl',
      component: 'AbovePrompt',
      requestId: 'band',
      surface: 'desktop',
      props: {
        hasSurvey: false,
        isCollapsed: false,
        isWorking: true,
        maxRows: 12,
        bodyColumns: 80,
        scroll: { offset: 0, bodyRows: 12 },
        view: {},
      },
    },
  ] as const) {
    const ui = await $.ui.mount(target)

    expect(await ui.find({ type: 'Svg' })).toBeUndefined()
    expect((await ui.find({ type: 'Text' }))?.text).toBe('engine')
    await ui.unmount()
  }
})

test('the draw report counts what the app asked for', async ($, on) => {
  engine(on)

  const shown = await $.ui.mount(message('m1', 'hello'))
  await shown.unmount()
  await $.turn.start({ text: 'hello', turnId: 't1' })
  const dots = await $.ui.mount({ ...SPINNER, surface: 'desktop' })
  await dots.unmount()
  const chat = await $.ui.mount(message('m1', 'hello'))
  await chat.unmount()

  const answer = await $.tool.call({ tool: 'mcp__typing-girl__draw_report' })
  const report = String(answer.result)

  expect(report).toMatch(/"desktop\/Spinner":[1-9]/)
  expect(report).toMatch(/"desktop\/UserMessage":[1-9]/)
})

test('she sits under your newest message even when its text differs from the prompt', async ($, on) => {
  engine(on)

  // The app may show a message differently from the prompt the turn got
  // (an attached file path expanded, extra context added).
  const first = await $.ui.mount(message('m1', 'look at @C:/pic.avif please'))
  await first.unmount()
  await $.turn.start({ text: 'look at C:/pic.avif please\n<attached file>', turnId: 't1' })

  const ui = await $.ui.mount(message('m1', 'look at @C:/pic.avif please'))
  expect(await ui.find({ type: 'Svg' })).toBeDefined()
  await ui.unmount()
})
