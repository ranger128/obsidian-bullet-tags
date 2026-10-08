import {
	AbstractInputSuggest,
	getIcon,
	App,
	MarkdownView,
	Plugin,
	PluginSettingTab,
	Setting,
	getIconIds,
	setIcon,
} from "obsidian";

interface BulletTag {
	tag: string; // without the leading "#"
	icon: string; // icon id, e.g. "lucide-lightbulb"
	color?: string; // theme CSS variable, e.g. "--color-red"; empty = accent
}

const COLORS: Record<string, string> = {
	"": "Accent",
	"--text-normal": "Text",
	"--text-muted": "Muted",
	"--color-red": "Red",
	"--color-orange": "Orange",
	"--color-yellow": "Yellow",
	"--color-green": "Green",
	"--color-cyan": "Cyan",
	"--color-blue": "Blue",
	"--color-purple": "Purple",
	"--color-pink": "Pink",
};

// Draws the icon into el in the row's theme color.
function renderIcon(el: HTMLElement, row: BulletTag) {
	el.empty();
	setIcon(el, row.icon);
	el.style.color = row.color ? `var(${row.color})` : "";
}

// True when only Obsidian's bullet chrome and whitespace come before node.
// Checking nodes, not textContent, because text-less elements like a task's checkbox still count.
function leadsItem(node: Node): boolean {
	for (let n = node.previousSibling; n; n = n.previousSibling) {
		if (n instanceof HTMLElement ? !n.matches(".list-bullet, .list-collapse-indicator") : n.textContent?.trim()) return false;
	}
	return true;
}

interface BulletTagsSettings {
	tagIcons: BulletTag[];
}

const DEFAULT_SETTINGS: BulletTagsSettings = {
	tagIcons: [{ tag: "idea", icon: "lucide-lightbulb" }],
};

export default class BulletTagsPlugin extends Plugin {
	settings: BulletTagsSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new BulletTagsSettingTab(this.app, this));

		this.registerMarkdownPostProcessor((el) => {
			el.querySelectorAll("li").forEach((li) => this.decorate(li));
		});
	}

	// Turns "- #idea text" into "<icon> text", with the icon drawn as the list bullet itself.
	// The tag must be the first thing in the item.
	decorate(li: HTMLLIElement) {
		// Loose list items wrap their text in <p>, which comes after Obsidian's bullet span, so it's never :first-child.
		const tagEl = li.querySelector<HTMLAnchorElement>(":scope > a.tag, :scope > p:first-of-type > a.tag");
		if (!tagEl || !leadsItem(tagEl) || (tagEl.parentElement !== li && !leadsItem(tagEl.parentElement!))) return;

		const tag = (tagEl.textContent ?? "").replace(/^#/, "").toLowerCase();
		const match = this.settings.tagIcons.find((t) => t.tag.replace(/^#/, "").toLowerCase() === tag);
		if (!match?.icon) return;

		const svg = getIcon(match.icon);
		if (!svg) return;

		// styles.css masks Obsidian's own bullet with this icon, so it sits exactly in the bullet's slot.
		li.addClass("tag-icon-bullet");
		li.style.setProperty("--tag-icon", `url("data:image/svg+xml,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}")`);
		if (match.color) li.style.setProperty("--tag-icon-color", `var(${match.color})`);
		tagEl.addClass("tag-icon-hidden");
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		// Re-render open Reading views so changes show up immediately.
		this.app.workspace.getLeavesOfType("markdown").forEach((leaf) => {
			if (leaf.view instanceof MarkdownView) leaf.view.previewMode.rerender(true);
		});
	}
}

class IconSuggest extends AbstractInputSuggest<string> {
	getSuggestions(query: string): string[] {
		const q = query.toLowerCase();
		return getIconIds().filter((id) => id.includes(q));
	}

	renderSuggestion(id: string, el: HTMLElement) {
		el.addClass("tag-icon-suggestion");
		setIcon(el.createSpan(), id);
		el.createSpan({ text: id });
	}
}

class BulletTagsSettingTab extends PluginSettingTab {
	constructor(app: App, private plugin: BulletTagsPlugin) {
		super(app, plugin);
	}

	display() {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.addClass("tag-icons-settings");
		const rows = this.plugin.settings.tagIcons;

		new Setting(containerEl)
			.setName("Bullet tags")
			.setDesc("A bullet tag is a bullet followed by a tag, like - #idea, the way - [ ] is a checkbox. In Reading view the icon takes the place of the bullet.")
			.setHeading();

		if (rows.length) {
			const header = containerEl.createDiv({ cls: "tag-icons-row tag-icons-header" });
			["", "Tag", "Icon", "Color", ""].forEach((label) => header.createSpan({ text: label }));
		}

		rows.forEach((row) => {
			const rowEl = containerEl.createDiv({ cls: "tag-icons-row" });
			const preview = rowEl.createSpan({ cls: "tag-icon" });
			let iconInput: HTMLInputElement;
			const paint = () => {
				renderIcon(preview, row);
				iconInput.toggleClass("tag-icons-invalid", !!row.icon && !getIcon(row.icon));
			};
			const update = async () => {
				paint();
				await this.plugin.saveSettings();
			};

			const tagInput = rowEl.createEl("input", { type: "text", value: row.tag, placeholder: "idea" });
			tagInput.addEventListener("input", async () => {
				row.tag = tagInput.value.trim().replace(/^#/, "");
				await update();
			});

			iconInput = rowEl.createEl("input", { type: "text", value: row.icon, placeholder: "lightbulb" });
			iconInput.addEventListener("input", async () => {
				row.icon = iconInput.value.trim();
				await update();
			});
			const suggest = new IconSuggest(this.app, iconInput).onSelect(async (id) => {
				iconInput.value = id;
				row.icon = id;
				suggest.close();
				await update();
			});

			const colorSelect = rowEl.createEl("select", { cls: "dropdown" });
			Object.entries(COLORS).forEach(([value, label]) => colorSelect.createEl("option", { value, text: label }));
			colorSelect.value = row.color ?? "";
			colorSelect.addEventListener("change", async () => {
				row.color = colorSelect.value;
				await update();
			});

			const remove = rowEl.createEl("button", { cls: "clickable-icon", attr: { "aria-label": "Remove" } });
			setIcon(remove, "trash");
			remove.addEventListener("click", async () => {
				rows.remove(row);
				await this.plugin.saveSettings();
				this.display();
			});

			paint();
		});

		new Setting(containerEl).addButton((btn) =>
			btn
				.setButtonText("Add bullet tag")
				.setCta()
				.onClick(async () => {
					rows.push({ tag: "", icon: "", color: "" });
					await this.plugin.saveSettings();
					this.display();
				}),
		);
	}
}
