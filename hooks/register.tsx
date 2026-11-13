import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import { GIRL_ALT, GIRL_HEIGHT, GIRL_SVG, GIRL_WIDTH } from './girl'
import { RUNNER_ALT, RUNNER_HEIGHT, RUNNER_SVG, RUNNER_WIDTH } from './runner'
import { STICKER_SIZE, STICKERS } from './stickers'

const PANEL = 'claude-panel'
/** Which sticker the side panel shows; a change redraws the panel. */
const sticker = atom({ plugin: 'typing-girl', key: 'sticker' } as const, 0)

/** The words the row would show, without the trailing dots. */
const status = (word: string, message: string | null): string =>
  (message ?? word).replace(/\s*(?:…|\.{3})$/u, '')

/** How many times each part of the app asked this mod to draw, since it loaded. */
const asked: Record<string, number> = {}

const note = (site: string): void => {
  asked[site] = (asked[site] ?? 0) + 1
}

/** The prompt of the turn now running; null when no turn runs. */
let prompt: string | null = null
/** The message row she sits under while that turn runs. */
let herMessage = ''
/** Your message rows the app has shown, by id, in the order it first showed them. */
const shown = new Map<string, string>()

/** The message row the app showed last. */
const newest = (): string => [...shown.keys()].at(-1) ?? ''

export const register: Register = on => {
  // A check tool: Claude cannot see the screen, so this reports whether the
  // app has been asking the mod to draw.
  on('session.start', async ($, e, next) => {
    await $.tool.register({
      name: 'draw_report',
      description:
        'Reports how many times each part of the app asked the typing-girl mod to draw since it loaded, to check that she is on screen.',
    })
    await $.command.register({
      name: PANEL,
      description: 'Open the side panel with a Claude sticker',
    })

    return next(e)
  })

  // /claude-panel opens the side panel beside the chat.
  on('command.run', { command: PANEL }, async $ => {
    await $.ui.open({ id: PANEL, title: 'Claude' })

    return { text: 'Claude panel opened.' }
  })

  // The side panel: one sticker, and a button for a different one.
  on('ui.render', { component: 'Pane', requestId: PANEL }, async ($, e, next) => {
    const shown = STICKERS[(await read($, sticker)) % STICKERS.length]

    if (e.surface === 'terminal' || shown === undefined) {
      return next(e)
    }

    const { Box, Button, Svg } = $.ui.resolve(e)

    return (
      <Box flexDirection="column" alignItems="center" gap="sm">
        <Svg source={shown.svg} alt={shown.alt} width={STICKER_SIZE} height={STICKER_SIZE} />
        <Button
          key="another"
          label="Another one"
          onPress={() =>
            update($, sticker, n => (n + 1 + Math.floor(Math.random() * (STICKERS.length - 1))) % STICKERS.length)
          }
        />
      </Box>
    )
  })

  on('tool.call', { tool: 'mcp__typing-girl__draw_report' }, () => ({
    result: JSON.stringify(asked),
  }))

  // A turn starts: she sits under the message that began it. A turn of a
  // helper agent changes nothing.
  on('turn.start', ($, e, next) => {
    if (e.agentId === undefined) {
      prompt = e.text
      herMessage = newest()
      $.ui.invalidate('ui.render')
    }

    return next(e)
  })

  // The turn is over (answered, stopped or failed): she leaves.
  on('turn.complete', ($, e, next) => {
    if (e.agentId === undefined) {
      prompt = null
      herMessage = ''
      $.ui.invalidate('ui.render')
    }

    return next(e)
  })

  // Your message rows in the chat. The newest one keeps its own drawing and
  // gets her under it while its turn runs; every other row is left alone.
  on('ui.render', { component: 'UserMessage' }, async ($, e, next) => {
    const isYours = e.props.task === undefined && e.props.from === undefined

    if (isYours && !shown.has(e.requestId)) {
      shown.set(e.requestId, e.props.text)

      // A message first shown after its turn began: she moves under it.
      if (prompt !== null) {
        herMessage = e.requestId
      }
    }

    // A terminal has no Svg.
    if (e.surface === 'terminal' || prompt === null || e.requestId !== herMessage) {
      return next(e)
    }

    note(`${e.surface}/UserMessage`)
    const { Box, Svg } = $.ui.resolve(e)

    return (
      <Box flexDirection="column" gap="xs">
        {await next(e)}
        <Svg source={GIRL_SVG} alt={GIRL_ALT} width={GIRL_WIDTH} height={GIRL_HEIGHT} />
      </Box>
    )
  })

  // The row with the dots. The desktop app gives a mod one line of height
  // there and keeps its own dots, so a tiny runner goes beside the words.
  on('ui.render', { component: 'Spinner' }, ($, e, next) => {
    // A terminal draws text cells only and has no Svg: its spinner stays.
    if (e.surface === 'terminal') {
      return next(e)
    }

    note(`${e.surface}/Spinner`)
    const { Box, Svg, Text } = $.ui.resolve(e)

    return (
      <Box flexDirection="row" alignItems="center" gap="xs">
        <Svg source={RUNNER_SVG} alt={RUNNER_ALT} width={RUNNER_WIDTH} height={RUNNER_HEIGHT} />
        <Text dimColor>{status(e.props.word, e.props.message)}</Text>
      </Box>
    )
  })
}
