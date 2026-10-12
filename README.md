<p align="center">
  <img src="images/icon.png" width="128" alt="OpenCode V2 for VS Code logo">
</p>

# OpenCode V2 for VS Code

An unofficial, community-maintained Visual Studio Code integration for the OpenCode V2 terminal interface.

## Requirements

- Visual Studio Code 1.94 or newer
- OpenCode V2 installed and available as `opencode`

Run **OpenCode V2: Check Installation** from the Command Palette to verify the setup. A custom executable can be selected with `opencodeV2.executablePath`.

## Features

- Open or focus OpenCode beside the active editor.
- Start multiple OpenCode sessions.
- Start in the active workspace folder.
- Pass the active file or selected lines as `@file#Lx-Ly` context.
- Add file context from the editor menu or keyboard.
- Launch from the editor title or status bar.

## Shortcuts

| Action | Windows/Linux | macOS |
| --- | --- | --- |
| Open or focus | `Ctrl+Esc` | `Cmd+Esc` |
| New session | `Ctrl+Shift+Esc` | `Cmd+Shift+Esc` |
| Add file/selection | `Ctrl+Alt+K` | `Cmd+Alt+K` |

If `sst-dev.opencode` is still installed, disable its shortcuts to avoid keybinding conflicts.

## Development

```sh
npm install
npm test
npm run build
```

Press `F5` in VS Code to launch an Extension Development Host.

## Publishing checklist

Before the first public release:

1. Choose and create the final Marketplace publisher.
2. Replace the provisional `publisher` and `repository.url` fields in `package.json`.
3. Add final branding and screenshots.
4. Run `npm run package` and install the generated VSIX for a clean smoke test.

## License

MIT. This community project is not affiliated with or endorsed by the OpenCode maintainers. OpenCode and its logo belong to their respective owners.
