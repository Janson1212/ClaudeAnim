// An original chibi drawing of Claude大小姐, the character the Chinese
// community gave Claude: long orange hair and orange eyes, a radial flower on
// a black ribbon, a cream blouse and a long dark skirt. She sits on a stack
// of books and types on her laptop.
//
// Hand-written SVG, animated with SMIL alone (no script, no outside file), so
// it moves when the app draws it as an image. `currentColor` is the app's own
// text colour, which keeps the dark parts readable on a dark theme.

/** The drawn size in CSS pixels; the drawing itself is 180 by 176 units. */
export const GIRL_HEIGHT = 96
export const GIRL_WIDTH = Math.round((GIRL_HEIGHT * 180) / 176)

export const GIRL_ALT =
  'A girl with long orange hair sits on a stack of books, typing on her laptop'

const HAIR = '#F08A4B'
const HAIR_LINE = '#B5531D'
const HAIR_LIGHT = '#FBBE8A'
const SKIN = '#FFE7D6'
const SKIN_LINE = '#C9896A'
const CREAM = '#FFF5E4'
const CREAM_LINE = '#A77B5B'
const INK = '#3B2D33'
const ORANGE = '#E8793E'
/** An outline in the app's text colour, for dark shapes on a dark theme. */
const RIM = 'stroke="currentColor" stroke-opacity=".4"'

/** One looping SMIL transform; `more` holds keyTimes, begin and the like. */
const move = (type: string, values: string, dur: number, more = ''): string =>
  `<animateTransform attributeName="transform" type="${type}" values="${values}" dur="${dur}s" repeatCount="indefinite" ${more}/>`

const EASE = 'calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1"'
/** Head and hair sway together, pivoting at the neck. */
const SWAY = move('rotate', '-1.3 100 100;1.5 100 100;-1.3 100 100', 3.4, EASE)
const BLINK = move('scale', '1 1;1 1;1 .1;1 1;1 1', 3.8, 'keyTimes="0;.9;.94;.98;1"')

/** A book seen from its long side: cover, spine band, and the page edges. */
const book = (
  x: number,
  y: number,
  w: number,
  h: number,
  cover: string,
  line: string,
  band: string,
): string =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3.5" fill="${cover}" ${line} stroke-width="2"/>` +
  `<rect x="${x + 14}" y="${y + 4}" width="${w - 14.5}" height="${h - 8}" rx="1" fill="#FFFAEE"/>` +
  `<path d="M${x + 19} ${y + h / 2}H${x + w - 5}" stroke="#E3D2B5" stroke-width="1.2"/>` +
  `<path d="M${x + 7} ${y + 2}V${y + h - 2}" stroke="${band}" stroke-width="3"/>`

/** A starburst of rays about the origin, alternating long and short. */
const rays = (
  count: number,
  long: number,
  short: number,
  color: string,
  width: number,
): string => {
  let d = ''

  for (let i = 0; i < count; i += 1) {
    const angle = (i * 2 * Math.PI) / count
    const r = i % 2 === 0 ? long : short
    d += `M0 0L${(r * Math.cos(angle)).toFixed(1)} ${(r * Math.sin(angle)).toFixed(1)}`
  }

  return `<path d="${d}" stroke="${color}" stroke-width="${width}"/>`
}

/** An eye at (cx, cy): the lash stays put, the iris under it blinks. */
const eye = (cx: number, cy: number, rx: number, ry: number): string =>
  `<path d="M${cx - rx - 1.2} ${(cy - ry * 0.45).toFixed(1)}Q${cx} ${(cy - ry * 1.55 - 0.6).toFixed(1)} ${cx + rx + 1.2} ${(cy - ry * 0.45).toFixed(1)}" stroke="#5A2C18" stroke-width="2.2" fill="none"/>` +
  `<g transform="translate(${cx} ${cy})"><g>${BLINK}` +
  `<ellipse rx="${rx}" ry="${ry}" fill="#F5903F"/>` +
  `<ellipse cy="${(-ry * 0.34).toFixed(1)}" rx="${(rx * 0.93).toFixed(1)}" ry="${(ry * 0.62).toFixed(1)}" fill="#D2591C"/>` +
  `<ellipse cx=".8" cy="1" rx="${(rx * 0.45).toFixed(1)}" ry="${(ry * 0.5).toFixed(1)}" fill="#8A3414"/>` +
  `<circle cx="${(-rx * 0.35).toFixed(1)}" cy="${(-ry * 0.42).toFixed(1)}" r="${(rx * 0.36).toFixed(1)}" fill="#FFF"/>` +
  `<circle cx="${(rx * 0.4).toFixed(1)}" cy="${(ry * 0.5).toFixed(1)}" r="${(rx * 0.2).toFixed(1)}" fill="#FFD9B0"/>` +
  `</g></g>`

