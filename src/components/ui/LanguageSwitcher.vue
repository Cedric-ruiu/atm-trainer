<script setup>
import { useI18n } from "vue-i18n";
import { RouterLink } from "vue-router";

// Sélecteur de langue d'INTERFACE (axe A). RouterLink = vrais <a href> crawlables ;
// le guard du router bascule la locale. À NE PAS confondre avec ScreenLangue (langue
// DU DAB simulé) — d'où le libellé explicite « Langue de l'interface » en variante intro.
//
// variant "intro" : libellé visible, dans la popup d'accueil (config par l'éducateur).
// variant "menu"  : toggle discret FR/EN dans le menu accompagnateur (3 boutons top-left).
defineProps({
  variant: { type: String, default: "menu" }, // "intro" | "menu"
});

const { t, locale } = useI18n();

const links = [
  { code: "fr", to: "/" },
  { code: "en", to: "/en" },
];
</script>

<template>
  <div
    :class="variant === 'intro' ? 'flex items-center gap-2.5' : 'inline-flex items-center'"
  >
    <span
      v-if="variant === 'intro'"
      class="text-xs font-bold uppercase tracking-widest text-gray-400"
    >{{ t("lang.interfaceLabel") }}</span>

    <nav
      :aria-label="t('lang.switcher')"
      class="inline-flex items-center overflow-hidden rounded-md border"
      :class="variant === 'intro'
        ? 'border-white/25'
        : 'border-gray-400/50 opacity-40 hover:opacity-80 transition-opacity'"
    >
      <RouterLink
        v-for="(link, i) in links"
        :key="link.code"
        :to="link.to"
        :hreflang="link.code"
        :aria-label="t(`lang.${link.code}`)"
        :aria-current="locale === link.code ? 'true' : undefined"
        class="uppercase tracking-wide font-bold transition-colors touch-manipulation"
        :class="[
          variant === 'intro' ? 'px-3 py-1.5 text-sm' : 'px-2 py-0.5 text-[11px]',
          i > 0 ? 'border-l border-white/15' : '',
          locale === link.code
            ? 'bg-white/20 text-white'
            : 'text-gray-300 hover:text-white hover:bg-white/10',
        ]"
        style="-webkit-tap-highlight-color: transparent"
      >{{ link.code.toUpperCase() }}</RouterLink>
    </nav>
  </div>
</template>
