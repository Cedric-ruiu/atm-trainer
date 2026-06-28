<script setup>
// Contenu descriptif du projet, réutilisé par InfoModal (bouton « i ») et
// IntroOverlay (popup d'accueil indexable). `titleId` permet à chaque parent
// de relier son aria-labelledby au h1 sans dupliquer d'identifiant dans le DOM.
// Texte INTERFACE (axe A) : suit la locale d'interface via t()/tm()/rt().
import { useI18n } from "vue-i18n";

defineProps({ titleId: { type: String, default: undefined } });

const { t, tm, rt } = useI18n();
const baseUrl = import.meta.env.BASE_URL;
</script>

<template>
  <div class="p-8">
    <!-- Header -->
    <div class="mb-6">
      <p class="text-xs font-bold tracking-widest uppercase text-yellow-400 mb-2">{{ t("project.eyebrow") }}</p>
      <img
        :src="`${baseUrl}dab-trainer-logo-text.svg`"
        alt=""
        width="380"
        height="70"
        class="w-full max-w-75 h-auto bg-white rounded-lg p-2 mb-3"
      />
      <h1 :id="titleId" class="text-xl font-black text-white leading-tight m-0">
        {{ t("project.title") }}
      </h1>
    </div>

    <!-- What is it -->
    <section class="mb-6">
      <h2 class="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">{{ t("project.aboutTitle") }}</h2>
      <p class="text-gray-200 leading-relaxed text-sm">{{ t("project.aboutP1") }}</p>
      <p class="text-gray-200 leading-relaxed text-sm mt-2">{{ t("project.aboutP2") }}</p>
    </section>

    <!-- Who is it for -->
    <section class="mb-6">
      <h2 class="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">{{ t("project.audienceTitle") }}</h2>
      <ul class="text-gray-200 text-sm space-y-1 leading-relaxed list-disc list-inside">
        <li v-for="(item, i) in tm('project.audienceList')" :key="i">{{ rt(item) }}</li>
      </ul>
    </section>

    <!-- How to use -->
    <section class="mb-6">
      <h2 class="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">{{ t("project.usageTitle") }}</h2>
      <p class="text-gray-200 text-sm leading-relaxed">{{ t("project.usageP") }}</p>
    </section>

    <!-- FAQ -->
    <section class="mb-6">
      <h2 class="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">{{ t("project.faqTitle") }}</h2>
      <div v-for="(item, i) in tm('project.faq')" :key="i" class="mb-4 last:mb-0">
        <h3 class="text-sm font-semibold text-white leading-snug mb-1">{{ rt(item.q) }}</h3>
        <p class="text-gray-200 text-sm leading-relaxed">{{ rt(item.a) }}</p>
      </div>
    </section>

    <!-- Divider -->
    <hr class="border-white/10 mb-6" />

    <!-- Contribute -->
    <section class="mb-6">
      <h2 class="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">{{ t("project.contribTitle") }}</h2>
      <p class="text-gray-200 text-sm leading-relaxed mb-3">{{ t("project.contribP1") }}</p>
      <p class="text-gray-200 text-sm leading-relaxed mb-3">
        <span class="text-white font-semibold">{{ t("project.contribNonDevLead") }}</span>
        {{ t("project.contribNonDevBody") }}
      </p>
      <p class="text-gray-200 text-sm leading-relaxed">
        <span class="text-white font-semibold">{{ t("project.contribDevLead") }}</span>
        {{ t("project.contribDevBody") }}
      </p>
      <a
        href="https://github.com/Cedric-ruiu/atm-trainer"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
        style="background: #238636;"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
        </svg>
        {{ t("project.contribGithub") }}
      </a>
    </section>

    <!-- Credits -->
    <section>
      <h2 class="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">{{ t("project.creditsTitle") }}</h2>
      <ul class="text-gray-400 text-xs leading-relaxed space-y-1">
        <li v-for="(item, i) in tm('project.creditsList')" :key="i">{{ rt(item) }}</li>
        <li class="pt-2">
          {{ t("project.creditsSoundLabel") }}
          <a href="https://lasonotheque.org" target="_blank" rel="noopener noreferrer"
             class="text-gray-300 underline hover:text-white transition-colors">
            {{ t("project.creditsSoundLink") }}
          </a>
          {{ t("project.creditsSoundSuffix") }}
        </li>
      </ul>
    </section>
  </div>
</template>
