# atm-trainer — référence Claude Code

Simulateur de DAB pour l'entraînement de personnes ayant des difficultés cognitives. Cible : tablette/navigateur. Déploiement : GitHub Pages.

---

## Stack et commandes

| Outil | Version |
|---|---|
| Node | 22.22.0 (`.node-version`) |
| Yarn | 4.13.0 (node-modules linker) |
| Vue | 3 (Composition API, `script setup`) |
| Vite | 8 |
| Tailwind CSS | v4 (`@tailwindcss/vite` — pas de postcss ni de fichier config) |
| Biome | linter/formatter |

```bash
yarn dev       # serveur de développement
yarn build     # build de production (dist/)
yarn preview   # prévisualisation du build
```

**Tailwind v4** — point d'entrée CSS : `src/style.css` avec `@import "tailwindcss"`. Ne pas utiliser `import "tailwindcss"` dans un fichier JS.

**Biome — deux comportements à connaître :**
- Signale comme "inutilisé" tout symbole `<script setup>` utilisé uniquement dans le template → faux positifs, le build ne produit pas d'erreurs.
- Préfère les classes utilitaires sans crochets quand possible : `z-9400` plutôt que `z-[9400]` (`suggestCanonicalClasses`).

**GitHub Pages** — `base: "/atm-trainer/"` dans `vite.config.js`.

---

## Architecture

```
src/
├── App.vue                  # Registre statique + composant dynamique
├── main.js                  # Monte l'app, importe style.css
├── style.css                # @import "tailwindcss" — point d'entrée Tailwind
│
├── components/
│   ├── AtmShell.vue         # Châssis physique (provide/inject + keypadBus + D&D)
│   ├── AtmScreenLayout.vue  # Layout interne des screens (gradient bleu + header + barre fraude)
│   ├── AtmKeypad.vue        # Grille 3×4 — émet digit/cancel/clear/confirm
│   ├── InfoModal.vue        # Modale "À propos" (v-model, fixed plein écran)
│   └── ui/
│       ├── AtmButton.vue    # Bouton générique (variant, disabled)
│       └── UiCard.vue       # Conteneur générique avec titre + slot
│
├── composables/
│   ├── useAtmState.js       # Routing (singleton module-level)
│   ├── useSession.js        # État de session (singleton module-level)
│   └── useProgression.js    # Persistance localStorage
│
├── screens/                 # 11 écrans — un par état du DAB
│   ├── ScreenAccueil.vue
│   ├── ScreenLangue.vue
│   ├── ScreenOperation.vue
│   ├── ScreenMontant.vue
│   ├── ScreenCode.vue
│   ├── ScreenRecu.vue
│   ├── ScreenBillets.vue
│   ├── ScreenRemerciement.vue
│   ├── ScreenCarteBloquee.vue
│   ├── ScreenProgression.vue
│   └── ScreenStats.vue
│
└── utils/
    └── sounds.js            # playApplause() — Web Audio API
```

### Routing

Pas de Vue Router. `useAtmState.js` expose `currentScreen` (ref module-level) et `navigate(screenName)`. `App.vue` résout le nom en composant via un registre statique + `computed`. Les screens valides sont listés dans `VALID_SCREENS` (useAtmState.js) **et** dans le registre d'`App.vue` — mettre à jour les deux à l'ajout d'un screen.

### État partagé (module-level singletons)

Tous les composables déclarent leurs refs **en dehors** de la fonction exportée. Chaque appel à `useSession()`, `useAtmState()`, etc. retourne les mêmes refs.

---

## AtmShell — châssis physique et provide/inject

Gère le châssis complet (layout responsive + drag & drop + animations). Fournit des refs que les screens injectent pour piloter les éléments physiques.

### Layout responsive

**Paysage** : `flex-row`. Écran simulateur : `shrink-0`, `aspect-ratio: 4/3; height: min(70dvh, 580px)`. Châssis : `flex-1 min-w-0`.

**Portrait** : `flex-col`. Écran simulateur : `w-full`, `aspect-ratio: 4/3`. Châssis en dessous (clavier + rangée : Lecteur | Reçu | Billets | Poche).

### Contrat provide/inject

| Clé inject | Type | Consommé par | Description |
|---|---|---|---|
| `cardVisible` | `ref(false)` | Accueil, Opération, Montant, Recu | Rend la carte interactive |
| `receiptVisible` | `ref(false)` | Recu | Affiche le reçu dans la fente |
| `billsVisible` | `ref(false)` | Billets | Affiche la liasse dans le bac |
| `onCardClick` | `ref(null\|fn)` | Accueil, Opération, Montant, Recu | Callback quand carte déposée dans zone cible |
| `onReceiptClick` | `ref(null\|fn)` | Recu | Callback au clic sur le reçu |
| `onBillsClick` | `ref(null\|fn)` | Billets | Callback au clic sur la liasse |
| `keypadBus` | `ref(null\|{type,payload?})` | Code, Montant, Progression | Événement clavier courant |
| `cardInReader` | `ref(false)` | Opération, Montant, Recu | `true` = carte dans le lecteur (déclenche éjection 3 s) |

