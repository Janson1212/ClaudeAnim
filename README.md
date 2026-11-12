# typing-girl

A Claude Code mod that replaces the thinking row (the line that says "Working…" while Claude is busy) with a small animated drawing: a girl with long orange hair sitting on a stack of books and typing on her laptop. The status words stay beside her.

The character is Claude大小姐, the personification the Chinese community gave Claude. The drawing is an original hand-written SVG made for this mod and copies no existing artwork. This is a fan-made mod, not an Anthropic product.

## Where she shows

- Built for the Claude desktop app (Code tab).
- The VS Code extension has the same drawing element, so she should show there too; that has not been tried yet.
- A terminal keeps its normal spinner, because it cannot draw pictures.

## Install

At the prompt of a terminal session:

```
/plugin install typing-girl --marketplace Janson1212/claude-typing-girl
```

Answer `y` to add the marketplace, then choose a scope (the user scope shows her in every session).

From a shell:

```
claude plugin install typing-girl --marketplace Janson1212/claude-typing-girl
```

In the Claude desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, Add marketplace with `Janson1212/claude-typing-girl`, then Add plugin.

This repository is private. It installs only for people who can read it on GitHub and whose computer already holds a git credential for github.com (an SSH key, or `gh auth login` then `gh auth setup-git`). The install never asks for one.

## Change her

- Size: `GIRL_HEIGHT` in `hooks/girl.ts`, in pixels.
- The drawing is the SVG built in `hooks/girl.ts`; the hook that places it is `hooks/register.tsx`.
- Tests: `claude plugin test <this folder>`.
