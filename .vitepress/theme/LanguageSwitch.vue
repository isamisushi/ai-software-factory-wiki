<script setup>
import { computed } from "vue";
import { useData, withBase } from "vitepress";

const { page, lang } = useData();
const englishPath = computed(() => {
  const path = page.value.relativePath
    .replace(/^ja\//, "")
    .replace(/(^|\/)index\.md$/, "$1")
    .replace(/\.md$/, "");
  return `/${path}`;
});
</script>

<template>
  <nav class="language-switch" :aria-label="lang === 'ja' ? '言語' : 'Language'">
    <a :href="withBase(englishPath)" lang="en" hreflang="en"
      aria-label="English" :aria-current="lang === 'en' ? 'page' : undefined">EN</a>
    <span aria-hidden="true">/</span>
    <a :href="withBase(`/ja${englishPath}`)" lang="ja" hreflang="ja"
      aria-label="日本語" :aria-current="lang === 'ja' ? 'page' : undefined">JA</a>
  </nav>
</template>

<style scoped>
.language-switch {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-left: 12px;
  gap: 2px;
  font-size: 12px;
  font-weight: 600;
}
a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  min-height: 44px;
  color: var(--vp-c-text-2);
}
a[aria-current="page"] {
  color: var(--vp-c-brand-1);
  text-decoration: underline;
  text-underline-offset: 5px;
}
a:hover { color: var(--vp-c-brand-1); }
a:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 2px; border-radius: 4px; }
span { color: var(--vp-c-divider); }
</style>