### Reset automatique

AtmShell surveille `currentScreen` avec `{ flush: "pre" }` : toutes les refs sont remises à `false`/`null` avant que le nouveau composant monte (y compris `receiptFloating`, `receiptEjecting`, `billsFloating`).

### Pattern d'utilisation dans un screen

```js
import { inject } from "vue";
const cardVisible  = inject("cardVisible");
const cardInReader = inject("cardInReader");
const onCardClick  = inject("onCardClick");

// Insertion (poche → lecteur)
cardVisible.value = true;
onCardClick.value = () => navigate("ScreenSuivant");

// Récupération (lecteur → poche)
cardVisible.value  = true;
cardInReader.value = true;  // déclenche l'animation d'éjection 3 s
onCardClick.value  = () => navigate("ScreenSuivant");
```

---

## Drag & drop (carte, reçu, billets)

Même mécanique pour les trois éléments : **Pointer Events API** (`pointerdown/pointermove/pointerup` + `setPointerCapture`). Si lâché hors zone cible → `*Floating = true` (reste fixe à la position de lâcher, pas de retour).

### Dimensions par orientation

| Élément | Paysage (px) | Portrait (px) |
|---|---|---|
| Carte | 110 × 174 | 80 × 127 |
| Réçu | 70 × 190 (30 % visible) | 54 × 145 (30 % visible) |
| Billets | 275 × 145 (~2/3 visible) | 190 × 100 (~2/3 visible) |

**Carte — insertion (poche → lecteur)** : `checkInsertionHit()` vérifie que le bord supérieur de la carte touche la fente et que 80 % de la largeur chevauche. Si hit → `triggerSwallow()` (animation CSS 3 s + clip-path) → `onCardClick()`.

**Carte — récupération (lecteur → poche)** : `cardInReader = true` → animation éjection 3 s (30 % visible) → l'utilisateur drag vers `pocketZoneRef`.

---

## keypadBus — clavier partagé

`AtmKeypad` est monté **une seule fois** dans AtmShell. **Ne jamais importer dans un screen.** Les events transitent via `keypadBus` (nouveau objet à chaque frappe, même répétée).

### Structure de l'événement

```ts
type KeypadEvent =
  | { type: "digit"; payload: string }   // "0"–"9"
  | { type: "cancel" }
  | { type: "clear" }
  | { type: "confirm" }
```

### Écoute dans un screen

```js
const keypadBus = inject("keypadBus");
watch(keypadBus, (event) => {
  if (!event) return;
  if (step.value !== "monEtat") return; // guard obligatoire
  if (event.type === "digit")   onDigit(event.payload);
  if (event.type === "confirm") onConfirm();
});
```

**Guards obligatoires** : chaque screen ne traite les événements que dans son état propre.

---

## Screens

### Nommage

- Préfixe `Screen` + PascalCase, nommés par **état du DAB**.
- Enregistrer dans `VALID_SCREENS` (useAtmState.js) **et** registre d'`App.vue`.
- Utiliser `AtmScreenLayout` comme wrapper (gradient bleu banque, header "MA BANQUE", barre "VIGILANCE FRAUDE" en bas, prop `warn` pour la masquer).

### Flux

**Principal :** Accueil → Langue → Opération → (Montant?) → Code → Recu → Billets → Remerciement

**Échec PIN :** Code (×3) → CarteBloquee → Accueil

**Progression :** Accueil → Progression → Stats → Accueil

| Screen | Rôle |
|---|---|
| `ScreenAccueil` | Écran d'accueil — insère la carte |
| `ScreenLangue` | Choix de la langue |
| `ScreenOperation` | Retrait express / montant / solde / annulation |
| `ScreenMontant` | Saisie du montant (grille + saisie libre) |
| `ScreenCode` | Saisie du code PIN (4 chiffres) |
| `ScreenRecu` | Choix reçu (Oui/Non) + récupération carte et reçu |
| `ScreenBillets` | Retrait des billets dans le bac |
| `ScreenRemerciement` | Message de fin — retour auto après 5 s |
| `ScreenCarteBloquee` | Carte bloquée après 3 échecs PIN — retour auto après 20 s |
| `ScreenProgression` | Formulaire 2 étapes : nom + code PIN utilisateur |
| `ScreenStats` | Stats, barre de progression, historique 10 sessions |