/** A sparkle that rises from the keyboard, growing then fading out. */
const sparkle = (x: number, y: number, color: string, begin: number): string =>
  `<g transform="translate(${x} ${y})"><g>` +
  move('translate', '0 0;0 -18', 1.8, `begin="${begin}s"`) +
  move('scale', '0;1;0', 1.8, `begin="${begin}s" additive="sum" keyTimes="0;.45;1"`) +
  `<path d="M0-5.5Q0 0 5.5 0Q0 0 0 5.5Q0 0-5.5 0Q0 0 0-5.5Z" fill="${color}"/>` +
  `</g></g>`

export const GIRL_SVG = [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="20 20 180 176" width="${GIRL_WIDTH}" height="${GIRL_HEIGHT}" stroke-linecap="round" stroke-linejoin="round">`,

  // The floor, and the three books she sits on.
  `<path d="M24 191H196" stroke="currentColor" stroke-opacity=".16" stroke-width="2"/>`,
  book(26, 172, 100, 18, '#F6E3C2', `stroke="${CREAM_LINE}"`, ORANGE),
  book(36, 155, 86, 17, '#E98B52', 'stroke="#A9552B"', CREAM),
  book(30, 138, 98, 17, INK, RIM, ORANGE),

  // Her long hair, falling down her back and over the books.
  `<g>${SWAY}`,
  `<path d="M104 30C76 28 58 50 60 80C61 104 52 124 50 146C49 156 46 164 40 172C50 172 56 168 60 160C60 168 59 174 56 180C66 178 72 170 74 160C75 166 77 172 76 176C83 170 86 160 86 148L90 120L120 100L128 60Z" fill="${HAIR}" stroke="${HAIR_LINE}" stroke-width="2"/>`,
  `<path d="M66 84C66 108 59 128 56 150" stroke="${HAIR_LIGHT}" stroke-width="3" fill="none" opacity=".8"/>`,
  `<path d="M77 112C77 128 73 142 71 154" stroke="${HAIR_LINE}" stroke-width="1.4" fill="none" opacity=".5"/>`,
  `</g>`,

  // Her feet dangle and swing; the far one first.
  `<g>${move('rotate', '3 148 134;-3 148 134;3 148 134', 1.6, EASE)}`,
  `<rect x="146" y="158" width="7" height="16" fill="${CREAM}" stroke="${CREAM_LINE}" stroke-width="1.5"/>`,
  `<path d="M144.5 174h9c6 0 9 3 9 6v1h-18z" fill="#6B4636" stroke="#3A241B" stroke-width="1.5"/>`,
  `</g>`,
  `<g>${move('rotate', '-3 148 134;3 148 134;-3 148 134', 1.6, EASE)}`,
  `<rect x="134" y="160" width="7.5" height="16" fill="${CREAM}" stroke="${CREAM_LINE}" stroke-width="1.5"/>`,
  `<path d="M132.5 176h10c6 0 10 3 10 6v1h-20z" fill="#7A5140" stroke="#3A241B" stroke-width="1.5"/>`,
  `</g>`,

  // The long skirt, with an orange stripe and a cream frill at the hem.
  `<path d="M74 126L112 122C128 120 143 124 151 134C157 144 161 156 163 166Q151 175 139 170Q128 175 117 167C115 158 113 150 112 142L72 142C70 136 71 130 74 126Z" fill="${INK}" ${RIM} stroke-width="1.6"/>`,
  `<path d="M150 137C154 146 156 153 157 159M133 129C136 142 137 152 137 162" stroke="#5C4950" stroke-width="1.6" fill="none"/>`,
  `<path d="M161.5 159Q150 168 139 163Q128 168 116 160" stroke="${ORANGE}" stroke-width="3" fill="none"/>`,
  `<path d="M163 166Q151 175 139 170Q128 175 117 167" stroke="${CREAM}" stroke-width="3.2" fill="none"/>`,

  // The blouse, its collar, a dark waistband and the ribbon bow with a brooch.
  `<path d="M80 102C77 110 75 119 74 128L112 124C114 116 114 108 112 100C103 95 89 96 80 102Z" fill="${CREAM}" stroke="${CREAM_LINE}" stroke-width="2"/>`,
  `<path d="M74.8 120.5L112.8 117L112 124.5L74 128.5Z" fill="${INK}"/>`,
  `<ellipse cx="97" cy="100" rx="15" ry="5.5" fill="#FFFBF2" stroke="${CREAM_LINE}" stroke-width="1.6"/>`,
  `<path d="M111 107L101 101.5V113ZM111 107L121 101.5V113ZM109 109L105 122L110 119.5ZM113 109L118 122L112.6 119.5Z" fill="${INK}" stroke="#1E1418" stroke-width="1.2"/>`,
  `<circle cx="111" cy="107" r="3.4" fill="${ORANGE}" stroke="${HAIR_LINE}"/>`,

  // The laptop on her lap: base, lid with a little starburst, and the screen's glow.
  `<g transform="rotate(5 145 126)">`,
  `<rect x="118" y="123" width="54" height="6" rx="3" fill="#EEEAE4" stroke="#8E8880" stroke-width="1.6"/>`,
  `<path d="M160 124L172 126L191 85Q192 81 188 80.5L181 79Q178 79 177 82Z" fill="#E2DED7" stroke="#8E8880" stroke-width="1.6"/>`,
  `<path d="M161 122.5L177.4 83" stroke="#9ED8FF" stroke-width="2.4"/>`,
  `<g transform="translate(177 103)">${rays(8, 5.5, 3.8, ORANGE, 1.8)}</g>`,
  `</g>`,

  // The far hand taps a beat behind the near one.
  `<g>${move('translate', '0 0;0 -2.4;0 0', 0.36, 'begin=".18s"')}`,
  `<ellipse cx="151" cy="120.5" rx="6.5" ry="4.2" fill="${SKIN}" stroke="${SKIN_LINE}" stroke-width="1.4"/>`,
  `</g>`,

  // The near arm: the upper sleeve stays, the bell sleeve and hand tap from the elbow.
  `<path d="M89 105L102 125" stroke="${CREAM_LINE}" stroke-width="17" fill="none"/>`,
  `<g>${move('rotate', '0 102 126;-3.6 102 126;0 102 126', 0.36)}`,
  `<ellipse cx="137" cy="121.5" rx="7" ry="4.8" fill="${SKIN}" stroke="${SKIN_LINE}" stroke-width="1.5"/>`,
  `<path d="M97 119L129 113.5C134 116 134 127 130 130.5L102 133.5C96 131 94 123 97 119Z" fill="${CREAM}" stroke="${CREAM_LINE}" stroke-width="2"/>`,
  `<path d="M126 114.5q4 3 .6 5.4q4 2.6 .2 5.4q3.4 2.6-.6 5" stroke="${CREAM_LINE}" stroke-width="1.3" fill="none"/>`,
  `</g>`,
  `<path d="M89 105L102 125" stroke="${CREAM}" stroke-width="13.4" fill="none"/>`,

  // Her head: face, eyes that blink, fringe, side locks, and the flower on its ribbon.
  `<g>${SWAY}`,
  `<path d="M72 70C72 48 90 37 106 37C124 37 136 52 136 70C136 85 128 96 114 100C100 103 84 98 76 86C73 81 72 76 72 70Z" fill="${SKIN}" stroke="${SKIN_LINE}" stroke-width="1.8"/>`,
  `<ellipse cx="90.5" cy="91" rx="6" ry="3.4" fill="#F59C8C" opacity=".5"/>`,
  `<ellipse cx="131" cy="90" rx="3.4" ry="3" fill="#F59C8C" opacity=".5"/>`,
  eye(99, 80, 7, 9.5),
  eye(124, 79.5, 5.2, 9),
  `<path d="M110 93.5q3 2.3 6 0" stroke="#B5614A" stroke-width="1.8" fill="none"/>`,
  `<path d="M139 58C143 70 142 84 138 96C137 86 137 74 134.5 60Z" fill="${HAIR}" stroke="${HAIR_LINE}" stroke-width="1.6"/>`,
  `<path d="M66 80C58 50 78 27 104 27C127 27 141 44 141 62L136 60Q134 66 129 64.5L127.5 60Q122 67 114 65L112.5 60.5Q106 67.5 98 65.5L96.5 61Q91 67 86 64L84.5 58C85 78 87 100 82 119C76 106 73 92 71 84Z" fill="${HAIR}" stroke="${HAIR_LINE}" stroke-width="2"/>`,
  `<path d="M84 42Q102 33 124 41" stroke="${HAIR_LIGHT}" stroke-width="3.2" fill="none" opacity=".9"/>`,
  `<g>${move('rotate', '-4 79 58;5 79 58;-4 79 58', 2.2, EASE)}`,
  `<path d="M76 57L69 80L75.5 77.5L79 60ZM81 59L82.5 82L88 78L85 59Z" fill="${INK}" stroke="#1E1418"/>`,
  `</g>`,
  `<circle cx="79" cy="50" r="9.5" fill="${INK}" stroke="#1E1418" stroke-width="1.2"/>`,
  `<g transform="translate(79 50)"><g>${move('scale', '1;1.2;1', 1.7, EASE)}${rays(10, 7.4, 5.2, '#F9A968', 2.2)}<circle r="1.9" fill="#FFE2B8"/></g></g>`,
  `</g>`,

  // Sparkles rise from the keyboard as she types.
  sparkle(146, 108, '#FFC75A', 0),
  sparkle(158, 100, ORANGE, 0.6),
  sparkle(137, 104, '#FFC75A', 1.2),

  `</svg>`,
].join('')
