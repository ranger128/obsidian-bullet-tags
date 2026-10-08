import {
	AbstractInputSuggest,
	App,
	MarkdownView,
	Plugin,
	PluginSettingTab,
	Setting,
	getIconIds,
	setIcon,
} from "obsidian";

interface TagIcon {
	tag: string; // without the leading "#"
	icon: string; // icon id, e.g. "lucide-lightbulb"
}

interface TagIconsSettings {
	tagIcons: TagIcon[];
}

const DEFAULT_SETTINGS: TagIconsSettings = {
	tagIcons: [{ tag: "idea", icon: "lucide-lightbulb" }],
};

export default class TagIconsPlugin extends Plugin {
	settings: TagIconsSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new TagIconsSettingTab(this.app, this));

		this.registerMarkdownPostProcessor((el) => {
			el.querySelectorAll("li").forEach((li) => this.decorate(li));
		});
	}

	// Turns "- #idea text" into "<icon> text": the tag must be the first thing in the item.
	decorate(li: HTMLLIElement) {
		const tagEl = li.querySelector<HTMLAnchorElement>(":scope > a.tag, :scope > p:first-child > a.tag");
		if (!tagEl || !li.textContent?.trimStart().startsWith(tagEl.textContent ?? "")) return;

		const tag = (tagEl.textContent ?? "").replace(/^#/, "").toLowerCase();
		const match = this.settings.tagIcons.find((t) => t.tag.replace(/^#/, "").toLowerCase() === tag);
		if (!match?.icon) return;

		li.addClass("tag-icon-bullet");
		tagEl.addClass("tag-icon-hidden");
		const iconEl = createSpan({ cls: "tag-icon", attr: { "aria-label": `#${tag}` } });
		setIcon(iconEl, match.icon);
		tagEl.before(iconEl);
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

class TagIconsSettingTab extends PluginSettingTab {
	constructor(app: App, private plugin: TagIconsPlugin) {
		super(app, plugin);
	}

	display() {
		const { containerEl } = this;
		containerEl.empty();
		const rows = this.plugin.settings.tagIcons;

		rows.forEach((row) => {
			const setting = new Setting(containerEl);
			const preview = setting.nameEl.createSpan({ cls: "tag-icon" });
			const updatePreview = () => {
				preview.empty();
				setIcon(preview, row.icon);
			};
			updatePreview();

			setting
				.addText((text) =>
					text
						.setPlaceholder("tag (without #)")
						.setValue(row.tag)
						.onChange(async (value) => {
							row.tag = value.trim().replace(/^#/, "");
							await this.plugin.saveSettings();
						}),
				)
				.addText((text) => {
					text.setPlaceholder("icon, e.g. lightbulb").setValue(row.icon);
					const save = async (value: string) => {
						row.icon = value.trim();
						updatePreview();
						await this.plugin.saveSettings();
					};
					text.onChange(save);
					const suggest = new IconSuggest(this.app, text.inputEl).onSelect((id) => {
						text.setValue(id);
						suggest.close();
						void save(id);
					});
				})
				.addExtraButton((btn) =>
					btn
						.setIcon("trash")
						.setTooltip("Remove")
						.onClick(async () => {
							rows.remove(row);
							await this.plugin.saveSettings();
							this.display();
						}),
				);
		});

		new Setting(containerEl).addButton((btn) =>
			btn
				.setButtonText("Add tag bullet")
				.setCta()
				.onClick(async () => {
					rows.push({ tag: "", icon: "" });
					await this.plugin.saveSettings();
					this.display();
				}),
		);
	}
}