---

## Structure localStorage

**Clé :** `"atm-trainer-users"` → `User[]`

```ts
type Session = { date: string; success: boolean };  // date = ISO 8601
type User    = { id: string; name: string; pin: string; sessions: Session[] };
//              crypto.randomUUID()                  4 chiffres, peut commencer par "0"
```

**`useProgression()` :** `loadUsers()` · `saveUser(user)` · `recordSession(userId, success)` · `getStats(userId)` → `{ total, successes, failures, currentStreak }` · `generatePin()`

**Note PIN :** générer chaque chiffre indépendamment (`Array.from({length:4}, () => …)`). Ne pas utiliser `Math.random() * 9000 + 1000` — exclut les PINs commençant par 0.

---

## Règles métier

| Règle | Valeur |
|---|---|
| Solde initial | 200 € (ref module-level dans `useSession.js`, non persisté) |
| Tentatives PIN | 3 max → `ScreenCarteBloquee` |
| Montant libre | Multiple de 10 €, ≤ solde disponible |
| Dénominations billets | 50 €, 20 €, 10 € (algorithme glouton) |
| Streak applaudissements | 5 succès consécutifs → `playApplause()` |
| Auto-retour Remerciement | 5 secondes |
| Auto-retour CarteBloquee | 10 s (message) + 10 s (redirection) = 20 s total |
| Mode démo (sans utilisateur) | Tout code à 4 chiffres est accepté |

**`resetSession()`** : remet à zéro `selectedAmount`, `pinAttempts`, `transactionType`. Ne réinitialise pas `currentUser` ni `solde`.

---

## Charte UI — ambiance DAB

### Fonds

| Usage | Valeur |
|---|---|
| Fond global (body) | `bg-[#2a2e33]` |
| Fond écran simulateur | `bg-gray-50` |
| Fond screens (via AtmScreenLayout) | `linear-gradient(160deg, #2457a0 0%, #1a3878 50%, #152e60 100%)` |
| Fond châssis (métal) | `linear-gradient(160deg, #c0c0c0 0%, #8e8e8e 25%, #b0b0b0 55%, …)` |
| Fond housing lecteur / reçu | `linear-gradient(180deg, #5a6470 0%, #3d4550 40%, #2e3540 100%)` |
| Fond bac billets | `linear-gradient(180deg, #4a5460 0%, #3a4450 50%, #2e3840 100%)` |
| Fond zone poche | `#2d1f14` + texture diagonale `rgba(255,255,255,0.03)` |
| Fond champ saisie / fente | `#0a0c10` |

### Couleurs de texte

| Usage | Classe |
|---|---|
| Texte principal | `text-white` |
| Accent / valeurs | `text-yellow-400` |
| Titres d'opération | `text-red-500` |
| Texte secondaire | `text-gray-400` / `text-gray-500` |
| Succès | `text-green-400` |
| Erreur | `text-red-400` |

### Boutons

| Variante | Classe |
|---|---|
| Action principale / validation | `bg-green-700 hover:bg-green-600` |
| Navigation / opération | `bg-blue-700 hover:bg-blue-600` |
| Annulation / danger | `bg-red-700 hover:bg-red-600` |
| Secondaire / retour | `bg-[#2a2a2a] hover:bg-[#333]` |

Boutons tactiles : `rounded-2xl text-white font-bold tracking-wide transition-colors`, taille min `px-8 py-5`.

### Typographie

- Titres d'écran : `text-2xl font-bold tracking-widest uppercase`
- Labels de champs : `text-sm font-bold uppercase tracking-widest text-yellow-400`
- Valeurs monétaires : `text-yellow-400 font-bold font-mono`
- Hints / labels chassis : `text-[10px] tracking-widest uppercase text-gray-500`

### Transitions (standard)

```
enter-active-class="transition-all duration-300"
enter-from-class="opacity-0 -translate-y-2"
enter-to-class="opacity-100 translate-y-0"
```

---

## Composants à ne pas confondre

- **`AtmCard`** — SVG carte hérité, **non utilisé** : la carte est rendue directement dans `AtmShell.vue`.
- **`AtmScreenLayout`** — wrapper obligatoire des screens (gradient bleu, header, barre fraude). Prop `warn={false}` pour masquer la barre.
- **`InfoModal`** — modale "À propos" (v-model), montée dans `AtmShell`, positionnée `fixed z-9500`.
- **`UiCard`** — conteneur générique avec titre et slot. Indépendant du thème DAB.
- **`AtmButton`** — bouton générique (props `variant` / `disabled`). Les screens utilisent souvent des `<button>` inline.
- **`AtmKeypad`** — monté **uniquement dans AtmShell**. Ne jamais importer dans un screen.
