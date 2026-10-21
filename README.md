# Bullet Tags

An Obsidian plugin for **bullet tags**: register a tag with an icon, and any list item containing that tag gets the icon as its bullet.

`- #idea this is an idea` renders in Reading view as 💡 this is an idea, with the icon in place of the bullet.

Set up bullet tags in **Settings → Bullet Tags**: add a row, type the tag (without `#`), pick any Lucide icon and a theme color. The first registered tag in a list item wins, wherever it appears: `- call Sam #todo #idea` gets the `#todo` icon if both are registered. That tag is hidden, since the icon stands for it. Task items (`- [ ]`) keep their checkbox and tags. Only Reading view is affected; Live Preview and Source mode show the raw tag.

## Development

```sh
npm install
npm run dev    # watch build to main.js
npm run build  # typecheck + production build
```

To test in a vault, copy `main.js` and `manifest.json` into `<vault>/.obsidian/plugins/bullet-tags/` and enable the plugin.

## Releasing

Every push to `main` publishes a GitHub release for the version in `manifest.json` if that version has no release yet, with `main.js`, `manifest.json` and `styles.css` attached. To ship a new version, bump it and merge to `main`:

```sh
npm version patch --no-git-tag-version   # or minor / major: bumps package.json, manifest.json and versions.json
```

## Install with BRAT

In the [BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin, choose "Add Beta plugin" and enter `ranger128/obsidian-tag-icons`.
