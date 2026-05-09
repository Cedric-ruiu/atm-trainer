<script setup>
defineProps({ modelValue: Boolean });
defineEmits(["update:modelValue"]);
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-150"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      @click.self="$emit('update:modelValue', false)"
    >
      <div class="relative w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-2xl text-white"
           style="background: #1a1e24; box-shadow: 0 20px 60px rgba(0,0,0,0.7);">

        <!-- Close button -->
        <button
          class="btn absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-lg font-light"
          aria-label="Fermer"
          @click="$emit('update:modelValue', false)"
        >×</button>

        <div class="p-8">
          <!-- Header -->
          <div class="mb-6">
            <p class="text-xs font-bold tracking-widest uppercase text-yellow-400 mb-1">Outil pédagogique</p>
            <h1 class="text-2xl font-bold tracking-wide">DAB Trainer</h1>
          </div>

          <!-- What is it -->
          <section class="mb-6">
            <h2 class="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">À propos</h2>
            <p class="text-gray-200 leading-relaxed text-sm">
              DAB Trainer est un simulateur de distributeur automatique de billets, conçu pour accompagner
              les personnes ayant des difficultés cognitives dans l'apprentissage de cette tâche du quotidien.
            </p>
            <p class="text-gray-200 leading-relaxed text-sm mt-2">
              L'application reproduit fidèlement les étapes d'un retrait en espèces&nbsp;: insertion de la carte,
              choix de la langue, sélection de l'opération, saisie du montant et du code PIN, récupération
              des billets et du reçu. Toutes les interactions physiques sont simulées (glisser la carte,
              récupérer les billets…).
            </p>
          </section>

          <!-- Who is it for -->
          <section class="mb-6">
            <h2 class="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Public visé</h2>
            <ul class="text-gray-200 text-sm space-y-1 leading-relaxed list-disc list-inside">
              <li>Personnes avec troubles cognitifs, handicap mental léger, troubles DYS ou de l'attention</li>
              <li>Éducateurs spécialisés, moniteurs-éducateurs, AMP/AES</li>
              <li>Structures médico-sociales&nbsp;: ESAT, IME, SAVS, SAMSAH…</li>
            </ul>
          </section>

          <!-- How to use -->
          <section class="mb-6">
            <h2 class="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Utilisation</h2>
            <p class="text-gray-200 text-sm leading-relaxed">
              Aucune installation requise. L'application fonctionne directement dans le navigateur,
              sur tablette ou ordinateur. Elle est conçue pour être utilisée en séance d'accompagnement,
              en autonomie guidée ou en entraînement libre.
            </p>
          </section>

          <!-- Divider -->
          <hr class="border-white/10 mb-6" />

          <!-- Contribute -->
          <section class="mb-6">
            <h2 class="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Contribuer au projet</h2>
            <p class="text-gray-200 text-sm leading-relaxed mb-3">
              DAB Trainer est un projet open source. Toutes les contributions sont les bienvenues,
              qu'elles viennent de développeurs ou de professionnels du terrain.
            </p>
            <p class="text-gray-200 text-sm leading-relaxed mb-3">
              <span class="text-white font-semibold">Vous n'êtes pas développeur&nbsp;?</span>
              Vous pouvez ouvrir une <strong>issue</strong> pour signaler un problème pédagogique,
              suggérer une amélioration ou partager votre retour d'expérience.
              Votre regard de professionnel de terrain est précieux&nbsp;!
            </p>
            <p class="text-gray-200 text-sm leading-relaxed">
              <span class="text-white font-semibold">Vous développez&nbsp;?</span>
              Les <strong>pull requests</strong> sont les bienvenues.
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
              Voir le projet sur GitHub
            </a>
          </section>

          <!-- Credits -->
          <section>
            <h2 class="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Crédits</h2>
            <ul class="text-gray-400 text-xs leading-relaxed space-y-1">
              <li>Résidence la Belle Vie — Pontivy</li>
              <li>Jérémy Jaskolski — initiative et conception pédagogique</li>
              <li>Alice Dupas — contribution</li>
              <li>Cédric Ruiu — développement web</li>
              <li class="pt-2">
                Son d'applaudissements&nbsp;:
                <a href="https://lasonotheque.org" target="_blank" rel="noopener noreferrer"
                   class="text-gray-300 underline hover:text-white transition-colors">
                  La Sonothèque
                </a>
                — licence libre (équivalent domaine public).
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.btn {
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: filter 0.12s ease;
}
.btn:hover { filter: brightness(1.2); }
.btn:active { filter: brightness(0.82); }
</style>
