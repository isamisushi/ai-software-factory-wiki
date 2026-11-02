import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { withMermaid } from "vitepress-plugin-mermaid";

const root = new URL("..", import.meta.url).pathname;

const labels = {
  en: {
    categories: ["Input", "Process", "Verification", "Safety", "Architecture", "Operations", "Other"],
    cases: "Cases", loops: "Loops", concepts: "Concepts", compare: "Comparison",
  },
  ja: {
    categories: ["入力", "プロセス", "検証", "安全性", "アーキテクチャ", "運用", "その他"],
    cases: "事例", loops: "ループ", concepts: "用語", compare: "比較表",
  },
};

function readPages(dir, lang) {
  const prefix = lang === "ja" ? "/ja" : "";
  return readdirSync(join(root, prefix, "wiki", dir))
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const src = readFileSync(join(root, prefix, "wiki", dir, f), "utf8");
      const fm = src.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
      const field = (k) => fm.match(new RegExp(`^${k}:\\s*(.+)$`, "m"))?.[1].trim();
      return {
        text: field("title") ?? f.replace(/\.md$/, ""),
        category: field("category") ?? labels[lang].categories.at(-1),
        link: `${prefix}/wiki/${dir}/${f.replace(/\.md$/, "")}`,
      };
    })
    .sort((a, b) => a.text.localeCompare(b.text, lang));
}

function conceptGroups(lang) {
  const pages = readPages("concepts", lang);
  return labels[lang].categories
    .map((category) => ({
      text: category,
      collapsed: false,
      items: pages.filter((p) => p.category === category).map(({ text, link }) => ({ text, link })),
    }))
    .filter((group) => group.items.length > 0);
}

function buildNav(lang) {
  const prefix = lang === "ja" ? "/ja" : "";
  const text = labels[lang];
  return [
    { text: text.cases, link: `${prefix}/wiki/` },
    { text: text.concepts, link: `${prefix}/wiki/concepts` },
    { text: text.loops, link: `${prefix}/wiki/loops/` },
    { text: text.compare, link: `${prefix}/wiki/compare` },
  ];
}

function buildSidebar(lang) {
  const prefix = lang === "ja" ? "/ja" : "";
  const text = labels[lang];
  return [
    {
      text: text.cases,
      link: `${prefix}/wiki/`,
      items: readPages("cases", lang).map(({ text, link }) => ({ text, link })),
    },
    {
      text: text.loops,
      link: `${prefix}/wiki/loops/`,
      items: readPages("loops", lang).filter((p) => !p.link.endsWith("/index")).map(({ text, link }) => ({ text, link })),
    },
    { text: text.concepts, link: `${prefix}/wiki/concepts`, items: conceptGroups(lang) },
    { text: text.compare, link: `${prefix}/wiki/compare` },
  ];
}

function allSidebars() {
  return { en: buildSidebar("en"), ja: buildSidebar("ja") };
}

// VitePressは設定を読み込む時にメニューを作るため、Markdownの追加だけでは
// 更新されない。メニューに影響する変更時だけ、設定の再読み込みを通知する。
function refreshSidebar() {
  return {
    name: "wiki-sidebar-refresh",
    apply: "serve",
    configureServer(server) {
      const directories = ["", "ja"].flatMap((prefix) =>
        ["cases", "concepts", "loops"].map((dir) => join(root, prefix, "wiki", dir)));
      const configPath = join(root, ".vitepress/config.mjs");
      let snapshot = JSON.stringify(allSidebars());
      let timer;
      const onChange = (_event, file) => {
        if (!file.endsWith(".md") || !directories.includes(dirname(file))) return;
        clearTimeout(timer);
        timer = setTimeout(() => {
          const next = JSON.stringify(allSidebars());
          if (next === snapshot) return;
          snapshot = next;
          server.watcher.emit("change", configPath);
        }, 100);
      };
      server.watcher.on("all", onChange);
      server.httpServer?.once("close", () => {
        clearTimeout(timer);
        server.watcher.off("all", onChange);
      });
    },
  };
}

export default withMermaid({
  vite: { plugins: [refreshSidebar()] },
  lang: "en",
  title: "AI Software Factory Wiki",
  description: "Research on AI software factories and their shared patterns.",
  srcExclude: ["CLAUDE.md", "templates/**", "research/**", "node_modules/**"],
  rewrites: { "README.md": "index.md" },
  ignoreDeadLinks: [/\/CLAUDE$/],
  cleanUrls: true,
  lastUpdated: false,
  locales: {
    root: {
      label: "EN",
      lang: "en",
      themeConfig: {
        nav: buildNav("en"),
        sidebar: buildSidebar("en"),
        outline: { level: [2, 3], label: "On this page" },
        docFooter: { prev: "Previous page", next: "Next page" },
      },
    },
    ja: {
      label: "JA",
      lang: "ja",
      description: "AIソフトウェアファクトリーの事例とパターン辞書",
      themeConfig: {
        nav: buildNav("ja"),
        sidebar: buildSidebar("ja"),
        outline: { level: [2, 3], label: "目次" },
        docFooter: { prev: "前へ", next: "次へ" },
        sidebarMenuLabel: "メニュー",
        returnToTopLabel: "ページの先頭へ",
        darkModeSwitchLabel: "外観",
        lightModeSwitchTitle: "ライトモードに切り替え",
        darkModeSwitchTitle: "ダークモードに切り替え",
        langMenuLabel: "言語を切り替え",
        skipToContentLabel: "本文へ移動",
      },
    },
  },
  themeConfig: {
    search: {
      provider: "local",
      options: {
        locales: {
          ja: {
            translations: {
              button: { buttonText: "検索", buttonAriaLabel: "検索" },
              modal: {
                displayDetails: "詳細を表示",
                resetButtonTitle: "検索をリセット",
                backButtonTitle: "検索を閉じる",
                noResultsText: "検索結果がありません",
                footer: { selectText: "選択", selectKeyAriaLabel: "Enter", navigateText: "移動", navigateUpKeyAriaLabel: "上矢印", navigateDownKeyAriaLabel: "下矢印", closeText: "閉じる", closeKeyAriaLabel: "Escape" },
              },
            },
          },
        },
      },
    },
  },
  mermaid: {
    fontFamily: '"Hiragino Sans", "Noto Sans JP", "Yu Gothic", sans-serif',
    flowchart: { padding: 16, wrappingWidth: 260 },
  },
});
