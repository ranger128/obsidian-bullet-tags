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

```sh
npm version patch   # or minor / major: bumps manifest.json + versions.json and tags (no "v" prefix)
git push --follow-tags
```

Pushing the tag runs the Release workflow, which builds and publishes a GitHub release with `main.js` and `manifest.json` (and `styles.css` if present).

## Install with BRAT

In the [BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin, choose "Add Beta plugin" and enter `ranger128/obsidian-tag-icons`.
