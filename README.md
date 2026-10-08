# obsidian-tag-icons

Obsidian plugin that shows icons next to tags.

## Development

```sh
npm install
npm run dev    # watch build to main.js
npm run build  # typecheck + production build
```

To test in a vault, copy `main.js` and `manifest.json` into `<vault>/.obsidian/plugins/tag-icons/` and enable the plugin.

## Releasing

Run `npm version patch|minor|major` to bump `manifest.json` and `versions.json`, then attach `main.js` and `manifest.json` to a GitHub release with the same tag.
