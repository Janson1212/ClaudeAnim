export type StickerIndex = number

declare module 'claude-code' {
  interface PluginState {
    'typing-girl': { sticker: StickerIndex }
  }
}
