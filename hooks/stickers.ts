// The pictures the side panel cycles through. This shared version shows the
// two drawings the mod already has. To show the kelaode sticker pack instead
// (personal use only), run stickers.py with the pack's assets folder: it
// rewrites this file with small copies of a few stickers.

import { GIRL_ALT, GIRL_SVG } from './girl'
import { RUNNER_ALT, RUNNER_SVG } from './runner'

export const STICKER_SIZE = 160

export const STICKERS: readonly { alt: string; svg: string }[] = [
  { alt: GIRL_ALT, svg: GIRL_SVG },
  { alt: RUNNER_ALT, svg: RUNNER_SVG },
]
