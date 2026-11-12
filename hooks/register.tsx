import type { Register } from 'claude-code'

import { GIRL_ALT, GIRL_HEIGHT, GIRL_SVG, GIRL_WIDTH } from './girl'

/** The words the row would show, without the trailing dots she stands in for. */
const status = (word: string, message: string | null): string =>
  (message ?? word).replace(/\s*(?:…|\.{3})$/u, '')

export const register: Register = on => {
  // The thinking row: the line that animates while a turn runs.
  on('ui.render', { component: 'Spinner' }, ($, e, next) => {
    // A terminal draws text cells only and has no Svg: its spinner stays.
    if (e.surface === 'terminal') {
      return next(e)
    }

    const { Box, Svg, Text } = $.ui.resolve(e)

    return (
      <Box flexDirection="row" alignItems="flex-end" gap="sm">
        <Svg source={GIRL_SVG} alt={GIRL_ALT} width={GIRL_WIDTH} height={GIRL_HEIGHT} />
        <Text dimColor>{status(e.props.word, e.props.message)}</Text>
      </Box>
    )
  })
}
