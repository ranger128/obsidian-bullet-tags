# obsidian-tag-icons

Obsidian plugin for bullet journaling: list items that start with a configured tag render with an icon in place of the bullet.

`- #idea this is an idea` renders in Reading view as 💡 this is an idea.

Set up tag bullets in **Settings → Tag Icons**: add a row, type the tag (without `#`), pick any Lucide icon and a theme color. Only Reading view is affected; Live Preview and Source mode show the raw tag.

## Development

```sh
npm install
npm run dev    # watch build to main.js
npm run build  # typecheck + production build
```

To test in a vault, copy `main.js` and `manifest.json` into `<vault>/.obsidian/plugins/tag-icons/` and enable the plugin.

## Releasing

Every push to `main` publishes a GitHub release for the version in `manifest.json` if that version has no release yet, with `main.js`, `manifest.json` and `styles.css` attached. To ship a new version, bump it and merge to `main`:

```sh
npm version patch --no-git-tag-version   # or minor / major: bumps package.json, manifest.json and versions.json
```

## Install with BRAT

In the [BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin, choose "Add Beta plugin" and enter `ranger128/obsidian-tag-icons`.
