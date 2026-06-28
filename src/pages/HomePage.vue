<script setup>
import { useHead } from "@unhead/vue";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import AtmShell from "../components/AtmShell.vue";
import IntroOverlay from "../components/overlays/IntroOverlay.vue";
import { useAtmState } from "../composables/useAtmState.js";
import ScreenAccueil from "../screens/ScreenAccueil.vue";
import ScreenBillets from "../screens/ScreenBillets.vue";
import ScreenCarteBloquee from "../screens/ScreenCarteBloquee.vue";
import ScreenCode from "../screens/ScreenCode.vue";
import ScreenLangue from "../screens/ScreenLangue.vue";
import ScreenMontant from "../screens/ScreenMontant.vue";
import ScreenOperation from "../screens/ScreenOperation.vue";
import ScreenRecu from "../screens/ScreenRecu.vue";
import ScreenRemerciement from "../screens/ScreenRemerciement.vue";
import { DATE_MODIFIED, DATE_PUBLISHED } from "../utils/siteMeta.js";

const screens = {
  ScreenAccueil,
  ScreenLangue,
  ScreenOperation,
  ScreenMontant,
  ScreenCode,
  ScreenRecu,
  ScreenBillets,
  ScreenRemerciement,
  ScreenCarteBloquee,
};

const { currentScreen } = useAtmState();
const activeScreen = computed(() => screens[currentScreen.value]);

// ── SEO par locale ────────────────────────────────────────────────────────────
// Pré-rendu par vite-ssg dans le HTML de chaque route, et réactif côté client au
// switch de locale. Le JSON-LD est construit depuis les mêmes clés i18n que le
// visible → le schema correspond toujours à la copie affichée. htmlAttrs.lang
// fixé ici par locale remplace l'ancien contournement `useHead: false`.
const { t, tm, rt, locale } = useI18n();

const SITE_URL = "https://cedric-ruiu.github.io/atm-trainer";
const FR_URL = `${SITE_URL}/`;
const EN_URL = `${SITE_URL}/en/`;
const OG_IMAGE = `${SITE_URL}/dab-trainer-og-image.png`;

useHead(() => {
  const isEn = locale.value === "en";
  const canonical = isEn ? EN_URL : FR_URL;

  const appSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "DAB Trainer",
    alternateName: "ATM Trainer",
    description: t("meta.schemaApp"),
    url: canonical,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    browserRequirements: "Requires JavaScript. Modern browser.",
    inLanguage: isEn ? "en" : "fr",
    isAccessibleForFree: true,
    softwareVersion: "1.0.0",
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
    screenshot: OG_IMAGE,
    featureList: tm("meta.featureList").map((item) => rt(item)),
    keywords: t("meta.keywords"),
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    audience: { "@type": "PeopleAudience", audienceType: t("meta.audience") },
    creator: {
      "@type": "Person",
      name: "Cédric Ruiu",
      url: "https://github.com/Cedric-ruiu",
    },
    license: "https://opensource.org/licenses/MIT",
    codeRepository: "https://github.com/Cedric-ruiu/atm-trainer",
  };

  // FAQPage construit depuis les mêmes clés i18n que la FAQ visible (ProjectInfo)
  // → le schema reflète toujours la copie affichée, par locale.
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: tm("project.faq").map((item) => ({
      "@type": "Question",
      name: rt(item.q),
      acceptedAnswer: { "@type": "Answer", text: rt(item.a) },
    })),
  };

  return {
    htmlAttrs: { lang: isEn ? "en" : "fr" },
    title: t("meta.title"),
    meta: [
      { name: "description", content: t("meta.description") },
      { name: "keywords", content: t("meta.keywords") },
      { property: "og:type", content: "website" },
      {
        property: "og:site_name",
        content: isEn ? "ATM Trainer" : "DAB Trainer",
      },
      { property: "og:locale", content: isEn ? "en_US" : "fr_FR" },
      { property: "og:locale:alternate", content: isEn ? "fr_FR" : "en_US" },
      { property: "og:title", content: t("meta.ogTitle") },
      { property: "og:description", content: t("meta.ogDescription") },
      { property: "og:url", content: canonical },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: t("meta.ogTitle") },
      { name: "twitter:description", content: t("meta.twitterDescription") },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    link: [
      { rel: "canonical", href: canonical },
      { rel: "alternate", hreflang: "fr", href: FR_URL },
      { rel: "alternate", hreflang: "en", href: EN_URL },
      { rel: "alternate", hreflang: "x-default", href: FR_URL },
    ],
    script: [
      { type: "application/ld+json", innerHTML: JSON.stringify(appSchema) },
      { type: "application/ld+json", innerHTML: JSON.stringify(faqSchema) },
    ],
  };
});
</script>

<template>
  <AtmShell>
    <component :is="activeScreen" />
  </AtmShell>
  <IntroOverlay />
</template>
